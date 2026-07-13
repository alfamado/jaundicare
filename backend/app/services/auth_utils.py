"""
JaundiCare — Auth Utilities (High-Scale Production Ready)
Optimized with microsecond SHA-256 signatures for refresh tokens to eliminate CPU bottlenecks,
and timezone-aware UTC timestamps for cross-region compatibility.
"""

import os
import secrets
import string
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET must be configured before the API can start.")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINS = 15      # 15 minutes
REFRESH_TOKEN_DAYS = 30     # 30 days
OTP_EXPIRY_MINS = 10       # 10 minutes
OTP_LENGTH = 6


# ── CRYPTOGRAPHICALLY SECURE OTP ──────────────────────────────
def generate_otp() -> str:
    """
    Generates a 6-digit numeric OTP.
    Uses secrets.choice instead of random.choices for cryptographically secure randomness.
    """
    return "".join(secrets.choice(string.digits) for _ in range(OTP_LENGTH))


def hash_otp(otp: str) -> str:
    """Hash short 6-digit OTP with bcrypt to prevent dictionary attacks in database logs."""
    salt = bcrypt.gensalt(rounds=10) # 10 rounds balances processing speed and protection
    return bcrypt.hashpw(otp.encode("utf-8"), salt).decode("utf-8")


def verify_otp(otp: str, hashed: str) -> bool:
    """Verify OTP against stored database bcrypt hash."""
    try:
        return bcrypt.checkpw(otp.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def otp_expiry() -> datetime:
    """Returns a timezone-aware UTC expiration point for database logging."""
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINS)


# ── HIGH-PERFORMANCE REFRESH TOKEN HASHING ───────────────────
def hash_token(token: str) -> str:
    """
    Hashes a JWT refresh token using SHA-256.
    CRITICAL FOR SCALE: Replaces bcrypt. SHA-256 runs in microseconds, preventing 
    100% CPU lockouts when thousands of mobile apps request background token rotations.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_token_hash(token: str, hashed: str) -> bool:
    """Validates high-entropy refresh token signature instantly."""
    return secrets.compare_digest(hash_token(token), hashed)


# ── TIMEZONE-AWARE JWT LIFE CYCLE ────────────────────────────
def create_access_token(user_id: str, phone: str) -> str:
    """Generates short-lived bearer access tokens for secured routes."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "phone": phone,
        "type": "access",
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINS),
        "iat": now,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Generates high-entropy multi-session token for background silent-authentication updates."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": now + timedelta(days=REFRESH_TOKEN_DAYS),
        "iat": now,
        # Injects unique noise to guarantee unique hashes even if requested within the same second
        "jti": secrets.token_hex(16) 
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def refresh_token_expiry() -> datetime:
    """Returns localized timestamp for session expiration tables."""
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS)


def decode_token(token: str) -> Optional[dict]:
    """Decodes and validates token signatures safely against expiry anomalies."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
