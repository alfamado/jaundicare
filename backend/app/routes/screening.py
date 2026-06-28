# from pathlib import Path
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),

#     age_hours: int = Form(...),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     triage_level, triage_reason, triage_notes = run_triage(triage_input)
#     image_result = classifier.predict(str(destination))

#     final_result = combine_decision(
#         triage_level=triage_level,
#         triage_reason=triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone
#     )

#     return ScreeningResponse(
#         success=True,
#         filename=image.filename,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         triage_level=final_result["triage_level"],
#         triage_reason=final_result["triage_reason"],
#         final_decision=final_result["final_decision"],
#         notes=final_result["notes"],
#     )



# from pathlib import Path
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: int = Form(...),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     triage_level, triage_reason, triage_notes = run_triage(triage_input)
#     image_result = classifier.predict(str(destination))

#     final_result = combine_decision(
#         triage_level=triage_level,
#         triage_reason=triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone
#     )

#     return ScreeningResponse(
#         success=True,
#         filename=image.filename,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         confidence_band=image_result.get("confidence_band"),
#         triage_level=final_result["triage_level"],
#         triage_reason=final_result["triage_reason"],
#         final_decision=final_result["final_decision"],
#         parent_message=final_result["parent_message"],
#         notes=final_result["notes"],
#     )


# from pathlib import Path
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: int = Form(...),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)
#     image_result = classifier.predict(str(destination))

#     final_result = combine_decision(
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone
#     )

#     return ScreeningResponse(
#         success=True,
#         filename=image.filename,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         confidence_band=image_result.get("confidence_band"),
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         final_decision=final_result["final_decision"],
#         final_decision_reason=final_result["final_decision_reason"],
#         parent_message=final_result["parent_message"],
#         notes=final_result["notes"],
#     )

# from pathlib import Path
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision
# from app.services.facility_service import get_recommended_facilities
# from app.services.profile_store import (
#     get_baby_profile,
#     calculate_baby_age_hours,
#     save_screening,
#     get_screenings
# )

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: int = Form(None),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
#     user_latitude: float = Form(None),
#     user_longitude: float = Form(None),
#     user_state: str = Form(None),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     profile = get_baby_profile()
#     computed_age_hours = calculate_baby_age_hours(profile)

#     if age_hours is None:
#         if computed_age_hours is None:
#             raise HTTPException(
#                 status_code=400,
#                 detail="No age_hours provided and no baby profile available."
#             )
#         age_hours = computed_age_hours

#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     print("TRIAGE INPUT:", triage_input)

#     raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)
#     image_result = classifier.predict(str(destination))

#     final_result = combine_decision(
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone
#     )


#     facilities = get_recommended_facilities(
#         state=user_state or "ogun",
#         decision=final_result["final_decision"],
#         user_latitude=user_latitude,
#         user_longitude=user_longitude
#     )

    

#     # state = "Ogun"  # for now (later from user/profile)

#     # facilities = get_recommended_facilities(
#     #     state=state,
#     #     decision=final_result["final_decision"]
#     # )


#     saved_record = save_screening({
#         "filename": image.filename,
#         "baby_age_hours": age_hours,
#         "image_prediction": image_result["prediction"],
#         "image_confidence": image_result["confidence"],
#         "confidence_band": image_result.get("confidence_band"),
#         "raw_triage_level": raw_triage_level,
#         "raw_triage_reason": raw_triage_reason,
#         "final_decision": final_result["final_decision"],
#         "final_decision_reason": final_result["final_decision_reason"],
#         "parent_message": final_result["parent_message"],
#         "notes": final_result["notes"],
#         "symptoms": triage_input
#     })

#     return ScreeningResponse(
#         success=True,
#         filename=image.filename,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         confidence_band=image_result.get("confidence_band"),
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         final_decision=final_result["final_decision"],
#         final_decision_reason=final_result["final_decision_reason"],
#         parent_message=final_result["parent_message"],
#         notes=final_result["notes"],
#         screening_id=saved_record["screening_id"],
#         created_at=saved_record["created_at"],
#         baby_age_hours=age_hours,
#         recommended_facilities=facilities   # IMPORTANT
#     )

# @router.get("/history")
# def screening_history():
#     return get_screenings()


