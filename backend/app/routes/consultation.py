"""Authenticated consultation endpoints for JaundiCare in-app assistants."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db.models import User
from app.services.auth_middleware import get_current_user
from app.services.consultation_service import (
    ask_mamabot,
    ask_vaxai,
    assistant_is_available,
)

router = APIRouter(prefix="/consult", tags=["consultation"])


class ConsultRequest(BaseModel):
    message: str


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
                f"{assistant.title()} is not configured. Add its API key in Render or enable "
                "CONSULTATION_DEMO_MODE for the presentation demo."
            ),
        )


@router.post("/mamabot", response_model=ConsultResponse)
async def mamabot_consult(
    payload: ConsultRequest,
    _current_user: User = Depends(get_current_user),
):
    _ensure_available("mamabot")
    response = await ask_mamabot(_validate_message(payload.message))
    return ConsultResponse(response=response, source="JaundiCare MamaBot")


@router.post("/vaxai", response_model=ConsultResponse)
async def vaxai_consult(
    payload: ConsultRequest,
    _current_user: User = Depends(get_current_user),
):
    _ensure_available("vaxai")
    response = await ask_vaxai(_validate_message(payload.message))
    return ConsultResponse(response=response, source="JaundiCare VaxAI")
