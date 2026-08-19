# """
# JaundiCare — Database Models
# Replaces: baby_profile.json, screenings.json
# Images now stored in Cloudinary, URL saved here.
# """

# import uuid
# from datetime import datetime
# from sqlalchemy import (
#     Column, String, Integer, Float, Boolean,
#     DateTime, JSON, Text, ForeignKey
# )
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from app.db.session import Base


# def generate_uuid():
#     return str(uuid.uuid4())


# class BabyProfile(Base):
#     __tablename__ = "baby_profiles"

#     id                   = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     baby_name            = Column(String(100), nullable=False)
#     parent_name          = Column(String(100), nullable=True)
#     date_of_birth        = Column(String(10),  nullable=False)   # YYYY-MM-DD
#     time_of_birth        = Column(String(5),   nullable=False)   # HH:MM
#     sex                  = Column(String(10),  nullable=True)
#     gestational_age_weeks= Column(Integer,     nullable=True)
#     created_at           = Column(DateTime,    default=datetime.utcnow)
#     updated_at           = Column(DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)

#     # One profile → many screenings
#     screenings = relationship("Screening", back_populates="profile", lazy="dynamic")


# class Screening(Base):
#     __tablename__ = "screenings"

#     id                   = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     profile_id           = Column(UUID(as_uuid=False), ForeignKey("baby_profiles.id"), nullable=True)

#     # Image — stored in Cloudinary, URL saved here
#     original_filename    = Column(String(255), nullable=True)
#     cloudinary_url       = Column(Text,        nullable=True)   # permanent URL for model retraining
#     cloudinary_public_id = Column(String(255), nullable=True)   # for deletion/management

#     # Baby context at time of screening
#     baby_age_hours       = Column(Integer,  nullable=True)

#     # AI model result
#     image_prediction     = Column(String(50),  nullable=True)
#     image_confidence     = Column(Float,       nullable=True)
#     confidence_band      = Column(String(50),  nullable=True)

#     # Triage
#     raw_triage_level     = Column(String(50),  nullable=False)
#     raw_triage_reason    = Column(Text,        nullable=False)

#     # Final decision
#     final_decision       = Column(String(100), nullable=False)
#     final_decision_reason= Column(Text,        nullable=False)
#     parent_message       = Column(Text,        nullable=False)
#     notes                = Column(JSON,        default=list)

#     # Symptoms snapshot — stored as JSON so schema stays flexible
#     symptoms             = Column(JSON,        default=dict)

#     # Location
#     user_latitude        = Column(Float,  nullable=True)
#     user_longitude       = Column(Float,  nullable=True)
#     user_state           = Column(String(50), nullable=True)
#     user_lga             = Column(String(100), nullable=True)

#     # Skin tone
#     skin_tone_category   = Column(String(30), nullable=True)

#     # Recommended facilities snapshot
#     recommended_facilities = Column(JSON, default=list)

#     # Language used during screening
#     ui_language          = Column(String(5), default="en")

#     # Metadata
#     created_at           = Column(DateTime, default=datetime.utcnow)

#     profile = relationship("BabyProfile", back_populates="screenings")


# class ModelTrainingImage(Base):
#     """
#     Separate table for model retraining pipeline.
#     Every screening image gets an entry here so the ML team
#     can query unlabelled images and annotate them.
#     """
#     __tablename__ = "model_training_images"

#     id                   = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     screening_id         = Column(UUID(as_uuid=False), ForeignKey("screenings.id"), nullable=False)

#     cloudinary_url       = Column(Text,       nullable=False)
#     cloudinary_public_id = Column(String(255),nullable=False)

#     # Ground truth label — filled in manually or by clinician later
#     ground_truth_label   = Column(String(50), nullable=True)   # "jaundice" | "normal" | "uncertain"
#     labelled_by          = Column(String(100),nullable=True)
#     labelled_at          = Column(DateTime,   nullable=True)

#     # Context that helps with labelling
#     skin_tone_category   = Column(String(30), nullable=True)
#     baby_age_hours       = Column(Integer,    nullable=True)
#     final_decision       = Column(String(100),nullable=True)
#     triage_level         = Column(String(50), nullable=True)

#     is_usable_for_training = Column(Boolean, default=True)
#     notes                  = Column(Text,    nullable=True)

#     created_at           = Column(DateTime, default=datetime.utcnow)





