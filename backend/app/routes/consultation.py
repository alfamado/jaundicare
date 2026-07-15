"""Authenticated consultation endpoints for JaundiCare in-app assistants."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.db.models import User
from app.services.auth_middleware import get_current_user
from app.services.consultation_service import (
    ask_mamabot,
    ask_vaxai,
    assistant_is_available,
    AssistantServiceError,
)

router = APIRouter(prefix="/consult", tags=["consultation"])


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


@router.post("/mamabot", response_model=ConsultResponse)
async def mamabot_consult(
    payload: ConsultRequest,
    _current_user: User = Depends(get_current_user),
):
    _ensure_available("mamabot")
    try:
        response = await ask_mamabot(_validate_message(payload.message), payload.chat_id)
    except AssistantServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return ConsultResponse(response=response, source="JaundiCare MamaBot")


@router.post("/vaxai", response_model=ConsultResponse)
async def vaxai_consult(
    payload: ConsultRequest,
    _current_user: User = Depends(get_current_user),
):
    _ensure_available("vaxai")
    try:
        response = await ask_vaxai(_validate_message(payload.message), payload.chat_id)
    except AssistantServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return ConsultResponse(response=response, source="JaundiCare VaxAI")