# from pathlib import Path
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision
# from app.services.profile_store import (
#     get_baby_profile,
#     calculate_baby_age_hours,
#     save_screening,
#     get_screenings
# )
# from app.services.facility_service import get_recommended_facilities

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: int = Form(None),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
#     user_latitude: float = Form(None),
#     user_longitude: float = Form(None),
#     user_state: str = Form(None),
#     ui_language: str = Form("en"),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     profile = get_baby_profile()
#     computed_age_hours = calculate_baby_age_hours(profile)

#     if age_hours is None:
#         if computed_age_hours is None:
#             raise HTTPException(
#                 status_code=400,
#                 detail="No age_hours provided and no baby profile available."
#             )
#         age_hours = computed_age_hours

#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     print("TRIAGE INPUT:", triage_input)

#     raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)
#     image_result = classifier.predict(str(destination))

#     print("IMAGE RESULT:", image_result)

#     final_result = combine_decision(
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone,
#         language=ui_language
#     )

#     facilities = get_recommended_facilities(
#         user_lat=user_latitude,
#         user_lon=user_longitude,
#         user_state=user_state,
#         triage_level=raw_triage_level,
#     )

#     saved_record = save_screening({
#         "filename": image.filename,
#         "baby_age_hours": age_hours,
#         "image_prediction": image_result["prediction"],
#         "image_confidence": image_result["confidence"],
#         "confidence_band": image_result.get("confidence_band"),
#         "raw_triage_level": raw_triage_level,
#         "raw_triage_reason": raw_triage_reason,
#         "final_decision": final_result["final_decision"],
#         "final_decision_reason": final_result["final_decision_reason"],
#         "parent_message": final_result["parent_message"],
#         "notes": final_result["notes"],
#         "recommended_facilities": facilities,
#         "symptoms": triage_input
#     })

#     return ScreeningResponse(
#         success=True,
#         filename=image.filename,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result.get("confidence_percent"),
#         confidence_band=image_result.get("confidence_band"),
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         final_decision=final_result["final_decision"],
#         final_decision_reason=final_result["final_decision_reason"],
#         parent_message=final_result["parent_message"],
#         notes=final_result["notes"],
#         screening_id=saved_record["screening_id"],
#         created_at=saved_record["created_at"],
#         baby_age_hours=age_hours,
#         recommended_facilities=facilities
#     )


# @router.get("/history")
# def screening_history():
#     return get_screenings()


# from pathlib import Path
# from typing import Optional
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision
# from app.services.profile_store import (
#     get_baby_profile,
#     calculate_baby_age_hours,
#     save_screening,
#     get_screenings,
# )
# from app.services.facility_service import get_recommended_facilities

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: Optional[int] = Form(None),          # Fixed: was int = Form(None) which crashes
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
#     user_latitude: Optional[float] = Form(None),    # Fixed: added Optional
#     user_longitude: Optional[float] = Form(None),   # Fixed: added Optional
#     user_state: Optional[str] = Form(None),         # Fixed: added Optional
#     ui_language: str = Form("en"),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     profile = get_baby_profile()
#     computed_age_hours = calculate_baby_age_hours(profile)

#     if age_hours is None:
#         if computed_age_hours is None:
#             raise HTTPException(
#                 status_code=400,
#                 detail="No age_hours provided and no baby profile found. Please create a baby profile or enter age manually.",
#             )
#         age_hours = computed_age_hours

#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)
#     image_result = classifier.predict(str(destination))

#     final_result = combine_decision(
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone,
#         language=ui_language,
#     )

#     facilities = get_recommended_facilities(
#         user_lat=user_latitude,
#         user_lon=user_longitude,
#         user_state=user_state,
#         triage_level=raw_triage_level,
#     )

#     saved_record = save_screening({
#         "filename": image.filename,
#         "baby_age_hours": age_hours,
#         "image_prediction": image_result["prediction"],
#         "image_confidence": image_result["confidence"],
#         "confidence_band": image_result.get("confidence_band"),
#         "raw_triage_level": raw_triage_level,
#         "raw_triage_reason": raw_triage_reason,
#         "final_decision": final_result["final_decision"],
#         "final_decision_reason": final_result["final_decision_reason"],
#         "parent_message": final_result["parent_message"],
#         "notes": final_result["notes"],
#         "recommended_facilities": facilities,
#         "symptoms": triage_input,
#     })

