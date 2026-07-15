"""Network clients for JaundiCare's optional maternal and immunisation assistants."""

import os
import uuid

import httpx
from dotenv import load_dotenv

load_dotenv()

MAMABOT_URL = os.getenv("MAMABOT_URL", "https://d2g5avlpkj63xl.cloudfront.net/chat")
VAXAI_URL = os.getenv("VAXAI_URL", "https://d1vis8hpx6u9q0.cloudfront.net/chat")
MAMABOT_API_KEY = os.getenv("MAMABOT_API_KEY")
VAXAI_API_KEY = os.getenv("VAXAI_API_KEY")
CONSULTATION_DEMO_MODE = os.getenv("CONSULTATION_DEMO_MODE", "false").strip().lower() in {
    "1", "true", "yes", "on",
}
TIMEOUT = 30.0


class AssistantServiceError(RuntimeError):
    """A configured upstream assistant could not complete a live request."""


def assistant_is_available(assistant: str) -> bool:
    """One assistant's absent key must never block the other assistant."""
    if CONSULTATION_DEMO_MODE:
        return True
    if assistant == "mamabot":
        return bool(MAMABOT_API_KEY)
    if assistant == "vaxai":
        return bool(VAXAI_API_KEY)
    return False


def _demo_response(assistant: str, message: str) -> str:
    """Clearly labelled, safety-first response for an approved demo fallback."""
    question = message.lower()
    if assistant == "vaxai":
        if "birth" in question or "newborn" in question:
            guidance = (
                "For a newborn, confirm the birth-dose immunisations and the next clinic visit "
                "using the child's immunisation card."
            )
        elif "6 week" in question or "six week" in question:
            guidance = (
                "Check the child's immunisation card and confirm the six-week appointment "
                "with the clinic before giving advice."
            )
        else:
            guidance = (
                "Check the child's immunisation card and confirm timing with the nearest "
                "immunisation clinic."
            )
    elif "feed" in question or "breast" in question:
        guidance = (
            "Feed the baby frequently. If the baby cannot feed, is difficult to wake, or is "
            "becoming more yellow, seek urgent assessment."
        )
    elif "yellow" in question or "jaundice" in question:
        guidance = (
            "Check the eyes and gums in good light. Yellowing in the first day of life, poor "
            "feeding, or unusual sleepiness needs urgent assessment."
        )
    else:
        guidance = (
            "For newborn concerns, monitor feeding and alertness closely. Seek urgent care for "
            "poor feeding, difficulty waking, dark urine, pale stool, or yellowing in the first day."
        )
    return f"Demo guidance: {guidance} This does not replace a health professional."


async def _ask(
    url: str,
    api_key: str | None,
    message: str,
    assistant_name: str,
    chat_id: str | None,
) -> str:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                url,
                headers={"X-API-KEY": api_key or "", "Content-Type": "application/json"},
                json={"message": message, "chat_id": chat_id or str(uuid.uuid4())},
            )
            response.raise_for_status()
            return response.json().get("response", f"No response received from {assistant_name}.")
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
    if not MAMABOT_API_KEY and CONSULTATION_DEMO_MODE:
        return _demo_response("mamabot", message)
    return await _ask(MAMABOT_URL, MAMABOT_API_KEY, message, "MamaBot", chat_id)


async def ask_vaxai(message: str, chat_id: str | None = None) -> str:
    if not VAXAI_API_KEY and CONSULTATION_DEMO_MODE:
        return _demo_response("vaxai", message)
    return await _ask(VAXAI_URL, VAXAI_API_KEY, message, "VaxAI", chat_id)
