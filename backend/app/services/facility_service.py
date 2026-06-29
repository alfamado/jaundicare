# import json
# from pathlib import Path
# from backend.app.config import DATA_STORE_DIR

# FACILITY_PATH = DATA_STORE_DIR / "facilities.json"


# def load_facilities():
#     if not FACILITY_PATH.exists():
#         return []

#     with open(FACILITY_PATH, "r", encoding="utf-8") as f:
#         return json.load(f)


# def get_recommended_facilities(state: str, urgency: str):
#     facilities = load_facilities()

#     # Filter by state
#     filtered = [f for f in facilities if f["state"].lower() == state.lower()]

#     if not filtered:
#         return []

#     # Prioritize based on urgency
#     if urgency == "RED":
#         # Only tertiary/secondary with neonatal care
#         return [
#             f for f in filtered
#             if f["type"] in ["tertiary", "secondary"]
#             and "neonatal" in f["services"]
#         ]

#     if urgency == "AMBER":
#         # Include primary + secondary
#         return [
#             f for f in filtered
#             if f["type"] in ["primary", "secondary", "tertiary"]
#         ]

#     # GREEN → no facility needed, but still return PHCs optionally
#     return [
#         f for f in filtered if f["type"] == "primary"
#     ]

# def load_facilities():
#     if not FACILITY_PATH.exists():
#         print("FACILITY FILE NOT FOUND:", FACILITY_PATH)
#         return []

#     with open(FACILITY_PATH, "r", encoding="utf-8") as f:
#         data = json.load(f)
#         print("LOADED FACILITIES:", len(data))
#         return data

# import json
# from pathlib import Path
# from app.config import DATA_STORE_DIR

# FACILITY_PATH = DATA_STORE_DIR / "facilities.json"


# def load_facilities():
#     try:
#         with open(FACILITY_PATH, "r", encoding="utf-8") as f:
#             return json.load(f)
#     except Exception as e:
#         print("FACILITY LOAD ERROR:", e)
#         return []


# def get_recommended_facilities(state: str, decision: str):
#     facilities = load_facilities()

#     if not facilities:
#         return []

#     # normalize state
#     state = (state or "").strip().lower()

#     # filter by state (fallback to all if none)
#     filtered = [
#         f for f in facilities
#         if f.get("state", "").strip().lower() == state
#     ]

#     if not filtered:
#         filtered = facilities

#     # RED → hospitals only
#     if decision == "URGENT_HOSPITAL_REVIEW":
#         return [
#             f for f in filtered
#             if f["type"] in ["tertiary", "secondary"]
#         ]

#     # AMBER → any facility
#     if decision in [
#         "SAME_DAY_CLINIC_REVIEW",
#         "RECHECK_SOON_OR_CLINIC_IF_CONCERNED"
#     ]:
#         return filtered

#     # GREEN → PHC only
#     return [
#         f for f in filtered
#         if f["type"] == "primary"
#     ]


# import json
# from app.config import DATA_STORE_DIR

# FACILITY_PATH = DATA_STORE_DIR / "facilities.json"


# def load_facilities():
#     try:
#         with open(FACILITY_PATH, "r", encoding="utf-8") as f:
#             return json.load(f)
#     except Exception as e:
#         print("FACILITY LOAD ERROR:", e)
#         return []


# def get_recommended_facilities(state: str, decision: str):
#     facilities = load_facilities()

#     if not facilities:
#         return []

#     state = (state or "").strip().lower()

#     filtered = [
#         f for f in facilities
#         if f.get("state", "").strip().lower() == state
#     ]

#     if not filtered:
#         filtered = facilities

#     if decision == "URGENT_HOSPITAL_REVIEW":
#         return [
#             f for f in filtered
#             if f.get("type") in ["tertiary", "secondary"]
#         ]

#     if decision in [
#         "SAME_DAY_CLINIC_REVIEW",
#         "RECHECK_SOON_OR_CLINIC_IF_CONCERNED"
#     ]:
#         return filtered

#     return [
#         f for f in filtered
#         if f.get("type") == "primary"
#     ]



# import json
# import math
# from app.config import DATA_STORE_DIR

# FACILITY_PATH = DATA_STORE_DIR / "facilities.json"


# def load_facilities():
#     try:
#         with open(FACILITY_PATH, "r", encoding="utf-8") as f:
#             return json.load(f)
#     except Exception as e:
#         print("FACILITY LOAD ERROR:", e)
#         return []


# def haversine_distance_km(lat1, lon1, lat2, lon2):
#     r = 6371.0

#     phi1 = math.radians(lat1)
#     phi2 = math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)

#     a = (
#         math.sin(dphi / 2) ** 2
#         + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
#     )
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

#     return round(r * c, 2)


# def filter_by_decision(facilities, decision):
#     if decision == "URGENT_HOSPITAL_REVIEW":
#         return [
#             f for f in facilities
#             if f.get("type") in ["tertiary", "secondary"]
#         ]

#     if decision in [
#         "SAME_DAY_CLINIC_REVIEW",
#         "RECHECK_SOON_OR_CLINIC_IF_CONCERNED"
#     ]:
#         return facilities

#     return [
#         f for f in facilities
#         if f.get("type") == "primary"
#     ]


# def get_recommended_facilities(
#     state: str | None,
#     decision: str,
#     user_latitude: float | None = None,
#     user_longitude: float | None = None
# ):
#     facilities = load_facilities()

#     if not facilities:
#         return []

#     filtered = facilities

#     if state:
#         state_normalized = state.strip().lower()
#         state_filtered = [
#             f for f in facilities
#             if f.get("state", "").strip().lower() == state_normalized
#         ]
#         if state_filtered:
#             filtered = state_filtered

#     filtered = filter_by_decision(filtered, decision)

#     if user_latitude is not None and user_longitude is not None:
#         enriched = []
#         for f in filtered:
#             lat = f.get("latitude")
#             lon = f.get("longitude")

#             if lat is not None and lon is not None:
#                 distance_km = haversine_distance_km(
#                     user_latitude, user_longitude, lat, lon
#                 )
#             else:
#                 distance_km = None

#             enriched.append({
#                 **f,
#                 "distance_km": distance_km
#             })

#         enriched.sort(
#             key=lambda x: x["distance_km"] if x["distance_km"] is not None else 999999
#         )
#         return enriched

#     return filtered





"""
JaundiCare — facility_service.py (patched with fallback logic)
===============================================================
Drop-in replacement for your existing facility_service.py.

Key improvements over the original:
  1. Never returns an empty list — always returns at least 1 facility
  2. Falls back to nearest tertiary hospital nationwide if nothing
     is found within the search radius
  3. Adds a "far_fallback" flag so the frontend can display a note
     like "Nearest facility is X km away — plan ahead"
  4. Radius expands automatically: 25km → 50km → 100km → nationwide
  5. Handles missing coordinates gracefully (falls back to state match)
"""

# import json
# import math
# import os
# from pathlib import Path
# from typing import Optional
# from app.config import DATA_STORE_DIR

# # FACILITY_PATH = DATA_STORE_DIR / "facilities.json"


# # ── Load facilities once at startup ──────────────────────────
# # _FACILITIES_PATH = Path(__file__).parent / "data" / "facilities.json"
# _FACILITIES_PATH = DATA_STORE_DIR / "facilities.json"

# def _load_facilities():
#     if not _FACILITIES_PATH.exists():
#         print(f"WARNING: facilities.json not found at {_FACILITIES_PATH}")
#         return []
#     with open(_FACILITIES_PATH, encoding="utf-8") as f:
#         return json.load(f)

# _ALL_FACILITIES = _load_facilities()

# # Separate tertiary hospitals for fallback pool
# _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]


# # ── Haversine distance in km ──────────────────────────────────
# def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371.0
#     d_lat = math.radians(lat2 - lat1)
#     d_lon = math.radians(lon2 - lon1)
#     a = (math.sin(d_lat / 2) ** 2 +
#          math.cos(math.radians(lat1)) *
#          math.cos(math.radians(lat2)) *
#          math.sin(d_lon / 2) ** 2)
#     return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# # ── Attach distance to facility dict ─────────────────────────
# def _with_distance(facility: dict, lat: float, lon: float) -> dict:
#     dist = _haversine_km(lat, lon, facility["latitude"], facility["longitude"])
#     return {**facility, "distance_km": round(dist, 2)}


# # ── Main function: get_nearby_facilities ─────────────────────
# def get_nearby_facilities(
#     user_lat: Optional[float],
#     user_lon: Optional[float],
#     user_state: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> list[dict]:
#     """
#     Returns up to max_results nearby facilities, always at least 1.

#     Priority order:
#       1. Facilities within 25km with GPS coordinates
#       2. Expand to 50km if fewer than 2 results
#       3. Expand to 100km if still fewer than 2
#       4. Same-state facilities sorted by distance
#       5. Nearest tertiary hospital nationwide (hard fallback)

#     If user_lat/lon not provided, falls back to state-based matching.
#     """

#     has_coords = (
#         user_lat is not None and user_lon is not None and
#         not math.isnan(float(user_lat)) and not math.isnan(float(user_lon))
#     )

#     # ── Path A: We have coordinates ──────────────────────────
#     if has_coords:
#         lat, lon = float(user_lat), float(user_lon)

#         results = _search_by_radius(lat, lon, radius_km=25, triage=triage_level)

#         if len(results) < 2:
#             results = _search_by_radius(lat, lon, radius_km=50, triage=triage_level)

#         if len(results) < 2:
#             results = _search_by_radius(lat, lon, radius_km=100, triage=triage_level)

#         if len(results) < 2 and user_state:
#             state_results = _search_by_state(user_state, lat, lon)
#             # Merge without duplication
#             existing_ids = {r["id"] for r in results}
#             for f in state_results:
#                 if f["id"] not in existing_ids:
#                     results.append(f)
#                     existing_ids.add(f["id"])

#         # Hard fallback — nearest tertiary nationwide
#         if not results:
#             results = _nearest_tertiary_fallback(lat, lon)

#         return sorted(results, key=lambda f: f.get("distance_km", 9999))[:max_results]

#     # ── Path B: No coordinates, use state ────────────────────
#     if user_state:
#         state_results = _search_by_state(user_state, None, None)
#         if state_results:
#             return state_results[:max_results]

#     # ── Path C: Nothing — return first tertiary in list ──────
#     if _TERTIARY:
#         fallback = dict(_TERTIARY[0])
#         fallback["distance_km"] = None
#         fallback["far_fallback"] = True
#         fallback["fallback_note"] = (
#             "We could not determine your location. "
#             "This is a major hospital that treats newborn jaundice. "
#             "Contact them for directions."
#         )
#         return [fallback]

#     return []


# # ── Search within radius ──────────────────────────────────────
# def _search_by_radius(
#     lat: float,
#     lon: float,
#     radius_km: float,
#     triage: Optional[str] = None,
# ) -> list[dict]:
#     results = []

#     # For urgent triage, prioritise tertiary first
#     pool = _ALL_FACILITIES
#     if triage in ("RED", "URGENT_HOSPITAL_REVIEW"):
#         pool = _TERTIARY + [f for f in _ALL_FACILITIES if f.get("type") != "tertiary"]

#     for facility in pool:
#         f_lat = facility.get("latitude")
#         f_lon = facility.get("longitude")
#         if not f_lat or not f_lon:
#             continue

#         dist = _haversine_km(lat, lon, float(f_lat), float(f_lon))
#         if dist <= radius_km:
#             results.append(_with_distance(facility, lat, lon))

#     # Flag if we had to expand radius significantly
#     if radius_km > 50:
#         for f in results:
#             if f.get("distance_km", 0) > 50:
#                 f["far_fallback"] = True
#                 f["fallback_note"] = (
#                     f"This facility is {f['distance_km']:.0f} km away — the nearest option in your area. "
#                     "Call ahead before travelling."
#                 )

#     return sorted(results, key=lambda f: f.get("distance_km", 9999))


# # ── Search by state (no coordinates) ─────────────────────────
# def _search_by_state(
#     state: str,
#     lat: Optional[float],
#     lon: Optional[float],
# ) -> list[dict]:
#     state_slug = state.lower().strip().replace(" ", "_").rstrip("_state")
#     matches = [
#         f for f in _ALL_FACILITIES
#         if f.get("state", "").lower().replace(" ", "_") == state_slug
#     ]

#     if lat is not None and lon is not None:
#         matches = [_with_distance(f, lat, lon) for f in matches]
#         matches.sort(key=lambda f: f.get("distance_km", 9999))
#     else:
#         # Sort tertiary first, then by name
#         matches.sort(key=lambda f: (
#             {"tertiary": 0, "secondary": 1, "primary": 2}.get(f.get("type"), 3),
#             f.get("name", "")
#         ))

#     return matches


