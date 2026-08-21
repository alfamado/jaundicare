"""Replaceable inference providers for ClinixTech Assist.

The deployed path is a hosted provider.  Ollama is present only for local
development and evaluation; user devices and Render never need the model file.
"""

from __future__ import annotations

import logging
import os

import httpx


logger = logging.getLogger(__name__)


class ProviderUnavailable(RuntimeError):
    """The selected inference provider could not generate a response."""


def configured_provider() -> str:
    return os.getenv("CLINIX_ASSIST_PROVIDER", "retrieval").strip().lower()


async def generate(messages: list[dict[str, str]]) -> tuple[str, str]:
    """Generate with the explicitly configured provider.

    Returns the answer and an operational provider label. Credentials stay in
    Render environment variables; neither web nor mobile receives them.
    """

    provider = configured_provider()
    if provider == "cloudflare":
        return await _generate_cloudflare(messages), "cloudflare-llama"
    if provider == "ollama":
        return await _generate_ollama(messages), "ollama-development"
    raise ProviderUnavailable("No hosted inference provider is enabled.")


async def _generate_cloudflare(messages: list[dict[str, str]]) -> str:
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID", "").strip()
    api_token = os.getenv("CLOUDFLARE_AI_API_TOKEN", "").strip()
    model = os.getenv(
        "CLOUDFLARE_LLAMA_MODEL",
        "@cf/meta/llama-3.1-8b-instruct-fp8",
    ).strip()
    if not account_id or not api_token:
        raise ProviderUnavailable("Cloudflare AI credentials are not configured.")

    url = (
        "https://api.cloudflare.com/client/v4/accounts/"
        f"{account_id}/ai/run/{model}"
    )
    # The direct Workers AI REST endpoint accepts a prompt for this Llama
    # family. Keeping the roles visibly labelled maintains the system/user
    # boundary without requiring a browser-facing AI Gateway or model key.
    prompt = "\n\n".join(
        f"{message.get('role', 'user').upper()}: {message.get('content', '')}"
        for message in messages
    )
    timeout = max(5.0, float(os.getenv("CLINIX_ASSIST_TIMEOUT_SECONDS", "25")))
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json",
                },
                json={"prompt": prompt, "max_tokens": 180, "temperature": 0.1},
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.TimeoutException as error:
        raise ProviderUnavailable("Cloudflare Llama timed out.") from error
    except httpx.HTTPStatusError as error:
        logger.warning("Cloudflare Llama returned HTTP %s", error.response.status_code)
        raise ProviderUnavailable("Cloudflare Llama is unavailable.") from error
    except httpx.RequestError as error:
        raise ProviderUnavailable("Cloudflare Llama could not be reached.") from error

    result = payload.get("result") if isinstance(payload, dict) else None
    answer = result.get("response") if isinstance(result, dict) else None
    if not isinstance(answer, str) or not answer.strip():
        raise ProviderUnavailable("Cloudflare Llama returned an empty response.")
    return answer.strip()


async def _generate_ollama(messages: list[dict[str, str]]) -> str:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.1:8b").strip()
    timeout = max(5.0, float(os.getenv("CLINIX_ASSIST_TIMEOUT_SECONDS", "25")))
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{base_url}/api/chat",
                json={"model": model, "stream": False, "messages": messages, "options": {"temperature": 0.1, "num_predict": 180}},
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.RequestError as error:
        raise ProviderUnavailable("Local development Llama is unavailable.") from error

    message = payload.get("message") if isinstance(payload, dict) else None
    answer = message.get("content") if isinstance(message, dict) else None
    if not isinstance(answer, str) or not answer.strip():
        raise ProviderUnavailable("Local development Llama returned an empty response.")
    return answer.strip()