#     return ScreeningResponse(
#         success=True,
#         filename=image.filename,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result.get("confidence_percent"),
#         confidence_band=image_result.get("confidence_band"),
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         final_decision=final_result["final_decision"],
#         final_decision_reason=final_result["final_decision_reason"],
#         parent_message=final_result["parent_message"],
#         notes=final_result["notes"],
#         screening_id=saved_record["screening_id"],
#         created_at=saved_record["created_at"],
#         baby_age_hours=age_hours,
#         recommended_facilities=facilities,
#     )


# @router.get("/history")
# def screening_history():
#     return get_screenings()





# from pathlib import Path
# from typing import Optional
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision
# from app.services.profile_store import (
#     get_baby_profile,
#     calculate_baby_age_hours,
#     save_screening,
#     get_screenings,
# )
# from app.services.facility_service import get_recommended_facilities

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: Optional[int] = Form(None),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
#     user_latitude: Optional[float] = Form(None),
#     user_longitude: Optional[float] = Form(None),
#     user_state: Optional[str] = Form(None),
#     user_lga: Optional[str] = Form(None),
#     ui_language: str = Form("en"),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     profile = get_baby_profile()
#     computed_age_hours = calculate_baby_age_hours(profile)

#     if age_hours is None:
#         if computed_age_hours is None:
#             raise HTTPException(
#                 status_code=400,
#                 detail="No age_hours provided and no baby profile found. Please create a baby profile or enter age manually.",
#             )
#         age_hours = computed_age_hours

#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)
#     image_result = classifier.predict(str(destination))

#     final_result = combine_decision(
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone,
#         language=ui_language,
#     )

#     # Core Fix: Passes form inputs cleanly down to the location engine
#     facilities = get_recommended_facilities(
#         user_lat=user_latitude,
#         user_lon=user_longitude,
#         user_state=user_state,
#         user_lga=user_lga,
#         triage_level=raw_triage_level,
#     )

#     saved_record = save_screening({
#         "filename": image.filename,
#         "baby_age_hours": age_hours,
#         "image_prediction": image_result["prediction"],
#         "image_confidence": image_result["confidence"],
#         "confidence_band": image_result.get("confidence_band"),
#         "raw_triage_level": raw_triage_level,
#         "raw_triage_reason": raw_triage_reason,
#         "final_decision": final_result["final_decision"],
#         "final_decision_reason": final_result["final_decision_reason"],
#         "parent_message": final_result["parent_message"],
#         "notes": final_result["notes"],
#         "recommended_facilities": facilities,
#         "symptoms": triage_input,
#     })

#     return ScreeningResponse(
#         success=True,
#         filename=image.filename,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result.get("confidence"),  # Swapped to confidence to match schema key
#         confidence_band=image_result.get("confidence_band"),
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         final_decision=final_result["final_decision"],
#         final_decision_reason=final_result["final_decision_reason"],
#         parent_message=final_result["parent_message"],
#         notes=final_result["notes"],
#         screening_id=saved_record["screening_id"],
#         created_at=saved_record["created_at"],
#         baby_age_hours=age_hours,
#         recommended_facilities=facilities,
#     )


# @router.get("/history")
# def screening_history():
#     return get_screenings()


# """
# JaundiCare — Screening Route (PostgreSQL + Cloudinary version)
# Replaces the old JSON-file based screening route.
# """

# from pathlib import Path
# from typing import Optional
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
# from sqlalchemy.orm import Session

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision
# from app.services.facility_service import get_recommended_facilities
# from app.services.cloudinary_service import upload_screening_image
# from app.db.session import get_db
# from app.db.models import Screening, BabyProfile, ModelTrainingImage
# from app.db import profile_db

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: Optional[int] = Form(None),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
#     skin_tone_category: Optional[str] = Form(None),
#     user_latitude: Optional[float] = Form(None),
#     user_longitude: Optional[float] = Form(None),
#     user_state: Optional[str] = Form(None),
#     user_lga: Optional[str] = Form(None),
#     ui_language: str = Form("en"),
#     db: Session = Depends(get_db),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     # Get baby profile and compute age
#     profile = profile_db.get_latest_profile(db)
#     computed_age = profile_db.calculate_age_hours(profile) if profile else None

#     if age_hours is None:
#         if computed_age is None:
#             raise HTTPException(
#                 status_code=400,
#                 detail="No age_hours provided and no baby profile found.",
#             )
#         age_hours = computed_age

#     # Save image locally for inference
#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     # Run AI inference
#     image_result = classifier.predict(str(destination))

#     # Run symptom triage
#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)

