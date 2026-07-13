# """
# JaundiCare — HelpMum API Service
# Integrates MamaBot and VaxAI as stateless consultation endpoints.
# Each request generates a fresh UUID — treating every query as an isolated session.
# """

# import uuid
# import httpx
# import os
# from dotenv import load_dotenv

# load_dotenv()

# MAMABOT_URL     = "https://mamabot.helpmum.org/api/chat"
# VAXAI_URL       = "https://vaxai.helpmum.org/api/chat"
# MAMABOT_API_KEY = os.getenv("HELPMUM_MAMABOT_API_KEY", "mkksnvfnsnjac")
# VAXAI_API_KEY   = os.getenv("HELPMUM_VAXAI_API_KEY", "ZpZvpkzzELxB")

# TIMEOUT = 30.0  # seconds — generous for LLM inference


# async def ask_mamabot(message: str) -> str:
#     """
#     Send a maternal health question to MamaBot.
#     Generates a fresh UUID per request for stateless behaviour.
#     Returns the AI response text, or a fallback message on failure.
#     """
#     chat_id = str(uuid.uuid4())
#     try:
#         async with httpx.AsyncClient(timeout=TIMEOUT) as client:
#             response = await client.post(
#                 MAMABOT_URL,
#                 headers={
#                     "X-API-KEY": MAMABOT_API_KEY,
#                     "Content-Type": "application/json",
#                 },
#                 json={"message": message, "chat_id": chat_id},
#             )
#             response.raise_for_status()
#             data = response.json()
#             return data.get("response", "No response received from MamaBot.")
#     except httpx.TimeoutException:
#         return "MamaBot is taking longer than expected. Please try again in a moment."
#     except Exception as e:
#         print(f"[HelpMum] MamaBot error: {e}")
#         return "MamaBot is currently unavailable. Please try again later."


# async def ask_vaxai(message: str) -> str:
#     """
#     Send a vaccination/immunization question to VaxAI.
#     Generates a fresh UUID per request for stateless behaviour.
#     Returns the AI response text, or a fallback message on failure.
#     """
#     chat_id = str(uuid.uuid4())
#     try:
#         async with httpx.AsyncClient(timeout=TIMEOUT) as client:
#             response = await client.post(
#                 VAXAI_URL,
#                 headers={
#                     "X-API-KEY": VAXAI_API_KEY,
#                     "Content-Type": "application/json",
#                 },
#                 json={"message": message, "chat_id": chat_id},
#             )
#             response.raise_for_status()
#             data = response.json()
#             return data.get("response", "No response received from VaxAI.")
#     except httpx.TimeoutException:
#         return "VaxAI is taking longer than expected. Please try again in a moment."
#     except Exception as e:
#         print(f"[HelpMum] VaxAI error: {e}")
#         return "VaxAI is currently unavailable. Please try again later."


"""
JaundiCare — HelpMum API Service
Integrates MamaBot and VaxAI as stateless consultation endpoints.
Each request generates a fresh UUID — treating every query as an isolated session.
"""

import uuid
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

MAMABOT_URL     = "https://d2g5avlpkj63xl.cloudfront.net/chat"
VAXAI_URL       = "https://d1vis8hpx6u9q0.cloudfront.net/chat"

# Standard Practice: Load cleanly from environment without hardcoded strings
MAMABOT_API_KEY = os.getenv("HELPMUM_MAMABOT_API_KEY")
VAXAI_API_KEY   = os.getenv("HELPMUM_VAXAI_API_KEY")

# Optional but highly recommended: Guardrail check
def helpmum_is_configured() -> bool:
    """Keep optional consultation outages from preventing the API from starting."""
    return bool(MAMABOT_API_KEY and VAXAI_API_KEY)

TIMEOUT = 30.0  # seconds — generous for LLM inference


async def ask_mamabot(message: str) -> str:
    """
    Send a maternal health question to MamaBot.
    Generates a fresh UUID per request for stateless behaviour.
    Returns the AI response text, or a fallback message on failure.
    """
    chat_id = str(uuid.uuid4())
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                MAMABOT_URL,
                headers={
                    "X-API-KEY": MAMABOT_API_KEY,
                    "Content-Type": "application/json",
                },
                json={"message": message, "chat_id": chat_id},
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "No response received from MamaBot.")
            
    except httpx.TimeoutException:
        print("[HelpMum] MamaBot connection timed out.")
        return "MamaBot is taking longer than expected. Please try again in a moment."
    except httpx.HTTPStatusError as e:
        print(f"[HelpMum] MamaBot returned error status code: {e.response.status_code} - Reason: {e.response.text}")
        return "MamaBot is currently experiencing service updates. Please try again later."
    except Exception as e:
        print(f"[HelpMum] MamaBot unexpected interface error: {e}")
        return "MamaBot is currently unavailable. Please try again later."


async def ask_vaxai(message: str) -> str:
    """
    Send a vaccination/immunization question to VaxAI.
    Generates a fresh UUID per request for stateless behaviour.
    Returns the AI response text, or a fallback message on failure.
    """
    chat_id = str(uuid.uuid4())
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                VAXAI_URL,
                headers={
                    "X-API-KEY": VAXAI_API_KEY,
                    "Content-Type": "application/json",
                },
                json={"message": message, "chat_id": chat_id},
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "No response received from VaxAI.")
            
    except httpx.TimeoutException:
        print("[HelpMum] VaxAI connection timed out.")
        return "VaxAI is taking longer than expected. Please try again in a moment."
    except httpx.HTTPStatusError as e:
        print(f"[HelpMum] VaxAI returned error status code: {e.response.status_code} - Reason: {e.response.text}")
        return "VaxAI is currently experiencing service updates. Please try again later."
    except Exception as e:
        print(f"[HelpMum] VaxAI unexpected interface error: {e}")
        return "VaxAI is currently unavailable. Please try again later."
