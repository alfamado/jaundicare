"""Network clients for JaundiCare's optional maternal and immunisation assistants."""

import logging
import os
import uuid

import httpx
from dotenv import load_dotenv

load_dotenv()

MAMABOT_URL = os.getenv("MAMABOT_URL", "https://d2g5avlpkj63xl.cloudfront.net/chat")
VAXAI_URL = os.getenv("VAXAI_URL", "https://d1vis8hpx6u9q0.cloudfront.net/chat")
MAMABOT_API_KEY = os.getenv("MAMABOT_API_KEY")
VAXAI_API_KEY = os.getenv("VAXAI_API_KEY")
TIMEOUT = 30.0
logger = logging.getLogger(__name__)


class AssistantServiceError(RuntimeError):
    """A configured upstream assistant could not complete a live request."""


def assistant_is_available(assistant: str) -> bool:
    """One assistant's absent key must never block the other assistant."""
    if assistant == "mamabot":
        return bool(MAMABOT_API_KEY)
    if assistant == "vaxai":
        return bool(VAXAI_API_KEY)
    return False


async def _ask(
    url: str,
    api_key: str | None,
    message: str,
    assistant_name: str,
    _client_chat_id: str | None,
) -> str:
    # The hackathon assistants are session-managed. A new server-side ID for
    # every request keeps this integration stateless and prevents one user's
    # context from affecting another user's answer.
    upstream_chat_id = str(uuid.uuid4())
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                url,
                headers={"X-API-KEY": api_key or "", "Content-Type": "application/json"},
                json={"message": message, "chat_id": upstream_chat_id},
            )
            response.raise_for_status()
            payload = response.json()
            answer = payload.get("response") if isinstance(payload, dict) else None
            if not isinstance(answer, str) or not answer.strip():
                raise AssistantServiceError(
                    f"{assistant_name} returned an empty response. Please try again."
                )
            answer = answer.strip()
            # Do not log health questions or replies. Length alone confirms
            # the upstream assistant sent usable content to the mobile client.
            logger.warning("%s upstream reply received (%d characters)", assistant_name, len(answer))
            return answer
    except httpx.TimeoutException as error:
        raise AssistantServiceError(
            f"{assistant_name} is taking longer than expected. Please try again in a moment."
        ) from error
    except httpx.HTTPStatusError as error:
        if error.response.status_code in {401, 403}:
            detail = f"{assistant_name} rejected its API key. Check the Render environment variable."
        else:
            detail = f"{assistant_name} is currently unavailable. Please try again later."
        raise AssistantServiceError(detail) from error
    except httpx.RequestError as error:
        raise AssistantServiceError(
            f"{assistant_name} could not be reached. Check its configured endpoint."
        ) from error


async def ask_mamabot(message: str, chat_id: str | None = None) -> str:
    return await _ask(MAMABOT_URL, MAMABOT_API_KEY, message, "MamaBot", chat_id)


async def ask_vaxai(message: str, chat_id: str | None = None) -> str:
    return await _ask(VAXAI_URL, VAXAI_API_KEY, message, "VaxAI", chat_id)
