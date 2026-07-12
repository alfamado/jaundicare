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

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from uuid import UUID

from app.db.session import get_db
from app.db.models import User, OtpCode, RefreshToken, UserRole
from app.services.termii_service import send_otp_sms, format_phone_ng
from app.services.auth_utils import (
    generate_otp, hash_otp, verify_otp, otp_expiry,
    create_access_token, create_refresh_token, refresh_token_expiry,
    hash_token, verify_token_hash, decode_token,
)
from app.services.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

MAX_OTP_REQUESTS_PER_HOUR = 3
MAX_OTP_ATTEMPTS = 3


# ── VALIDATION SCHEMAS ────────────────────────────────────────
class RequestOTPSchema(BaseModel):
    phone_number: str = Field(..., example="08012345678")
    role: str = "parent"         # parent | health_worker
    language: str = "en"         # en | yo (Yoruba)


class VerifyOTPSchema(BaseModel):
    phone_number: str = Field(..., example="08012345678")
    code: str = Field(..., example="123456")


class RefreshSchema(BaseModel):
    refresh_token: str


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
async def request_otp(payload: RequestOTPSchema, db: Session = Depends(get_db)):
    phone = format_phone_ng(payload.phone_number)

    # Validates against the stripped E.164 numeric string produced by our Termii helper
    if not phone.startswith("234") or len(phone) != 13:
        raise HTTPException(status_code=400, detail="Invalid Nigerian phone number format.")

    # Timezone-aware window calculation
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    
    recent_count = (
        db.query(OtpCode)
        .filter(
            OtpCode.phone_number == phone,
            OtpCode.created_at >= one_hour_ago,
        )
        .count()
    )
    if recent_count >= MAX_OTP_REQUESTS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please wait up to an hour before trying again.",
        )

    # Clean up stale/unused historical OTP tracking records instantly to prevent database creep
    db.query(OtpCode).filter(
        OtpCode.phone_number == phone,
        OtpCode.is_used == False,
    ).delete()

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    otp_record = OtpCode(
        phone_number=phone,
        code_hash=otp_hash,
        expires_at=otp_expiry(),
    )
    db.add(otp_record)
    db.commit()

    # Dispatch to Termii infrastructure
    sent = await send_otp_sms(phone, otp)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SMS gateway delivery failed. Please verify network access and try again.",
        )

    return {"message": "OTP sent successfully.", "phone_number": phone}


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

    if not user:
        is_new_user = True
        # Enforce valid application system boundaries during initialization
        assigned_role = payload.role if payload.role in [UserRole.parent.value, UserRole.health_worker.value] else UserRole.parent.value
        
        user = User(
            phone_number=phone,
            is_verified=True,
            role=assigned_role,
            language=payload.language,
            created_at=now,
            last_login=now
        )
        db.add(user)
    else:
        user.is_verified = True
        user.last_login = now

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
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at >= now,
        )
        .first()
    )

    if not matched:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or blacklisted.")

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