# from typing import Optional
# from fastapi import APIRouter, Query
# from app.services.facility_service import get_recommended_facilities

# router = APIRouter(prefix="/facilities", tags=["facilities"])


# @router.get("/recommend")
# def recommend_facilities(
#     state: Optional[str] = Query(None),
#     triage_level: Optional[str] = Query(None),
#     lat: Optional[float] = Query(None),
#     lon: Optional[float] = Query(None),
# ):
#     # Fixed: old version called get_recommended_facilities(state, urgency)
#     # which no longer matches the function signature and would crash.
#     facilities = get_recommended_facilities(
#         user_lat=lat,
#         user_lon=lon,
#         user_state=state,
#         triage_level=triage_level,
#     )
#     return {
#         "count": len(facilities),
#         "facilities": facilities,
#     }




from typing import Optional
from fastapi import APIRouter, Query
from app.services.facility_service import get_recommended_facilities

router = APIRouter(prefix="/facilities", tags=["facilities"])


@router.get("/recommend")
def recommend_facilities(
    state: Optional[str] = Query(None),
    lga: Optional[str] = Query(None),
    triage_level: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    preference: Optional[str] = Query("nearest"),  # nearest | government | clinic
):
    facilities = get_recommended_facilities(
        user_lat=lat,
        user_lon=lon,
        user_state=state,
        user_lga=lga,
        triage_level=triage_level or "MONITOR_AT_HOME",
        facility_preference=preference or "nearest",
        max_results=5,
    )
    return {
        "count": len(facilities),
        "facilities": facilities,
    }