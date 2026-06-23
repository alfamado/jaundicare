# from app.config import MODEL_CONFIDENCE_THRESHOLD


# def combine_decision(
#     triage_level: str,
#     triage_reason: str,
#     triage_notes: list[str],
#     image_prediction: str | None,
#     image_confidence: float | None,
#     darker_skin_tone: bool
# ) -> dict:
#     notes = list(triage_notes)

#     if triage_level == "RED":
#         return {
#             "triage_level": triage_level,
#             "triage_reason": triage_reason,
#             "final_decision": "URGENT_HOSPITAL_REVIEW",
#             "notes": notes
#         }

#     image_flags_risk = (
#         image_prediction == "jaundice"
#         and image_confidence is not None
#         and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
#     )

#     if darker_skin_tone:
#         notes.append(
#             "Because visual detection is less reliable in darker skin babies, symptom-based triage is weighted more heavily."
#         )

#         if triage_level == "AMBER":
#             return {
#                 "triage_level": triage_level,
#                 "triage_reason": triage_reason,
#                 "final_decision": "SAME_DAY_CLINIC_REVIEW",
#                 "notes": notes
#             }

#         if image_flags_risk:
#             return {
#                 "triage_level": "AMBER",
#                 "triage_reason": "Image model flagged possible jaundice. Same-day review advised.",
#                 "final_decision": "SAME_DAY_CLINIC_REVIEW",
#                 "notes": notes
#             }

#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "Visual screening can miss jaundice in darker skin. Use extra caution and monitor closely.",
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "notes": notes
#         }

#     if triage_level == "AMBER":
#         return {
#             "triage_level": triage_level,
#             "triage_reason": triage_reason,
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "notes": notes
#         }

#     if image_flags_risk:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "Image model flagged possible jaundice.",
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "notes": notes
#         }

#     return {
#         "triage_level": triage_level,
#         "triage_reason": triage_reason,
#         "final_decision": "HOME_MONITORING",
#         "notes": notes
#     }



# from app.config import MODEL_CONFIDENCE_THRESHOLD


# def combine_decision(
#     triage_level: str,
#     triage_reason: str,
#     triage_notes: list[str],
#     image_prediction: str | None,
#     image_confidence: float | None,
#     darker_skin_tone: bool
# ) -> dict:
#     notes = list(triage_notes)

#     if triage_level == "RED":
#         return {
#             "triage_level": "RED",
#             "triage_reason": triage_reason,
#             "final_decision": "URGENT_HOSPITAL_REVIEW",
#             "parent_message": (
#                 "Your baby has warning signs that need urgent medical assessment now."
#             ),
#             "notes": notes
#         }

#     image_flags_risk = (
#         image_prediction == "jaundice"
#         and image_confidence is not None
#         and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
#     )

#     image_uncertain = image_prediction == "uncertain"

#     if darker_skin_tone:
#         notes.append(
#             "Jaundice can be harder to detect visually in darker skin babies. "
#             "The system places more weight on feeding, behavior, and signs in the eyes, gums, palms, and soles."
#         )

#         if triage_level == "AMBER":
#             return {
#                 "triage_level": "AMBER",
#                 "triage_reason": triage_reason,
#                 "final_decision": "SAME_DAY_CLINIC_REVIEW",
#                 "parent_message": (
#                     "Your baby may need same-day review. This does not always mean severe illness, "
#                     "but a health worker should assess your baby today."
#                 ),
#                 "notes": notes
#             }

#         if image_flags_risk:
#             return {
#                 "triage_level": "AMBER",
#                 "triage_reason": "The image suggests possible jaundice. Same-day review is advised.",
#                 "final_decision": "SAME_DAY_CLINIC_REVIEW",
#                 "parent_message": (
#                     "The screening result suggests your baby should be checked the same day by a health worker."
#                 ),
#                 "notes": notes
#             }