#     # Combine AI + triage into final decision
#     final_result = combine_decision(
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone,
#         language=ui_language,
#     )

#     # Get nearby facilities
#     facilities = get_recommended_facilities(
#         user_lat=user_latitude,
#         user_lon=user_longitude,
#         user_state=user_state,
#         triage_level=raw_triage_level,
#     )

#     # Upload image to Cloudinary for permanent storage + model training
#     cloudinary_url = None
#     cloudinary_public_id = None
#     import uuid
#     screening_id = str(uuid.uuid4())

#     try:
#         cloud_result = upload_screening_image(
#             file_path=str(destination),
#             screening_id=screening_id,
#             skin_tone=skin_tone_category,
#             triage_level=raw_triage_level,
#         )
#         cloudinary_url       = cloud_result["url"]
#         cloudinary_public_id = cloud_result["public_id"]
#     except Exception as e:
#         # Cloudinary failure should NOT block the screening result
#         print(f"Cloudinary upload failed (non-critical): {e}")

#     # # Save to PostgreSQL
#     # screening = Screening(
#     #     id                    = screening_id,
#     #     profile_id            = profile.id if profile else None,
#     #     original_filename     = image.filename,
#     #     cloudinary_url        = cloudinary_url,
#     #     cloudinary_public_id  = cloudinary_public_id,
#     #     baby_age_hours        = age_hours,
#     #     image_prediction      = image_result["prediction"],
#     #     image_confidence      = image_result["confidence"],
#     #     confidence_band       = image_result.get("confidence_band"),
#     #     raw_triage_level      = raw_triage_level,
#     #     raw_triage_reason     = raw_triage_reason,
#     #     final_decision        = final_result["final_decision"],
#     #     final_decision_reason = final_result["final_decision_reason"],
#     #     parent_message        = final_result["parent_message"],
#     #     notes                 = final_result["notes"],
#     #     symptoms              = triage_input,
#     #     user_latitude         = user_latitude,
#     #     user_longitude        = user_longitude,
#     #     user_state            = user_state,
#     #     user_lga              = user_lga,
#     #     skin_tone_category    = skin_tone_category,
#     #     recommended_facilities= facilities,
#     #     ui_language           = ui_language,
#     # )
#     # db.add(screening)

#     # # Add to model training table
#     # if cloudinary_url:
#     #     training_image = ModelTrainingImage(
#     #         screening_id         = screening_id,
#     #         cloudinary_url       = cloudinary_url,
#     #         cloudinary_public_id = cloudinary_public_id,
#     #         skin_tone_category   = skin_tone_category,
#     #         baby_age_hours       = age_hours,
#     #         final_decision       = final_result["final_decision"],
#     #         triage_level         = raw_triage_level,
#     #     )
#     #     db.add(training_image)

#     # db.commit()
#     # db.refresh(screening)

#     # =================================================================
#     # SAVE BASE SCREENING RECORD FIRST (Ensures parent row exists)
#     # =================================================================
#     screening = Screening(
#         id                    = screening_id,
#         profile_id            = profile.id if profile else None,
#         original_filename     = image.filename,
#         cloudinary_url        = cloudinary_url,
#         cloudinary_public_id  = cloudinary_public_id,
#         baby_age_hours        = age_hours,
#         image_prediction      = image_result["prediction"],
#         image_confidence      = image_result["confidence"],
#         confidence_band       = image_result.get("confidence_band"),
#         raw_triage_level      = raw_triage_level,
#         raw_triage_reason     = raw_triage_reason,
#         final_decision        = final_result["final_decision"],
#         final_decision_reason = final_result["final_decision_reason"],
#         parent_message        = final_result["parent_message"],
#         notes                 = final_result["notes"],
#         symptoms              = triage_input,
#         user_latitude         = user_latitude,
#         user_longitude        = user_longitude,
#         user_state            = user_state,
#         user_lga              = user_lga,
#         skin_tone_category    = skin_tone_category,
#         recommended_facilities= facilities,
#         ui_language           = ui_language,
#     )
#     db.add(screening)
    
#     # Force SQLAlchemy to write the Screening record to PostgreSQL right now
#     # This guarantees the ForeignKey requirement is fulfilled.
#     db.flush()