# # ── Nationwide tertiary fallback ──────────────────────────────
# def _nearest_tertiary_fallback(lat: float, lon: float) -> list[dict]:
#     if not _TERTIARY:
#         return []

#     with_dist = [_with_distance(f, lat, lon) for f in _TERTIARY]
#     with_dist.sort(key=lambda f: f.get("distance_km", 9999))

#     nearest = with_dist[0]
#     nearest["far_fallback"] = True
#     nearest["fallback_note"] = (
#         f"No facility was found nearby. The nearest major hospital is "
#         f"{nearest['distance_km']:.0f} km away. Call ahead before travelling."
#     )
#     return [nearest]


# # ── Convenience: reload facilities at runtime ─────────────────
# def reload_facilities():
#     """Call this if you update facilities.json without restarting the server."""
#     global _ALL_FACILITIES, _TERTIARY
#     _ALL_FACILITIES = _load_facilities()
#     _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]
#     print(f"Facilities reloaded: {len(_ALL_FACILITIES)} total, {len(_TERTIARY)} tertiary")





# import json
# import math
# from pathlib import Path
# from typing import Optional
# from app.config import DATA_STORE_DIR

# _FACILITIES_PATH = DATA_STORE_DIR / "facilities.json"

# def _load_facilities():
#     if not _FACILITIES_PATH.exists():
#         print(f"WARNING: facilities.json not found at {_FACILITIES_PATH}")
#         return []
#     with open(_FACILITIES_PATH, encoding="utf-8") as f:
#         return json.load(f)

# _ALL_FACILITIES = _load_facilities()
# _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]


# def _haversine_km(lat1, lon1, lat2, lon2):
#     R = 6371.0
#     d_lat = math.radians(lat2 - lat1)
#     d_lon = math.radians(lon2 - lon1)
#     a = (math.sin(d_lat / 2) ** 2 +
#          math.cos(math.radians(lat1)) *
#          math.cos(math.radians(lat2)) *
#          math.sin(d_lon / 2) ** 2)
#     return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# def _with_distance(facility, lat, lon):
#     dist = _haversine_km(lat, lon, facility["latitude"], facility["longitude"])
#     return {**facility, "distance_km": round(dist, 2)}


# def _search_by_radius(lat, lon, radius_km, triage=None):
#     pool = _ALL_FACILITIES
#     if triage in ("RED", "URGENT_HOSPITAL_REVIEW"):
#         pool = _TERTIARY + [f for f in _ALL_FACILITIES if f.get("type") != "tertiary"]

#     results = []
#     for facility in pool:
#         f_lat = facility.get("latitude")
#         f_lon = facility.get("longitude")
#         if not f_lat or not f_lon:
#             continue
#         dist = _haversine_km(lat, lon, float(f_lat), float(f_lon))
#         if dist <= radius_km:
#             results.append(_with_distance(facility, lat, lon))

#     if radius_km > 50:
#         for f in results:
#             if f.get("distance_km", 0) > 50:
#                 f["far_fallback"] = True
#                 f["fallback_note"] = (
#                     f"This facility is {f['distance_km']:.0f} km away — "
#                     "the nearest option in your area. Call ahead before travelling."
#                 )
#     return sorted(results, key=lambda f: f.get("distance_km", 9999))


# def _search_by_state(state, lat=None, lon=None):
#     state_slug = state.lower().strip().replace(" ", "_").replace("_state", "")
#     matches = [
#         f for f in _ALL_FACILITIES
#         if f.get("state", "").lower().replace(" ", "_") == state_slug
#     ]
#     if lat is not None and lon is not None:
#         matches = [_with_distance(f, lat, lon) for f in matches]
#         matches.sort(key=lambda f: f.get("distance_km", 9999))
#     else:
#         matches.sort(key=lambda f: (
#             {"tertiary": 0, "secondary": 1, "primary": 2}.get(f.get("type"), 3),
#             f.get("name", "")
#         ))
#     return matches


# def _nearest_tertiary_fallback(lat, lon):
#     if not _TERTIARY:
#         return []
#     with_dist = [_with_distance(f, lat, lon) for f in _TERTIARY]
#     with_dist.sort(key=lambda f: f.get("distance_km", 9999))
#     nearest = with_dist[0]
#     nearest["far_fallback"] = True
#     nearest["fallback_note"] = (
#         f"No facility was found nearby. The nearest major hospital is "
#         f"{nearest['distance_km']:.0f} km away. Call ahead before travelling."
#     )
#     return [nearest]


# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> list:
#     has_coords = (
#         user_lat is not None and user_lon is not None and
#         not math.isnan(float(user_lat)) and not math.isnan(float(user_lon))
#     )

#     if has_coords:
#         lat, lon = float(user_lat), float(user_lon)

#         results = _search_by_radius(lat, lon, radius_km=25, triage=triage_level)

#         if len(results) < 2:
#             results = _search_by_radius(lat, lon, radius_km=50, triage=triage_level)

#         if len(results) < 2:
#             results = _search_by_radius(lat, lon, radius_km=100, triage=triage_level)

#         if len(results) < 2 and user_state:
#             state_results = _search_by_state(user_state, lat, lon)
#             existing_ids = {r["id"] for r in results}
#             for f in state_results:
#                 if f["id"] not in existing_ids:
#                     results.append(f)
#                     existing_ids.add(f["id"])

#         if not results:
#             results = _nearest_tertiary_fallback(lat, lon)

#         return sorted(results, key=lambda f: f.get("distance_km", 9999))[:max_results]

#     if user_state:
#         state_results = _search_by_state(user_state)
#         if state_results:
#             return state_results[:max_results]

#     if _TERTIARY:
#         fallback = dict(_TERTIARY[0])
#         fallback["distance_km"] = None
#         fallback["far_fallback"] = True
#         fallback["fallback_note"] = (
#             "We could not determine your location. "
#             "This is a major hospital that treats newborn jaundice."
#         )
#         return [fallback]

#     return []


# def reload_facilities():
#     global _ALL_FACILITIES, _TERTIARY
#     _ALL_FACILITIES = _load_facilities()
#     _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]
#     print(f"Reloaded: {len(_ALL_FACILITIES)} facilities, {len(_TERTIARY)} tertiary")









"""
JaundiCare — facility_service.py (patched with fallback logic)
===============================================================
Drop-in replacement for your existing facility_service.py.

Key improvements over the original:
  1. Never returns an empty list — always returns at least 1 facility
  2. Falls back to nearest tertiary hospital nationwide if nothing
     is found within the search radius
  3. Adds a "far_fallback" flag so the frontend can display a note
     like "Nearest facility is X km away — plan ahead"
  4. Radius expands automatically: 25km → 50km → 100km → nationwide
  5. Handles missing coordinates gracefully (falls back to state match)
"""

# import json
# import math
# import os
# from pathlib import Path
# from typing import Optional
# from app.config import DATA_STORE_DIR




# # ── Load facilities once at startup ──────────────────────────
# # _FACILITIES_PATH = Path(__file__).parent / "data" / "facilities.json"
# _FACILITIES_PATH = DATA_STORE_DIR / "facilities.json"
# # Adjust path above if your facilities.json lives elsewhere, e.g.:
# # _FACILITIES_PATH = Path(__file__).parent / "facilities.json"

# def _load_facilities():
#     if not _FACILITIES_PATH.exists():
#         print(f"WARNING: facilities.json not found at {_FACILITIES_PATH}")
#         return []
#     with open(_FACILITIES_PATH, encoding="utf-8") as f:
#         return json.load(f)

# _ALL_FACILITIES = _load_facilities()

# # Separate tertiary hospitals for fallback pool
# _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]


# # ── Haversine distance in km ──────────────────────────────────
# def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371.0
#     d_lat = math.radians(lat2 - lat1)
#     d_lon = math.radians(lon2 - lon1)
#     a = (math.sin(d_lat / 2) ** 2 +
#          math.cos(math.radians(lat1)) *
#          math.cos(math.radians(lat2)) *
#          math.sin(d_lon / 2) ** 2)
#     return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# # ── Attach distance to facility dict ─────────────────────────
# def _with_distance(facility: dict, lat: float, lon: float) -> dict:
#     dist = _haversine_km(lat, lon, facility["latitude"], facility["longitude"])
#     return {**facility, "distance_km": round(dist, 2)}


# # ── Main function: get_nearby_facilities ─────────────────────
# def get_recommended_facilities(
#     user_lat: Optional[float],
#     user_lon: Optional[float],
#     user_state: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> list[dict]:
#     """
#     Returns up to max_results nearby facilities, always at least 1.

#     Priority order:
#       1. Facilities within 25km with GPS coordinates
#       2. Expand to 50km if fewer than 2 results
#       3. Expand to 100km if still fewer than 2
#       4. Same-state facilities sorted by distance
#       5. Nearest tertiary hospital nationwide (hard fallback)

#     If user_lat/lon not provided, falls back to state-based matching.
#     """

#     has_coords = (
#         user_lat is not None and user_lon is not None and
#         not math.isnan(float(user_lat)) and not math.isnan(float(user_lon))
#     )

#     # ── Path A: We have coordinates ──────────────────────────
#     if has_coords:
#         lat, lon = float(user_lat), float(user_lon)

#         results = _search_by_radius(lat, lon, radius_km=25, triage=triage_level)

#         if len(results) < 2:
#             results = _search_by_radius(lat, lon, radius_km=50, triage=triage_level)

#         if len(results) < 2:
#             results = _search_by_radius(lat, lon, radius_km=100, triage=triage_level)

#         if len(results) < 2 and user_state:
#             state_results = _search_by_state(user_state, lat, lon)
#             # Merge without duplication
#             existing_ids = {r["id"] for r in results}
#             for f in state_results:
#                 if f["id"] not in existing_ids:
#                     results.append(f)
#                     existing_ids.add(f["id"])

#         # Hard fallback — nearest tertiary nationwide
#         if not results:
#             results = _nearest_tertiary_fallback(lat, lon)

#         return sorted(results, key=lambda f: f.get("distance_km", 9999))[:max_results]

#     # ── Path B: No coordinates, use state ────────────────────
#     if user_state:
#         state_results = _search_by_state(user_state, None, None)
#         if state_results:
#             return state_results[:max_results]

#     # ── Path C: Nothing — return first tertiary in list ──────
#     if _TERTIARY:
#         fallback = dict(_TERTIARY[0])
#         fallback["distance_km"] = None
#         fallback["far_fallback"] = True
#         fallback["fallback_note"] = (
#             "We could not determine your location. "
#             "This is a major hospital that treats newborn jaundice. "
#             "Contact them for directions."
#         )
#         return [fallback]

#     return []


# # ── Search within radius ──────────────────────────────────────
# def _search_by_radius(
#     lat: float,
#     lon: float,
#     radius_km: float,
#     triage: Optional[str] = None,
# ) -> list[dict]:
#     results = []

#     # For urgent triage, prioritise tertiary first
#     pool = _ALL_FACILITIES
#     if triage in ("RED", "URGENT_HOSPITAL_REVIEW"):
#         pool = _TERTIARY + [f for f in _ALL_FACILITIES if f.get("type") != "tertiary"]

#     for facility in pool:
#         f_lat = facility.get("latitude")
#         f_lon = facility.get("longitude")
#         if not f_lat or not f_lon:
#             continue

#         dist = _haversine_km(lat, lon, float(f_lat), float(f_lon))
#         if dist <= radius_km:
#             results.append(_with_distance(facility, lat, lon))

#     # Flag if we had to expand radius significantly
#     if radius_km > 50:
#         for f in results:
#             if f.get("distance_km", 0) > 50:
#                 f["far_fallback"] = True
#                 f["fallback_note"] = (
#                     f"This facility is {f['distance_km']:.0f} km away — the nearest option in your area. "
#                     "Call ahead before travelling."
#                 )

#     return sorted(results, key=lambda f: f.get("distance_km", 9999))


# # ── Search by state (no coordinates) ─────────────────────────
# def _search_by_state(
#     state: str,
#     lat: Optional[float],
#     lon: Optional[float],
# ) -> list[dict]:
#     state_slug = state.lower().strip().replace(" ", "_").rstrip("_state")
#     matches = [
#         f for f in _ALL_FACILITIES
#         if f.get("state", "").lower().replace(" ", "_") == state_slug
#     ]

#     if lat is not None and lon is not None:
#         matches = [_with_distance(f, lat, lon) for f in matches]
#         matches.sort(key=lambda f: f.get("distance_km", 9999))
#     else:
#         # Sort tertiary first, then by name
#         matches.sort(key=lambda f: (
#             {"tertiary": 0, "secondary": 1, "primary": 2}.get(f.get("type"), 3),
#             f.get("name", "")
#         ))

#     return matches


# # ── Nationwide tertiary fallback ──────────────────────────────
# def _nearest_tertiary_fallback(lat: float, lon: float) -> list[dict]:
#     if not _TERTIARY:
#         return []

