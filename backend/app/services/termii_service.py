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

import logging
import hmac
import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

TERMII_API_KEY = os.getenv("TERMII_API_KEY", "")
# Termii assigns an account-specific regional base URL. Copy it from the
# Termii dashboard (Settings -> API token) rather than relying on a shared,
# versioned hostname. Both forms are accepted: https://host and https://host/api.
TERMII_BASE_URL = os.getenv("TERMII_BASE_URL", "").strip().rstrip("/")

SENDER_ID = os.getenv("TERMII_SENDER_ID", "JaundiCare")
TIMEOUT = 15.0
OTP_DELIVERY_MODE = os.getenv("OTP_DELIVERY_MODE", "termii").strip().lower()


class DemoOtpConfigurationError(RuntimeError):
    """Raised when presentation-only authentication has not been safely configured."""


def _is_truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def is_demo_mode() -> bool:
    """Return true only when the explicit OTP delivery-mode switch selects demo."""
    return OTP_DELIVERY_MODE == "demo"

# ── PERSISTENT CONNECTION POOLING ────────────────────────────
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


def get_demo_otp_for_phone(phone_number: str) -> str | None:
    """Return the configured demonstration code for one of exactly three team accounts.

    This is deliberately unavailable unless the service is explicitly marked as a
    demo environment. The codes and phone numbers live only in Render environment
    variables; they are never returned by the API or written to logs.
    """
    if not is_demo_mode():
        return None

    if os.getenv("ENVIRONMENT", "").strip().lower() != "demo":
        raise DemoOtpConfigurationError(
            "Demo OTP mode requires ENVIRONMENT=demo."
        )
    if not _is_truthy(os.getenv("DEMO_AUTH_ENABLED")):
        raise DemoOtpConfigurationError(
            "Demo OTP mode requires DEMO_AUTH_ENABLED=true."
        )

    credentials: dict[str, str] = {}
    for index in range(1, 4):
        raw_phone = os.getenv(f"DEMO_ALLOWED_PHONE_{index}", "")
        code = os.getenv(f"DEMO_OTP_CODE_{index}", "").strip()
        phone = format_phone_ng(raw_phone)
        if not re.fullmatch(r"234\d{10}", phone) or not re.fullmatch(r"\d{6}", code):
            raise DemoOtpConfigurationError(
                "Demo OTP mode needs three valid Nigerian phone numbers and six-digit codes."
            )
        if phone in credentials or code in credentials.values():
            raise DemoOtpConfigurationError(
                "Demo phone numbers and codes must each be unique."
            )
        credentials[phone] = code

    return credentials.get(format_phone_ng(phone_number))


def get_demo_account_role(phone_number: str) -> str:
    """Return the role for the one explicitly configured presentation account.

    This is only used when demo OTP mode is enabled. It is deliberately based
    on a server environment variable rather than the role sent by the mobile
    app, so a public caller cannot promote their own account.
    """
    if not is_demo_mode():
        return "parent"

    raw_phone = os.getenv("DEMO_HEALTH_WORKER_PHONE", "").strip()
    if not raw_phone:
        return "parent"

    approved_phone = format_phone_ng(raw_phone)
    if not re.fullmatch(r"234\d{10}", approved_phone):
        raise DemoOtpConfigurationError(
            "DEMO_HEALTH_WORKER_PHONE must be a valid Nigerian phone number."
        )

    return "health_worker" if hmac.compare_digest(approved_phone, format_phone_ng(phone_number)) else "parent"


# The production Termii implementation is retained below. It is bypassed only
# when OTP_DELIVERY_MODE=demo; restoring real SMS does not require a code edit.
async def _send_otp_via_termii(phone_number: str, otp_code: str) -> bool:
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
        "channel": "dnd",
        "api_key": TERMII_API_KEY,
    }

    if not TERMII_API_KEY or not TERMII_BASE_URL:
        logger.error(
            "Termii is not configured; both TERMII_API_KEY and TERMII_BASE_URL are required."
        )
        return False

    try:
        api_base_url = (
            TERMII_BASE_URL
            if TERMII_BASE_URL.endswith("/api")
            else f"{TERMII_BASE_URL}/api"
        )
        target_url = f"{api_base_url}/sms/send"

        response = await async_client.post(
            target_url,
            json=payload,
        )
        
        # Guard against malformed non-JSON error payloads from gateway drops
        if response.status_code != 200:
            logger.error("Termii Gateway returned non-200 status: %s", response.status_code)
            return False
            
        data = response.json()
        
        # Check for successful send properties inside Termii's response format
        if data.get("message_id") or data.get("message") == "Successfully Sent":
            logger.info(f"OTP successfully dispatched via Termii to trace ID: {data.get('message_id')}")
            return True
            
        logger.error(f"Termii API explicitly rejected an OTP request: {data}")
        return False

    except httpx.RequestError as exc:
        logger.error(f"Network connectivity error while reaching Termii infrastructure: {str(exc)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected operational failure inside SMS service: {str(e)}", exc_info=True)
        return False


async def send_otp_sms(phone_number: str, otp_code: str) -> bool:
    """Deliver a normal Termii OTP or stage a tightly allow-listed demo OTP."""
    if is_demo_mode():
        try:
            expected_otp = get_demo_otp_for_phone(phone_number)
        except DemoOtpConfigurationError:
            logger.exception("Demo OTP mode is misconfigured.")
            return False

        if expected_otp is None:
            logger.warning("Demo OTP was requested for a phone number outside the allow-list.")
            return False
        if not hmac.compare_digest(expected_otp, otp_code):
            logger.error("Demo OTP did not match its configured presentation account.")
            return False

        logger.info("A presentation-only OTP was staged for an approved demo account.")
        return True

    if OTP_DELIVERY_MODE != "termii":
        logger.error("Unsupported OTP_DELIVERY_MODE configured.")
        return False

    return await _send_otp_via_termii(phone_number, otp_code)
    