#         if image_uncertain:
#             return {
#                 "triage_level": "AMBER",
#                 "triage_reason": "The image result was uncertain. Same-day review or close recheck is advised.",
#                 "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#                 "parent_message": (
#                     "The screening image was not clear enough to confidently rule out concern. "
#                     "Please monitor closely and seek same-day advice if you are worried."
#                 ),
#                 "notes": notes
#             }

#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "Visual screening may miss jaundice in darker skin babies, so extra caution is advised.",
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "parent_message": (
#                 "No urgent warning sign was identified, but jaundice can be harder to see in darker skin babies. "
#                 "Please monitor closely and seek care if you notice feeding problems, unusual sleepiness, or more yellowing."
#             ),
#             "notes": notes
#         }

#     if triage_level == "AMBER":
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": triage_reason,
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "parent_message": (
#                 "Your baby may need same-day review. This does not always mean a severe problem, "
#                 "but a health worker should assess your baby today."
#             ),
#             "notes": notes
#         }

#     if image_flags_risk:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image suggests possible jaundice.",
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "parent_message": (
#                 "The screening result suggests your baby should be checked the same day by a health worker."
#             ),
#             "notes": notes
#         }

#     if image_uncertain:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image result was uncertain.",
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "parent_message": (
#                 "The screening image was not clear enough to confidently reassure you. "
#                 "Please recheck soon and seek advice if you are concerned."
#             ),
#             "notes": notes
#         }

#     return {
#         "triage_level": "GREEN",
#         "triage_reason": triage_reason,
#         "final_decision": "HOME_MONITORING",
#         "parent_message": (
#             "No urgent warning sign was identified from the information provided. "
#             "Continue feeding well and monitor your baby closely."
#         ),
#         "notes": notes
#     }

# from app.config import MODEL_CONFIDENCE_THRESHOLD


# def combine_decision(
#     triage_level: str,
#     triage_reason: str,
#     triage_notes: list[str],
#     image_prediction: str | None,
#     image_confidence: float | None,
#     darker_skin_tone: bool
# ) -> dict:
#     notes = list(triage_notes)

#     if darker_skin_tone:
#         notes.append(
#             "Jaundice can be harder to detect visually in darker skin babies. "
#             "Check the eyes, gums, palms, soles, feeding, and alertness closely."
#         )

#     if triage_level == "RED":
#         return {
#             "triage_level": "RED",
#             "triage_reason": triage_reason,
#             "final_decision": "URGENT_HOSPITAL_REVIEW",
#             "parent_message": (
#                 "Your baby has warning signs that need urgent medical assessment now."
#             ),
#             "notes": notes
#         }

#     image_flags_risk = (
#         image_prediction == "jaundice"
#         and image_confidence is not None
#         and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
#     )

#     image_uncertain = image_prediction == "uncertain"

#     if triage_level == "AMBER":
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": triage_reason,
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "parent_message": (
#                 "Your baby may need same-day review. This does not always mean a severe problem, "
#                 "but a health worker should assess your baby today."
#             ),
#             "notes": notes
#         }

#     if image_flags_risk:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image suggests possible jaundice.",
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "parent_message": (
#                 "The screening result suggests your baby should be checked the same day by a health worker."
#             ),
#             "notes": notes
#         }

#     if image_uncertain:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image result was uncertain.",
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "parent_message": (
#                 "The screening image was not clear enough to confidently reassure you. "
#                 "Please recheck soon and seek advice if you are concerned."
#             ),
#             "notes": notes
#         }

#     # if image_prediction == "normal" and image_confidence is not None and image_confidence < 0.80:
#     if image_prediction == "normal" and image_confidence is not None and image_confidence < 0.65:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image result is not strongly confident enough for full reassurance.",
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "parent_message": (
#                 "No urgent warning sign was identified, but the image result is not strong enough to fully reassure. "
#                 "Please monitor your baby closely and seek same-day advice if you notice yellowing in the eyes, gums, palms, soles, "
#                 "or changes in feeding or alertness."
#             ),
#             "notes": notes
#         }

#     return {
#         "triage_level": "GREEN",
#         "triage_reason": triage_reason,
#         "final_decision": "HOME_MONITORING",
#         "parent_message": (
#             "No urgent warning sign was identified from the information provided. "
#             "Please continue feeding well and monitor your baby closely. "
#             "If you notice yellowing in the eyes, gums, palms, or soles, or changes in feeding or alertness, seek medical advice."
#         ),
#         "notes": notes
#     }


# from app.config import MODEL_CONFIDENCE_THRESHOLD, NORMAL_REASSURANCE_THRESHOLD


# def combine_decision(
#     triage_level: str,
#     triage_reason: str,
#     triage_notes: list[str],
#     image_prediction: str | None,
#     image_confidence: float | None,
#     darker_skin_tone: bool
# ) -> dict:
#     notes = list(triage_notes)

#     if darker_skin_tone:
#         notes.append(
#             "Jaundice can be harder to detect visually in darker skin babies. "
#             "Check the eyes, gums, palms, soles, feeding, and alertness closely."
#         )

#     if triage_level == "RED":
#         return {
#             "triage_level": "RED",
#             "triage_reason": triage_reason,
#             "final_decision": "URGENT_HOSPITAL_REVIEW",
#             "parent_message": (
#                 "Your baby has warning signs that need urgent medical assessment now."
#             ),
#             "notes": notes
#         }

#     image_flags_risk = (
#         image_prediction == "jaundice"
#         and image_confidence is not None
#         and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
#     )

#     image_uncertain = image_prediction == "uncertain"

#     if triage_level == "AMBER":
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": triage_reason,
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "parent_message": (
#                 "Your baby may need same-day review. This does not always mean a severe problem, "
#                 "but a health worker should assess your baby today."
#             ),
#             "notes": notes
#         }

#     if image_flags_risk:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image suggests possible jaundice.",
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "parent_message": (
#                 "The screening result suggests your baby should be checked the same day by a health worker."
#             ),
#             "notes": notes
#         }

#     if image_uncertain:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image result was uncertain.",
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "parent_message": (
#                 "The screening image was not clear enough to confidently reassure you. "
#                 "Please recheck soon and seek advice if you are concerned."
#             ),
#             "notes": notes
#         }

#     if image_prediction == "normal" and image_confidence is not None and image_confidence < NORMAL_REASSURANCE_THRESHOLD:
#         return {
#             "triage_level": "AMBER",
#             "triage_reason": "The image result is weaker than the comfort threshold for full reassurance.",
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "parent_message": (
#                 "No urgent warning sign was identified, but the image result is not strong enough to fully reassure. "
#                 "Please monitor your baby closely and seek same-day advice if you notice yellowing in the eyes, gums, palms, soles, "
#                 "or changes in feeding or alertness."
#             ),
#             "notes": notes
#         }

#     return {
#         "triage_level": "GREEN",
#         "triage_reason": triage_reason,
#         "final_decision": "HOME_MONITORING",
#         "parent_message": (
#             "No urgent warning sign was identified from the information provided. "
#             "Please continue feeding well and monitor your baby closely. "
#             "If you notice yellowing in the eyes, gums, palms, or soles, or changes in feeding or alertness, seek medical advice."
#         ),
#         "notes": notes
#     }



# from app.config import MODEL_CONFIDENCE_THRESHOLD, NORMAL_REASSURANCE_THRESHOLD


# def combine_decision(
#     raw_triage_level: str,
#     raw_triage_reason: str,
#     triage_notes: list[str],
#     image_prediction: str | None,
#     image_confidence: float | None,
#     darker_skin_tone: bool
# ) -> dict:
#     notes = list(triage_notes)

#     if darker_skin_tone:
#         notes.append(
#             "Jaundice can be harder to detect visually in darker skin babies. "
#             "Check the eyes, gums, palms, soles, feeding, and alertness closely."
#         )

#     if raw_triage_level == "RED":
#         return {
#             "final_decision": "URGENT_HOSPITAL_REVIEW",
#             "final_decision_reason": raw_triage_reason,
#             "parent_message": (
#                 "Your baby has warning signs that need urgent medical assessment now."
#             ),
#             "notes": notes
#         }

#     image_flags_risk = (
#         image_prediction == "jaundice"
#         and image_confidence is not None
#         and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
#     )

#     image_uncertain = image_prediction == "uncertain"

#     if raw_triage_level == "AMBER":
#         return {
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "final_decision_reason": raw_triage_reason,
#             "parent_message": (
#                 "Your baby may need same-day review. This does not always mean a severe problem, "
#                 "but a health worker should assess your baby today."
#             ),
#             "notes": notes
#         }

#     if image_flags_risk:
#         return {
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "final_decision_reason": "The image suggests possible jaundice.",
#             "parent_message": (
#                 "The screening result suggests your baby should be checked the same day by a health worker."
#             ),
#             "notes": notes
#         }

#     if image_uncertain:
#         return {
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "final_decision_reason": "The image result was uncertain.",
#             "parent_message": (
#                 "The screening image was not clear enough to confidently reassure you. "
#                 "Please recheck soon and seek advice if you are concerned."
#             ),
#             "notes": notes
#         }

#     if image_prediction == "normal" and image_confidence is not None and image_confidence < NORMAL_REASSURANCE_THRESHOLD:
#         return {
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "final_decision_reason": "The image result is weaker than the comfort threshold for full reassurance.",
#             "parent_message": (
#                 "No urgent warning sign was identified, but the image result is not strong enough to fully reassure. "
#                 "Please monitor your baby closely and seek same-day advice if you notice yellowing in the eyes, gums, palms, soles, "
#                 "or changes in feeding or alertness."
#             ),
#             "notes": notes
#         }

#     return {
#         "final_decision": "HOME_MONITORING",
#         "final_decision_reason": raw_triage_reason,
#         "parent_message": (
#             "No urgent warning sign was identified from the information provided. "
#             "Please continue feeding well and monitor your baby closely. "
#             "If you notice yellowing in the eyes, gums, palms, or soles, or changes in feeding or alertness, seek medical advice."
#         ),
#         "notes": notes
#     }




# from app.config import MODEL_CONFIDENCE_THRESHOLD, NORMAL_REASSURANCE_THRESHOLD


# def combine_decision(
#     raw_triage_level: str,
#     raw_triage_reason: str,
#     triage_notes: list[str],
#     image_prediction: str | None,
#     image_confidence: float | None,
#     darker_skin_tone: bool
# ) -> dict:
#     notes = list(triage_notes)

#     if darker_skin_tone:
#         notes.append(
#             "Jaundice can be harder to detect visually in darker skin babies. "
#             "Check the eyes, gums, palms, soles, feeding, and alertness closely."
#         )

#     image_flags_risk = (
#         image_prediction == "jaundice"
#         and image_confidence is not None
#         and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
#     )

#     image_uncertain = image_prediction == "uncertain"

#     weak_normal = (
#         image_prediction == "normal"
#         and image_confidence is not None
#         and image_confidence < NORMAL_REASSURANCE_THRESHOLD
#     )

#     # 1. Hard red triage always stays urgent
#     if raw_triage_level == "RED":
#         return {
#             "final_decision": "URGENT_HOSPITAL_REVIEW",
#             "final_decision_reason": raw_triage_reason,
#             "parent_message": (
#                 "Your baby has warning signs that need urgent medical assessment now."
#             ),
#             "notes": notes
#         }

#     # 2. Amber triage is concerning, but image can soften or support
#     if raw_triage_level == "AMBER":
#         if image_uncertain:
#             return {
#                 "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#                 "final_decision_reason": (
#                     "Symptoms suggest concern, but the image result was uncertain."
#                 ),
#                 "parent_message": (
#                     "There are signs that should not be ignored, but the image result was uncertain. "
#                     "Please recheck soon and seek same-day advice if you remain concerned."
#                 ),
#                 "notes": notes
#             }

#         if weak_normal:
#             return {
#                 "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#                 "final_decision_reason": (
#                     "Symptoms suggest concern and the image result is not strong enough to reassure."
#                 ),
#                 "parent_message": (
#                     "Some symptoms may need attention, and the image result is not strong enough to fully reassure. "
#                     "Please monitor closely and seek same-day advice if concerns continue."
#                 ),
#                 "notes": notes
#             }

#         return {
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "final_decision_reason": raw_triage_reason,
#             "parent_message": (
#                 "Your baby may need same-day review. This does not always mean a severe problem, "
#                 "but a health worker should assess your baby today."
#             ),
#             "notes": notes
#         }

#     # 3. Green triage depends much more on image
#     if image_flags_risk:
#         return {
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "final_decision_reason": "The image suggests possible jaundice.",
#             "parent_message": (
#                 "The screening result suggests your baby should be checked the same day by a health worker."
#             ),
#             "notes": notes
#         }

#     if image_uncertain:
#         return {
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "final_decision_reason": "The image result was uncertain.",
#             "parent_message": (
#                 "The screening image was not clear enough to confidently reassure you. "
#                 "Please recheck soon and seek advice if you are concerned."
#             ),
#             "notes": notes
#         }

#     if weak_normal:
#         return {
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "final_decision_reason": "The image result is weaker than the comfort threshold for full reassurance.",
#             "parent_message": (
#                 "No urgent warning sign was identified, but the image result is not strong enough to fully reassure. "
#                 "Please monitor your baby closely and seek advice if you notice yellowing in the eyes, gums, palms, soles, "
#                 "or changes in feeding or alertness."
#             ),
#             "notes": notes
#         }

#     return {
#         "final_decision": "HOME_MONITORING",
#         "final_decision_reason": raw_triage_reason,
#         "parent_message": (
#             "No urgent warning sign was identified from the information provided. "
#             "Please continue feeding well and monitor your baby closely. "
#             "If you notice yellowing in the eyes, gums, palms, or soles, or changes in feeding or alertness, seek medical advice."
#         ),
#         "notes": notes
#     }




# from app.config import MODEL_CONFIDENCE_THRESHOLD, NORMAL_REASSURANCE_THRESHOLD
# from app.i18n import tr


# def combine_decision(
#     raw_triage_level: str,
#     raw_triage_reason: str,
#     triage_notes: list[str],
#     image_prediction: str | None,
#     image_confidence: float | None,
#     darker_skin_tone: bool,
#     language: str = "en"
# ) -> dict:
#     notes = list(triage_notes)

#     if darker_skin_tone:
#         notes.append(
#             "Jaundice can be harder to detect visually in darker skin babies. "
#             "Check the eyes, gums, palms, soles, feeding, and alertness closely."
#         )

#     image_flags_risk = (
#         image_prediction == "jaundice"
#         and image_confidence is not None
#         and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
#     )

#     image_uncertain = image_prediction == "uncertain"

#     weak_normal = (
#         image_prediction == "normal"
#         and image_confidence is not None
#         and image_confidence < NORMAL_REASSURANCE_THRESHOLD
#     )

#     if raw_triage_level == "RED":
#         return {
#             "final_decision": "URGENT_HOSPITAL_REVIEW",
#             "final_decision_reason": raw_triage_reason,
#             "parent_message": tr(language, "urgent_parent"),
#             "notes": notes
#         }

#     if raw_triage_level == "AMBER":
#         if image_uncertain:
#             return {
#                 "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#                 "final_decision_reason": tr(language, "amber_uncertain_reason"),
#                 "parent_message": tr(language, "recheck_parent"),
#                 "notes": notes
#             }

#         if weak_normal:
#             return {
#                 "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#                 "final_decision_reason": tr(language, "amber_weak_reason"),
#                 "parent_message": tr(language, "recheck_parent"),
#                 "notes": notes
#             }

#         return {
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "final_decision_reason": raw_triage_reason,
#             "parent_message": tr(language, "same_day_parent"),
#             "notes": notes
#         }

#     if image_flags_risk:
#         return {
#             "final_decision": "SAME_DAY_CLINIC_REVIEW",
#             "final_decision_reason": tr(language, "urgent_reason_image"),
#             "parent_message": tr(language, "same_day_parent"),
#             "notes": notes
#         }

#     if image_uncertain:
#         return {
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "final_decision_reason": tr(language, "uncertain_reason"),
#             "parent_message": tr(language, "recheck_parent"),
#             "notes": notes
#         }

#     if weak_normal:
#         return {
#             "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
#             "final_decision_reason": tr(language, "weak_normal_reason"),
#             "parent_message": tr(language, "recheck_parent"),
#             "notes": notes
#         }

#     return {
#         "final_decision": "HOME_MONITORING",
#         "final_decision_reason": raw_triage_reason,
#         "parent_message": tr(language, "monitor_parent"),
#         "notes": notes
#     }



from app.config import MODEL_CONFIDENCE_THRESHOLD, NORMAL_REASSURANCE_THRESHOLD
from app.i18n import tr


def combine_decision(
    raw_triage_level: str,
    raw_triage_reason: str,
    triage_notes: list,
    image_prediction: str | None,
    image_confidence: float | None,
    darker_skin_tone: bool,
    language: str = "en",
) -> dict:
    # Fixed: triage_engine already adds a darker_skin_tone note.
    # The old decision_engine added a second identical note creating duplicates.
    # We now only carry forward the notes from triage, no duplication.
    notes = list(triage_notes)

    image_flags_risk = (
        image_prediction == "jaundice"
        and image_confidence is not None
        and image_confidence >= MODEL_CONFIDENCE_THRESHOLD
    )

    image_uncertain = image_prediction == "uncertain"

    weak_normal = (
        image_prediction == "normal"
        and image_confidence is not None
        and image_confidence < NORMAL_REASSURANCE_THRESHOLD
    )

    # RED triage always wins regardless of image result
    if raw_triage_level == "RED":
        return {
            "final_decision": "URGENT_HOSPITAL_REVIEW",
            "final_decision_reason": raw_triage_reason,
            "parent_message": tr(language, "urgent_parent"),
            "notes": notes,
        }

    # AMBER triage — image modifies the urgency level
    if raw_triage_level == "AMBER":
        if image_uncertain:
            return {
                "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
                "final_decision_reason": tr(language, "amber_uncertain_reason"),
                "parent_message": tr(language, "recheck_parent"),
                "notes": notes,
            }
        if weak_normal:
            return {
                "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
                "final_decision_reason": tr(language, "amber_weak_reason"),
                "parent_message": tr(language, "recheck_parent"),
                "notes": notes,
            }
        return {
            "final_decision": "SAME_DAY_CLINIC_REVIEW",
            "final_decision_reason": raw_triage_reason,
            "parent_message": tr(language, "same_day_parent"),
            "notes": notes,
        }

    # GREEN triage — image can still escalate
    if image_flags_risk:
        return {
            "final_decision": "SAME_DAY_CLINIC_REVIEW",
            "final_decision_reason": tr(language, "urgent_reason_image"),
            "parent_message": tr(language, "same_day_parent"),
            "notes": notes,
        }

    if image_uncertain:
        return {
            "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
            "final_decision_reason": tr(language, "uncertain_reason"),
            "parent_message": tr(language, "recheck_parent"),
            "notes": notes,
        }

    if weak_normal:
        return {
            "final_decision": "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
            "final_decision_reason": tr(language, "weak_normal_reason"),
            "parent_message": tr(language, "recheck_parent"),
            "notes": notes,
        }

    return {
        "final_decision": "HOME_MONITORING",
        "final_decision_reason": raw_triage_reason,
        "parent_message": tr(language, "monitor_parent"),
        "notes": notes,
    }