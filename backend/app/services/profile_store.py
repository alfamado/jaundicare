# import json
# import uuid
# from datetime import datetime
# from pathlib import Path

# from app.config import BABY_PROFILE_PATH, SCREENINGS_PATH


# def _read_json_file(file_path: Path, default):
#     if not file_path.exists():
#         return default

#     try:
#         with open(file_path, "r", encoding="utf-8") as f:
#             return json.load(f)
#     except Exception:
#         return default


# def _write_json_file(file_path: Path, data):
#     with open(file_path, "w", encoding="utf-8") as f:
#         json.dump(data, f, indent=2)


# def save_baby_profile(profile_data: dict):
#     _write_json_file(BABY_PROFILE_PATH, profile_data)
#     return profile_data


# def get_baby_profile():
#     return _read_json_file(BABY_PROFILE_PATH, None)


# def calculate_baby_age_hours(profile: dict):
#     if not profile:
#         return None

#     dob = profile.get("date_of_birth")
#     tob = profile.get("time_of_birth")

#     if not dob or not tob:
#         return None

#     try:
#         birth_dt = datetime.fromisoformat(f"{dob}T{tob}")
#         now_dt = datetime.now()
#         delta = now_dt - birth_dt
#         age_hours = int(delta.total_seconds() // 3600)

#         if age_hours < 0:
#             return 0

#         return age_hours
#     except Exception:
#         return None


# def ensure_screenings_file():
#     if not SCREENINGS_PATH.exists():
#         _write_json_file(SCREENINGS_PATH, [])


# def save_screening(screening_data: dict):
#     ensure_screenings_file()
#     screenings = _read_json_file(SCREENINGS_PATH, [])

#     screening_record = {
#         "screening_id": str(uuid.uuid4()),
#         "created_at": datetime.now().isoformat(timespec="seconds"),
#         **screening_data
#     }

#     screenings.insert(0, screening_record)
#     _write_json_file(SCREENINGS_PATH, screenings)
#     return screening_record


# def get_screenings():
#     ensure_screenings_file()
#     return _read_json_file(SCREENINGS_PATH, [])


# def get_latest_screening():
#     screenings = get_screenings()
#     if screenings:
#         return screenings[0]
#     return None



"""
JaundiCare — Profile DB Operations
Replaces the old profile_store.py JSON file approach.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.db.models import BabyProfile


def get_latest_profile(db: Session):
    """Get the most recently created baby profile."""
    return db.query(BabyProfile).order_by(BabyProfile.created_at.desc()).first()


def save_profile(db: Session, data: dict) -> BabyProfile:
    """Create or update baby profile. For now single-profile model."""
    existing = get_latest_profile(db)

    if existing:
        for key, value in data.items():
            if hasattr(existing, key):
                setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    profile = BabyProfile(**data)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def calculate_age_hours(profile):
    """Calculate baby age in hours from profile birth date and time."""
    if not profile:
        return None

    dob = profile.date_of_birth
    tob = profile.time_of_birth

    if not dob or not tob:
        return None

    try:
        birth_dt = datetime.fromisoformat(f"{dob}T{tob}")
        delta    = datetime.utcnow() - birth_dt
        age      = int(delta.total_seconds() // 3600)
        return max(0, age)
    except Exception:
        return None


def profile_to_dict(profile, age_hours):
    """Serialise profile to dict for API response."""
    if not profile:
        return {"exists": False}

    return {
        "exists":                True,
        "id":                    profile.id,
        "baby_name":             profile.baby_name,
        "parent_name":           profile.parent_name,
        "date_of_birth":         profile.date_of_birth,
        "time_of_birth":         profile.time_of_birth,
        "sex":                   profile.sex,
        "gestational_age_weeks": profile.gestational_age_weeks,
        "age_hours":             age_hours,
    }