# """
# JaundiCare — Database Models (Multi-User Pilot Ready)
# Handles phone-based authentication via Termii, JWT token invalidation,
# and strictly scopes baby profiles and screenings per user.
# """

# import uuid
# from datetime import datetime
# from sqlalchemy import (
#     Column, String, Integer, Float, Boolean,
#     DateTime, JSON, Text, ForeignKey, Enum
# )
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from app.db.session import Base


# def generate_uuid():
#     return str(uuid.uuid4())


# class User(Base):
#     __tablename__ = "users"

#     id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     # E.164 format normalization (e.g., "+2348012345678")
#     phone_number = Column(String(20), unique=True, nullable=False, index=True)
#     country_code = Column(String(5), default="NG", nullable=False)
#     is_verified = Column(Boolean, default=False, nullable=False)
    
#     # Ready to handle both mothers and community health workers (CHEWs) in Abeokuta/Ibadan
#     role = Column(String(30), default="parent", nullable=False)  # "parent" | "health_worker"
#     language = Column(String(5), default="en", nullable=False)
    
#     created_at = Column(DateTime, default=datetime.utcnow)
#     last_login = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     # One user → many baby profiles. If a user deletes an account, their profiles cascade delete.
#     baby_profiles = relationship("BabyProfile", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")


# class OTPCode(Base):
#     __tablename__ = "otp_codes"

#     id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     phone_number = Column(String(20), nullable=False, index=True)
    
#     # Store hashed with bcrypt for zero-exposure security
#     hashed_code = Column(String(255), nullable=False)
#     expires_at = Column(DateTime, nullable=False)
#     is_used = Column(Boolean, default=False, nullable=False)
#     attempts = Column(Integer, default=0, nullable=False)  # Track rate limiting up to 3 tries
    
#     created_at = Column(DateTime, default=datetime.utcnow)


# class BabyProfile(Base):
#     __tablename__ = "baby_profiles"

#     id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    
#     # CRITICAL: Scope profiles to authenticated users. Nullable=True for backward compatibility migration,
#     # but enforced as required for new records.
#     user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
#     baby_name = Column(String(100), nullable=False)
#     parent_name = Column(String(100), nullable=True)
#     date_of_birth = Column(String(10),  nullable=False)   # YYYY-MM-DD
#     time_of_birth = Column(String(5),   nullable=False)   # HH:MM
#     sex = Column(String(10),  nullable=True)
#     gestational_age_weeks = Column(Integer,     nullable=True)
#     created_at = Column(DateTime,    default=datetime.utcnow)
#     updated_at = Column(DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)

#     # Relationships
#     user = relationship("User", back_populates="baby_profiles")
#     screenings = relationship("Screening", back_populates="profile", cascade="all, delete-orphan", lazy="dynamic")


# class Screening(Base):
#     __tablename__ = "screenings"

#     id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     profile_id = Column(UUID(as_uuid=False), ForeignKey("baby_profiles.id", ondelete="CASCADE"), nullable=True, index=True)

#     # Image — stored in Cloudinary, URL saved here
#     original_filename = Column(String(255), nullable=True)
#     cloudinary_url = Column(Text,        nullable=True)   # permanent URL for model retraining
#     cloudinary_public_id = Column(String(255), nullable=True)   # for deletion/management

#     # Baby context at time of screening
#     baby_age_hours = Column(Integer,  nullable=True)

#     # AI model result
#     image_prediction = Column(String(50),  nullable=True)
#     image_confidence = Column(Float,       nullable=True)
#     confidence_band = Column(String(50),  nullable=True)

#     # Triage
#     raw_triage_level = Column(String(50),  nullable=False)
#     raw_triage_reason = Column(Text,        nullable=False)

#     # Final decision
#     final_decision = Column(String(100), nullable=False)
#     final_decision_reason = Column(Text,        nullable=False)
#     parent_message = Column(Text,        nullable=False)
#     notes = Column(JSON,        default=list)

#     # Symptoms snapshot — stored as JSON so schema stays flexible
#     symptoms = Column(JSON,        default=dict)

#     # Location
#     user_latitude = Column(Float,  nullable=True)
#     user_longitude = Column(Float,  nullable=True)
#     user_state = Column(String(50), nullable=True)
#     user_lga = Column(String(100), nullable=True)

#     # Skin tone
#     skin_tone_category = Column(String(30), nullable=True)

#     # Recommended facilities snapshot
#     recommended_facilities = Column(JSON, default=list)

#     # Language used during screening
#     ui_language = Column(String(5), default="en")

