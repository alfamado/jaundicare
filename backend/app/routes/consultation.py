"""Authenticated consultation endpoints for JaundiCare in-app assistants."""

from datetime import datetime, timedelta, timezone
import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.models import ConsultationRequestAudit, User
from app.db.session import get_db
from app.services.auth_middleware import get_current_user
from app.services.consultation_service import (
    ask_mamabot,
    ask_vaxai,
    assistant_is_available,
    AssistantServiceError,
)

router = APIRouter(prefix="/consult", tags=["consultation"])

# The limits protect the paid/upstream assistant integrations without making a
# normal caregiver conversation impractical. They can be raised deliberately
# in Render if usage data supports it.
MAX_CONSULT_REQUESTS_PER_MINUTE = max(
    1, int(os.getenv("MAX_CONSULT_REQUESTS_PER_MINUTE", "6"))
)
MAX_CONSULT_REQUESTS_PER_HOUR = max(
    MAX_CONSULT_REQUESTS_PER_MINUTE,
    int(os.getenv("MAX_CONSULT_REQUESTS_PER_HOUR", "30")),
)
CONSULT_AUDIT_RETENTION_DAYS = 2


class ConsultRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    chat_id: str | None = Field(
        default=None,
        min_length=8,
        max_length=128,
        pattern=r"^[A-Za-z0-9_-]+$",
    )


class ConsultResponse(BaseModel):
    response: str
    source: str


def _validate_message(message: str) -> str:
    cleaned = message.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    return cleaned


def _ensure_available(assistant: str) -> None:
    if not assistant_is_available(assistant):
        raise HTTPException(
            status_code=503,
            detail=(
                f"{assistant.title()} is not configured. Add its API key in Render."
            ),
        )


def _rate_limited(detail: str, retry_after: int) -> HTTPException:
    return HTTPException(
        status_code=429,
        detail=detail,
        headers={"Retry-After": str(retry_after)},
    )


def _record_and_limit_request(
    db: Session,
    current_user: User,
    assistant: str,
) -> None:
    """Apply a database-backed per-user limit without retaining health text."""
    now = datetime.now(timezone.utc)

    # Serialise the count-and-insert operation on PostgreSQL so concurrent
    # workers cannot both pass the rate check. SQLite remains safe for local
    # single-process development without requiring PostgreSQL-only SQL.
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        lock_key = f"consult:{current_user.id}:{assistant}"
        db.execute(
            text("SELECT pg_advisory_xact_lock(hashtext(:key))"),
            {"key": lock_key},
        )

    retention_cutoff = now - timedelta(days=CONSULT_AUDIT_RETENTION_DAYS)
    db.query(ConsultationRequestAudit).filter(
        ConsultationRequestAudit.created_at < retention_cutoff,
    ).delete(synchronize_session=False)

    minute_count = db.query(ConsultationRequestAudit).filter(
        ConsultationRequestAudit.user_id == current_user.id,
        ConsultationRequestAudit.assistant == assistant,
        ConsultationRequestAudit.created_at >= now - timedelta(minutes=1),
    ).count()
    if minute_count >= MAX_CONSULT_REQUESTS_PER_MINUTE:
        db.rollback()
        raise _rate_limited(
            "Please wait a minute before asking this assistant another question.",
            retry_after=60,
        )

    hour_count = db.query(ConsultationRequestAudit).filter(
        ConsultationRequestAudit.user_id == current_user.id,
        ConsultationRequestAudit.assistant == assistant,
        ConsultationRequestAudit.created_at >= now - timedelta(hours=1),
    ).count()
    if hour_count >= MAX_CONSULT_REQUESTS_PER_HOUR:
        db.rollback()
        raise _rate_limited(
            "You have reached the assistant limit for this hour. Please try again later.",
            retry_after=3600,
        )

    db.add(ConsultationRequestAudit(user_id=current_user.id, assistant=assistant))
    db.commit()


@router.post("/mamabot", response_model=ConsultResponse)
async def mamabot_consult(
    payload: ConsultRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_available("mamabot")
    _record_and_limit_request(db, current_user, "mamabot")
    try:
        response = await ask_mamabot(_validate_message(payload.message), payload.chat_id)
    except AssistantServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return ConsultResponse(response=response, source="JaundiCare MamaBot")


@router.post("/vaxai", response_model=ConsultResponse)
async def vaxai_consult(
    payload: ConsultRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_available("vaxai")
    _record_and_limit_request(db, current_user, "vaxai")
    try:
        response = await ask_vaxai(_validate_message(payload.message), payload.chat_id)
    except AssistantServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return ConsultResponse(response=response, source="JaundiCare VaxAI")
