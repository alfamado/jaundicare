"""Network clients for JaundiCare's optional maternal and immunisation assistants."""

import os
import uuid

import httpx
from dotenv import load_dotenv

load_dotenv()

MAMABOT_URL = "https://d2g5avlpkj63xl.cloudfront.net/chat"
VAXAI_URL = "https://d1vis8hpx6u9q0.cloudfront.net/chat"
MAMABOT_API_KEY = os.getenv("MAMABOT_API_KEY")
VAXAI_API_KEY = os.getenv("VAXAI_API_KEY")
TIMEOUT = 30.0


def consultations_are_configured() -> bool:
    return bool(MAMABOT_API_KEY and VAXAI_API_KEY)


async def _ask(url: str, api_key: str | None, message: str, assistant_name: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                url,
                headers={"X-API-KEY": api_key or "", "Content-Type": "application/json"},
                json={"message": message, "chat_id": str(uuid.uuid4())},
            )
            response.raise_for_status()
            return response.json().get("response", f"No response received from {assistant_name}.")
    except httpx.TimeoutException:
        return f"{assistant_name} is taking longer than expected. Please try again in a moment."
    except httpx.HTTPStatusError:
        return f"{assistant_name} is currently unavailable. Please try again later."
    except Exception:
        return f"{assistant_name} is currently unavailable. Please try again later."


async def ask_mamabot(message: str) -> str:
    return await _ask(MAMABOT_URL, MAMABOT_API_KEY, message, "MamaBot")


async def ask_vaxai(message: str) -> str:
    return await _ask(VAXAI_URL, VAXAI_API_KEY, message, "VaxAI")