#     # Metadata
#     created_at = Column(DateTime, default=datetime.utcnow)

#     # Relationships
#     profile = relationship("BabyProfile", back_populates="screenings")
#     training_images = relationship("ModelTrainingImage", back_populates="screening", cascade="all, delete-orphan")


# class ModelTrainingImage(Base):
#     """
#     Separate table for model retraining pipeline.
#     Every screening image gets an entry here so the ML team
#     can query unlabelled images and annotate them.
#     """
#     __tablename__ = "model_training_images"

#     id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     screening_id = Column(UUID(as_uuid=False), ForeignKey("screenings.id", ondelete="CASCADE"), nullable=False, index=True)

#     cloudinary_url = Column(Text,       nullable=False)
#     cloudinary_public_id = Column(String(255), nullable=False)

#     # Ground truth label — filled in manually or by clinician later
#     ground_truth_label = Column(String(50), nullable=True)   # "jaundice" | "normal" | "uncertain"
#     labelled_by = Column(String(100), nullable=True)
#     labelled_at = Column(DateTime,   nullable=True)

#     # Context that helps with labelling
#     skin_tone_category = Column(String(30), nullable=True)
#     baby_age_hours = Column(Integer,    nullable=True)
#     final_decision = Column(String(100), nullable=True)
#     triage_level = Column(String(50), nullable=True)

#     is_usable_for_training = Column(Boolean, default=True)
#     notes = Column(Text,    nullable=True)

#     created_at = Column(DateTime, default=datetime.utcnow)

#     # Relationships
#     screening = relationship("Screening", back_populates="training_images")



# """
# JaundiCare — Database Models (v2 — Multi-user auth)
# Added: User, OtpCode, RefreshToken tables
# Updated: BabyProfile now has user_id foreign key
# """

# import uuid
# from datetime import datetime
# from sqlalchemy import (
#     Column, String, Integer, Float, Boolean,
#     DateTime, JSON, Text, ForeignKey, Enum
# )
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from app.db.session import Base
# import enum


# def generate_uuid():
#     return str(uuid.uuid4())


# class UserRole(str, enum.Enum):
#     parent         = "parent"
#     health_worker  = "health_worker"


# # ── NEW: Users ────────────────────────────────────────────────
# class User(Base):
#     __tablename__ = "users"

#     id           = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     phone_number = Column(String(20), unique=True, nullable=False, index=True)
#     country_code = Column(String(5), default="NG", nullable=False)
#     is_verified  = Column(Boolean, default=False, nullable=False)
#     role         = Column(String(20), default="parent", nullable=False)
#     language     = Column(String(5), default="en", nullable=False)
#     created_at   = Column(DateTime, default=datetime.utcnow)
#     last_login   = Column(DateTime, nullable=True)

#     profiles       = relationship("BabyProfile",  back_populates="user", lazy="dynamic")
#     refresh_tokens = relationship("RefreshToken", back_populates="user", lazy="dynamic")


# # ── NEW: OTP Codes ────────────────────────────────────────────
# class OtpCode(Base):
#     __tablename__ = "otp_codes"

#     id           = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     phone_number = Column(String(20), nullable=False, index=True)
#     code_hash    = Column(String(255), nullable=False)   # bcrypt hashed
#     expires_at   = Column(DateTime, nullable=False)
#     is_used      = Column(Boolean, default=False)
#     attempts     = Column(Integer, default=0)
#     created_at   = Column(DateTime, default=datetime.utcnow)


# # ── NEW: Refresh Tokens ───────────────────────────────────────
# class RefreshToken(Base):
#     __tablename__ = "refresh_tokens"

#     id         = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     user_id    = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
#     token_hash = Column(String(255), nullable=False, unique=True)
#     expires_at = Column(DateTime, nullable=False)
#     is_revoked = Column(Boolean, default=False)
#     created_at = Column(DateTime, default=datetime.utcnow)

#     user = relationship("User", back_populates="refresh_tokens")


# # ── UPDATED: BabyProfile — now scoped per user ───────────────
# class BabyProfile(Base):
#     __tablename__ = "baby_profiles"

#     id                    = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     user_id               = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)  # nullable for migration
#     baby_name             = Column(String(100), nullable=False)
#     parent_name           = Column(String(100), nullable=True)
#     date_of_birth         = Column(String(10),  nullable=False)
#     time_of_birth         = Column(String(5),   nullable=False)
#     sex                   = Column(String(10),  nullable=True)
#     gestational_age_weeks = Column(Integer,     nullable=True)
#     created_at            = Column(DateTime,    default=datetime.utcnow)
#     updated_at            = Column(DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)

