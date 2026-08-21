"""Credential and quota controls for ClinixTech Assist partner clients.

This is not used by the JaundiCare app itself; it is the future external API
boundary. Raw keys, questions and replies are never written to the database.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
import secrets

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.models import ClinixApiKey, ClinixApiProject, ClinixApiRequestAudit


KEY_SCHEME = "cxt_live"
AUDIT_RETENTION_DAYS = 2


@dataclass(frozen=True)
class PartnerCredential:
    project: ClinixApiProject
    key: ClinixApiKey


def _hash_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def create_api_key(
    db: Session,
    *,
    project: ClinixApiProject,
    scopes: list[str] | None = None,
    expires_at: datetime | None = None,
) -> tuple[ClinixApiKey, str]:
    """Create a key once. The caller must show the raw value only once."""

    # Hex avoids delimiter ambiguity when a key is parsed from an HTTP header.
    key_prefix = f"{KEY_SCHEME}_{secrets.token_hex(6)}"
    raw_key = f"{key_prefix}_{secrets.token_urlsafe(32)}"
    api_key = ClinixApiKey(
        project_id=project.id,
        key_prefix=key_prefix,
        secret_hash=_hash_key(raw_key),
        scopes=scopes or ["assist:respond"],
        expires_at=expires_at,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return api_key, raw_key


def _bad_key() -> HTTPException:
    # Identical messages prevent a caller from discovering whether a project or
    # key prefix exists.
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or inactive Clinix API key.",
        headers={"WWW-Authenticate": "X-Clinix-API-Key"},
    )


def authenticate_api_key(db: Session, raw_key: str | None) -> PartnerCredential:
    if not raw_key:
        raise _bad_key()

    parts = raw_key.strip().split("_", 3)
    if len(parts) != 4 or parts[0] != "cxt" or parts[1] != "live":
        raise _bad_key()

    key_prefix = "_".join(parts[:3])
    api_key = (
        db.query(ClinixApiKey)
        .filter(ClinixApiKey.key_prefix == key_prefix)
        .one_or_none()
    )
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if (
        api_key is None
        or not api_key.is_active
        or (api_key.expires_at is not None and api_key.expires_at <= now)
        or not hmac.compare_digest(api_key.secret_hash, _hash_key(raw_key.strip()))
    ):
        raise _bad_key()

    project = api_key.project
    if project is None or not project.is_active:
        raise _bad_key()
    if "assist:respond" not in (api_key.scopes or []):
        raise HTTPException(status_code=403, detail="This API key cannot request assistant responses.")

    api_key.last_used_at = now
    db.commit()
    return PartnerCredential(project=project, key=api_key)


def assert_project_can_use(credential: PartnerCredential, assistant: str) -> None:
    if assistant not in set(credential.project.allowed_assistants or []):
        raise HTTPException(status_code=403, detail="This project is not allowed to use that assistant.")


def _limit(name: str, default: int) -> int:
    try:
        return max(1, int(os.getenv(name, str(default))))
    except ValueError:
        return default


def record_and_limit_partner_request(
    db: Session,
    *,
    project_id,
    assistant: str,
) -> None:
    """Use short-lived metadata to enforce a distributed per-project quota."""

    now = datetime.now(timezone.utc)
    minute_limit = _limit("CLINIX_PARTNER_REQUESTS_PER_MINUTE", 30)
    hour_limit = max(minute_limit, _limit("CLINIX_PARTNER_REQUESTS_PER_HOUR", 500))

    if db.bind is not None and db.bind.dialect.name == "postgresql":
        lock_key = f"clinix-api:{project_id}:{assistant}"
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:key))"), {"key": lock_key})

    db.query(ClinixApiRequestAudit).filter(
        ClinixApiRequestAudit.created_at < now - timedelta(days=AUDIT_RETENTION_DAYS),
    ).delete(synchronize_session=False)

    minute_count = db.query(ClinixApiRequestAudit).filter(
        ClinixApiRequestAudit.project_id == project_id,
        ClinixApiRequestAudit.assistant == assistant,
        ClinixApiRequestAudit.created_at >= now - timedelta(minutes=1),
    ).count()
    if minute_count >= minute_limit:
        db.rollback()
        raise HTTPException(
            status_code=429,
            detail="Partner API request limit reached. Please retry shortly.",
            headers={"Retry-After": "60"},
        )

    hour_count = db.query(ClinixApiRequestAudit).filter(
        ClinixApiRequestAudit.project_id == project_id,
        ClinixApiRequestAudit.assistant == assistant,
        ClinixApiRequestAudit.created_at >= now - timedelta(hours=1),
    ).count()
    if hour_count >= hour_limit:
        db.rollback()
        raise HTTPException(
            status_code=429,
            detail="Partner API hourly request limit reached. Please retry later.",
            headers={"Retry-After": "3600"},
        )

    db.add(ClinixApiRequestAudit(project_id=project_id, assistant=assistant))
    db.commit()
