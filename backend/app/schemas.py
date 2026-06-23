# from typing import Optional
# from pydantic import BaseModel, Field


# class ScreeningResponse(BaseModel):
#     success: bool
#     filename: Optional[str] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     triage_level: str
#     triage_reason: str
#     final_decision: str
#     notes: list[str]


# class HealthCheckResponse(BaseModel):
#     status: str = "ok"


# class TriageInput(BaseModel):
#     age_hours: int = Field(..., ge=0)
#     feeding: str
#     difficult_to_wake: bool = False
#     floppy_or_unusually_drowsy: bool = False
#     jaundice_first_24h: bool = False
#     jaundice_spreading: bool = False
#     yellow_eyes: bool = False
#     yellow_gums: bool = False
#     yellow_palms_or_soles: bool = False
#     dark_urine: bool = False
#     pale_stool: bool = False
#     darker_skin_tone: bool = False



# from typing import Optional
# from pydantic import BaseModel, Field


# class ScreeningResponse(BaseModel):
#     success: bool
#     filename: Optional[str] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     triage_level: str
#     triage_reason: str
#     final_decision: str
#     parent_message: str
#     notes: list[str]


# class HealthCheckResponse(BaseModel):
#     status: str = "ok"


# class TriageInput(BaseModel):
#     age_hours: int = Field(..., ge=0)
#     feeding: str
#     difficult_to_wake: bool = False
#     floppy_or_unusually_drowsy: bool = False
#     jaundice_first_24h: bool = False
#     jaundice_spreading: bool = False
#     yellow_eyes: bool = False
#     yellow_gums: bool = False
#     yellow_palms_or_soles: bool = False
#     dark_urine: bool = False
#     pale_stool: bool = False
#     darker_skin_tone: bool = False


# from typing import Optional
# from pydantic import BaseModel, Field


# class ScreeningResponse(BaseModel):
#     success: bool
#     filename: Optional[str] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None
#     triage_level: str
#     triage_reason: str
#     final_decision: str
#     parent_message: str
#     notes: list[str]


# class HealthCheckResponse(BaseModel):
#     status: str = "ok"


# class TriageInput(BaseModel):
#     age_hours: int = Field(..., ge=0)
#     feeding: str
#     difficult_to_wake: bool = False
#     floppy_or_unusually_drowsy: bool = False
#     jaundice_first_24h: bool = False
#     jaundice_spreading: bool = False
#     yellow_eyes: bool = False
#     yellow_gums: bool = False
#     yellow_palms_or_soles: bool = False
#     dark_urine: bool = False
#     pale_stool: bool = False
#     darker_skin_tone: bool = False

# from typing import Optional
# from pydantic import BaseModel, Field


# class ScreeningResponse(BaseModel):
#     success: bool
#     filename: Optional[str] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None

#     raw_triage_level: str
#     raw_triage_reason: str

#     final_decision: str
#     final_decision_reason: str
#     parent_message: str
#     notes: list[str]


# class HealthCheckResponse(BaseModel):
#     status: str = "ok"


# class TriageInput(BaseModel):
#     age_hours: int = Field(..., ge=0)
#     feeding: str
#     difficult_to_wake: bool = False
#     floppy_or_unusually_drowsy: bool = False
#     jaundice_first_24h: bool = False
#     jaundice_spreading: bool = False
#     yellow_eyes: bool = False
#     yellow_gums: bool = False
#     yellow_palms_or_soles: bool = False
#     dark_urine: bool = False
#     pale_stool: bool = False
#     darker_skin_tone: bool = False



# from typing import Optional
# from pydantic import BaseModel, Field


# class BabyProfileCreate(BaseModel):
#     baby_name: str
#     date_of_birth: str
#     time_of_birth: str
#     sex: Optional[str] = None
#     gestational_age_weeks: Optional[int] = None
#     parent_name: Optional[str] = None


# class BabyProfileResponse(BaseModel):
#     exists: bool
#     baby_name: Optional[str] = None
#     date_of_birth: Optional[str] = None
#     time_of_birth: Optional[str] = None
#     sex: Optional[str] = None
#     gestational_age_weeks: Optional[int] = None
#     parent_name: Optional[str] = None
#     age_hours: Optional[int] = None


# class ScreeningResponse(BaseModel):
#     success: bool
#     filename: Optional[str] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None

#     raw_triage_level: str
#     raw_triage_reason: str

#     final_decision: str
#     final_decision_reason: str
#     parent_message: str
#     notes: list[str]