#     # =================================================================
#     # SAVE DEPENDENT MODEL TRAINING IMAGE RECORD SECOND
#     # =================================================================
#     if cloudinary_url:
#         training_image = ModelTrainingImage(
#             screening_id         = screening.id, # Uses the safely flushed id
#             cloudinary_url       = cloudinary_url,
#             cloudinary_public_id = cloudinary_public_id,
#             skin_tone_category   = skin_tone_category,
#             baby_age_hours       = age_hours,
#             final_decision       = final_result["final_decision"],
#             triage_level         = raw_triage_level,
#         )
#         db.add(training_image)

#     # Commit both transactions atomically to disk
#     db.commit()
#     db.refresh(screening)

#     print("\n=========================================")
#     print("🎉 SUCCESSFUL POSTGRESQL INSERTION!")
#     print(f"Screening ID Saved: {screening.id}")
#     print(f"Linked Training Image Saved: {cloudinary_url is not None}")
#     print("=========================================\n")

#     return ScreeningResponse(
#         success               = True,
#         filename              = image.filename,
#         image_prediction      = image_result["prediction"],
#         image_confidence      = image_result.get("confidence_percent"),
#         confidence_band       = image_result.get("confidence_band"),
#         raw_triage_level      = raw_triage_level,
#         raw_triage_reason     = raw_triage_reason,
#         final_decision        = final_result["final_decision"],
#         final_decision_reason = final_result["final_decision_reason"],
#         parent_message        = final_result["parent_message"],
#         notes                 = final_result["notes"],
#         screening_id          = screening.id,
#         created_at            = screening.created_at.isoformat(),
#         baby_age_hours        = age_hours,
#         recommended_facilities= facilities,
#     )


# @router.get("/history")
# def screening_history(db: Session = Depends(get_db)):
#     screenings = (
#         db.query(Screening)
#         .order_by(Screening.created_at.desc())
#         .limit(100)
#         .all()
#     )
#     return [
#         {
#             "screening_id":          s.id,
#             "created_at":            s.created_at.isoformat(),
#             "filename":              s.original_filename,
#             "cloudinary_url":        s.cloudinary_url,
#             "baby_age_hours":        s.baby_age_hours,
#             "image_prediction":      s.image_prediction,
#             "image_confidence":      s.image_confidence,
#             "confidence_band":       s.confidence_band,
#             "raw_triage_level":      s.raw_triage_level,
#             "raw_triage_reason":     s.raw_triage_reason,
#             "final_decision":        s.final_decision,
#             "final_decision_reason": s.final_decision_reason,
#             "parent_message":        s.parent_message,
#             "notes":                 s.notes or [],
#             "symptoms":              s.symptoms or {},
#             "recommended_facilities":s.recommended_facilities or [],
#         }
#         for s in screenings
#     ]




# """
# JaundiCare — Screening Route (PostgreSQL + Cloudinary + Facility Preference)
# """

# from pathlib import Path
# from typing import Optional
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
# from sqlalchemy.orm import Session

# from app.config import UPLOAD_DIR
# from app.schemas import ScreeningResponse
# from app.utils.file_utils import save_upload_file
# from app.services.cv_inference import classifier
# from app.services.triage_engine import run_triage
# from app.services.decision_engine import combine_decision
# from app.services.facility_service import get_recommended_facilities
# from app.services.cloudinary_service import upload_screening_image
# from app.db.session import get_db
# from app.db.models import Screening, BabyProfile, ModelTrainingImage
# from app.db import profile_db

# router = APIRouter(prefix="/screening", tags=["screening"])


# @router.post("/analyze", response_model=ScreeningResponse)
# async def analyze_screening(
#     image: UploadFile = File(...),
#     age_hours: Optional[int] = Form(None),
#     feeding: str = Form(...),
#     difficult_to_wake: bool = Form(False),
#     floppy_or_unusually_drowsy: bool = Form(False),
#     jaundice_first_24h: bool = Form(False),
#     jaundice_spreading: bool = Form(False),
#     yellow_eyes: bool = Form(False),
#     yellow_gums: bool = Form(False),
#     yellow_palms_or_soles: bool = Form(False),
#     dark_urine: bool = Form(False),
#     pale_stool: bool = Form(False),
#     darker_skin_tone: bool = Form(False),
#     skin_tone_category: Optional[str] = Form(None),
#     user_latitude: Optional[float] = Form(None),
#     user_longitude: Optional[float] = Form(None),
#     user_state: Optional[str] = Form(None),
#     user_lga: Optional[str] = Form(None),
#     facility_preference: Optional[str] = Form("nearest"),  # nearest | government | clinic
#     ui_language: str = Form("en"),
#     db: Session = Depends(get_db),
# ):
#     if not image.filename:
#         raise HTTPException(status_code=400, detail="No file provided.")

