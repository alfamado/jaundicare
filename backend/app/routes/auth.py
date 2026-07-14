# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# import pydantic
# from typing import Optional

# # Importing directly from your existing folder structure
# from app.db.session import get_db  # Assuming get_db lives here based on session.py
# from app.db.models import User, OTPCode
# from app.services.termii import generate_6_digit_otp, send_sms_otp

# # We will define simple, self-contained schemas here to avoid breaking app/schemas.py
# class OTPRequest(pydantic.BaseModel):
#     phone_number: str  # Expected in E.164 format: +234...

# class OTPVerify(pydantic.BaseModel):
#     phone_number: str
#     code: str

# router = APIRouter(prefix="/auth", tags=["Authentication"])

# @router.post("/request-otp")
# def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
#     """
#     Generates a 6-digit OTP, checks hourly rate limits (max 3), 
#     saves the attempt to the database, and dispatches via Termii.
#     """
#     phone = payload.phone_number.strip()
    
#     # 1. Rate Limiting Check: Max 3 requests per phone number per hour
#     one_hour_ago = datetime.utcnow() - timedelta(hours=1)
#     hourly_requests = db.query(OTPCode).filter(
#         OTPCode.phone_number == phone,
#         OTPCode.created_at >= one_hour_ago
#     ).count()
    
#     if hourly_requests >= 3:
#         raise HTTPException(
#             status_code=status.HTTP_429_TOO_MANY_REQUESTS,
#             detail="Too many OTP requests. Please try again in an hour."
#         )
    
#     # 2. Generate and store OTP
#     otp = generate_6_digit_otp()
#     expiry = datetime.utcnow() + timedelta(minutes=10)
    
#     # Simple plain-text or clear verification tracking matching the model properties
#     db_otp = OTPCode(
#         phone_number=phone,
#         hashed_code=otp,  # For production, hash with bcrypt; matching your raw schema property name
#         expires_at=expiry,
#         is_used=False,
#         attempts=0
#     )
#     db.add(db_otp)
#     db.commit()
    
#     # 3. Send SMS via Termii service
#     sms_sent = send_sms_otp(phone_number=phone, otp_code=otp)
#     if not sms_sent:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Failed to send verification SMS via gateway."
#         )
        
#     return {"message": "Verification code dispatched successfully."}


# @router.post("/verify-otp")
# def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
#     """
#     Validates the 6-digit OTP code against expiry, attempts limit, and usage status.
#     If valid, verifies or provisions the User profile record.
#     """
#     phone = payload.phone_number.strip()
#     input_code = payload.code.strip()
    
#     # Find the latest active OTP code for this phone number
#     db_otp = db.query(OTPCode).filter(
#         OTPCode.phone_number == phone,
#         OTPCode.is_used == False,
#         OTPCode.expires_at > datetime.utcnow()
#     ).order_by(OTPCode.created_at.desc()).first()
    
#     if not db_otp:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="No active verification code found or code has expired."
#         )
        
#     # Check max wrong attempts constraint
#     if db_otp.attempts >= 3:
#         db_otp.is_used = True
#         db.commit()
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Too many invalid validation attempts. Please request a new code."
#         )
        
#     # Validate code matching
#     if db_otp.hashed_code != input_code:
#         db_otp.attempts += 1
#         db.commit()
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail=f"Invalid verification code. {3 - db_otp.attempts} attempts remaining."
#         )
        
#     # Mark OTP code as cleanly consumed
#     db_otp.is_used = True
    
#     # Lookup or create user profile wrapper row
#     user = db.query(User).filter(User.phone_number == phone).first()
#     if not user:
#         user = User(
#             phone_number=phone,
#             is_verified=True,
#             role="parent",
#             language="en"
#         )
#         db.add(user)
#     else:
#         user.is_verified = True
#         user.last_login = datetime.utcnow()
        
#     db.commit()
#     db.refresh(user)
    
#     # Placeholder token string for step-by-step verification until JWT middleware hooks are aligned
#     return {
#         "access_token": f"mock_secure_jwt_{user.id}",
#         "token_type": "bearer",
#         "user": {
#             "id": user.id,
#             "phone_number": user.phone_number,
#             "role": user.role,
#             "language": user.language
#         }
#     }

