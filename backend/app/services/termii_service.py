# """
# JaundiCare — Termii SMS Service
# Sends OTP codes via Termii SMS gateway.
# """

# import os
# import httpx
# from dotenv import load_dotenv

# load_dotenv()

# TERMII_API_KEY  = os.getenv("TERMII_API_KEY", "")
# TERMII_BASE_URL = "https://api.ng.termii.com/api"
# SENDER_ID       = "JaundiCare"   # must be registered with Termii
# TIMEOUT         = 15.0


# def format_phone_ng(phone: str) -> str:
#     """
#     Normalise Nigerian phone numbers to E.164 format (+234XXXXXXXXXX).
#     Accepts: 08012345678, 8012345678, +2348012345678, 2348012345678
#     """
#     phone = phone.strip().replace(" ", "").replace("-", "")
#     if phone.startswith("+234"):
#         return phone
#     if phone.startswith("234"):
#         return f"+{phone}"
#     if phone.startswith("0") and len(phone) == 11:
#         return f"+234{phone[1:]}"
#     if len(phone) == 10:
#         return f"+234{phone}"
#     return phone  # return as-is if format unknown


# async def send_otp_sms(phone_number: str, otp_code: str) -> bool:
#     """
#     Send OTP via Termii SMS.
#     Returns True if sent successfully, False otherwise.
#     """
#     formatted = format_phone_ng(phone_number)
#     message   = f"Your JaundiCare verification code is {otp_code}. It expires in 10 minutes. Do not share this code with anyone."

#     payload = {
#         "to":       formatted,
#         "from":     SENDER_ID,
#         "sms":      message,
#         "type":     "plain",
#         "channel":  "dnd",        # DND channel bypasses Do Not Disturb
#         "api_key":  TERMII_API_KEY,
#     }

#     try:
#         async with httpx.AsyncClient(timeout=TIMEOUT) as client:
#             response = await client.post(
#                 f"{TERMII_BASE_URL}/sms/send",
#                 json=payload,
#             )
#             data = response.json()
#             # Termii returns message_id on success
#             if response.status_code == 200 and data.get("message_id"):
#                 return True
#             print(f"[Termii] Failed: {data}")
#             return False
#     except Exception as e:
#         print(f"[Termii] Error: {e}")
#         return False




"""
JaundiCare — Termii SMS Service (High-Scale Production Ready)
Optimized with persistent HTTP connection pooling via a global AsyncClient,
Termii-compatible number normalization, and standard production logging.
"""

import os
import logging
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

TERMII_API_KEY = os.getenv("TERMII_API_KEY", "")
TERMII_BASE_URL = "https://api.ng.termii.com/api"
# Default to registered Sender ID, fallback to sandbox CHANNELS if not configured
SENDER_ID = os.getenv("TERMII_SENDER_ID", "JaundiCare")
TIMEOUT = 15.0

# ── PERSISTENT CONNECTION POOLING ────────────────────────────
# Reusing a single client avoids socket exhaustion under tens of thousands of requests
async_client = httpx.AsyncClient(
    timeout=httpx.Timeout(TIMEOUT),
    limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
)


async def close_termii_client() -> None:
    if not async_client.is_closed:
        await async_client.aclose()


def format_phone_ng(phone: str) -> str:
    """
    Normalizes Nigerian phone numbers to Termii-compatible numeric E.164 format (234XXXXXXXXXX).
    Note: Termii expects the country code WITHOUT the leading '+' sign.
    Accepts: 08012345678, 8012345678, +2348012345678, 2348012345678
    """
    phone = phone.strip().replace(" ", "").replace("-", "").replace("+", "")
    
    if phone.startswith("234") and len(phone) == 13:
        return phone
    if phone.startswith("0") and len(phone) == 11:
        return f"234{phone[1:]}"
    if len(phone) == 10 and not phone.startswith("0"):
        return f"234{phone}"
        
    return phone


async def send_otp_sms(phone_number: str, otp_code: str) -> bool:
    """
    Dispatches a 6-digit verification code over Termii's direct DND bypass route.
    Utilizes global HTTP connection pool for low-latency operations under high load.
    """
    formatted = format_phone_ng(phone_number)
    message = f"Your JaundiCare verification code is {otp_code}. It expires in 10 minutes. Do not share this code with anyone."

    payload = {
        "to": formatted,
        "from": SENDER_ID,
        "sms": message,
        "type": "plain",
        "channel": "dnd",  # Bypasses carrier DND rules natively on MTN/Airtel/Glo
        "api_key": TERMII_API_KEY,
    }

    # A production system must never log or pretend to deliver a verification
    # code. Configure Termii before enabling phone authentication.
    if not TERMII_API_KEY:
        logger.error("TERMII_API_KEY is not configured; OTP was not sent.")
        return False

    try:
        response = await async_client.post(
            f"{TERMII_BASE_URL}/sms/send",
            json=payload,
        )
        
        # Guard against malformed non-JSON error payloads from gateway drops
        if response.status_code != 200:
            logger.error("Termii Gateway returned non-200 status: %s", response.status_code)
            return False
            
        data = response.json()
        
        if data.get("message_id"):
            logger.info(f"OTP successfully dispatched via Termii to trace ID: {data.get('message_id')}")
            return True
            
        logger.error("Termii API explicitly rejected an OTP request.")
        return False

    except httpx.RequestError as exc:
        logger.error(f"Network connectivity error while reaching Termii infrastructure: {str(exc)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected operational failure inside SMS service: {str(e)}", exc_info=True)
        return False
