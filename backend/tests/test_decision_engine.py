from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.decision_engine import combine_decision


def test_red_symptoms_are_never_downgraded_by_image_output():
    result = combine_decision(
        raw_triage_level="RED",
        raw_triage_reason="Danger sign reported.",
        triage_notes=[],
        image_prediction="normal",
        image_confidence=0.99,
        darker_skin_tone=False,
    )

    assert result["final_decision"] == "URGENT_HOSPITAL_REVIEW"


def test_amber_symptoms_are_never_downgraded_by_uncertain_image():
    result = combine_decision(
        raw_triage_level="AMBER",
        raw_triage_reason="Poor feeding should be reviewed today.",
        triage_notes=[],
        image_prediction="uncertain",
        image_confidence=0.5,
        darker_skin_tone=False,
    )

    assert result["final_decision"] == "SAME_DAY_CLINIC_REVIEW"
