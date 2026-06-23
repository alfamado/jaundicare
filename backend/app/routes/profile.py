# from fastapi import APIRouter
# from app.schemas import BabyProfileCreate, BabyProfileResponse
# from app.services.profile_store import (
#     save_baby_profile,
#     get_baby_profile,
#     calculate_baby_age_hours
# )

# router = APIRouter(prefix="/profile", tags=["profile"])


# @router.get("/baby", response_model=BabyProfileResponse)
# def fetch_baby_profile():
#     profile = get_baby_profile()

#     if not profile:
#         return BabyProfileResponse(exists=False)

#     age_hours = calculate_baby_age_hours(profile)

#     return BabyProfileResponse(
#         exists=True,
#         baby_name=profile.get("baby_name"),
#         date_of_birth=profile.get("date_of_birth"),
#         time_of_birth=profile.get("time_of_birth"),
#         sex=profile.get("sex"),
#         gestational_age_weeks=profile.get("gestational_age_weeks"),
#         parent_name=profile.get("parent_name"),
#         age_hours=age_hours
#     )


# @router.post("/baby", response_model=BabyProfileResponse)
# def create_or_update_baby_profile(payload: BabyProfileCreate):
#     profile = payload.model_dump()
#     saved = save_baby_profile(profile)
#     age_hours = calculate_baby_age_hours(saved)

#     return BabyProfileResponse(
#         exists=True,
#         baby_name=saved.get("baby_name"),
#         date_of_birth=saved.get("date_of_birth"),
#         time_of_birth=saved.get("time_of_birth"),
#         sex=saved.get("sex"),
#         gestational_age_weeks=saved.get("gestational_age_weeks"),
#         parent_name=saved.get("parent_name"),
#         age_hours=age_hours
#     )


# from fastapi import APIRouter
# from app.schemas import BabyProfileCreate, BabyProfileResponse
# from app.services.profile_store import (
#     save_baby_profile,
#     get_baby_profile,
#     calculate_baby_age_hours,
# )

# router = APIRouter(prefix="/profile", tags=["profile"])


# @router.get("/baby", response_model=BabyProfileResponse)
# def fetch_baby_profile():
#     profile = get_baby_profile()
#     if not profile:
#         return BabyProfileResponse(exists=False)

#     age_hours = calculate_baby_age_hours(profile)
#     return BabyProfileResponse(
#         exists=True,
#         baby_name=profile.get("baby_name"),
#         date_of_birth=profile.get("date_of_birth"),
#         time_of_birth=profile.get("time_of_birth"),
#         sex=profile.get("sex"),
#         gestational_age_weeks=profile.get("gestational_age_weeks"),
#         parent_name=profile.get("parent_name"),
#         age_hours=age_hours,
#     )


# @router.post("/baby", response_model=BabyProfileResponse)
# def create_or_update_baby_profile(payload: BabyProfileCreate):
#     profile = payload.model_dump()
#     saved = save_baby_profile(profile)
#     age_hours = calculate_baby_age_hours(saved)
#     return BabyProfileResponse(
#         exists=True,
#         baby_name=saved.get("baby_name"),
#         date_of_birth=saved.get("date_of_birth"),
#         time_of_birth=saved.get("time_of_birth"),
#         sex=saved.get("sex"),
#         gestational_age_weeks=saved.get("gestational_age_weeks"),
#         parent_name=saved.get("parent_name"),
#         age_hours=age_hours,
#     )





from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import BabyProfileCreate, BabyProfileResponse
from app.db.session import get_db
from app.db import profile_db

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/baby", response_model=BabyProfileResponse)
def fetch_baby_profile(db: Session = Depends(get_db)):
    profile   = profile_db.get_latest_profile(db)
    age_hours = profile_db.calculate_age_hours(profile)
    return profile_db.profile_to_dict(profile, age_hours)


@router.post("/baby", response_model=BabyProfileResponse)
def create_or_update_baby_profile(
    payload: BabyProfileCreate,
    db: Session = Depends(get_db),
):
    data    = payload.model_dump(exclude_none=True)
    profile = profile_db.save_profile(db, data)
    age     = profile_db.calculate_age_hours(profile)
    return profile_db.profile_to_dict(profile, age)