# """
# JaundiCare — Auth Routes
# Phone OTP registration and login.
# """

# from datetime import datetime
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from pydantic import BaseModel

# from app.db.session import get_db
# from app.db.models import User, OtpCode, RefreshToken
# from app.services.termii_service import send_otp_sms, format_phone_ng
# from app.services.auth_utils import (
#     generate_otp, hash_otp, verify_otp, otp_expiry,
#     create_access_token, create_refresh_token, refresh_token_expiry,
#     hash_token, verify_token_hash, decode_token,
# )
# from app.services.auth_middleware import get_current_user

# router = APIRouter(prefix="/auth", tags=["auth"])

# MAX_OTP_REQUESTS_PER_HOUR = 3
# MAX_OTP_ATTEMPTS          = 3


# # ── Schemas ───────────────────────────────────────────────────
# class RequestOTPSchema(BaseModel):
#     phone_number: str
#     role: str = "parent"         # parent | health_worker
#     language: str = "en"


# class VerifyOTPSchema(BaseModel):
#     phone_number: str
#     code: str


# class RefreshSchema(BaseModel):
#     refresh_token: str


# class TokenResponse(BaseModel):
#     access_token:  str
#     refresh_token: str
#     token_type:    str = "bearer"
#     user_id:       str
#     phone_number:  str
#     role:          str
#     language:      str
#     is_new_user:   bool


# # ── Request OTP ───────────────────────────────────────────────
# @router.post("/request-otp")
# async def request_otp(payload: RequestOTPSchema, db: Session = Depends(get_db)):
#     phone = format_phone_ng(payload.phone_number)

#     if not phone.startswith("+"):
#         raise HTTPException(status_code=400, detail="Invalid phone number format.")

#     # Rate limit — max 3 OTP requests per hour per phone
#     from datetime import timedelta
#     one_hour_ago = datetime.utcnow() - timedelta(hours=1)
#     recent_count = (
#         db.query(OtpCode)
#         .filter(
#             OtpCode.phone_number == phone,
#             OtpCode.created_at >= one_hour_ago,
#         )
#         .count()
#     )
#     if recent_count >= MAX_OTP_REQUESTS_PER_HOUR:
#         raise HTTPException(
#             status_code=429,
#             detail="Too many OTP requests. Please wait before trying again.",
#         )

#     # Invalidate any existing unused OTPs for this number
#     db.query(OtpCode).filter(
#         OtpCode.phone_number == phone,
#         OtpCode.is_used == False,
#     ).delete()

#     # Generate and store new OTP
#     otp      = generate_otp()
#     otp_hash = hash_otp(otp)

#     otp_record = OtpCode(
#         phone_number = phone,
#         code_hash    = otp_hash,
#         expires_at   = otp_expiry(),
#     )
#     db.add(otp_record)
#     db.commit()

#     # Send via Termii
#     sent = await send_otp_sms(phone, otp)
#     if not sent:
#         raise HTTPException(
#             status_code=503,
#             detail="Could not send OTP. Please check your number and try again.",
#         )

#     return {"message": "OTP sent successfully.", "phone_number": phone}


# # ── Verify OTP ────────────────────────────────────────────────
# @router.post("/verify-otp", response_model=TokenResponse)
# async def verify_otp_endpoint(payload: VerifyOTPSchema, db: Session = Depends(get_db)):
#     phone = format_phone_ng(payload.phone_number)

#     # Find most recent valid OTP
#     otp_record = (
#         db.query(OtpCode)
#         .filter(
#             OtpCode.phone_number == phone,
#             OtpCode.is_used      == False,
#             OtpCode.expires_at   >= datetime.utcnow(),
#         )
#         .order_by(OtpCode.created_at.desc())
#         .first()
#     )

#     if not otp_record:
#         raise HTTPException(status_code=400, detail="OTP expired or not found. Please request a new one.")

#     # Check attempt limit
#     if otp_record.attempts >= MAX_OTP_ATTEMPTS:
#         otp_record.is_used = True
#         db.commit()
#         raise HTTPException(status_code=400, detail="Too many incorrect attempts. Please request a new OTP.")

