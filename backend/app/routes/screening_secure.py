"""Authenticated jaundice screening, history, and training-consent routes."""

import logging
import os
from datetime import datetime
from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.db import profile_db
from app.db.models import ModelTrainingImage, Screening, User
from app.db.session import get_db
from app.schemas import ScreeningResponse
from app.services.auth_middleware import get_current_user
from app.services.cloudinary_service import delete_image, upload_screening_image
from app.services.decision_engine import combine_decision
from app.services.facility_service import get_recommended_facilities
from app.services.pth_inference import classifier
from app.services.triage_engine import run_triage
from app.utils.file_utils import InvalidImageUpload, safe_original_filename, save_upload_file


router = APIRouter(prefix="/screening", tags=["screening"])
logger = logging.getLogger(__name__)

TRAINING_IMAGE_STORAGE_ENABLED = os.getenv(
    "ENABLE_TRAINING_IMAGE_STORAGE",
    "false",
).strip().lower() in {"1", "true", "yes", "on"}
TRAINING_CONSENT_VERSION = "2026-07-13-v1"


@router.post("/analyze", response_model=ScreeningResponse)
async def analyze_screening(
    image: UploadFile = File(...),
    age_hours: int | None = Form(None, ge=0, le=8760),
    feeding: Literal["good", "poor"] = Form(...),
    difficult_to_wake: bool = Form(False),
    floppy_or_unusually_drowsy: bool = Form(False),
    jaundice_first_24h: bool = Form(False),
    jaundice_spreading: bool = Form(False),
    yellow_eyes: bool = Form(False),
    yellow_gums: bool = Form(False),
    yellow_palms_or_soles: bool = Form(False),
    dark_urine: bool = Form(False),
    pale_stool: bool = Form(False),
    darker_skin_tone: bool = Form(False),
    skin_tone_category: str | None = Form(None, max_length=30),
    user_latitude: float | None = Form(None, ge=-90, le=90),
    user_longitude: float | None = Form(None, ge=-180, le=180),
    user_state: str | None = Form(None, max_length=50),
    user_lga: str | None = Form(None, max_length=100),
    facility_preference: Literal["nearest", "government", "clinic"] = Form("nearest"),
    ui_language: Literal["en", "yo", "ha", "ig", "pcm"] = Form("en"),
    allow_training_use: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No image was provided.")

    profile = profile_db.get_latest_profile(db, current_user.id)
    computed_age = profile_db.calculate_age_hours(profile) if profile else None
    resolved_age = age_hours if age_hours is not None else computed_age

    try:
        destination = await save_upload_file(image, UPLOAD_DIR)
    except InvalidImageUpload as error:
        await image.close()
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        await image.close()
        logger.exception("Screening image could not be saved safely")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The image could not be processed. Please try again.",
        ) from error

    cloudinary_public_id: str | None = None
    cloud_asset_committed = False

    try:
        image_result = classifier.predict(str(destination))
        triage_input = {
            "age_hours": resolved_age,
            "feeding": feeding,
            "difficult_to_wake": difficult_to_wake,
            "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
            "jaundice_first_24h": jaundice_first_24h,
            "jaundice_spreading": jaundice_spreading,
            "yellow_eyes": yellow_eyes,
            "yellow_gums": yellow_gums,
            "yellow_palms_or_soles": yellow_palms_or_soles,
            "dark_urine": dark_urine,
            "pale_stool": pale_stool,
            "darker_skin_tone": darker_skin_tone,
        }
        raw_level, raw_reason, triage_notes = run_triage(triage_input)
        final_result = combine_decision(
            raw_triage_level=raw_level,
            raw_triage_reason=raw_reason,
            triage_notes=triage_notes,
            image_prediction=image_result["prediction"],
            image_confidence=image_result["confidence"],
            darker_skin_tone=darker_skin_tone,
            language=ui_language,
        )
        facilities = get_recommended_facilities(
            user_lat=user_latitude,
            user_lon=user_longitude,
            user_state=user_state,
            user_lga=user_lga,
            triage_level=raw_level,
            facility_preference=facility_preference,
            max_results=5,
        )

        screening_id = uuid4()
        cloudinary_url: str | None = None
        consented_at: datetime | None = None
        if allow_training_use and TRAINING_IMAGE_STORAGE_ENABLED:
            try:
                cloud_result = upload_screening_image(
                    file_path=str(destination),
                    screening_id=str(screening_id),
                    skin_tone=skin_tone_category,
                    triage_level=raw_level,
                )
                cloudinary_url = cloud_result["url"]
                cloudinary_public_id = cloud_result["public_id"]
                consented_at = datetime.utcnow()
            except Exception:
                logger.exception("Consented training-image upload failed")
        elif allow_training_use:
            logger.warning("Training consent received while image storage is disabled")

        screening = Screening(
            id=screening_id,
            user_id=current_user.id,
            profile_id=profile.id if profile else None,
            original_filename=safe_original_filename(image.filename),
            cloudinary_url=cloudinary_url,
            cloudinary_public_id=cloudinary_public_id,
            baby_age_hours=resolved_age,
            image_prediction=image_result["prediction"],
            image_confidence=image_result["confidence"],
            confidence_band=image_result.get("confidence_band"),
            raw_triage_level=raw_level,
            raw_triage_reason=raw_reason,
            final_decision=final_result["final_decision"],
            final_decision_reason=final_result["final_decision_reason"],
            parent_message=final_result["parent_message"],
            notes=final_result["notes"],
            symptoms=triage_input,
            user_latitude=user_latitude,
            user_longitude=user_longitude,
            user_state=user_state,
            user_lga=user_lga,
            skin_tone_category=skin_tone_category,
            recommended_facilities=facilities,
            ui_language=ui_language,
        )
        db.add(screening)
        db.flush()

        if cloudinary_url and cloudinary_public_id and consented_at:
            db.add(
                ModelTrainingImage(
                    screening_id=screening.id,
                    cloudinary_url=cloudinary_url,
                    cloudinary_public_id=cloudinary_public_id,
                    skin_tone_category=skin_tone_category,
                    baby_age_hours=resolved_age,
                    final_decision=final_result["final_decision"],
                    triage_level=raw_level,
                    is_usable_for_training=True,
                    consent_version=TRAINING_CONSENT_VERSION,
                    consented_at=consented_at,
                )
            )

        db.commit()
        cloud_asset_committed = True
        db.refresh(screening)
        return ScreeningResponse(
            success=True,
            filename=screening.original_filename,
            image_prediction=image_result["prediction"],
            image_confidence=image_result.get("confidence_percent"),
            confidence_band=image_result.get("confidence_band"),
            raw_triage_level=raw_level,
            raw_triage_reason=raw_reason,
            final_decision=final_result["final_decision"],
            final_decision_reason=final_result["final_decision_reason"],
            parent_message=final_result["parent_message"],
            notes=final_result["notes"],
            screening_id=str(screening.id),
            created_at=screening.created_at.isoformat(),
            baby_age_hours=resolved_age,
            training_image_stored=bool(cloudinary_public_id),
            recommended_facilities=facilities,
        )
    except Exception:
        db.rollback()
        if cloudinary_public_id and not cloud_asset_committed:
            delete_image(cloudinary_public_id)
        raise
    finally:
        destination.unlink(missing_ok=True)
        await image.close()