#     with_dist = [_with_distance(f, lat, lon) for f in _TERTIARY]
#     with_dist.sort(key=lambda f: f.get("distance_km", 9999))

#     nearest = with_dist[0]
#     nearest["far_fallback"] = True
#     nearest["fallback_note"] = (
#         f"No facility was found nearby. The nearest major hospital is "
#         f"{nearest['distance_km']:.0f} km away. Call ahead before travelling."
#     )
#     return [nearest]


# # ── Convenience: reload facilities at runtime ─────────────────
# def reload_facilities():
#     """Call this if you update facilities.json without restarting the server."""
#     global _ALL_FACILITIES, _TERTIARY
#     _ALL_FACILITIES = _load_facilities()
#     _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]
#     print(f"Facilities reloaded: {len(_ALL_FACILITIES)} total, {len(_TERTIARY)} tertiary")



# import json
# import math
# import re
# from pathlib import Path
# from typing import Optional

# from app.config import DATA_STORE_DIR

# _FACILITIES_PATH = DATA_STORE_DIR / "facilities.json"

# # Nigeria bounding box — reject coordinates outside this
# _NG_LAT_MIN, _NG_LAT_MAX = 4.0, 14.0
# _NG_LON_MIN, _NG_LON_MAX = 2.5, 15.0


# def _valid_nigeria_coords(lat, lon) -> bool:
#     try:
#         lat, lon = float(lat), float(lon)
#         if math.isnan(lat) or math.isnan(lon):
#             return False
#         return (_NG_LAT_MIN <= lat <= _NG_LAT_MAX and
#                 _NG_LON_MIN <= lon <= _NG_LON_MAX)
#     except (TypeError, ValueError):
#         return False


# def _normalise_state(raw: str) -> str:
#     """ogun / Ogun / Ogun State / ogun_state → ogun"""
#     s = raw.lower().strip()
#     # Remove trailing ' state' word (not character strip)
#     if s.endswith(" state"):
#         s = s[:-6].strip()
#     if s.endswith("_state"):
#         s = s[:-6].strip()
#     return s.replace(" ", "_")


# def _normalise_name(name: str) -> str:
#     return re.sub(r"[^a-z0-9]", "", name.lower())


# def _load_and_clean() -> list:
#     if not _FACILITIES_PATH.exists():
#         print(f"WARNING: facilities.json not found at {_FACILITIES_PATH}")
#         return []

#     with open(_FACILITIES_PATH, encoding="utf-8") as f:
#         raw = json.load(f)

#     cleaned = []
#     seen: dict = {}  # (norm_name, state) -> index in cleaned

#     for facility in raw:
#         lat = facility.get("latitude")
#         lon = facility.get("longitude")

#         has_valid_coords = (
#             lat is not None and lon is not None and
#             _valid_nigeria_coords(lat, lon)
#         )

#         # Normalise state
#         state = _normalise_state(facility.get("state", ""))
#         norm_name = _normalise_name(facility.get("name", ""))
#         key = (norm_name, state)

#         entry = {
#             **facility,
#             "state": state,
#             "_valid_coords": has_valid_coords,
#         }

#         if key in seen:
#             idx = seen[key]
#             existing = cleaned[idx]
#             # Prefer entry with valid coords
#             if has_valid_coords and not existing.get("_valid_coords"):
#                 cleaned[idx] = entry
#             # Merge phone if missing
#             elif facility.get("phone") and not existing.get("phone"):
#                 cleaned[idx]["phone"] = facility["phone"]
#         else:
#             seen[key] = len(cleaned)
#             cleaned.append(entry)

#     print(f"Facilities loaded: {len(cleaned)} unique "
#           f"({sum(1 for f in cleaned if f['_valid_coords'])} with valid coords)")
#     return cleaned


# _ALL_FACILITIES: list = _load_and_clean()
# _TERTIARY: list = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]


# def _haversine_km(lat1, lon1, lat2, lon2) -> float:
#     R = 6371.0
#     d_lat = math.radians(float(lat2) - float(lat1))
#     d_lon = math.radians(float(lon2) - float(lon1))
#     a = (math.sin(d_lat / 2) ** 2 +
#          math.cos(math.radians(float(lat1))) *
#          math.cos(math.radians(float(lat2))) *
#          math.sin(d_lon / 2) ** 2)
#     return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# def _with_distance(f: dict, lat: float, lon: float) -> dict:
#     dist = _haversine_km(lat, lon, f["latitude"], f["longitude"])
#     return {**f, "distance_km": round(dist, 2)}


# def _type_rank(ftype: str, triage: Optional[str]) -> int:
#     """Lower = higher priority. Urgent triage prefers tertiary."""
#     if triage == "URGENT_HOSPITAL_REVIEW" or triage == "RED":
#         return {"tertiary": 0, "secondary": 1, "primary": 2}.get(ftype, 3)
#     return {"tertiary": 2, "secondary": 1, "primary": 0}.get(ftype, 3)


# def _by_state(state: str,
#               lat: Optional[float] = None,
#               lon: Optional[float] = None,
#               triage: Optional[str] = None,
#               max_results: int = 5) -> list:
#     """Return facilities in the given state, sorted by distance if available."""
#     norm = _normalise_state(state)
#     matches = [f for f in _ALL_FACILITIES if f.get("state") == norm]

#     if not matches:
#         return []

#     if lat is not None and lon is not None:
#         with_dist = []
#         for f in matches:
#             if f.get("_valid_coords"):
#                 with_dist.append(_with_distance(f, lat, lon))
#             else:
#                 with_dist.append({**f, "distance_km": None})

#         with_dist.sort(key=lambda f: (
#             0 if f.get("distance_km") is not None else 1,
#             f.get("distance_km") or 9999,
#             _type_rank(f.get("type", "primary"), triage),
#         ))
#         return with_dist[:max_results]

#     # No coords — sort by type priority then name
#     matches.sort(key=lambda f: (
#         _type_rank(f.get("type", "primary"), triage),
#         f.get("name", ""),
#     ))
#     return [{**f, "distance_km": None} for f in matches[:max_results]]


# def _by_radius(lat: float, lon: float,
#                radius_km: float,
#                triage: Optional[str] = None) -> list:
#     """Return all facilities within radius_km that have valid coordinates."""
#     results = []
#     for f in _ALL_FACILITIES:
#         if not f.get("_valid_coords"):
#             continue
#         dist = _haversine_km(lat, lon, f["latitude"], f["longitude"])
#         if dist <= radius_km:
#             entry = {**f, "distance_km": round(dist, 2)}
#             if dist > 50:
#                 entry["fallback_note"] = (
#                     f"{dist:.0f} km away — call ahead before travelling."
#                 )
#             results.append(entry)

#     results.sort(key=lambda f: (
#         _type_rank(f.get("type", "primary"), triage),
#         f.get("distance_km", 9999),
#     ))
#     return results


# def _nearest_tertiary(lat: float, lon: float) -> list:
#     candidates = [f for f in _TERTIARY if f.get("_valid_coords")]
#     if not candidates:
#         if _TERTIARY:
#             f = {**_TERTIARY[0], "distance_km": None,
#                  "far_fallback": True,
#                  "fallback_note": "No nearby facility found. Contact this hospital for directions."}
#             return [f]
#         return []

#     with_dist = sorted(
#         [_with_distance(f, lat, lon) for f in candidates],
#         key=lambda f: f.get("distance_km", 9999)
#     )
#     nearest = with_dist[0]
#     nearest["far_fallback"] = True
#     nearest["fallback_note"] = (
#         f"Nearest major hospital is {nearest['distance_km']:.0f} km away. "
#         "Call ahead before travelling."
#     )
#     return [nearest]


# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> list:
#     """
#     Always returns at least 1 facility. Never crashes.

#     Strategy:
#       1. GPS available → radius search (25→50→100km)
#          Always supplement with state results to fill remaining slots
#       2. No GPS, state provided → state-based search
#       3. Nothing → nearest tertiary or first in list
#     """

#     has_coords = (
#         user_lat is not None and
#         user_lon is not None and
#         _valid_nigeria_coords(user_lat, user_lon)
#     )

#     if has_coords:
#         lat, lon = float(user_lat), float(user_lon)

#         # Try expanding radii
#         results = _by_radius(lat, lon, 25, triage_level)
#         if len(results) < 3:
#             results = _by_radius(lat, lon, 50, triage_level)
#         if len(results) < 3:
#             results = _by_radius(lat, lon, 100, triage_level)

#         # ALWAYS supplement with state results to fill remaining slots
#         # This handles the case where OSM coords are wrong
#         if user_state and len(results) < max_results:
#             existing_ids = {f["id"] for f in results}
#             state_results = _by_state(user_state, lat, lon, triage_level,
#                                       max_results=max_results * 2)
#             for f in state_results:
#                 if f["id"] not in existing_ids:
#                     results.append(f)
#                     existing_ids.add(f["id"])
#                 if len(results) >= max_results:
#                     break

#         if not results:
#             results = _nearest_tertiary(lat, lon)

#         return results[:max_results]

#     # No valid GPS
#     if user_state:
#         state_results = _by_state(user_state, triage=triage_level,
#                                    max_results=max_results)
#         if state_results:
#             return state_results

#     # Hard fallback
#     if _TERTIARY:
#         f = {**_TERTIARY[0], "distance_km": None,
#              "far_fallback": True,
#              "fallback_note": (
#                  "Enable location or enter your state to find nearby facilities. "
#                  "This major hospital can help with newborn jaundice."
#              )}
#         return [f]

#     return []


# def reload_facilities():
#     global _ALL_FACILITIES, _TERTIARY
#     _ALL_FACILITIES = _load_and_clean()
#     _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]
#     print(f"Reloaded: {len(_ALL_FACILITIES)} facilities")




# import json
# import math
# import re
# from pathlib import Path
# from typing import Optional

# from app.config import DATA_STORE_DIR

# # Target the clean production file generated by the streaming pipeline
# _FACILITIES_PATH = DATA_STORE_DIR / "production_facilities.json"

# # Nigeria bounding box limits
# _NG_LAT_MIN, _NG_LAT_MAX = 4.0, 14.0
# _NG_LON_MIN, _NG_LON_MAX = 2.5, 15.0


# def _valid_nigeria_coords(lat, lon) -> bool:
#     try:
#         lat, lon = float(lat), float(lon)
#         if math.isnan(lat) or math.isnan(lon):
#             return False
#         return (_NG_LAT_MIN <= lat <= _NG_LAT_MAX and
#                 _NG_LON_MIN <= lon <= _NG_LON_MAX)
#     except (TypeError, ValueError):
#         return False


# def _normalise_state(raw: str) -> str:
#     """ogun / Ogun / Ogun State / ogun_state → ogun"""
#     if not raw:
#         return "unspecified_state"
#     s = raw.lower().strip()
#     if s.endswith(" state"):
#         s = s[:-6].strip()
#     if s.endswith("_state"):
#         s = s[:-6].strip()
#     return s.replace(" ", "_")


# def _normalise_name(name: str) -> str:
#     return re.sub(r"[^a-z0-9]", "", name.lower())


# def _load_and_clean() -> list:
#     if not _FACILITIES_PATH.exists():
#         print(f"WARNING: production_facilities.json not found at {_FACILITIES_PATH}")
#         return []

#     with open(_FACILITIES_PATH, encoding="utf-8") as f:
#         raw = json.load(f)

#     cleaned = []
#     seen: dict = {}  # (norm_name, state) -> index in cleaned

#     for facility in raw:
#         lat = facility.get("latitude")
#         lon = facility.get("longitude")

#         # Explicitly trust the data_quality_verified flag from our pipeline if coords match bounds
#         has_valid_coords = (
#             lat is not None and lon is not None and
#             _valid_nigeria_coords(lat, lon)
#         )

#         state = _normalise_state(facility.get("state", "unspecified_state"))
#         norm_name = _normalise_name(facility.get("name", ""))
#         key = (norm_name, state)

#         entry = {
#             **facility,
#             "state": state,
#             "_valid_coords": has_valid_coords,
#         }

#         if key in seen:
#             idx = seen[key]
#             existing = cleaned[idx]
#             if has_valid_coords and not existing.get("_valid_coords"):
#                 cleaned[idx] = entry
#             elif facility.get("phone") and not existing.get("phone"):
#                 cleaned[idx]["phone"] = facility["phone"]
#         else:
#             seen[key] = len(cleaned)
#             cleaned.append(entry)

#     print(f"Facilities loaded: {len(cleaned)} unique production entries "
#           f"({sum(1 for f in cleaned if f['_valid_coords'])} with valid coords)")
#     return cleaned


# _ALL_FACILITIES: list = _load_and_clean()
# _TERTIARY: list = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]