#     # Verify code
#     if not verify_otp(payload.code, otp_record.code_hash):
#         otp_record.attempts += 1
#         db.commit()
#         remaining = MAX_OTP_ATTEMPTS - otp_record.attempts
#         raise HTTPException(
#             status_code=400,
#             detail=f"Incorrect OTP. {remaining} attempt(s) remaining.",
#         )

#     # Mark OTP as used
#     otp_record.is_used = True
#     db.commit()

#     # Get or create user
#     user = db.query(User).filter(User.phone_number == phone).first()
#     is_new_user = False

#     if not user:
#         is_new_user = True
#         user = User(
#             phone_number = phone,
#             is_verified  = True,
#             role         = "parent",
#             language     = "en",
#         )
#         db.add(user)
#     else:
#         user.is_verified = True
#         user.last_login  = datetime.utcnow()

#     db.commit()
#     db.refresh(user)

#     # Generate tokens
#     access_token  = create_access_token(user.id, user.phone_number)
#     refresh_token = create_refresh_token(user.id)

#     # Store hashed refresh token
#     rt_record = RefreshToken(
#         user_id    = user.id,
#         token_hash = hash_token(refresh_token),
#         expires_at = refresh_token_expiry(),
#     )
#     db.add(rt_record)
#     db.commit()

#     return TokenResponse(
#         access_token  = access_token,
#         refresh_token = refresh_token,
#         user_id       = user.id,
#         phone_number  = user.phone_number,
#         role          = user.role,
#         language      = user.language,
#         is_new_user   = is_new_user,
#     )


# # ── Refresh Token ─────────────────────────────────────────────
# @router.post("/refresh", response_model=TokenResponse)
# async def refresh_access_token(payload: RefreshSchema, db: Session = Depends(get_db)):
#     token_data = decode_token(payload.refresh_token)
#     if not token_data or token_data.get("type") != "refresh":
#         raise HTTPException(status_code=401, detail="Invalid refresh token.")

#     user_id = token_data.get("sub")

#     # Find matching refresh token record
#     rt_records = (
#         db.query(RefreshToken)
#         .filter(
#             RefreshToken.user_id    == user_id,
#             RefreshToken.is_revoked == False,
#             RefreshToken.expires_at >= datetime.utcnow(),
#         )
#         .all()
#     )

#     matched = None
#     for rt in rt_records:
#         if verify_token_hash(payload.refresh_token, rt.token_hash):
#             matched = rt
#             break

#     if not matched:
#         raise HTTPException(status_code=401, detail="Refresh token not found or revoked.")

#     # Rotate — revoke old, issue new
#     matched.is_revoked = True
#     db.commit()

#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="User not found.")

#     new_access  = create_access_token(user.id, user.phone_number)
#     new_refresh = create_refresh_token(user.id)

#     new_rt = RefreshToken(
#         user_id    = user.id,
#         token_hash = hash_token(new_refresh),
#         expires_at = refresh_token_expiry(),
#     )
#     db.add(new_rt)
#     db.commit()

#     return TokenResponse(
#         access_token  = new_access,
#         refresh_token = new_refresh,
#         user_id       = user.id,
#         phone_number  = user.phone_number,
#         role          = user.role,
#         language      = user.language,
#         is_new_user   = False,
#     )


# # ── Logout ────────────────────────────────────────────────────
# @router.post("/logout")
# async def logout(payload: RefreshSchema, db: Session = Depends(get_db)):
#     token_data = decode_token(payload.refresh_token)
#     if token_data:
#         user_id = token_data.get("sub")
#         rt_records = db.query(RefreshToken).filter(
#             RefreshToken.user_id    == user_id,
#             RefreshToken.is_revoked == False,
#         ).all()
#         for rt in rt_records:
#             if verify_token_hash(payload.refresh_token, rt.token_hash):
#                 rt.is_revoked = True
#         db.commit()

#     return {"message": "Logged out successfully."}


# # ── Me ────────────────────────────────────────────────────────
# @router.get("/me")
# async def get_me(current_user: User = Depends(get_current_user)):
#     return {
#         "user_id":      current_user.id,
#         "phone_number": current_user.phone_number,
#         "role":         current_user.role,
#         "language":     current_user.language,
#         "is_verified":  current_user.is_verified,
#         "created_at":   current_user.created_at.isoformat(),
#     }






