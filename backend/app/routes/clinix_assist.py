"""First-party v1 interface for the ClinixTech Assist Core.

It uses JaundiCare's existing signed-in-user authentication. A later public
partner API will authenticate organisations by hashed, scoped API keys rather
than exposing this route directly to untrusted mobile clients.
"""

import logging
import os

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.routes.consultation import _record_and_limit_request
from app.services.auth_middleware import get_current_user
from app.services.clinix_assist.knowledge import IMMUNISATION_NG, NEWBORN_CARE
from app.services.clinix_assist.partner_auth import (
    PartnerCredential,
    assert_project_can_use,
    authenticate_api_key,
    record_and_limit_partner_request,
)
from app.services.clinix_assist.service import answer_question
from app.services.clinix_assist.standalone_client import (
    StandaloneAssistUnavailable,
    answer_from_standalone,
)


router = APIRouter(prefix="/v1/assistants", tags=["clinix-assist"])
partner_router = APIRouter(prefix="/v1/partner/assistants", tags=["clinix-partner-api"])

_PARTNER_DOMAINS = {
    "newborn-care": NEWBORN_CARE,
    "immunisation-ng": IMMUNISATION_NG,
}

logger = logging.getLogger(__name__)


class AssistRequest(BaseModel):
    """One request is independent; the server stores neither chat text nor history."""

    message: str = Field(..., min_length=1, max_length=1_000)
    language: str = Field(default="en", pattern=r"^(en|yo|ha|ig|pcm)$")
    session_id: str | None = Field(
        default=None,
        min_length=8,
        max_length=128,
        pattern=r"^[A-Za-z0-9_-]+$",
    )


class CitationResponse(BaseModel):
    id: str
    title: str
    url: str
    version: str


class AssistResponse(BaseModel):
    response: str
    action: str
    source: str
    provider: str
    content_version: str
    citations: list[CitationResponse]
    safety_reason: str | None = None


async def _respond(domain: str, payload: AssistRequest) -> AssistResponse:
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    try:
        answer = await answer_from_standalone(
            assistant=domain,
            message=message,
            language=payload.language,
            session_id=payload.session_id,
        )
    except StandaloneAssistUnavailable as error:
        # Never log a question or response. The embedded source-bounded
        # service preserves availability if the standalone service is down.
        logger.warning("Standalone Clinix Assist fallback: %s", error)
        answer = None

    if answer is None:
        answer = await answer_question(domain=domain, question=message, language=payload.language)
    return AssistResponse(
        response=answer.response,
        action=answer.action,
        source=answer.source,
        provider=answer.provider,
        content_version=answer.content_version,
        citations=[CitationResponse(**citation) for citation in answer.citations],
        safety_reason=answer.safety_reason,
    )


@router.post("/newborn-care/respond", response_model=AssistResponse)
async def newborn_care(
    payload: AssistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AssistResponse:
    _record_and_limit_request(db, current_user, "clinix_newborn")
    return await _respond(NEWBORN_CARE, payload)


@router.post("/immunisation-ng/respond", response_model=AssistResponse)
async def immunisation_ng(
    payload: AssistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AssistResponse:
    _record_and_limit_request(db, current_user, "clinix_immunisation")
    return await _respond(IMMUNISATION_NG, payload)


def _partner_api_is_enabled() -> bool:
    """Keep the public interface deliberately closed until operations approve it."""

    return os.getenv("CLINIX_PARTNER_API_ENABLED", "false").strip().lower() == "true"


def _partner_credential(
    db: Session = Depends(get_db),
    x_clinix_api_key: str | None = Header(default=None),
) -> PartnerCredential:
    if not _partner_api_is_enabled():
        raise HTTPException(status_code=404, detail="Not found.")
    return authenticate_api_key(db, x_clinix_api_key)


@partner_router.post("/{assistant}/respond", response_model=AssistResponse)
async def partner_assistant_response(
    assistant: str,
    payload: AssistRequest,
    credential: PartnerCredential = Depends(_partner_credential),
    db: Session = Depends(get_db),
) -> AssistResponse:
    """Future API for ClinixTech partners; disabled unless explicitly enabled.

    A partner calls this endpoint from its own server with ``X-Clinix-API-Key``.
    Browser and mobile apps must not contain partner API keys.
    """

    domain = _PARTNER_DOMAINS.get(assistant)
    if domain is None:
        raise HTTPException(status_code=404, detail="Unknown assistant.")
    assert_project_can_use(credential, assistant)
    record_and_limit_partner_request(
        db,
        project_id=credential.project.id,
        assistant=assistant,
    )
    return await _respond(domain, payload)