#     screening_id: Optional[str] = None
#     created_at: Optional[str] = None
#     baby_age_hours: Optional[int] = None

#     recommended_facilities: list = []



# class ScreeningHistoryItem(BaseModel):
#     screening_id: str
#     created_at: str
#     filename: Optional[str] = None
#     baby_age_hours: Optional[int] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None
#     raw_triage_level: str
#     raw_triage_reason: str
#     final_decision: str
#     final_decision_reason: str
#     parent_message: str
#     notes: list[str]
#     symptoms: dict


# class HealthCheckResponse(BaseModel):
#     status: str = "ok"


# class TriageInput(BaseModel):
#     age_hours: int = Field(..., ge=0)
#     feeding: str
#     difficult_to_wake: bool = False
#     floppy_or_unusually_drowsy: bool = False
#     jaundice_first_24h: bool = False
#     jaundice_spreading: bool = False
#     yellow_eyes: bool = False
#     yellow_gums: bool = False
#     yellow_palms_or_soles: bool = False
#     dark_urine: bool = False
#     pale_stool: bool = False
#     darker_skin_tone: bool = False




# from typing import Optional, List
# from pydantic import BaseModel, Field

# # 1. New Explicit Nested Schema for Facility responses
# class FacilityResponseSchema(BaseModel):
#     id: str
#     name: str
#     type: str
#     state: str
#     lga: Optional[str] = None
#     address: Optional[str] = None
#     phone: Optional[str] = None
#     latitude: float
#     longitude: float
#     services: List[str]
#     osm_id: int
#     data_quality_verified: bool
#     distance_km: Optional[float] = None

# class BabyProfileCreate(BaseModel):
#     baby_name: str
#     date_of_birth: str
#     time_of_birth: str
#     sex: Optional[str] = None
#     gestational_age_weeks: Optional[int] = None
#     parent_name: Optional[str] = None

# class BabyProfileResponse(BaseModel):
#     exists: bool
#     baby_name: Optional[str] = None
#     date_of_birth: Optional[str] = None
#     time_of_birth: Optional[str] = None
#     sex: Optional[str] = None
#     gestational_age_weeks: Optional[int] = None
#     parent_name: Optional[str] = None
#     age_hours: Optional[int] = None

# # Updated to use the explicit FacilityResponseSchema structure
# class ScreeningResponse(BaseModel):
#     success: bool
#     filename: Optional[str] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None

#     raw_triage_level: str
#     raw_triage_reason: str

#     final_decision: str
#     final_decision_reason: str
#     parent_message: str
#     notes: list[str]

#     screening_id: Optional[str] = None
#     created_at: Optional[str] = None
#     baby_age_hours: Optional[int] = None

#     # This enforces clean validation on the array returned to the frontend
#     recommended_facilities: List[FacilityResponseSchema] = []

# class ScreeningHistoryItem(BaseModel):
#     screening_id: str
#     created_at: str
#     filename: Optional[str] = None
#     baby_age_hours: Optional[int] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None
#     raw_triage_level: str
#     raw_triage_reason: str
#     final_decision: str
#     final_decision_reason: str
#     parent_message: str
#     notes: list[str]
#     symptoms: dict

# class HealthCheckResponse(BaseModel):
#     status: str = "ok"

# class TriageInput(BaseModel):
#     age_hours: int = Field(..., ge=0)
#     feeding: str
#     difficult_to_wake: bool = False
#     floppy_or_unusually_drowsy: bool = False
#     jaundice_first_24h: bool = False
#     jaundice_spreading: bool = False
#     yellow_eyes: bool = False
#     yellow_gums: bool = False
#     yellow_palms_or_soles: bool = False
#     dark_urine: bool = False
#     pale_stool: bool = False
#     darker_skin_tone: bool = False



# from typing import Optional, List, Any
# from pydantic import BaseModel, Field

# class FacilityResponseSchema(BaseModel):
#     id: str
#     name: str
#     type: str
#     state: str
#     lga: Optional[str] = None
#     address: Optional[str] = None
#     phone: Optional[str] = None
#     latitude: float
#     longitude: float
#     services: List[str] = []
#     osm_id: int
#     data_quality_verified: bool
#     distance_km: Optional[float] = None

#     class Config:
#         from_attributes = True


# class BabyProfileCreate(BaseModel):
#     baby_name: str
#     date_of_birth: str
#     time_of_birth: str
#     sex: Optional[str] = None
#     gestational_age_weeks: Optional[int] = None
#     parent_name: Optional[str] = None


