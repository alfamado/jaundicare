"""Server-to-server client for the standalone Clinix Assist service.

JaundiCare users keep their existing JaundiCare authentication. This module
forwards only the current question, selected language and optional client
session ID. It never forwards JaundiCare tokens, user IDs, baby profiles or
images to the standalone service.
"""

from __future__ import annotations

from dataclasses import dataclass
import logging
import os

import httpx


logger = logging.getLogger(__name__)


class StandaloneAssistUnavailable(RuntimeError):
    """The standalone Clinix Assist service cannot answer right now."""


@dataclass(frozen=True)
class StandaloneAssistAnswer:
    response: str
    action: str
    source: str
    provider: str
    content_version: str
    citations: tuple[dict[str, str], ...]
    safety_reason: str | None = None


def _configuration() -> tuple[str, str] | None:
    base_url = os.getenv("CLINIX_ASSIST_BASE_URL", "").strip().rstrip("/")
    api_key = os.getenv("CLINIX_ASSIST_API_KEY", "").strip()
    if not base_url and not api_key:
        return None
    if not base_url or not api_key:
        raise StandaloneAssistUnavailable("Standalone Clinix Assist is only partially configured.")
    if not base_url.startswith("https://"):
        raise StandaloneAssistUnavailable("Standalone Clinix Assist must use an HTTPS URL.")
    return base_url, api_key


def _parse_answer(payload: object) -> StandaloneAssistAnswer:
    if not isinstance(payload, dict):
        raise StandaloneAssistUnavailable("Standalone Clinix Assist returned an invalid response.")

    response = payload.get("response")
    action = payload.get("action")
    provider = payload.get("provider")
    content_version = payload.get("content_version")
    citations = payload.get("citations")
    safety_reason = payload.get("safety_reason")
    if (
        not isinstance(response, str)
        or not response.strip()
        or len(response) > 1_100
        or action not in {"information", "same_day", "urgent"}
        or not isinstance(provider, str)
        or not isinstance(content_version, str)
        or not isinstance(citations, list)
        or (safety_reason is not None and not isinstance(safety_reason, str))
    ):
        raise StandaloneAssistUnavailable("Standalone Clinix Assist returned an invalid response.")

    safe_citations: list[dict[str, str]] = []
    for citation in citations:
        if not isinstance(citation, dict):
            raise StandaloneAssistUnavailable("Standalone Clinix Assist returned invalid citations.")
        identifier = citation.get("id")
        title = citation.get("title")
        url = citation.get("url")
        version = citation.get("version")
        if not all(isinstance(value, str) and value for value in (identifier, title, url, version)):
            raise StandaloneAssistUnavailable("Standalone Clinix Assist returned invalid citations.")
        safe_citations.append({"id": identifier, "title": title, "url": url, "version": version})

    return StandaloneAssistAnswer(
        response=response.strip(),
        action=action,
        source="Clinix Assist standalone service",
        provider=provider,
        content_version=content_version,
        citations=tuple(safe_citations),
        safety_reason=safety_reason,
    )


async def answer_from_standalone(
    *,
    assistant: str,
    message: str,
    language: str,
    session_id: str | None,
) -> StandaloneAssistAnswer | None:
    """Call Clinix Assist or return ``None`` when integration is unconfigured."""

    configuration = _configuration()
    if configuration is None:
        return None
    base_url, api_key = configuration
    timeout = max(5.0, float(os.getenv("CLINIX_ASSIST_SERVICE_TIMEOUT_SECONDS", "20")))
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{base_url}/v1/assistants/{assistant}/respond",
                headers={
                    "Content-Type": "application/json",
                    "X-Clinix-API-Key": api_key,
                },
                json={"message": message, "language": language, "session_id": session_id},
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.TimeoutException as error:
        raise StandaloneAssistUnavailable("Standalone Clinix Assist timed out.") from error
    except httpx.HTTPStatusError as error:
        logger.warning("Standalone Clinix Assist returned HTTP %s", error.response.status_code)
        raise StandaloneAssistUnavailable("Standalone Clinix Assist is unavailable.") from error
    except httpx.RequestError as error:
        raise StandaloneAssistUnavailable("Standalone Clinix Assist could not be reached.") from error
    except ValueError as error:
        raise StandaloneAssistUnavailable("Standalone Clinix Assist returned invalid JSON.") from error
    return _parse_answer(payload)