#     user      = relationship("User",      back_populates="profiles")
#     screenings = relationship("Screening", back_populates="profile", lazy="dynamic")


# # ── UNCHANGED: Screening ──────────────────────────────────────
# class Screening(Base):
#     __tablename__ = "screenings"

#     id                    = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     profile_id            = Column(UUID(as_uuid=False), ForeignKey("baby_profiles.id"), nullable=True)
#     original_filename     = Column(String(255), nullable=True)
#     cloudinary_url        = Column(Text,        nullable=True)
#     cloudinary_public_id  = Column(String(255), nullable=True)
#     baby_age_hours        = Column(Integer,     nullable=True)
#     image_prediction      = Column(String(50),  nullable=True)
#     image_confidence      = Column(Float,       nullable=True)
#     confidence_band       = Column(String(50),  nullable=True)
#     raw_triage_level      = Column(String(50),  nullable=False)
#     raw_triage_reason     = Column(Text,        nullable=False)
#     final_decision        = Column(String(100), nullable=False)
#     final_decision_reason = Column(Text,        nullable=False)
#     parent_message        = Column(Text,        nullable=False)
#     notes                 = Column(JSON,        default=list)
#     symptoms              = Column(JSON,        default=dict)
#     user_latitude         = Column(Float,       nullable=True)
#     user_longitude        = Column(Float,       nullable=True)
#     user_state            = Column(String(50),  nullable=True)
#     user_lga              = Column(String(100), nullable=True)
#     skin_tone_category    = Column(String(30),  nullable=True)
#     recommended_facilities= Column(JSON,        default=list)
#     ui_language           = Column(String(5),   default="en")
#     created_at            = Column(DateTime,    default=datetime.utcnow)

#     profile = relationship("BabyProfile", back_populates="screenings")


# # ── UNCHANGED: ModelTrainingImage ─────────────────────────────
# class ModelTrainingImage(Base):
#     __tablename__ = "model_training_images"

#     id                     = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
#     screening_id           = Column(UUID(as_uuid=False), ForeignKey("screenings.id"), nullable=False)
#     cloudinary_url         = Column(Text,        nullable=False)
#     cloudinary_public_id   = Column(String(255), nullable=False)
#     ground_truth_label     = Column(String(50),  nullable=True)
#     labelled_by            = Column(String(100), nullable=True)
#     labelled_at            = Column(DateTime,    nullable=True)
#     skin_tone_category     = Column(String(30),  nullable=True)
#     baby_age_hours         = Column(Integer,     nullable=True)
#     final_decision         = Column(String(100), nullable=True)
#     triage_level           = Column(String(50),  nullable=True)
#     is_usable_for_training = Column(Boolean,     default=True)
#     notes                  = Column(Text,        nullable=True)
#     created_at             = Column(DateTime,    default=datetime.utcnow)