"""
JaundiCare — Auth Routes (High-Scale Production Ready)
Fully aligned with timezone-aware UTC metrics, direct database index lookups
for hashed tokens, and safe parameter passing for multilingual user registration.
"""

import hashlib
import hmac
import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID

from app.db.session import get_db
from app.db.models import (
    ModelTrainingImage,
    OtpCode,
    OtpRequestAudit,
    RefreshToken,
    Screening,
    User,
    UserRole,
)
from app.services.cloudinary_service import delete_image
from app.services.termii_service import (
    DemoOtpConfigurationError,
    format_phone_ng,
    get_demo_account_role,
    get_demo_otp_for_phone,
    is_demo_mode,
    send_otp_sms,
)
from app.services.auth_utils import (
    generate_otp, hash_otp, verify_otp, otp_expiry,
    create_access_token, create_refresh_token, refresh_token_expiry,
    hash_token, verify_token_hash, decode_token,
)
from app.services.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

MAX_OTP_REQUESTS_PER_HOUR = 3
MAX_OTP_REQUESTS_PER_IP_PER_HOUR = 12
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_AUDIT_RETENTION_DAYS = 2
MAX_OTP_ATTEMPTS = 3


def _is_truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def _client_fingerprint(request: Request) -> str:
    """Return an HMAC fingerprint, never a raw client IP address."""
    client_address = request.client.host if request.client else "unknown"

    # Forwarded headers are only trusted when deployment explicitly opts in.
    # Render is configured this way because its public ingress is the proxy.
    if _is_truthy(os.getenv("TRUST_PROXY_HEADERS")):
        forwarded_for = request.headers.get("x-forwarded-for", "")
        if forwarded_for:
            client_address = forwarded_for.split(",", 1)[0].strip() or client_address

    secret = os.getenv("RATE_LIMIT_SALT") or os.getenv("JWT_SECRET")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not configured.",
        )

    return hmac.new(
        secret.encode("utf-8"),
        client_address.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _rate_limited(detail: str, retry_after: int) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=detail,
        headers={"Retry-After": str(retry_after)},
    )


def _lock_otp_rate_limit_keys(
    db: Session,
    phone_number: str,
    client_fingerprint: str,
) -> None:
    """Serialize OTP throttling checks across Postgres API instances.

    A count-and-insert limit is otherwise raceable when multiple requests hit
    different workers at the same instant. PostgreSQL advisory transaction
    locks are released automatically at the following commit or rollback.
    """
    if db.bind is None or db.bind.dialect.name != "postgresql":
        return

    for key in sorted((f"otp-client:{client_fingerprint}", f"otp-phone:{phone_number}")):
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:key))"), {"key": key})


# ── VALIDATION SCHEMAS ────────────────────────────────────────
class RequestOTPSchema(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20, examples=["08012345678"])
    role: Literal["parent"] = "parent"
    language: Literal["en", "yo", "ha", "ig", "pcm"] = "en"


class VerifyOTPSchema(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20, examples=["08012345678"])
    code: str = Field(..., pattern=r"^\d{6}$", examples=["123456"])


class RefreshSchema(BaseModel):
    refresh_token: str = Field(..., min_length=20, max_length=4096)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    phone_number: str
    role: str
    language: str
    is_new_user: bool