# class BabyProfileResponse(BaseModel):
#     exists: bool
#     baby_name: Optional[str] = None
#     date_of_birth: Optional[str] = None
#     time_of_birth: Optional[str] = None
#     sex: Optional[str] = None
#     gestational_age_weeks: Optional[int] = None
#     parent_name: Optional[str] = None
#     age_hours: Optional[int] = None


# class ScreeningResponse(BaseModel):
#     success: bool
#     filename: Optional[str] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None

#     raw_triage_level: str
#     raw_triage_reason: str

#     final_decision: str
#     final_decision_reason: str
#     parent_message: str
#     notes: List[str] = []

#     screening_id: Optional[str] = None
#     created_at: Optional[str] = None
#     baby_age_hours: Optional[int] = None

#     # This enforces clean structure matching the facility arrays returned to the mobile app
#     recommended_facilities: List[FacilityResponseSchema] = []


# class ScreeningHistoryItem(BaseModel):
#     screening_id: str
#     created_at: str
#     filename: Optional[str] = None
#     baby_age_hours: Optional[int] = None
#     image_prediction: Optional[str] = None
#     image_confidence: Optional[float] = None
#     confidence_band: Optional[str] = None
#     raw_triage_level: str
#     raw_triage_reason: str
#     final_decision: str
#     final_decision_reason: str
#     parent_message: str
#     notes: List[str] = []
#     symptoms: dict


# class HealthCheckResponse(BaseModel):
#     status: str = "ok"


# class TriageInput(BaseModel):
#     age_hours: int = Field(..., ge=0)
#     feeding: str
#     difficult_to_wake: bool = False
#     floppy_or_unusually_drowsy: bool = False
#     jaundice_first_24h: bool = False
#     jaundice_spreading: bool = False
#     yellow_eyes: bool = False
#     yellow_gums: bool = False
#     yellow_palms_or_soles: bool = False
#     dark_urine: bool = False
#     pale_stool: bool = False
#     darker_skin_tone: bool = False

from typing import Optional, List
from pydantic import BaseModel, Field

# Ensure this model matches your local production_facilities.json keys perfectly
class FacilityResponseSchema(BaseModel):
    id: str
    name: str
    type: str
    state: str
    lga: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: float
    longitude: float
    services: List[str] = []
    osm_id: int
    data_quality_verified: bool
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class BabyProfileCreate(BaseModel):
    baby_name: str
    date_of_birth: str
    time_of_birth: str
    sex: Optional[str] = None
    gestational_age_weeks: Optional[int] = None
    parent_name: Optional[str] = None


class BabyProfileResponse(BaseModel):
    exists: bool
    baby_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    sex: Optional[str] = None
    gestational_age_weeks: Optional[int] = None
    parent_name: Optional[str] = None
    age_hours: Optional[int] = None


class ScreeningResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    image_prediction: Optional[str] = None
    image_confidence: Optional[float] = None
    confidence_band: Optional[str] = None

    raw_triage_level: str
    raw_triage_reason: str

    final_decision: str
    final_decision_reason: str
    parent_message: str
    notes: List[str] = []

    screening_id: Optional[str] = None
    created_at: Optional[str] = None
    baby_age_hours: Optional[int] = None

    # Matches your array property directly
    recommended_facilities: List[FacilityResponseSchema] = []


class ScreeningHistoryItem(BaseModel):
    screening_id: str
    created_at: str
    filename: Optional[str] = None
    baby_age_hours: Optional[int] = None
    image_prediction: Optional[str] = None
    image_confidence: Optional[float] = None
    confidence_band: Optional[str] = None
    raw_triage_level: str
    raw_triage_reason: str
    final_decision: str
    final_decision_reason: str
    parent_message: str
    notes: List[str] = []
    symptoms: dict


class HealthCheckResponse(BaseModel):
    status: str = "ok"


class TriageInput(BaseModel):
    age_hours: int = Field(..., ge=0)
    feeding: str
    difficult_to_wake: bool = False
    floppy_or_unusually_drowsy: bool = False
    jaundice_first_24h: bool = False
    jaundice_spreading: bool = False
    yellow_eyes: bool = False
    yellow_gums: bool = False
    yellow_palms_or_soles: bool = False
    dark_urine: bool = False
    pale_stool: bool = False
    darker_skin_tone: bool = False