"""
JaundiCare — Database Models (v2 — High-Scale Production Ready)
Optimized with native binary UUIDs, explicit indexing for high-concurrency lookups,
and cascading deletes to prevent database bloat.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    DateTime, Index, JSON, Text, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

# Enums are cleaner at scale for static roles
class UserRole(str, enum.Enum):
    parent = "parent"
    health_worker = "health_worker"


# ── USERS ───────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    # Using native binary UUIDs (as_uuid=True) for faster index scans and lower storage overhead
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    country_code = Column(String(5), default="NG", nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    role = Column(String(20), default=UserRole.parent.value, nullable=False)
    language = Column(String(5), default="en", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Dynamic loading allows appending filters cleanly without loading everything into memory
    profiles = relationship("BabyProfile", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")
    screenings = relationship("Screening", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")


# ── OTP CODES ────────────────────────────────────────────────
class OtpCode(Base):
    __tablename__ = "otp_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), nullable=False, index=True)
    language = Column(String(5), default="en", nullable=False)
    # Used only while the tightly allow-listed presentation OTP mode is active.
    # In normal delivery mode, every public sign-in remains a parent account.
    requested_role = Column(String(20), default=UserRole.parent.value, nullable=False)
    code_hash = Column(String(255), nullable=False) 
    expires_at = Column(DateTime, nullable=False, index=True) # Indexed to allow fast cron-job cleanups of expired codes
    is_used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class OtpRequestAudit(Base):
    """Short-lived, pseudonymous audit trail for distributed OTP throttling."""

    __tablename__ = "otp_request_audits"
    __table_args__ = (
        Index("ix_otp_request_audits_phone_created", "phone_number", "created_at"),
        Index("ix_otp_request_audits_client_created", "client_fingerprint", "created_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), nullable=False)
    # HMAC of the client IP. Do not store the raw IP address in clinical data.
    client_fingerprint = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ConsultationRequestAudit(Base):
    """Minimal, short-lived audit trail for assistant abuse protection.

    The message itself is intentionally never persisted or logged. The table
    contains only the user, assistant name and timestamp required to apply a
    distributed rate limit across API workers.
    """

    __tablename__ = "consultation_request_audits"
    __table_args__ = (
        Index(
            "ix_consultation_request_audits_user_assistant_created",
            "user_id",
            "assistant",
            "created_at",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assistant = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# ── REFRESH TOKENS ───────────────────────────────────────────
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Added ondelete="CASCADE" so token drops instantly if user account is removed
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Unique index for instantaneous token lifecycle lookups during rotation
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")


# ── BABY PROFILES ───────────────────────────────────────────
class BabyProfile(Base):
    __tablename__ = "baby_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Indexed user_id ensures loading a mother's dashboard takes milliseconds under heavy load
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    baby_name = Column(String(100), nullable=False)
    parent_name = Column(String(100), nullable=True)
    date_of_birth = Column(String(10), nullable=False)
    time_of_birth = Column(String(5), nullable=False)
    sex = Column(String(10), nullable=True)
    gestational_age_weeks = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profiles")
    screenings = relationship("Screening", back_populates="profile", cascade="all, delete-orphan", lazy="dynamic")


# ── SCREENINGS ──────────────────────────────────────────────
class Screening(Base):
    __tablename__ = "screenings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # A screening belongs to the authenticated account even if its baby profile
    # is later deleted. This is the primary tenant-isolation boundary.
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Indexed profile_id ensures immediate retrieval of an individual child's screening history
    profile_id = Column(UUID(as_uuid=True), ForeignKey("baby_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    original_filename = Column(String(255), nullable=True)
    cloudinary_url = Column(Text, nullable=True)
    cloudinary_public_id = Column(String(255), nullable=True)
    baby_age_hours = Column(Integer, nullable=True)
    image_prediction = Column(String(50), nullable=True)
    image_confidence = Column(Float, nullable=True)
    confidence_band = Column(String(50), nullable=True)
    raw_triage_level = Column(String(50), nullable=False)
    raw_triage_reason = Column(Text, nullable=False)
    final_decision = Column(String(100), nullable=False)
    final_decision_reason = Column(Text, nullable=False)
    parent_message = Column(Text, nullable=False)
    notes = Column(JSON, default=list)
    symptoms = Column(JSON, default=dict)
    user_latitude = Column(Float, nullable=True)
    user_longitude = Column(Float, nullable=True)
    user_state = Column(String(50), nullable=True)
    user_lga = Column(String(100), nullable=True)
    skin_tone_category = Column(String(30), nullable=True)
    recommended_facilities = Column(JSON, default=list)
    ui_language = Column(String(5), default="en")
    created_at = Column(DateTime, default=datetime.utcnow, index=True) # Indexed for high-speed chronological reports

    user = relationship("User", back_populates="screenings")
    profile = relationship("BabyProfile", back_populates="screenings")


# ── MODEL TRAINING IMAGES ────────────────────────────────────
class ModelTrainingImage(Base):
    __tablename__ = "model_training_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Consented training data follows the source screening's deletion lifecycle.
    screening_id = Column(
        UUID(as_uuid=True),
        ForeignKey("screenings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    cloudinary_url = Column(Text, nullable=False)
    cloudinary_public_id = Column(String(255), nullable=False)
    ground_truth_label = Column(String(50), nullable=True)
    labelled_by = Column(String(100), nullable=True)
    labelled_at = Column(DateTime, nullable=True)
    skin_tone_category = Column(String(30), nullable=True)
    baby_age_hours = Column(Integer, nullable=True)
    final_decision = Column(String(100), nullable=True)
    triage_level = Column(String(50), nullable=True)
    is_usable_for_training = Column(Boolean, default=True, nullable=False)
    consent_version = Column(String(40), nullable=True)
    consented_at = Column(DateTime, nullable=True)
    consent_withdrawn_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