# ── REQUEST OTP ───────────────────────────────────────────────
@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp(
    request: Request,
    payload: RequestOTPSchema,
    db: Session = Depends(get_db),
):
    # Clinical roles must be provisioned through a verified organisation, not
    # selected by a caller during public registration.
    if payload.role != UserRole.parent.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Health-worker accounts must be provisioned by an administrator.",
        )

    phone = format_phone_ng(payload.phone_number)

    # Validates against the stripped E.164 numeric string produced by our Termii helper
    if not phone.startswith("234") or len(phone) != 13:
        raise HTTPException(status_code=400, detail="Invalid Nigerian phone number format.")

    demo_mode = is_demo_mode()
    try:
        demo_otp = get_demo_otp_for_phone(phone) if demo_mode else None
    except DemoOtpConfigurationError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Presentation authentication is not configured correctly.",
        )

    if demo_mode and demo_otp is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This phone number is not enabled for the presentation demo.",
        )

    client_fingerprint = _client_fingerprint(request)
    _lock_otp_rate_limit_keys(db, phone, client_fingerprint)

    # Database-backed limits work consistently across API instances.
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    one_minute_ago = datetime.now(timezone.utc) - timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
    audit_retention_cutoff = datetime.now(timezone.utc) - timedelta(days=OTP_AUDIT_RETENTION_DAYS)

    db.query(OtpRequestAudit).filter(
        OtpRequestAudit.created_at < audit_retention_cutoff,
    ).delete(synchronize_session=False)

    recent_phone_count = (
        db.query(OtpRequestAudit)
        .filter(
            OtpRequestAudit.phone_number == phone,
            OtpRequestAudit.created_at >= one_hour_ago,
        )
        .count()
    )
    if recent_phone_count >= MAX_OTP_REQUESTS_PER_HOUR:
        raise _rate_limited(
            "Too many verification-code requests. Please wait before trying again.",
            retry_after=3600,
        )

    recent_ip_count = (
        db.query(OtpRequestAudit)
        .filter(
            OtpRequestAudit.client_fingerprint == client_fingerprint,
            OtpRequestAudit.created_at >= one_hour_ago,
        )
        .count()
    )
    if recent_ip_count >= MAX_OTP_REQUESTS_PER_IP_PER_HOUR:
        raise _rate_limited(
            "Too many verification-code requests from this network. Please wait before trying again.",
            retry_after=3600,
        )

    recent_phone_request = (
        db.query(OtpRequestAudit)
        .filter(
            OtpRequestAudit.phone_number == phone,
            OtpRequestAudit.created_at >= one_minute_ago,
        )
        .first()
    )
    if recent_phone_request:
        raise _rate_limited(
            "Please wait one minute before requesting another verification code.",
            retry_after=OTP_RESEND_COOLDOWN_SECONDS,
        )

    # Clean up stale/unused historical OTP tracking records instantly to prevent database creep
    db.query(OtpCode).filter(
        OtpCode.phone_number == phone,
        OtpCode.is_used == False,
    ).delete()

    otp = demo_otp or generate_otp()
    otp_hash = hash_otp(otp)

    otp_record = OtpCode(
        phone_number=phone,
        language=payload.language,
        code_hash=otp_hash,
        expires_at=otp_expiry(),
    )
    db.add(otp_record)
    db.add(
        OtpRequestAudit(
            phone_number=phone,
            client_fingerprint=client_fingerprint,
        )
    )
    db.commit()

    # Dispatch via Termii or stage the configured presentation-only OTP.
    sent = await send_otp_sms(phone, otp)
    if not sent:
        otp_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Verification-code delivery failed. Please try again.",
        )

    return {
        "message": "Demo verification is ready." if demo_mode else "OTP sent successfully.",
        "phone_number": phone,
        "delivery_mode": "demo" if demo_mode else "sms",
    }


# ── VERIFY OTP ────────────────────────────────────────────────
@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_endpoint(payload: VerifyOTPSchema, db: Session = Depends(get_db)):
    phone = format_phone_ng(payload.phone_number)
    now = datetime.now(timezone.utc)

    # High-speed ordered lookup matching native indexes
    otp_record = (
        db.query(OtpCode)
        .filter(
            OtpCode.phone_number == phone,
            OtpCode.is_used == False,
            OtpCode.expires_at >= now,
        )
        .order_by(OtpCode.created_at.desc())
        .with_for_update()
        .first()
    )

    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP code has expired or was not found.")

    if otp_record.attempts >= MAX_OTP_ATTEMPTS:
        otp_record.is_used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Too many invalid attempts. Please request a new OTP.")

    if not verify_otp(payload.code, otp_record.code_hash):
        otp_record.attempts += 1
        db.commit()
        remaining = MAX_OTP_ATTEMPTS - otp_record.attempts
        raise HTTPException(
            status_code=400,
            detail=f"Incorrect confirmation code. {remaining} attempt(s) remaining.",
        )

    otp_record.is_used = True

    # Check existence via unique phone index
    user = db.query(User).filter(User.phone_number == phone).first()
    is_new_user = False

    try:
        requested_demo_role = get_demo_account_role(phone)
    except DemoOtpConfigurationError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Presentation authentication is not configured correctly.",
        )

    if not user:
        is_new_user = True
        user = User(
            phone_number=phone,
            is_verified=True,
            role=requested_demo_role,
            language=otp_record.language or "en",
            created_at=now,
            last_login=now
        )
        db.add(user)
    else:
        user.is_verified = True
        user.last_login = now
        # A demo account can be intentionally reclassified between rehearsal
        # runs. This branch is unreachable in normal Termii delivery mode.
        if is_demo_mode():
            user.role = requested_demo_role

    db.commit()
    db.refresh(user)

    # Create authorization credentials
    access_token = create_access_token(user.id, user.phone_number)
    refresh_token = create_refresh_token(user.id)
    hashed_rt = hash_token(refresh_token)

    rt_record = RefreshToken(
        user_id=user.id,
        token_hash=hashed_rt,
        expires_at=refresh_token_expiry(),
        created_at=now
    )
    db.add(rt_record)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        phone_number=user.phone_number,
        role=user.role,
        language=user.language,
        is_new_user=is_new_user,
    )