#     suffix = Path(image.filename).suffix.lower()
#     if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
#         raise HTTPException(status_code=400, detail="Unsupported image format.")

#     # Validate facility preference
#     valid_preferences = ("nearest", "government", "clinic")
#     if facility_preference not in valid_preferences:
#         facility_preference = "nearest"

#     # Get baby profile and compute age
#     profile = profile_db.get_latest_profile(db)
#     computed_age = profile_db.calculate_age_hours(profile) if profile else None

#     if age_hours is None:
#         if computed_age is None:
#             raise HTTPException(
#                 status_code=400,
#                 detail="No age_hours provided and no baby profile found.",
#             )
#         age_hours = computed_age

#     # Save image locally for inference
#     destination = UPLOAD_DIR / image.filename
#     save_upload_file(image, destination)

#     # Run AI inference
#     image_result = classifier.predict(str(destination))

#     # Run symptom triage
#     triage_input = {
#         "age_hours": age_hours,
#         "feeding": feeding,
#         "difficult_to_wake": difficult_to_wake,
#         "floppy_or_unusually_drowsy": floppy_or_unusually_drowsy,
#         "jaundice_first_24h": jaundice_first_24h,
#         "jaundice_spreading": jaundice_spreading,
#         "yellow_eyes": yellow_eyes,
#         "yellow_gums": yellow_gums,
#         "yellow_palms_or_soles": yellow_palms_or_soles,
#         "dark_urine": dark_urine,
#         "pale_stool": pale_stool,
#         "darker_skin_tone": darker_skin_tone,
#     }

#     raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)

#     # Combine AI + triage into final decision
#     final_result = combine_decision(
#         raw_triage_level=raw_triage_level,
#         raw_triage_reason=raw_triage_reason,
#         triage_notes=triage_notes,
#         image_prediction=image_result["prediction"],
#         image_confidence=image_result["confidence"],
#         darker_skin_tone=darker_skin_tone,
#         language=ui_language,
#     )

#     # Get nearby facilities with preference and LGA
#     facilities = get_recommended_facilities(
#         user_lat=user_latitude,
#         user_lon=user_longitude,
#         user_state=user_state,
#         user_lga=user_lga,
#         triage_level=raw_triage_level,
#         facility_preference=facility_preference or "nearest",
#         max_results=5,
#     )

#     # Upload image to Cloudinary for permanent storage + model training
#     cloudinary_url = None
#     cloudinary_public_id = None
#     import uuid
#     screening_id = str(uuid.uuid4())

#     try:
#         cloud_result = upload_screening_image(
#             file_path=str(destination),
#             screening_id=screening_id,
#             skin_tone=skin_tone_category,
#             triage_level=raw_triage_level,
#         )
#         cloudinary_url = cloud_result["url"]
#         cloudinary_public_id = cloud_result["public_id"]
#     except Exception as e:
#         print(f"Cloudinary upload failed (non-critical): {e}")

#     # Save to PostgreSQL
#     screening = Screening(
#         id                    = screening_id,
#         profile_id            = profile.id if profile else None,
#         original_filename     = image.filename,
#         cloudinary_url        = cloudinary_url,
#         cloudinary_public_id  = cloudinary_public_id,
#         baby_age_hours        = age_hours,
#         image_prediction      = image_result["prediction"],
#         image_confidence      = image_result["confidence"],
#         confidence_band       = image_result.get("confidence_band"),
#         raw_triage_level      = raw_triage_level,
#         raw_triage_reason     = raw_triage_reason,
#         final_decision        = final_result["final_decision"],
#         final_decision_reason = final_result["final_decision_reason"],
#         parent_message        = final_result["parent_message"],
#         notes                 = final_result["notes"],
#         symptoms              = triage_input,
#         user_latitude         = user_latitude,
#         user_longitude        = user_longitude,
#         user_state            = user_state,
#         user_lga              = user_lga,
#         skin_tone_category    = skin_tone_category,
#         recommended_facilities= facilities,
#         ui_language           = ui_language,
#     )
#     db.add(screening)