# def _haversine_km(lat1, lon1, lat2, lon2) -> float:
#     R = 6371.0
#     d_lat = math.radians(float(lat2) - float(lat1))
#     d_lon = math.radians(float(lon2) - float(lon1))
#     a = (math.sin(d_lat / 2) ** 2 +
#          math.cos(math.radians(float(lat1))) *
#          math.cos(math.radians(float(lat2))) *
#          math.sin(d_lon / 2) ** 2)
#     return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# def _with_distance(f: dict, lat: float, lon: float) -> dict:
#     dist = _haversine_km(lat, lon, f["latitude"], f["longitude"])
#     return {**f, "distance_km": round(dist, 2)}


# def _type_rank(ftype: str, triage: Optional[str]) -> int:
#     """Lower = higher priority. Critical danger cases place Tertiary first."""
#     if triage in ["URGENT_HOSPITAL_REVIEW", "RED"]:
#         return {"tertiary": 0, "secondary": 1, "primary": 2}.get(ftype, 3)
#     # Default/Green/Amber conditions place localized clinics up front
#     return {"primary": 0, "secondary": 1, "tertiary": 2}.get(ftype, 3)


# def _by_state(state: str,
#               lat: Optional[float] = None,
#               lon: Optional[float] = None,
#               triage: Optional[str] = None,
#               max_results: int = 5) -> list:
#     norm = _normalise_state(state)
#     matches = [f for f in _ALL_FACILITIES if f.get("state") == norm]

#     if not matches:
#         return []

#     if lat is not None and lon is not None:
#         with_dist = []
#         for f in matches:
#             if f.get("_valid_coords"):
#                 with_dist.append(_with_distance(f, lat, lon))
#             else:
#                 with_dist.append({**f, "distance_km": None})

#         with_dist.sort(key=lambda f: (
#             0 if f.get("distance_km") is not None else 1,
#             f.get("distance_km") or 9999,
#             _type_rank(f.get("type", "primary"), triage),
#         ))
#         return with_dist[:max_results]

#     matches.sort(key=lambda f: (
#         _type_rank(f.get("type", "primary"), triage),
#         f.get("name", ""),
#     ))
#     return [{**f, "distance_km": None} for f in matches[:max_results]]


# def _by_radius(lat: float, lon: float,
#                radius_km: float,
#                triage: Optional[str] = None) -> list:
#     results = []
#     for f in _ALL_FACILITIES:
#         if not f.get("_valid_coords"):
#             continue
#         dist = _haversine_km(lat, lon, f["latitude"], f["longitude"])
#         if dist <= radius_km:
#             entry = {**f, "distance_km": round(dist, 2)}
#             if dist > 50:
#                 entry["fallback_note"] = (
#                     f"{dist:.0f} km away — call ahead to confirm phototherapy availability."
#                 )
#             results.append(entry)

#     results.sort(key=lambda f: (
#         _type_rank(f.get("type", "primary"), triage),
#         f.get("distance_km", 9999),
#     ))
#     return results


# def _nearest_tertiary(lat: float, lon: float) -> list:
#     candidates = [f for f in _TERTIARY if f.get("_valid_coords")]
#     if not candidates:
#         if _TERTIARY:
#             f = {**_TERTIARY[0], "distance_km": None,
#                  "far_fallback": True,
#                  "fallback_note": "Contact this major facility for newborn specialized care guidance."}
#             return [f]
#         return []

#     with_dist = sorted(
#         [_with_distance(f, lat, lon) for f in candidates],
#         key=lambda f: f.get("distance_km", 9999)
#     )
#     nearest = with_dist[0]
#     nearest["far_fallback"] = True
#     nearest["fallback_note"] = (
#         f"Nearest verified major hospital is {nearest['distance_km']:.0f} km away. "
#         "Call ahead to confirm emergency triage access."
#     )
#     return [nearest]


# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> list:
#     has_coords = (
#         user_lat is not None and
#         user_lon is not None and
#         _valid_nigeria_coords(user_lat, user_lon)
#     )

#     if has_coords:
#         lat, lon = float(user_lat), float(user_lon)

#         results = _by_radius(lat, lon, 25, triage_level)
#         if len(results) < 3:
#             results = _by_radius(lat, lon, 50, triage_level)
#         if len(results) < 3:
#             results = _by_radius(lat, lon, 100, triage_level)

#         if user_state and len(results) < max_results:
#             existing_ids = {f["id"] for f in results}
#             state_results = _by_state(user_state, lat, lon, triage_level,
#                                       max_results=max_results * 2)
#             for f in state_results:
#                 if f["id"] not in existing_ids:
#                     results.append(f)
#                     existing_ids.add(f["id"])
#                 if len(results) >= max_results:
#                     break

#         if not results:
#             results = _nearest_tertiary(lat, lon)

#         return results[:max_results]

#     if user_state:
#         state_results = _by_state(user_state, triage=triage_level, max_results=max_results)
#         if state_results:
#             return state_results

#     if _TERTIARY:
#         f = {**_TERTIARY[0], "distance_km": None,
#              "far_fallback": True,
#              "fallback_note": (
#                  "Enable device location permissions or specify your State region. "
#                  "This center is fully equipped to handle specialized infant phototherapy panels."
#              )}
#         return [f]

#     return []


# def reload_facilities():
#     global _ALL_FACILITIES, _TERTIARY
#     _ALL_FACILITIES = _load_and_clean()
#     _TERTIARY = [f for f in _ALL_FACILITIES if f.get("type") == "tertiary"]
#     print(f"Reloaded: {len(_ALL_FACILITIES)} facilities")




# import json
# import math
# from pathlib import Path
# from typing import Optional, List

# # Load facilities into memory once at startup
# FACILITIES_JSON_PATH = Path("backend/data_store/production_facilities.json")
# _ALL_FACILITIES = []

# if FACILITIES_JSON_PATH.exists():
#     with open(FACILITIES_JSON_PATH, "r", encoding="utf-8") as f:
#         _ALL_FACILITIES = json.load(f)

# def _normalise_state(state_str: Optional[str]) -> str:
#     if not state_str:
#         return "unspecified_state"
#     return state_str.strip().lower().replace(" ", "_")

# def _calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Calculates the absolute physical distance in kilometers between two points."""
#     R = 6371.0  # Earth radius in kilometers
    
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
    
#     a = (math.sin(dlat / 2) ** 2 + 
#          math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
#     return R * c

# def _get_tier_priority(facility_type: str, triage_level: Optional[str]) -> int:
#     """
#     Returns a sorting weight for the facility type based on triage severity.
#     Lower score = Higher priority (comes first in sorting).
#     """
#     severity = str(triage_level).upper().strip()
#     is_emergency = severity in ["RED", "HIGH_RISK", "URGENT", "URGENT_HOSPITAL_REVIEW"]
    
#     if is_emergency:
#         # Emergency situation: Tertiary and Secondary centers must override primary centers
#         if facility_type == "tertiary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2  # Primary centers are ranked last in an emergency
#     else:
#         # Routine or low risk: Closer primary centers are perfectly fine
#         if facility_type == "primary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2

# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> List[dict]:
#     """
#     Triage-Aware Recommendation Engine:
#     Filters and matches facilities across the entire country based on GPS coordinates
#     or manual state fallback filters without encountering Pydantic structure crashes.
#     """
#     recommended = []
    
#     # Check if a valid live GPS signal is active
#     has_gps = (user_lat is not None and user_lon is not None and 
#                user_lat != 0.0 and user_lon != 0.0)
    
#     # Target state normalization
#     target_state = _normalise_state(user_state) if user_state else None

#     # Step 1: Filter potential candidates from the global dataset
#     candidates = []
#     for f in _ALL_FACILITIES:
#         # If user explicitly selected a state, restrict candidates to that state
#         if target_state and f.get("state") != target_state:
#             continue
#         candidates.append(f)

#     # Step 2: Compute distances if GPS is available
#     for f in candidates:
#         distance = None
#         f_lat = f.get("latitude", 0.0)
#         f_lon = f.get("longitude", 0.0)
        
#         if has_gps and f.get("data_quality_verified") and f_lat != 0.0 and f_lon != 0.0:
#             distance = _calculate_haversine(float(user_lat), float(user_lon), f_lat, f_lon)
            
#         # Prepare clean layout matching FacilityResponseSchema specs perfectly
#         item = {
#             "id": f.get("id"),
#             "name": f.get("name"),
#             "type": f.get("type", "primary"),
#             "state": f.get("state"),
#             "lga": f.get("lga"),
#             "address": f.get("address"),
#             "phone": f.get("phone"),
#             "latitude": f_lat,
#             "longitude": f_lon,
#             "services": f.get("services", []),
#             "osm_id": int(f.get("osm_id", 0)),
#             "data_quality_verified": f.get("data_quality_verified", False),
#             "distance_km": distance
#         }
#         recommended.append(item)

#     # Step 3: Core Triage-Aware Sorting Logic
#     if has_gps:
#         # Sort criteria when GPS is available:
#         # 1. Tier Priority based on Triage (Emergency centers jump to front if case is severe)
#         # 2. Absolute distance proximity breaking ties next
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["distance_km"] if x["distance_km"] is not None else 99999.0
#         ))
#     else:
#         # Sort criteria when manually selecting states without GPS:
#         # 1. Tier Priority based on Triage
#         # 2. Alphabetical ordering by name to maintain structural predictability
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["name"]
#         ))

#     return recommended[:max_results]




# import json
# import math
# from pathlib import Path
# from typing import Optional, List

# # Centralized memory index for dataset tracking
# FACILITIES_JSON_PATH = Path("app/data/production_facilities.json")
# _ALL_FACILITIES = []

# def load_facilities_at_startup():
#     global _ALL_FACILITIES
#     if FACILITIES_JSON_PATH.exists():
#         try:
#             with open(FACILITIES_JSON_PATH, "r", encoding="utf-8") as f:
#                 _ALL_FACILITIES = json.load(f)
#             print(f"🌍 [FacilityService] Loaded {len(_ALL_FACILITIES)} nationwide facilities successfully.")
#         except Exception as e:
#             print(f"❌ [FacilityService] Error reading production file: {str(e)}")
#             _ALL_FACILITIES = []
#     else:
#         print(f"⚠️ [FacilityService] Production file missing at: {FACILITIES_JSON_PATH}")

# # Initialize right away
# load_facilities_at_startup()

# def _normalise_state(state_str: Optional[str]) -> str:
#     if not state_str:
#         return "unspecified_state"
#     return state_str.strip().lower().replace(" ", "_")

