# """
# JaundiCare — HelpMum Routes
# Exposes MamaBot and VaxAI as consultation endpoints.
# """

# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from app.services.helpmum_service import ask_mamabot, ask_vaxai

# router = APIRouter(prefix="/consult", tags=["consultation"])


# class ConsultRequest(BaseModel):
#     message: str


# class ConsultResponse(BaseModel):
#     response: str
#     source: str


# @router.post("/mamabot", response_model=ConsultResponse)
# async def mamabot_consult(payload: ConsultRequest):
#     if not payload.message.strip():
#         raise HTTPException(status_code=400, detail="Message cannot be empty.")
#     response = await ask_mamabot(payload.message)
#     return ConsultResponse(response=response, source="MamaBot by HelpMum")


# @router.post("/vaxai", response_model=ConsultResponse)
# async def vaxai_consult(payload: ConsultRequest):
#     if not payload.message.strip():
#         raise HTTPException(status_code=400, detail="Message cannot be empty.")
#     response = await ask_vaxai(payload.message)
#     return ConsultResponse(response=response, source="VaxAI by HelpMum")





"""
JaundiCare — HelpMum Routes
Exposes MamaBot and VaxAI as consultation endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.helpmum_service import ask_mamabot, ask_vaxai

router = APIRouter(prefix="/consult", tags=["consultation"])


class ConsultRequest(BaseModel):
    message: str


class ConsultResponse(BaseModel):
    response: str
    source: str


@router.post("/mamabot", response_model=ConsultResponse)
async def mamabot_consult(payload: ConsultRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    response = await ask_mamabot(payload.message)
    return ConsultResponse(response=response, source="MamaBot by HelpMum")


@router.post("/vaxai", response_model=ConsultResponse)
async def vaxai_consult(payload: ConsultRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    response = await ask_vaxai(payload.message)
    return ConsultResponse(response=response, source="VaxAI by HelpMum")