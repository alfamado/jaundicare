"""
JaundiCare — Database Models
Replaces: baby_profile.json, screenings.json
Images now stored in Cloudinary, URL saved here.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    DateTime, JSON, Text, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class BabyProfile(Base):
    __tablename__ = "baby_profiles"

    id                   = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    baby_name            = Column(String(100), nullable=False)
    parent_name          = Column(String(100), nullable=True)
    date_of_birth        = Column(String(10),  nullable=False)   # YYYY-MM-DD
    time_of_birth        = Column(String(5),   nullable=False)   # HH:MM
    sex                  = Column(String(10),  nullable=True)
    gestational_age_weeks= Column(Integer,     nullable=True)
    created_at           = Column(DateTime,    default=datetime.utcnow)
    updated_at           = Column(DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)

    # One profile → many screenings
    screenings = relationship("Screening", back_populates="profile", lazy="dynamic")


class Screening(Base):
    __tablename__ = "screenings"

    id                   = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    profile_id           = Column(UUID(as_uuid=False), ForeignKey("baby_profiles.id"), nullable=True)

    # Image — stored in Cloudinary, URL saved here
    original_filename    = Column(String(255), nullable=True)
    cloudinary_url       = Column(Text,        nullable=True)   # permanent URL for model retraining
    cloudinary_public_id = Column(String(255), nullable=True)   # for deletion/management

    # Baby context at time of screening
    baby_age_hours       = Column(Integer,  nullable=True)

    # AI model result
    image_prediction     = Column(String(50),  nullable=True)
    image_confidence     = Column(Float,       nullable=True)
    confidence_band      = Column(String(50),  nullable=True)

    # Triage
    raw_triage_level     = Column(String(50),  nullable=False)
    raw_triage_reason    = Column(Text,        nullable=False)

    # Final decision
    final_decision       = Column(String(100), nullable=False)
    final_decision_reason= Column(Text,        nullable=False)
    parent_message       = Column(Text,        nullable=False)
    notes                = Column(JSON,        default=list)

    # Symptoms snapshot — stored as JSON so schema stays flexible
    symptoms             = Column(JSON,        default=dict)

    # Location
    user_latitude        = Column(Float,  nullable=True)
    user_longitude       = Column(Float,  nullable=True)
    user_state           = Column(String(50), nullable=True)
    user_lga             = Column(String(100), nullable=True)

    # Skin tone
    skin_tone_category   = Column(String(30), nullable=True)

    # Recommended facilities snapshot
    recommended_facilities = Column(JSON, default=list)

    # Language used during screening
    ui_language          = Column(String(5), default="en")

    # Metadata
    created_at           = Column(DateTime, default=datetime.utcnow)

    profile = relationship("BabyProfile", back_populates="screenings")


class ModelTrainingImage(Base):
    """
    Separate table for model retraining pipeline.
    Every screening image gets an entry here so the ML team
    can query unlabelled images and annotate them.
    """
    __tablename__ = "model_training_images"

    id                   = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    screening_id         = Column(UUID(as_uuid=False), ForeignKey("screenings.id"), nullable=False)

    cloudinary_url       = Column(Text,       nullable=False)
    cloudinary_public_id = Column(String(255),nullable=False)

    # Ground truth label — filled in manually or by clinician later
    ground_truth_label   = Column(String(50), nullable=True)   # "jaundice" | "normal" | "uncertain"
    labelled_by          = Column(String(100),nullable=True)
    labelled_at          = Column(DateTime,   nullable=True)

    # Context that helps with labelling
    skin_tone_category   = Column(String(30), nullable=True)
    baby_age_hours       = Column(Integer,    nullable=True)
    final_decision       = Column(String(100),nullable=True)
    triage_level         = Column(String(50), nullable=True)

    is_usable_for_training = Column(Boolean, default=True)
    notes                  = Column(Text,    nullable=True)

    created_at           = Column(DateTime, default=datetime.utcnow)