#     # Add to model training table
#     if cloudinary_url:
#         training_image = ModelTrainingImage(
#             screening_id         = screening_id,
#             cloudinary_url       = cloudinary_url,
#             cloudinary_public_id = cloudinary_public_id,
#             skin_tone_category   = skin_tone_category,
#             baby_age_hours       = age_hours,
#             final_decision       = final_result["final_decision"],
#             triage_level         = raw_triage_level,
#         )
#         db.add(training_image)

#     db.commit()
#     db.refresh(screening)

#     return ScreeningResponse(
#         success               = True,
#         filename              = image.filename,
#         image_prediction      = image_result["prediction"],
#         image_confidence      = image_result.get("confidence_percent"),
#         confidence_band       = image_result.get("confidence_band"),
#         raw_triage_level      = raw_triage_level,
#         raw_triage_reason     = raw_triage_reason,
#         final_decision        = final_result["final_decision"],
#         final_decision_reason = final_result["final_decision_reason"],
#         parent_message        = final_result["parent_message"],
#         notes                 = final_result["notes"],
#         screening_id          = screening.id,
#         created_at            = screening.created_at.isoformat(),
#         baby_age_hours        = age_hours,
#         recommended_facilities= facilities,
#     )


# @router.get("/history")
# def screening_history(db: Session = Depends(get_db)):
#     screenings = (
#         db.query(Screening)
#         .order_by(Screening.created_at.desc())
#         .limit(100)
#         .all()
#     )
#     return [
#         {
#             "screening_id":          s.id,
#             "created_at":            s.created_at.isoformat(),
#             "filename":              s.original_filename,
#             "cloudinary_url":        s.cloudinary_url,
#             "baby_age_hours":        s.baby_age_hours,
#             "image_prediction":      s.image_prediction,
#             "image_confidence":      s.image_confidence,
#             "confidence_band":       s.confidence_band,
#             "raw_triage_level":      s.raw_triage_level,
#             "raw_triage_reason":     s.raw_triage_reason,
#             "final_decision":        s.final_decision,
#             "final_decision_reason": s.final_decision_reason,
#             "parent_message":        s.parent_message,
#             "notes":                 s.notes or [],
#             "symptoms":              s.symptoms or {},
#             "recommended_facilities":s.recommended_facilities or [],
#         }
#         for s in screenings
#     ]






"""
JaundiCare — Screening Route (PostgreSQL + Cloudinary + Facility Preference)
"""

from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.schemas import ScreeningResponse
from app.utils.file_utils import save_upload_file
from app.services.cv_inference import classifier
from app.services.triage_engine import run_triage
from app.services.decision_engine import combine_decision
from app.services.facility_service import get_recommended_facilities
from app.services.cloudinary_service import upload_screening_image
from app.db.session import get_db
from app.db.models import Screening, BabyProfile, ModelTrainingImage
from app.db import profile_db

router = APIRouter(prefix="/screening", tags=["screening"])