# def _calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Calculates physical distance in kilometers using the Haversine formula."""
#     R = 6371.0
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = (math.sin(dlat / 2) ** 2 + 
#          math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c

# def _get_tier_priority(facility_type: str, triage_level: Optional[str]) -> int:
#     """
#     Returns a ranking index based on medical triage emergency parameters.
#     Lower number = Higher ranking priority (appears first on the phone screen).
#     """
#     severity = str(triage_level).upper().strip()
#     is_emergency = any(keyword in severity for keyword in ["RED", "HIGH", "URGENT", "REVIEW"])
    
#     if is_emergency:
#         # Emergency status requires high-tier capabilities immediately
#         if facility_type == "tertiary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2  # Primary centers fall back safely to last place
#     else:
#         # Routine scenarios prioritize localized primary care
#         if facility_type == "primary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2

# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> List[dict]:
#     """
#     National recommendation coordinator. Connects to the updated Pydantic structure
#     without validation exceptions and updates sorting dynamically based on triage status.
#     """
#     # Ensure dataset recovery if memory is cleared unexpectedly
#     if not _ALL_FACILITIES:
#         load_facilities_at_startup()

#     recommended = []
    
#     # Clean and parse coordinates safely
#     try:
#         lat = float(user_lat) if user_lat is not None else 0.0
#         lon = float(user_lon) if user_lon is not None else 0.0
#         has_gps = (lat != 0.0 and lon != 0.0)
#     except (ValueError, TypeError):
#         lat, lon = 0.0, 0.0
#         has_gps = False

#     target_state = _normalise_state(user_state) if user_state else None

#     # Step 1: Filter entries by state if manual dropdown rules are set
#     candidates = []
#     for f in _ALL_FACILITIES:
#         if target_state and f.get("state") != target_state:
#             continue
#         candidates.append(f)

#     # Step 2: Compute relative proximity arrays
#     for f in candidates:
#         distance = None
#         f_lat = f.get("latitude", 0.0)
#         f_lon = f.get("longitude", 0.0)
        
#         if has_gps and f.get("data_quality_verified") and f_lat != 0.0 and f_lon != 0.0:
#             distance = _calculate_haversine(lat, lon, float(f_lat), float(f_lon))
            
#         item = {
#             "id": str(f.get("id")),
#             "name": str(f.get("name")),
#             "type": str(f.get("type", "primary")).lower(),
#             "state": str(f.get("state")),
#             "lga": f.get("lga") if f.get("lga") else "Central Region",
#             "address": f.get("address") if f.get("address") else str(f.get("name")),
#             "phone": f.get("phone"),
#             "latitude": float(f_lat),
#             "longitude": float(f_lon),
#             "services": f.get("services", ["basic_newborn_care"]),
#             "osm_id": int(f.get("osm_id", 0)),
#             "data_quality_verified": bool(f.get("data_quality_verified", False)),
#             "distance_km": distance
#         }
#         recommended.append(item)

#     # Step 3: Triage-Aware Sorting Loop
#     if has_gps:
#         # When GPS works: prioritize care tier capacity, then closest distance
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["distance_km"] if x["distance_km"] is not None else 99999.0
#         ))
#     else:
#         # Manual selection fallback: prioritize care tier capacity, then alphabetical order
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["name"]
#         ))

#     return recommended[:max_results]






# import json
# import math
# from pathlib import Path
# from typing import Optional, List

# # Target baseline resource paths
# FACILITIES_JSON_PATH = Path("backend/data_store/production_facilities.json")
# _ALL_FACILITIES = []

# def load_facilities_at_startup():
#     global _ALL_FACILITIES
#     if FACILITIES_JSON_PATH.exists():
#         try:
#             with open(FACILITIES_JSON_PATH, "r", encoding="utf-8") as f:
#                 _ALL_FACILITIES = json.load(f)
#             print(f"[FacilityService] Loaded {len(_ALL_FACILITIES)} facilities successfully.")
#         except Exception as e:
#             print(f"[FacilityService] Error reading production file: {str(e)}")
#             _ALL_FACILITIES = []
#     else:
#         print(f"[FacilityService] Production file missing at: {FACILITIES_JSON_PATH}")

# # Initialize right away
# load_facilities_at_startup()

# def _normalise_state(state_str: Optional[str]) -> str:
#     if not state_str:
#         return "unspecified_state"
#     return state_str.strip().lower().replace(" ", "_")

# def _calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371.0
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = (math.sin(dlat / 2) ** 2 + 
#          math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c

# def _get_tier_priority(facility_type: str, triage_level: Optional[str]) -> int:
#     """
#     Returns sorting rank indices based on case severity.
#     Lower number = Higher ranking priority (pushed directly to top of screen).
#     """
#     severity = str(triage_level).upper().strip()
#     is_emergency = any(keyword in severity for keyword in ["RED", "HIGH", "URGENT", "REVIEW"])
    
#     if is_emergency:
#         # Emergency situation requires advanced care capacity immediately
#         if facility_type == "tertiary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2  # Primary centers fall behind secondary/tertiary hubs
#     else:
#         # Routine tracking prioritizes localized care checks
#         if facility_type == "primary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2

# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     user_lga: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> List[dict]:

#     target_state = user_state.strip().lower().replace(" ", "_") if user_state else None
#     target_lga = user_lga.strip().lower() if user_lga else None

#     candidates = []
#     for f in _ALL_FACILITIES:
#         # Match State text
#         if target_state and f.get("state") != target_state:
#             continue
#         # Narrow down to LGA if provided
#         if target_lga and f.get("lga") and target_lga not in str(f.get("lga")).lower():
#             continue
#         candidates.append(f)

#     if not _ALL_FACILITIES:
#         load_facilities_at_startup()

#     recommended = []
    
#     # Process inputs cleanly avoiding floating exceptions
#     try:
#         lat = float(user_lat) if user_lat is not None else 0.0
#         lon = float(user_lon) if user_lon is not None else 0.0
#         has_gps = (lat != 0.0 and lon != 0.0)
#     except (ValueError, TypeError):
#         lat, lon = 0.0, 0.0
#         has_gps = False

#     target_state = _normalise_state(user_state) if user_state else None

#     # Step 1: Filter potential facility records by state text indicators
#     candidates = []
#     for f in _ALL_FACILITIES:
#         if target_state and f.get("state") != target_state:
#             continue
#         candidates.append(f)

#     # Step 2: Compute relative proximity metrics
#     for f in candidates:
#         distance = None
#         f_lat = f.get("latitude", 0.0)
#         f_lon = f.get("longitude", 0.0)
        
#         if has_gps and f.get("data_quality_verified") and f_lat != 0.0 and f_lon != 0.0:
#             distance = _calculate_haversine(lat, lon, float(f_lat), float(f_lon))
            
#         item = {
#             "id": str(f.get("id")),
#             "name": str(f.get("name")),
#             "type": str(f.get("type", "primary")).lower(),
#             "state": str(f.get("state")),
#             "lga": f.get("lga") if f.get("lga") else "Central Region",
#             "address": f.get("address") if f.get("address") else str(f.get("name")),
#             "phone": f.get("phone"),
#             "latitude": float(f_lat),
#             "longitude": float(f_lon),
#             "services": f.get("services", ["basic_newborn_care"]),
#             "osm_id": int(f.get("osm_id", 0)),
#             "data_quality_verified": bool(f.get("data_quality_verified", False)),
#             "distance_km": distance
#         }
#         recommended.append(item)

#     # Step 3: Sort dynamically based on triage data status
#     if has_gps:
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["distance_km"] if x["distance_km"] is not None else 99999.0
#         ))
#     else:
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["name"]
#         ))

#     return recommended[:max_results]


# CURRENT_FILE_PATH = Path(__file__).resolve()  
# BACKEND_ROOT_DIR = CURRENT_FILE_PATH.parent.parent.parent

# FACILITIES_JSON_PATH = BACKEND_ROOT_DIR / "data_store" / "production_facilities.json"


# import json
# import math
# from pathlib import Path
# from typing import Optional, List

# # Target baseline resource paths
# FACILITIES_JSON_PATH = Path("data_store\production_facilities.json")
# _ALL_FACILITIES = []

# def load_facilities_at_startup():
#     global _ALL_FACILITIES
#     if FACILITIES_JSON_PATH.exists():
#         try:
#             with open(FACILITIES_JSON_PATH, "r", encoding="utf-8") as f:
#                 _ALL_FACILITIES = json.load(f)
#             print(f"🌍 [FacilityService] Loaded {len(_ALL_FACILITIES)} facilities successfully.")
#         except Exception as e:
#             print(f"❌ [FacilityService] Error reading production file: {str(e)}")
#             _ALL_FACILITIES = []
#     else:
#         print(f"⚠️ [FacilityService] Production file missing at: {FACILITIES_JSON_PATH}")

# # Initialize right away
# load_facilities_at_startup()

# def _normalise_string(text: Optional[str]) -> str:
#     if not text:
#         return ""
#     return str(text).strip().lower().replace(" ", "_")

# def _calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371.0
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = (math.sin(dlat / 2) ** 2 + 
#          math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c

# def _get_tier_priority(facility_type: str, triage_level: Optional[str]) -> int:
#     """
#     Returns sorting rank indices based on case severity.
#     Lower number = Higher ranking priority (appears first on screen).
#     """
#     severity = str(triage_level).upper().strip()
#     is_emergency = any(keyword in severity for keyword in ["RED", "HIGH", "URGENT", "REVIEW"])
    
#     if is_emergency:
#         # Emergency situation requires advanced care capacity immediately
#         if facility_type == "tertiary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2  # Primary centers fall behind secondary/tertiary hubs
#     else:
#         # Routine tracking prioritizes localized care checks
#         if facility_type == "primary":
#             return 0
#         elif facility_type == "secondary":
#             return 1
#         else:
#             return 2

# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     user_lga: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> List[dict]:
#     # Ensure dataset recovery if memory is cleared unexpectedly
#     if not _ALL_FACILITIES:
#         load_facilities_at_startup()

#     # Clean and parse inputs consistently
#     target_state = _normalise_string(user_state) if user_state else None
    
#     # Keep spaces for local government text comparisons (e.g., "abeokuta north")
#     target_lga = user_lga.strip().lower() if user_lga else None

#     try:
#         lat = float(user_lat) if user_lat is not None else 0.0
#         lon = float(user_lon) if user_lon is not None else 0.0
#         has_gps = (lat != 0.0 and lon != 0.0)
#     except (ValueError, TypeError):
#         lat, lon = 0.0, 0.0
#         has_gps = False

#     # Step 1: Filter potential facility records by state AND local government area (LGA)
#     candidates = []
#     for f in _ALL_FACILITIES:
#         # Match State indicator
#         if target_state and _normalise_string(f.get("state")) != target_state:
#             continue
        
#         # Narrow down to LGA if selected on the frontend dropdown picker
#         if target_lga:
#             fac_lga = f.get("lga")
#             if fac_lga:
#                 # Direct string containment check (e.g., matching "Abeokuta North" dynamically)
#                 if target_lga not in str(fac_lga).lower():
#                     continue
#             else:
#                 # If user selected an LGA but this specific database entry doesn't specify one, skip it
#                 continue
                
#         candidates.append(f)

#     # Step 2: Compute relative proximity metrics if coordinates are active
#     recommended = []
#     for f in candidates:
#         distance = None
#         f_lat = f.get("latitude", 0.0)
#         f_lon = f.get("longitude", 0.0)
        
#         if has_gps and f_lat != 0.0 and f_lon != 0.0:
#             distance = _calculate_haversine(lat, lon, float(f_lat), float(f_lon))
            
#         item = {
#             "id": str(f.get("id")),
#             "name": str(f.get("name")),
#             "type": str(f.get("type", "primary")).lower(),
#             "state": str(f.get("state")),
#             "lga": f.get("lga") if f.get("lga") else "Central Region",
#             "address": f.get("address") if f.get("address") else str(f.get("name")),
#             "phone": f.get("phone"),
#             "latitude": float(f_lat),
#             "longitude": float(f_lon),
#             "services": f.get("services", ["basic_newborn_care"]),
#             "osm_id": int(f.get("osm_id", 0)),
#             "data_quality_verified": bool(f.get("data_quality_verified", False)),
#             "distance_km": distance
#         }
#         recommended.append(item)

#     # Step 3: Triage-Aware Sorting Flow
#     if has_gps:
#         # GPS active: Sort by Care Capacity Tier first, then by closest distance
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["distance_km"] if x["distance_km"] is not None else 99999.0
#         ))
#     else:
#         # Manual fallback active: Sort by Care Capacity Tier first, then alphabetically
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["name"]
#         ))

#     return recommended[:max_results]





# import json
# import math
# from pathlib import Path
# from typing import Optional, List

# CURRENT_FILE_PATH = Path(__file__).resolve()
# BACKEND_ROOT_DIR = CURRENT_FILE_PATH.parent.parent.parent
# FACILITIES_JSON_PATH = BACKEND_ROOT_DIR / "data_store" / "production_facilities.json"

# _ALL_FACILITIES = []

# def load_facilities_at_startup():
#     global _ALL_FACILITIES
#     if FACILITIES_JSON_PATH.exists():
#         try:
#             with open(FACILITIES_JSON_PATH, "r", encoding="utf-8") as f:
#                 _ALL_FACILITIES = json.load(f)
#             print(f"🌍 [FacilityService] Loaded {len(_ALL_FACILITIES)} facilities successfully.")
#         except Exception as e:
#             print(f"❌ [FacilityService] Error reading production file: {str(e)}")
#             _ALL_FACILITIES = []
#     else:
#         print(f"⚠️ [FacilityService] Production file missing at: {FACILITIES_JSON_PATH}")

# load_facilities_at_startup()

# def _normalise_string(text: Optional[str]) -> str:
#     if not text:
#         return ""
#     return str(text).strip().lower().replace(" ", "_")

# def _calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371.0  # Earth's radius in kilometers
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = (math.sin(dlat / 2) ** 2 + 
#          math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c

# def _get_tier_priority(facility_type: str, triage_level: Optional[str]) -> int:
#     severity = str(triage_level).upper().strip()
#     is_emergency = any(keyword in severity for keyword in ["RED", "HIGH", "URGENT", "REVIEW"])
    
#     if is_emergency:
#         if facility_type == "tertiary": return 0
#         elif facility_type == "secondary": return 1
#         else: return 2
#     else:
#         if facility_type == "primary": return 0
#         elif facility_type == "secondary": return 1
#         else: return 2

# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     user_lga: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> List[dict]:
    
#     if not _ALL_FACILITIES:
#         load_facilities_at_startup()

#     # target_state = _normalise_string(user_state) if user_state else None
#     # target_lga = user_lga.strip().lower() if user_lga else None

#     # 🎯 Add this check right at the top of your backend function:
#     if user_state is not None and str(user_state).strip() == "":
#         user_state = None

#     if user_lga is not None and str(user_lga).strip() == "":
#         user_lga = None

#     try:
#         # Securely parse coordinates ensuring float casting errors don't crash processing
#         lat = float(user_lat) if user_lat is not None else 0.0
#         lon = float(user_lon) if user_lon is not None else 0.0
#         has_gps = (abs(lat) > 0.1 and abs(lon) > 0.1)  # Verifies coordinates are genuinely populated
#     except (ValueError, TypeError):
#         lat, lon = 0.0, 0.0
#         has_gps = False

#     # Step 1: Filter by manual location values
#     candidates = []
#     for f in _ALL_FACILITIES:
#         if target_state and _normalise_string(f.get("state")) != target_state:
#             continue
        
#         if target_lga:
#             fac_lga = f.get("lga")
#             if fac_lga and target_lga not in str(fac_lga).lower():
#                 continue
#         candidates.append(f)

#     # Step 2: Build responses with robust address key fallbacks
#     recommended = []
#     for f in candidates:
#         distance = None
#         f_lat = f.get("latitude")
#         f_lon = f.get("longitude")
        
#         if has_gps and f_lat is not None and f_lon is not None:
#             # FIX: If your database uses flipped fields, swap f_lat and f_lon positional arguments here
#             distance = _calculate_haversine(lat, lon, float(f_lat), float(f_lon))

#         # FIX: Robust fallback matching check for common JSON address field conventions
#         exact_address = f.get("address") or f.get("facility_address") or f.get("formatted_address") or f.get("street")
#         if not exact_address or exact_address.strip() == "":
#             exact_address = f"Located in {f.get('lga', 'Central Region')}, {str(f.get('state')).title()} State."

#         item = {
#             "id": str(f.get("id")),
#             "name": str(f.get("name")),
#             "type": str(f.get("type", "primary")).lower(),
#             "state": str(f.get("state")),
#             "lga": f.get("lga") if f.get("lga") else "Central Region",
#             "address": exact_address, # Assigned securely
#             "phone": f.get("phone") or f.get("contact_phone") or "No contact number listed",
#             "latitude": float(f_lat) if f_lat else 0.0,
#             "longitude": float(f_lon) if f_lon else 0.0,
#             "services": f.get("services", ["basic_newborn_care"]),
#             "osm_id": int(f.get("osm_id", 0)),
#             "data_quality_verified": bool(f.get("data_quality_verified", False)),
#             "distance_km": round(distance, 1) if distance is not None else None
#         }
#         recommended.append(item)

#     # Step 3: Sort dynamically
#     if has_gps:
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["distance_km"] if x["distance_km"] is not None else 99999.0
#         ))
#     else:
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["name"]
#         ))

#     return recommended[:max_results]



# import json
# import math
# from pathlib import Path
# from typing import Optional, List

# CURRENT_FILE_PATH = Path(__file__).resolve()
# BACKEND_ROOT_DIR = CURRENT_FILE_PATH.parent.parent.parent
# FACILITIES_JSON_PATH = BACKEND_ROOT_DIR / "data_store" / "production_facilities.json"

# _ALL_FACILITIES = []

# def load_facilities_at_startup():
#     global _ALL_FACILITIES
#     if FACILITIES_JSON_PATH.exists():
#         try:
#             with open(FACILITIES_JSON_PATH, "r", encoding="utf-8") as f:
#                 _ALL_FACILITIES = json.load(f)
#             print(f"🌍 [FacilityService] Loaded {len(_ALL_FACILITIES)} facilities successfully.")
#         except Exception as e:
#             print(f"❌ [FacilityService] Error reading production file: {str(e)}")
#             _ALL_FACILITIES = []
#     else:
#         print(f"⚠️ [FacilityService] Production file missing at: {FACILITIES_JSON_PATH}")

# load_facilities_at_startup()

# def _normalise_string(text: Optional[str]) -> str:
#     if not text:
#         return ""
#     return str(text).strip().lower().replace(" ", "_")

# def _calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     R = 6371.0  # Earth's radius in kilometers
#     dlat = math.radians(lat2 - lat1)
#     dlon = math.radians(lon2 - lon1)
#     a = (math.sin(dlat / 2) ** 2 + 
#          math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     return R * c

# def _get_tier_priority(facility_type: str, triage_level: Optional[str]) -> int:
#     severity = str(triage_level).upper().strip()
#     is_emergency = any(keyword in severity for keyword in ["RED", "HIGH", "URGENT", "REVIEW"])
    
#     if is_emergency:
#         if facility_type == "tertiary": return 0
#         elif facility_type == "secondary": return 1
#         else: return 2
#     else:
#         if facility_type == "primary": return 0
#         elif facility_type == "secondary": return 1
#         else: return 2

# def get_recommended_facilities(
#     user_lat: Optional[float] = None,
#     user_lon: Optional[float] = None,
#     user_state: Optional[str] = None,
#     user_lga: Optional[str] = None,
#     triage_level: Optional[str] = None,
#     max_results: int = 5,
# ) -> List[dict]:
    
#     if not _ALL_FACILITIES:
#         load_facilities_at_startup()

#     # Convert empty form strings ("") cleanly to standard None objects
#     if user_state is not None and str(user_state).strip() == "":
#         user_state = None

#     if user_lga is not None and str(user_lga).strip() == "":
#         user_lga = None

#     # 🎯 FIXED: Initialized variables correctly so they are visible to Step 1 loop
#     target_state = _normalise_string(user_state) if user_state else None
#     target_lga = user_lga.strip().lower() if user_lga else None

#     try:
#         lat = float(user_lat) if user_lat is not None else 0.0
#         lon = float(user_lon) if user_lon is not None else 0.0
#         has_gps = (abs(lat) > 0.1 and abs(lon) > 0.1)  # Verifies coordinates are genuinely populated
#     except (ValueError, TypeError):
#         lat, lon = 0.0, 0.0
#         has_gps = False

#     # Step 1: Filter by manual location values
#     candidates = []
#     for f in _ALL_FACILITIES:
#         # Match State string
#         if target_state and _normalise_string(f.get("state")) != target_state:
#             continue
        
#         # Narrow down to LGA if provided
#         if target_lga:
#             fac_lga = f.get("lga")
#             if fac_lga and target_lga not in str(fac_lga).lower():
#                 continue
#         candidates.append(f)

#     # If the text filtering was too strict and left 0 results, fall back to all facilities
#     # so the app never displays a completely blank screen to a mother in an emergency
#     if not candidates:
#         candidates = _ALL_FACILITIES

#     # Step 2: Build responses with robust address key fallbacks
#     recommended = []
#     for f in candidates:
#         distance = None
#         f_lat = f.get("latitude")
#         f_lon = f.get("longitude")
        
#         if has_gps and f_lat is not None and f_lon is not None:
#             distance = _calculate_haversine(lat, lon, float(f_lat), float(f_lon))

#         # Robust fallback matching check for common JSON address field conventions
#         exact_address = f.get("address") or f.get("facility_address") or f.get("formatted_address") or f.get("street")
#         if not exact_address or exact_address.strip() == "":
#             exact_address = f"Located in {f.get('lga', 'Central Region')}, {str(f.get('state')).title()} State."

#         item = {
#             "id": str(f.get("id")),
#             "name": str(f.get("name")),
#             "type": str(f.get("type", "primary")).lower(),
#             "state": str(f.get("state")),
#             "lga": f.get("lga") if f.get("lga") else "Central Region",
#             "address": exact_address,
#             "phone": f.get("phone") or f.get("contact_phone") or "No contact number listed",
#             "latitude": float(f_lat) if f_lat else 0.0,
#             "longitude": float(f_lon) if f_lon else 0.0,
#             "services": f.get("services", ["basic_newborn_care"]),
#             "osm_id": int(f.get("osm_id", 0)),
#             "data_quality_verified": bool(f.get("data_quality_verified", False)),
#             "distance_km": round(distance, 1) if distance is not None else None
#         }
#         recommended.append(item)

#     # Step 3: Sort dynamically
#     if has_gps:
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["distance_km"] if x["distance_km"] is not None else 99999.0
#         ))
#     else:
#         recommended.sort(key=lambda x: (
#             _get_tier_priority(x["type"], triage_level),
#             x["name"]
#         ))

#     return recommended[:max_results]


# """
# JaundiCare — Facility Service (v2)
# Adds facility preference (nearest / government / clinic),
# LGA-level search, government-first cost-aware sorting,
# and urgent case override.
# """

# import json
# import math
# from app.config import DATA_STORE_DIR

# FACILITY_PATH = DATA_STORE_DIR / "facilities.json"

# # Facility type tier — lower number = higher priority for government preference
# GOVERNMENT_TIER = {
#     "federal":    1,   # Federal Teaching Hospitals, FMCs
#     "tertiary":   2,   # State specialist/general hospitals
#     "secondary":  3,   # General hospitals
#     "mission":    4,   # Mission/NGO hospitals (often subsidised)
#     "primary":    5,   # PHCs, health posts
#     "private":    6,   # Private hospitals/clinics
# }

# # Keywords in facility names that identify government facilities
# FEDERAL_KEYWORDS = [
#     "federal", "university teaching", "university college hospital",
#     "national hospital", "fmc", "luth", "ucth", "uith", "oauth",
#     "abuth", "juth", "unth", "nauth", "bmsh",
# ]
# MISSION_KEYWORDS = [
#     "catholic", "methodist", "baptist", "seventh day", "adventist",
#     "anglican", "presbyterian", "mission", "church", "christian",
# ]
# PRIVATE_KEYWORDS = [
#     "private", "clinic", "medical centre", "specialist centre",
# ]

# _facilities_cache = None


# def load_facilities():
#     global _facilities_cache
#     if _facilities_cache is not None:
#         return _facilities_cache
#     try:
#         with open(FACILITY_PATH, "r", encoding="utf-8") as f:
#             _facilities_cache = json.load(f)
#             print(f"🌍 [FacilityService] Loaded {len(_facilities_cache)} facilities successfully.")
#             return _facilities_cache
#     except Exception as e:
#         print(f"FACILITY LOAD ERROR: {e}")
#         return []


# def haversine_distance_km(lat1, lon1, lat2, lon2) -> float:
#     r = 6371.0
#     phi1, phi2 = math.radians(lat1), math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)
#     a = (
#         math.sin(dphi / 2) ** 2
#         + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
#     )
#     return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


# def _is_valid_nigeria_coord(lat, lon) -> bool:
#     """Reject OSM coordinates that are clearly wrong for Nigeria."""
#     return (
#         lat is not None and lon is not None
#         and 4.0 <= lat <= 14.0
#         and 2.5 <= lon <= 15.0
#     )


# def _infer_facility_tier(facility: dict) -> int:
#     """
#     Infer government/private tier from facility name and type.
#     Lower number = shown first when user picks 'Government'.
#     """
#     name = facility.get("name", "").lower()
#     ftype = facility.get("type", "").lower()

#     # Check name keywords first — more reliable than OSM type tags
#     for kw in FEDERAL_KEYWORDS:
#         if kw in name:
#             return GOVERNMENT_TIER["federal"]

#     for kw in MISSION_KEYWORDS:
#         if kw in name:
#             return GOVERNMENT_TIER["mission"]

#     for kw in PRIVATE_KEYWORDS:
#         if kw in name:
#             return GOVERNMENT_TIER["private"]

#     # Fall back to OSM type tag
#     if ftype in ("tertiary", "hospital"):
#         return GOVERNMENT_TIER["tertiary"]
#     if ftype == "secondary":
#         return GOVERNMENT_TIER["secondary"]
#     if ftype in ("primary", "health_post", "clinic"):
#         return GOVERNMENT_TIER["primary"]

#     return GOVERNMENT_TIER["secondary"]  # default


# def _filter_by_triage(facilities: list, triage_level: str) -> list:
#     """
#     Clinical filter based on triage level.
#     Urgent → hospitals only (tertiary/secondary).
#     Same-day → any facility.
#     Monitor → PHC/primary preferred but include secondary.
#     """
#     if triage_level == "URGENT_HOSPITAL_REVIEW":
#         filtered = [
#             f for f in facilities
#             if f.get("type") in ("tertiary", "secondary", "hospital")
#             or _infer_facility_tier(f) <= GOVERNMENT_TIER["secondary"]
#         ]
#         # If nothing found, don't return empty — fall back to all
#         return filtered if filtered else facilities

#     if triage_level in (
#         "SAME_DAY_CLINIC_REVIEW",
#         "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#     ):
#         return facilities

#     # GREEN / monitor — prefer primary but include secondary
#     primary = [
#         f for f in facilities
#         if f.get("type") in ("primary", "clinic", "health_post")
#         or _infer_facility_tier(f) >= GOVERNMENT_TIER["primary"]
#     ]
#     return primary if primary else facilities


# def _sort_by_preference(
#     facilities: list,
#     preference: str,
#     user_lat: float | None,
#     user_lon: float | None,
#     triage_level: str,
# ) -> list:
#     """
#     Sort facilities based on user preference:
#     - 'nearest'    → sort purely by distance
#     - 'government' → government tier first, then distance within tier
#     - 'clinic'     → PHC/primary first, then distance within type

#     For URGENT cases, always surface nearest tertiary hospital
#     at the top regardless of preference.
#     """
#     # Attach distance to every facility
#     enriched = []
#     for f in facilities:
#         lat = f.get("latitude")
#         lon = f.get("longitude")

#         if _is_valid_nigeria_coord(lat, lon) and user_lat and user_lon:
#             dist = haversine_distance_km(user_lat, user_lon, lat, lon)
#         else:
#             dist = None

#         enriched.append({
#             **f,
#             "distance_km": dist,
#             "_tier": _infer_facility_tier(f),
#         })

#     LARGE = 999999

#     if preference == "government":
#         enriched.sort(key=lambda x: (
#             x["_tier"],
#             x["distance_km"] if x["distance_km"] is not None else LARGE,
#         ))

#     elif preference == "clinic":
#         # PHC and primary care first, sorted by distance
#         primary   = [f for f in enriched if f["_tier"] >= GOVERNMENT_TIER["primary"]]
#         secondary = [f for f in enriched if f["_tier"] < GOVERNMENT_TIER["primary"]]
#         primary.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
#         secondary.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
#         enriched = primary + secondary

#     else:
#         # 'nearest' — pure distance sort
#         enriched.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)

#     # URGENT OVERRIDE — always put nearest tertiary hospital first
#     if triage_level == "URGENT_HOSPITAL_REVIEW":
#         urgent = [
#             f for f in enriched
#             if f.get("type") in ("tertiary", "secondary", "hospital")
#             or f["_tier"] <= GOVERNMENT_TIER["tertiary"]
#         ]
#         others = [f for f in enriched if f not in urgent]
#         urgent.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
#         enriched = urgent + others

#     # Clean up internal sort key before returning
#     for f in enriched:
#         f.pop("_tier", None)

#     return enriched


# def get_recommended_facilities(
#     user_lat: float | None = None,
#     user_lon: float | None = None,
#     user_state: str | None = None,
#     user_lga: str | None = None,
#     triage_level: str = "MONITOR_AT_HOME",
#     facility_preference: str = "nearest",   # nearest | government | clinic
#     max_results: int = 5,
# ) -> list:
#     """
#     Main entry point for facility recommendations.

#     Search order:
#     1. If GPS available → radius search (25km → 50km → 100km)
#     2. If LGA provided  → LGA-level filter first
#     3. If state only    → state-level filter
#     4. Hard fallback    → nearest in any state

#     Then apply triage filter + preference sort.
#     """
#     facilities = load_facilities()
#     if not facilities:
#         return []

#     # ── Step 1: Geography filter ──────────────────────────────
#     candidates = []

#     # GPS radius search — most accurate
#     if user_lat and user_lon:
#         for radius in (25, 50, 100, 200):
#             in_radius = [
#                 f for f in facilities
#                 if _is_valid_nigeria_coord(f.get("latitude"), f.get("longitude"))
#                 and haversine_distance_km(
#                     user_lat, user_lon, f["latitude"], f["longitude"]
#                 ) <= radius
#             ]
#             if len(in_radius) >= 3:
#                 candidates = in_radius
#                 break

#         # Always supplement with state results to handle bad OSM coords
#         if user_state:
#             state_norm = _normalise_state(user_state)
#             state_results = [
#                 f for f in facilities
#                 if _normalise_state(f.get("state", "")) == state_norm
#             ]
#             # Merge without duplicates
#             seen_ids = {f.get("id") for f in candidates}
#             for f in state_results:
#                 if f.get("id") not in seen_ids:
#                     candidates.append(f)

#     # LGA filter — more precise than state alone
#     elif user_lga and user_state:
#         state_norm = _normalise_state(user_state)
#         lga_norm   = user_lga.strip().lower()

#         lga_results = [
#             f for f in facilities
#             if _normalise_state(f.get("state", "")) == state_norm
#             and f.get("lga", "").strip().lower() == lga_norm
#         ]

#         # If LGA returns enough, use it; otherwise expand to state
#         if len(lga_results) >= 3:
#             candidates = lga_results
#         else:
#             candidates = [
#                 f for f in facilities
#                 if _normalise_state(f.get("state", "")) == state_norm
#             ]

#     # State only
#     elif user_state:
#         state_norm = _normalise_state(user_state)
#         candidates = [
#             f for f in facilities
#             if _normalise_state(f.get("state", "")) == state_norm
#         ]

#     # Hard fallback — no location at all
#     if not candidates:
#         candidates = facilities

#     # ── Step 2: Triage filter ─────────────────────────────────
#     candidates = _filter_by_triage(candidates, triage_level)

#     if not candidates:
#         candidates = facilities  # never return empty

#     # ── Step 3: Preference sort ───────────────────────────────
#     sorted_facilities = _sort_by_preference(
#         candidates,
#         preference=facility_preference,
#         user_lat=user_lat,
#         user_lon=user_lon,
#         triage_level=triage_level,
#     )

#     return sorted_facilities[:max_results]


# def _normalise_state(state: str) -> str:
#     """Normalise state name for comparison."""
#     if not state:
#         return ""
#     # Remove ' state' suffix, underscores, lowercase
#     return (
#         state.lower()
#         .replace("_state", "")
#         .replace(" state", "")
#         .replace("_", " ")
#         .strip()
#     )





# """
# JaundiCare — Facility Service (v2)
# Adds facility preference (nearest / government / clinic),
# LGA-level search, government-first cost-aware sorting,
# and urgent case override.
# """

# import json
# import math
# from app.config import FACILITIES_PATH

# FACILITY_PATH = FACILITIES_PATH

# # Facility type tier — lower number = higher priority for government preference
# GOVERNMENT_TIER = {
#     "federal":    1,   # Federal Teaching Hospitals, FMCs
#     "tertiary":   2,   # State specialist/general hospitals
#     "secondary":  3,   # General hospitals
#     "mission":    4,   # Mission/NGO hospitals (often subsidised)
#     "primary":    5,   # PHCs, health posts
#     "private":    6,   # Private hospitals/clinics
# }

# # Keywords in facility names that identify government facilities
# FEDERAL_KEYWORDS = [
#     "federal", "university teaching", "university college hospital",
#     "national hospital", "fmc", "luth", "ucth", "uith", "oauth",
#     "abuth", "juth", "unth", "nauth", "bmsh",
# ]
# MISSION_KEYWORDS = [
#     "catholic", "methodist", "baptist", "seventh day", "adventist",
#     "anglican", "presbyterian", "mission", "church", "christian",
# ]
# PRIVATE_KEYWORDS = [
#     "private", "clinic", "medical centre", "specialist centre",
# ]

# _facilities_cache = None


# def load_facilities():
#     global _facilities_cache
#     if _facilities_cache is not None:
#         return _facilities_cache
#     try:
#         with open(FACILITY_PATH, "r", encoding="utf-8") as f:
#             _facilities_cache = json.load(f)
#             print(f"🌍 [FacilityService] Loaded {len(_facilities_cache)} facilities successfully.")
#             return _facilities_cache
#     except Exception as e:
#         print(f"FACILITY LOAD ERROR: {e}")
#         return []


# def haversine_distance_km(lat1, lon1, lat2, lon2) -> float:
#     r = 6371.0
#     phi1, phi2 = math.radians(lat1), math.radians(lat2)
#     dphi = math.radians(lat2 - lat1)
#     dlambda = math.radians(lon2 - lon1)
#     a = (
#         math.sin(dphi / 2) ** 2
#         + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
#     )
#     return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


# def _is_valid_nigeria_coord(lat, lon) -> bool:
#     """Reject OSM coordinates that are clearly wrong for Nigeria."""
#     return (
#         lat is not None and lon is not None
#         and 4.0 <= lat <= 14.0
#         and 2.5 <= lon <= 15.0
#     )


# def _infer_facility_tier(facility: dict) -> int:
#     """
#     Infer government/private tier from facility name and type.
#     Lower number = shown first when user picks 'Government'.
#     """
#     name = facility.get("name", "").lower()
#     ftype = facility.get("type", "").lower()

#     # Check name keywords first — more reliable than OSM type tags
#     for kw in FEDERAL_KEYWORDS:
#         if kw in name:
#             return GOVERNMENT_TIER["federal"]

#     for kw in MISSION_KEYWORDS:
#         if kw in name:
#             return GOVERNMENT_TIER["mission"]

#     for kw in PRIVATE_KEYWORDS:
#         if kw in name:
#             return GOVERNMENT_TIER["private"]

#     # Fall back to OSM type tag
#     if ftype in ("tertiary", "hospital"):
#         return GOVERNMENT_TIER["tertiary"]
#     if ftype == "secondary":
#         return GOVERNMENT_TIER["secondary"]
#     if ftype in ("primary", "health_post", "clinic"):
#         return GOVERNMENT_TIER["primary"]

#     return GOVERNMENT_TIER["secondary"]  # default


# def _filter_by_triage(facilities: list, triage_level: str) -> list:
#     """
#     Clinical filter based on triage level.
#     Urgent → hospitals only (tertiary/secondary).
#     Same-day → any facility.
#     Monitor → PHC/primary preferred but include secondary.
#     """
#     if triage_level == "URGENT_HOSPITAL_REVIEW":
#         filtered = [
#             f for f in facilities
#             if f.get("type") in ("tertiary", "secondary", "hospital")
#             or _infer_facility_tier(f) <= GOVERNMENT_TIER["secondary"]
#         ]
#         # If nothing found, don't return empty — fall back to all
#         return filtered if filtered else facilities

#     if triage_level in (
#         "SAME_DAY_CLINIC_REVIEW",
#         "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#     ):
#         return facilities

#     # GREEN / monitor — prefer primary but include secondary
#     primary = [
#         f for f in facilities
#         if f.get("type") in ("primary", "clinic", "health_post")
#         or _infer_facility_tier(f) >= GOVERNMENT_TIER["primary"]
#     ]
#     return primary if primary else facilities


# def _sort_by_preference(
#     facilities: list,
#     preference: str,
#     user_lat: float | None,
#     user_lon: float | None,
#     triage_level: str,
# ) -> list:
#     """
#     Sort facilities based on user preference:
#     - 'nearest'    → sort purely by distance
#     - 'government' → government tier first, then distance within tier
#     - 'clinic'     → PHC/primary first, then distance within type

#     For URGENT cases, always surface nearest tertiary hospital
#     at the top regardless of preference.
#     """
#     # Attach distance to every facility
#     enriched = []
#     for f in facilities:
#         lat = f.get("latitude")
#         lon = f.get("longitude")

#         if _is_valid_nigeria_coord(lat, lon) and user_lat and user_lon:
#             dist = haversine_distance_km(user_lat, user_lon, lat, lon)
#         else:
#             dist = None

#         enriched.append({
#             **f,
#             "distance_km": dist,
#             "_tier": _infer_facility_tier(f),
#         })

#     LARGE = 999999

#     if preference == "government":
#         enriched.sort(key=lambda x: (
#             x["_tier"],
#             x["distance_km"] if x["distance_km"] is not None else LARGE,
#         ))

#     elif preference == "clinic":
#         # PHC and primary care first, sorted by distance
#         primary   = [f for f in enriched if f["_tier"] >= GOVERNMENT_TIER["primary"]]
#         secondary = [f for f in enriched if f["_tier"] < GOVERNMENT_TIER["primary"]]
#         primary.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
#         secondary.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
#         enriched = primary + secondary

#     else:
#         # 'nearest' — pure distance sort
#         enriched.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)

#     # URGENT OVERRIDE — always put nearest tertiary hospital first
#     if triage_level == "URGENT_HOSPITAL_REVIEW":
#         urgent = [
#             f for f in enriched
#             if f.get("type") in ("tertiary", "secondary", "hospital")
#             or f["_tier"] <= GOVERNMENT_TIER["tertiary"]
#         ]
#         others = [f for f in enriched if f not in urgent]
#         urgent.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
#         enriched = urgent + others

#     # Clean up internal sort key before returning
#     for f in enriched:
#         f.pop("_tier", None)

#     return enriched


# def get_recommended_facilities(
#     user_lat: float | None = None,
#     user_lon: float | None = None,
#     user_state: str | None = None,
#     user_lga: str | None = None,
#     triage_level: str = "MONITOR_AT_HOME",
#     facility_preference: str = "nearest",   # nearest | government | clinic
#     max_results: int = 5,
# ) -> list:
#     """
#     Main entry point for facility recommendations.

#     Search order:
#     1. If GPS available → radius search (25km → 50km → 100km)
#     2. If LGA provided  → LGA-level filter first
#     3. If state only    → state-level filter
#     4. Hard fallback    → nearest in any state

#     Then apply triage filter + preference sort.
#     """
#     facilities = load_facilities()
#     if not facilities:
#         return []

#     # ── Step 1: Geography filter ──────────────────────────────
#     candidates = []

#     # GPS radius search — most accurate
#     if user_lat and user_lon:
#         for radius in (25, 50, 100, 200):
#             in_radius = [
#                 f for f in facilities
#                 if _is_valid_nigeria_coord(f.get("latitude"), f.get("longitude"))
#                 and haversine_distance_km(
#                     user_lat, user_lon, f["latitude"], f["longitude"]
#                 ) <= radius
#             ]
#             if len(in_radius) >= 3:
#                 candidates = in_radius
#                 break

#         # Always supplement with state results to handle bad OSM coords
#         if user_state:
#             state_norm = _normalise_state(user_state)
#             state_results = [
#                 f for f in facilities
#                 if _normalise_state(f.get("state", "")) == state_norm
#             ]
#             # Merge without duplicates
#             seen_ids = {f.get("id") for f in candidates}
#             for f in state_results:
#                 if f.get("id") not in seen_ids:
#                     candidates.append(f)

#     # LGA filter — more precise than state alone
#     elif user_lga and user_state:
#         state_norm = _normalise_state(user_state)
#         lga_norm   = user_lga.strip().lower()

#         lga_results = [
#             f for f in facilities
#             if _normalise_state(f.get("state", "")) == state_norm
#             and f.get("lga", "").strip().lower() == lga_norm
#         ]

#         # If LGA returns enough, use it; otherwise expand to state
#         if len(lga_results) >= 3:
#             candidates = lga_results
#         else:
#             candidates = [
#                 f for f in facilities
#                 if _normalise_state(f.get("state", "")) == state_norm
#             ]

#     # State only
#     elif user_state:
#         state_norm = _normalise_state(user_state)
#         candidates = [
#             f for f in facilities
#             if _normalise_state(f.get("state", "")) == state_norm
#         ]

#     # Hard fallback — no location at all
#     if not candidates:
#         candidates = facilities

#     # ── Step 2: Triage filter ─────────────────────────────────
#     candidates = _filter_by_triage(candidates, triage_level)

#     if not candidates:
#         candidates = facilities  # never return empty

#     # ── Step 3: Preference sort ───────────────────────────────
#     sorted_facilities = _sort_by_preference(
#         candidates,
#         preference=facility_preference,
#         user_lat=user_lat,
#         user_lon=user_lon,
#         triage_level=triage_level,
#     )

#     return sorted_facilities[:max_results]


# def _normalise_state(state: str) -> str:
#     """Normalise state name for comparison."""
#     if not state:
#         return ""
#     # Remove ' state' suffix, underscores, lowercase
#     return (
#         state.lower()
#         .replace("_state", "")
#         .replace(" state", "")
#         .replace("_", " ")
#         .strip()
#     )





"""
JaundiCare — Facility Service (v2)
Adds facility preference (nearest / government / clinic),
LGA-level search, government-first cost-aware sorting,
and urgent case override.
"""

import json
import math
from app.config import FACILITIES_PATH

FACILITY_PATH = FACILITIES_PATH

# Facility type tier — lower number = higher priority for government preference
GOVERNMENT_TIER = {
    "federal":    1,   # Federal Teaching Hospitals, FMCs
    "tertiary":   2,   # State specialist/general hospitals
    "secondary":  3,   # General hospitals
    "mission":    4,   # Mission/NGO hospitals (often subsidised)
    "primary":    5,   # PHCs, health posts
    "private":    6,   # Private hospitals/clinics
}

# Keywords in facility names that identify government facilities
FEDERAL_KEYWORDS = [
    "federal", "university teaching", "university college hospital",
    "national hospital", "fmc", "luth", "ucth", "uith", "oauth",
    "abuth", "juth", "unth", "nauth", "bmsh", "oouth", "lautech",
    "teaching hospital", "university hospital",
]

STATE_KEYWORDS = [
    "general hospital", "state hospital", "state specialist",
    "government hospital", "government clinic", "general",
    "specialist hospital", "specialist centre",
]

MISSION_KEYWORDS = [
    "catholic", "methodist", "baptist", "seventh day", "adventist",
    "anglican", "presbyterian", "mission", "missionary", "church",
    "christian", "redeemed", "salvation",
]

PRIVATE_KEYWORDS = [
    "private", "specialist clinic", "medical services",
    "memorial", "kidney", "genesis", "trinity", "hosanna",
    "proverb", "hood", "king and", "opeyemi",
]

_facilities_cache = None


def load_facilities():
    global _facilities_cache
    if _facilities_cache is not None:
        return _facilities_cache
    try:
        with open(FACILITY_PATH, "r", encoding="utf-8") as f:
            _facilities_cache = json.load(f)
            print(f"🌍 [FacilityService] Loaded {len(_facilities_cache)} facilities successfully.")
            return _facilities_cache
    except Exception as e:
        print(f"FACILITY LOAD ERROR: {e}")
        return []


def haversine_distance_km(lat1, lon1, lat2, lon2) -> float:
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


def _is_valid_nigeria_coord(lat, lon) -> bool:
    """Reject OSM coordinates that are clearly wrong for Nigeria."""
    return (
        lat is not None and lon is not None
        and 4.0 <= lat <= 14.0
        and 2.5 <= lon <= 15.0
    )


def _infer_facility_tier(facility: dict) -> int:
    """
    Infer government/private tier from facility name and type.
    Lower number = shown first when user picks 'Government'.

    Tiers:
    1 = Federal (FMC, Teaching Hospitals, National)
    2 = State (General Hospital, State Specialist)
    3 = Secondary government (General hospitals without state prefix)
    4 = Mission/NGO (Catholic, Methodist, Redeemed etc)
    5 = PHC/Primary
    6 = Private clinics
    """
    name  = (facility.get("name") or "").lower()
    ftype = (facility.get("type") or "").lower()

    # Federal institutions — highest priority
    for kw in FEDERAL_KEYWORDS:
        if kw in name:
            return GOVERNMENT_TIER["federal"]

    # State/general government hospitals
    for kw in STATE_KEYWORDS:
        if kw in name:
            return GOVERNMENT_TIER["tertiary"]

    # Mission/NGO hospitals — subsidised but not government
    for kw in MISSION_KEYWORDS:
        if kw in name:
            return GOVERNMENT_TIER["mission"]

    # Private — check last so it doesn't override legit hospitals
    for kw in PRIVATE_KEYWORDS:
        if kw in name:
            return GOVERNMENT_TIER["private"]

    # Fall back to OSM type tag
    if ftype in ("tertiary", "hospital"):
        # Unknown tertiary — could be private, treat as secondary gov
        return GOVERNMENT_TIER["secondary"]
    if ftype == "secondary":
        return GOVERNMENT_TIER["secondary"]
    if ftype in ("primary", "health_post", "clinic"):
        return GOVERNMENT_TIER["primary"]

    return GOVERNMENT_TIER["secondary"]


def _is_urgent(triage_level: str) -> bool:
    """Check if triage level indicates urgent care needed."""
    urgent_values = {
        "red", "urgent", "urgent_hospital_review",
        "URGENT_HOSPITAL_REVIEW", "RED",
    }
    return triage_level in urgent_values or triage_level.upper() in {"RED", "URGENT"}


def _filter_by_triage(facilities: list, triage_level: str) -> list:
    """
    Clinical filter based on triage level.
    Urgent → hospitals only.
    Other  → all facilities.
    """
    if _is_urgent(triage_level):
        filtered = [
            f for f in facilities
            if f.get("type") in ("tertiary", "secondary", "hospital")
            or _infer_facility_tier(f) <= GOVERNMENT_TIER["secondary"]
        ]
        return filtered if filtered else facilities

    # AMBER / GREEN / SAME_DAY / MONITOR — return all
    return facilities


def _sort_by_preference(
    facilities: list,
    preference: str,
    user_lat: float | None,
    user_lon: float | None,
    triage_level: str,
) -> list:
    """
    Sort facilities based on user preference:
    - 'nearest'    → sort purely by distance
    - 'government' → government tier first, then distance within tier
    - 'clinic'     → PHC/primary first, then distance within type

    For URGENT cases, always surface nearest tertiary hospital
    at the top regardless of preference.
    """
    # Attach distance to every facility
    enriched = []
    for f in facilities:
        lat = f.get("latitude")
        lon = f.get("longitude")

        if _is_valid_nigeria_coord(lat, lon) and user_lat and user_lon:
            dist = haversine_distance_km(user_lat, user_lon, lat, lon)
        else:
            dist = None

        enriched.append({
            **f,
            "distance_km": dist,
            "_tier": _infer_facility_tier(f),
        })

    LARGE = 999999

    if preference == "government":
        enriched.sort(key=lambda x: (
            x["_tier"],
            x["distance_km"] if x["distance_km"] is not None else LARGE,
        ))

    elif preference == "clinic":
        # PHC and primary care first, sorted by distance
        primary   = [f for f in enriched if f["_tier"] >= GOVERNMENT_TIER["primary"]]
        secondary = [f for f in enriched if f["_tier"] < GOVERNMENT_TIER["primary"]]
        primary.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
        secondary.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
        enriched = primary + secondary

    else:
        # 'nearest' — pure distance sort
        enriched.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)

    # URGENT OVERRIDE — always put nearest tertiary hospital first
    if _is_urgent(triage_level):
        urgent = [
            f for f in enriched
            if f.get("type") in ("tertiary", "secondary", "hospital")
            or f["_tier"] <= GOVERNMENT_TIER["tertiary"]
        ]
        others = [f for f in enriched if f not in urgent]
        urgent.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else LARGE)
        enriched = urgent + others

    # Clean up internal sort key before returning
    for f in enriched:
        f.pop("_tier", None)

    return enriched


def get_recommended_facilities(
    user_lat: float | None = None,
    user_lon: float | None = None,
    user_state: str | None = None,
    user_lga: str | None = None,
    triage_level: str = "MONITOR_AT_HOME",
    facility_preference: str = "nearest",   # nearest | government | clinic
    max_results: int = 5,
) -> list:
    """
    Main entry point for facility recommendations.

    Search order:
    1. If GPS available → radius search (25km → 50km → 100km)
    2. If LGA provided  → LGA-level filter first
    3. If state only    → state-level filter
    4. Hard fallback    → nearest in any state

    Then apply triage filter + preference sort.
    """
    facilities = load_facilities()
    if not facilities:
        return []

    # ── Step 1: Geography filter ──────────────────────────────
    candidates = []

    # GPS radius search — most accurate
    if user_lat and user_lon:
        for radius in (25, 50, 100, 200):
            in_radius = [
                f for f in facilities
                if _is_valid_nigeria_coord(f.get("latitude"), f.get("longitude"))
                and haversine_distance_km(
                    user_lat, user_lon, f["latitude"], f["longitude"]
                ) <= radius
            ]
            if len(in_radius) >= 3:
                candidates = in_radius
                break

        # Always supplement with state results to handle bad OSM coords
        if user_state:
            state_norm = _normalise_state(user_state)
            state_results = [
                f for f in facilities
                if _normalise_state(f.get("state", "")) == state_norm
            ]
            # Merge without duplicates
            seen_ids = {f.get("id") for f in candidates}
            for f in state_results:
                if f.get("id") not in seen_ids:
                    candidates.append(f)

    # LGA filter — more precise than state alone
    elif user_lga and user_state:
        state_norm = _normalise_state(user_state)
        lga_norm   = user_lga.strip().lower()

        lga_results = [
            f for f in facilities
            if _normalise_state(f.get("state", "")) == state_norm
            and f.get("lga", "").strip().lower() == lga_norm
        ]

        # If LGA returns enough, use it; otherwise expand to state
        if len(lga_results) >= 3:
            candidates = lga_results
        else:
            candidates = [
                f for f in facilities
                if _normalise_state(f.get("state", "")) == state_norm
            ]

    # State only
    elif user_state:
        state_norm = _normalise_state(user_state)
        candidates = [
            f for f in facilities
            if _normalise_state(f.get("state", "")) == state_norm
        ]

    # Hard fallback — no location at all
    if not candidates:
        candidates = facilities

    # ── Step 2: Triage filter ─────────────────────────────────
    candidates = _filter_by_triage(candidates, triage_level)

    if not candidates:
        candidates = facilities  # never return empty

    # ── Step 3: Preference sort ───────────────────────────────
    sorted_facilities = _sort_by_preference(
        candidates,
        preference=facility_preference,
        user_lat=user_lat,
        user_lon=user_lon,
        triage_level=triage_level,
    )

    return sorted_facilities[:max_results]


def _normalise_state(state: str) -> str:
    """Normalise state name for comparison."""
    if not state:
        return ""
    # Remove ' state' suffix, underscores, lowercase
    return (
        state.lower()
        .replace("_state", "")
        .replace(" state", "")
        .replace("_", " ")
        .strip()
    )