@router.get("/history")
def screening_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    screenings = (
        db.query(Screening)
        .filter(Screening.user_id == current_user.id)
        .order_by(Screening.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "screening_id": str(screening.id),
            "created_at": screening.created_at.isoformat(),
            "filename": screening.original_filename,
            "baby_age_hours": screening.baby_age_hours,
            "image_prediction": screening.image_prediction,
            "image_confidence": screening.image_confidence,
            "confidence_band": screening.confidence_band,
            "raw_triage_level": screening.raw_triage_level,
            "raw_triage_reason": screening.raw_triage_reason,
            "final_decision": screening.final_decision,
            "final_decision_reason": screening.final_decision_reason,
            "parent_message": screening.parent_message,
            "notes": screening.notes or [],
            "symptoms": screening.symptoms or {},
            "recommended_facilities": screening.recommended_facilities or [],
        }
        for screening in screenings
    ]


@router.delete("/{screening_id}/training-consent")
def withdraw_training_consent(
    screening_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    screening = (
        db.query(Screening)
        .filter(
            Screening.id == screening_id,
            Screening.user_id == current_user.id,
        )
        .first()
    )
    if not screening:
        raise HTTPException(status_code=404, detail="Screening was not found.")

    training_images = (
        db.query(ModelTrainingImage)
        .filter(ModelTrainingImage.screening_id == screening.id)
        .all()
    )
    public_ids = {
        training_image.cloudinary_public_id for training_image in training_images
    }
    if screening.cloudinary_public_id:
        public_ids.add(screening.cloudinary_public_id)

    for public_id in public_ids:
        if not delete_image(public_id):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Image deletion could not be completed. Please retry.",
            )

    try:
        for training_image in training_images:
            db.delete(training_image)
        screening.cloudinary_url = None
        screening.cloudinary_public_id = None
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "message": "Training-image consent was withdrawn and the stored image was deleted."
    }