@router.post("/analyze", response_model=ScreeningResponse)
async def analyze_screening(
    image: UploadFile = File(...),
    age_hours: Optional[int] = Form(None),
    feeding: str = Form(...),
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
    skin_tone_category: Optional[str] = Form(None),
    user_latitude: Optional[float] = Form(None),
    user_longitude: Optional[float] = Form(None),
    user_state: Optional[str] = Form(None),
    user_lga: Optional[str] = Form(None),
    facility_preference: Optional[str] = Form("nearest"),  # nearest | government | clinic
    ui_language: str = Form("en"),
    db: Session = Depends(get_db),
):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    suffix = Path(image.filename).suffix.lower()
    if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Unsupported image format.")

    # Validate facility preference
    valid_preferences = ("nearest", "government", "clinic")
    if facility_preference not in valid_preferences:
        facility_preference = "nearest"

    # Get baby profile and compute age
    profile = profile_db.get_latest_profile(db)
    computed_age = profile_db.calculate_age_hours(profile) if profile else None

    if age_hours is None:
        if computed_age is None:
            raise HTTPException(
                status_code=400,
                detail="No age_hours provided and no baby profile found.",
            )
        age_hours = computed_age

    # Save image locally for inference
    destination = UPLOAD_DIR / image.filename
    save_upload_file(image, destination)

    # Run AI inference
    image_result = classifier.predict(str(destination))

    # Run symptom triage
    triage_input = {
        "age_hours": age_hours,
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

    raw_triage_level, raw_triage_reason, triage_notes = run_triage(triage_input)

    # Combine AI + triage into final decision
    final_result = combine_decision(
        raw_triage_level=raw_triage_level,
        raw_triage_reason=raw_triage_reason,
        triage_notes=triage_notes,
        image_prediction=image_result["prediction"],
        image_confidence=image_result["confidence"],
        darker_skin_tone=darker_skin_tone,
        language=ui_language,
    )

    # Get nearby facilities with preference and LGA
    facilities = get_recommended_facilities(
        user_lat=user_latitude,
        user_lon=user_longitude,
        user_state=user_state,
        user_lga=user_lga,
        triage_level=raw_triage_level,
        facility_preference=facility_preference or "nearest",
        max_results=5,
    )

    # Upload image to Cloudinary for permanent storage + model training
    cloudinary_url = None
    cloudinary_public_id = None
    import uuid
    screening_id = str(uuid.uuid4())

    try:
        cloud_result = upload_screening_image(
            file_path=str(destination),
            screening_id=screening_id,
            skin_tone=skin_tone_category,
            triage_level=raw_triage_level,
        )
        cloudinary_url = cloud_result["url"]
        cloudinary_public_id = cloud_result["public_id"]
    except Exception as e:
        print(f"Cloudinary upload failed (non-critical): {e}")

    # Save to PostgreSQL
    screening = Screening(
        id                    = screening_id,
        profile_id            = profile.id if profile else None,
        original_filename     = image.filename,
        cloudinary_url        = cloudinary_url,
        cloudinary_public_id  = cloudinary_public_id,
        baby_age_hours        = age_hours,
        image_prediction      = image_result["prediction"],
        image_confidence      = image_result["confidence"],
        confidence_band       = image_result.get("confidence_band"),
        raw_triage_level      = raw_triage_level,
        raw_triage_reason     = raw_triage_reason,
        final_decision        = final_result["final_decision"],
        final_decision_reason = final_result["final_decision_reason"],
        parent_message        = final_result["parent_message"],
        notes                 = final_result["notes"],
        symptoms              = triage_input,
        user_latitude         = user_latitude,
        user_longitude        = user_longitude,
        user_state            = user_state,
        user_lga              = user_lga,
        skin_tone_category    = skin_tone_category,
        recommended_facilities= facilities,
        ui_language           = ui_language,
    )
    db.add(screening)
    db.commit()        # ← commit screening FIRST so FK constraint is satisfied
    db.refresh(screening)

    # Add to model training table — AFTER screening is committed
    if cloudinary_url:
        training_image = ModelTrainingImage(
            screening_id         = screening_id,
            cloudinary_url       = cloudinary_url,
            cloudinary_public_id = cloudinary_public_id,
            skin_tone_category   = skin_tone_category,
            baby_age_hours       = age_hours,
            final_decision       = final_result["final_decision"],
            triage_level         = raw_triage_level,
        )
        db.add(training_image)
        db.commit()

    return ScreeningResponse(
        success               = True,
        filename              = image.filename,
        image_prediction      = image_result["prediction"],
        image_confidence      = image_result.get("confidence_percent"),
        confidence_band       = image_result.get("confidence_band"),
        raw_triage_level      = raw_triage_level,
        raw_triage_reason     = raw_triage_reason,
        final_decision        = final_result["final_decision"],
        final_decision_reason = final_result["final_decision_reason"],
        parent_message        = final_result["parent_message"],
        notes                 = final_result["notes"],
        screening_id          = screening.id,
        created_at            = screening.created_at.isoformat(),
        baby_age_hours        = age_hours,
        recommended_facilities= facilities,
    )


@router.get("/history")
def screening_history(db: Session = Depends(get_db)):
    screenings = (
        db.query(Screening)
        .order_by(Screening.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "screening_id":          s.id,
            "created_at":            s.created_at.isoformat(),
            "filename":              s.original_filename,
            "cloudinary_url":        s.cloudinary_url,
            "baby_age_hours":        s.baby_age_hours,
            "image_prediction":      s.image_prediction,
            "image_confidence":      s.image_confidence,
            "confidence_band":       s.confidence_band,
            "raw_triage_level":      s.raw_triage_level,
            "raw_triage_reason":     s.raw_triage_reason,
            "final_decision":        s.final_decision,
            "final_decision_reason": s.final_decision_reason,
            "parent_message":        s.parent_message,
            "notes":                 s.notes or [],
            "symptoms":              s.symptoms or {},
            "recommended_facilities":s.recommended_facilities or [],
        }
        for s in screenings
    ]