# ── REFRESH TOKEN ACCESS ──────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(payload: RefreshSchema, db: Session = Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token signature.")

    user_id_str = token_data.get("sub")
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token metadata identifier.")

    now = datetime.now(timezone.utc)
    target_hash = hash_token(payload.refresh_token)

    # CRITICAL PRODUCTION FIX: Hit the unique index directly instead of using a Python loop
    matched = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == user_id,
            RefreshToken.token_hash == target_hash,
        )
        .with_for_update()
        .first()
    )

    if not matched:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or blacklisted.")

    if matched.is_revoked:
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False,
        ).update({"is_revoked": True}, synchronize_session=False)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reuse was detected. Sign in again.",
        )

    is_unexpired = (
        db.query(RefreshToken.id)
        .filter(
            RefreshToken.id == matched.id,
            RefreshToken.expires_at >= now,
        )
        .first()
    )
    if not is_unexpired:
        matched.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired.",
        )

    # Execute atomic token rotation
    matched.is_revoked = True

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Associated user profile no longer exists.")

    new_access = create_access_token(user.id, user.phone_number)
    new_refresh = create_refresh_token(user.id)

    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(new_refresh),
        expires_at=refresh_token_expiry(),
        created_at=now
    )
    db.add(new_rt)
    db.commit()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        user_id=user.id,
        phone_number=user.phone_number,
        role=user.role,
        language=user.language,
        is_new_user=False,
    )


# ── LOGOUT ────────────────────────────────────────────────────
@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(payload: RefreshSchema, db: Session = Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if token_data:
        user_id_str = token_data.get("sub")
        target_hash = hash_token(payload.refresh_token)
        try:
            user_id = UUID(user_id_str)
            # Instantly locate and blacklist the targeted entry within Postgres
            matched = db.query(RefreshToken).filter(
                RefreshToken.user_id == user_id,
                RefreshToken.token_hash == target_hash
            ).first()
            if matched:
                matched.is_revoked = True
                db.commit()
        except ValueError:
            pass

    return {"message": "Logged out successfully."}


# ── CURRENT USER METRICS ──────────────────────────────────────
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "language": current_user.language,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat(),
    }


@router.delete("/account", status_code=status.HTTP_200_OK)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete the authenticated account and all owned clinical data."""
    screenings = (
        db.query(Screening)
        .filter(Screening.user_id == current_user.id)
        .all()
    )
    screening_ids = [screening.id for screening in screenings]
    training_images = (
        db.query(ModelTrainingImage)
        .filter(ModelTrainingImage.screening_id.in_(screening_ids))
        .all()
        if screening_ids
        else []
    )
    public_ids = {
        training_image.cloudinary_public_id for training_image in training_images
    }
    public_ids.update(
        screening.cloudinary_public_id
        for screening in screenings
        if screening.cloudinary_public_id
    )

    for public_id in public_ids:
        if not delete_image(public_id):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stored image deletion failed. Please retry account deletion.",
            )

    try:
        for training_image in training_images:
            db.delete(training_image)
        db.delete(current_user)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"message": "Account and associated screening data were deleted."}
