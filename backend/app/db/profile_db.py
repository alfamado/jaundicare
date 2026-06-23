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