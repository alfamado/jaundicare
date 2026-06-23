# # backend/app/services/triage_engine.py

# def triage(data):
#     """
#     data = {
#         age_hours,
#         feeding,
#         sleepy,
#         floppy,
#         jaundice_first_24h,
#         jaundice_spreading,
#         yellow_eyes,
#         yellow_gums,
#         yellow_palms,
#         dark_urine,
#         pale_stool
#     }
#     """

#     # 🚨 HIGH RISK CONDITIONS (IMMEDIATE ACTION)
#     if data["age_hours"] < 24:
#         return "RED", "Jaundice in first 24 hours is dangerous"

#     if data["feeding"] == "poor":
#         return "RED", "Baby not feeding well"

#     if data["sleepy"] or data["floppy"]:
#         return "RED", "Baby unusually drowsy or floppy"

#     if data["dark_urine"] or data["pale_stool"]:
#         return "RED", "Possible serious liver condition"

#     # ⚠️ DETECTION FOR DARKER SKIN (YOUR ADDITION)
#     if data["yellow_eyes"] or data["yellow_gums"] or data["yellow_palms"]:
#         return "AMBER", "Possible jaundice detected in eyes/gums/palms"

#     # ⚠️ MODERATE RISK
#     if data["jaundice_spreading"]:
#         return "AMBER", "Jaundice may be worsening"

#     # ✅ LOW RISK
#     return "GREEN", "Continue feeding and monitoring"



# def run_triage(data: dict) -> tuple[str, str, list[str]]:
#     notes = []

#     if data["darker_skin_tone"]:
#         notes.append(
#             "In darker skin babies, jaundice may be harder to see on the skin. "
#             "Check the eyes, gums, palms or soles, and monitor behavior closely."
#         )

#     if data["jaundice_first_24h"] or data["age_hours"] < 24:
#         return (
#             "RED",
#             "Possible jaundice in the first 24 hours needs urgent assessment.",
#             notes
#         )

#     if data["difficult_to_wake"]:
#         return (
#             "RED",
#             "Difficulty waking for feeds is a danger sign.",
#             notes
#         )

#     if data["floppy_or_unusually_drowsy"]:
#         return (
#             "RED",
#             "Floppiness or unusual drowsiness is a danger sign.",
#             notes
#         )

#     if data["feeding"].strip().lower() == "poor":
#         return (
#             "RED",
#             "Poor feeding is a danger sign.",
#             notes
#         )

#     if data["dark_urine"] or data["pale_stool"]:
#         return (
#             "RED",
#             "Dark urine or pale stool may suggest a serious underlying condition.",
#             notes
#         )

#     if data["yellow_eyes"] or data["yellow_gums"] or data["yellow_palms_or_soles"]:
#         return (
#             "AMBER",
#             "Possible jaundice signs seen in eyes, gums, palms, or soles.",
#             notes
#         )

#     if data["jaundice_spreading"]:
#         return (
#             "AMBER",
#             "Jaundice may be worsening and should be checked the same day.",
#             notes
#         )

#     if data["darker_skin_tone"]:
#         return (
#             "AMBER",
#             "No obvious danger sign reported, but darker skin makes visual detection less reliable. Use extra caution.",
#             notes
#         )

#     return (
#         "GREEN",
#         "No major danger sign reported. Continue monitoring and feeding well.",
#         notes
#     )





# def run_triage(data: dict) -> tuple[str, str, list[str]]:
#     notes = []

#     if data["darker_skin_tone"]:
#         notes.append(
#             "In darker skin babies, jaundice may be harder to see on the skin. "
#             "Check the eyes, gums, palms or soles, and monitor behavior closely."
#         )

#     if data["jaundice_first_24h"] or data["age_hours"] < 24:
#         return (
#             "RED",
#             "Possible jaundice in the first 24 hours needs urgent assessment.",
#             notes
#         )

#     if data["difficult_to_wake"]:
#         return (
#             "RED",
#             "Difficulty waking for feeds is a danger sign.",
#             notes
#         )

#     if data["floppy_or_unusually_drowsy"]:
#         return (
#             "RED",
#             "Floppiness or unusual drowsiness is a danger sign.",
#             notes
#         )

#     if data["feeding"].strip().lower() == "poor":
#         return (
#             "RED",
#             "Poor feeding is a danger sign.",
#             notes
#         )

#     if data["dark_urine"] or data["pale_stool"]:
#         return (
#             "RED",
#             "Dark urine or pale stool may suggest a serious underlying condition.",
#             notes
#         )

#     if data["yellow_eyes"] or data["yellow_gums"] or data["yellow_palms_or_soles"]:
#         return (
#             "AMBER",
#             "Possible jaundice signs seen in eyes, gums, palms, or soles.",
#             notes
#         )

#     if data["jaundice_spreading"]:
#         return (
#             "AMBER",
#             "Jaundice may be worsening and should be checked the same day.",
#             notes
#         )

#     return (
#         "GREEN",
#         "No major danger sign reported. Continue monitoring and feeding well.",
#         notes
#     )


# def run_triage(data: dict) -> tuple[str, str, list[str]]:
#     """
#     Expected keys in data:
#     - age_hours: int
#     - feeding: str
#     - difficult_to_wake: bool
#     - floppy_or_unusually_drowsy: bool
#     - jaundice_first_24h: bool
#     - jaundice_spreading: bool
#     - yellow_eyes: bool
#     - yellow_gums: bool
#     - yellow_palms_or_soles: bool
#     - dark_urine: bool
#     - pale_stool: bool
#     - darker_skin_tone: bool
#     """

#     notes = []

#     feeding_value = str(data.get("feeding", "")).strip().lower()
#     age_hours = int(data.get("age_hours", 0))

#     yellow_sign_present = any([
#         bool(data.get("yellow_eyes", False)),
#         bool(data.get("yellow_gums", False)),
#         bool(data.get("yellow_palms_or_soles", False)),
#     ])

#     if bool(data.get("darker_skin_tone", False)):
#         notes.append(
#             "In darker skin babies, jaundice may be harder to see on the skin. "
#             "Check the eyes, gums, palms or soles, and monitor behavior closely."
#         )

#     # RED: urgent danger signs
#     if bool(data.get("difficult_to_wake", False)):
#         return (
#             "RED",
#             "Difficulty waking for feeds is a danger sign.",
#             notes
#         )

#     if bool(data.get("floppy_or_unusually_drowsy", False)):
#         return (
#             "RED",
#             "Floppiness or unusual drowsiness is a danger sign.",
#             notes
#         )

#     if feeding_value == "poor":
#         return (
#             "RED",
#             "Poor feeding is a danger sign.",
#             notes
#         )

#     if bool(data.get("dark_urine", False)) or bool(data.get("pale_stool", False)):
#         return (
#             "RED",
#             "Dark urine or pale stool may suggest a serious underlying condition.",
#             notes
#         )

#     # RED: jaundice suspected in first 24 hours
#     # Important: this should be about suspected jaundice in first 24h,
#     # not just baby age below 24h on its own.
#     if bool(data.get("jaundice_first_24h", False)):
#         return (
#             "RED",
#             "Possible jaundice in the first 24 hours needs urgent assessment.",
#             notes
#         )

#     if age_hours < 24 and yellow_sign_present:
#         return (
#             "RED",
#             "Possible jaundice signs within the first 24 hours need urgent assessment.",
#             notes
#         )

#     # AMBER: visible jaundice concerns after first 24 hours
#     if yellow_sign_present:
#         return (
#             "AMBER",
#             "Possible jaundice signs seen in eyes, gums, palms, or soles.",
#             notes
#         )

#     if bool(data.get("jaundice_spreading", False)):
#         return (
#             "AMBER",
#             "Jaundice may be worsening and should be checked the same day.",
#             notes
#         )

#     # GREEN: no major concern reported
#     return (
#         "GREEN",
#         "No major danger sign reported. Continue monitoring and feeding well.",
#         notes
#     )




# def to_bool(value):
#     """Safely convert different truthy values to boolean."""
#     if isinstance(value, bool):
#         return value
#     if isinstance(value, str):
#         return value.strip().lower() in ["true", "1", "yes", "on"]
#     if isinstance(value, (int, float)):
#         return value == 1
#     return False


# def normalize_str(value):
#     if value is None:
#         return ""
#     return str(value).strip().lower()


# def safe_int(value, default=0):
#     try:
#         return int(value)
#     except Exception:
#         return default


# def run_triage(data: dict) -> tuple[str, str, list[str]]:
#     notes = []

#     # --- Normalize inputs ---
#     age_hours = safe_int(data.get("age_hours", 0))
#     feeding = normalize_str(data.get("feeding"))

#     difficult_to_wake = to_bool(data.get("difficult_to_wake"))
#     floppy = to_bool(data.get("floppy_or_unusually_drowsy"))
#     jaundice_first_24h = to_bool(data.get("jaundice_first_24h"))
#     jaundice_spreading = to_bool(data.get("jaundice_spreading"))

#     yellow_eyes = to_bool(data.get("yellow_eyes"))
#     yellow_gums = to_bool(data.get("yellow_gums"))
#     yellow_palms = to_bool(data.get("yellow_palms_or_soles"))

#     dark_urine = to_bool(data.get("dark_urine"))
#     pale_stool = to_bool(data.get("pale_stool"))
#     darker_skin = to_bool(data.get("darker_skin_tone"))

#     yellow_sign_present = any([yellow_eyes, yellow_gums, yellow_palms])

#     # --- Advisory note (not escalation) ---
#     if darker_skin:
#         notes.append(
#             "In darker skin babies, jaundice may be harder to see on the skin. "
#             "Check the eyes, gums, palms or soles, and monitor behavior closely."
#         )

#     # --- RED: Immediate danger signs ---
#     if difficult_to_wake:
#         return ("RED", "Difficulty waking for feeds is a danger sign.", notes)

#     if floppy:
#         return ("RED", "Floppiness or unusual drowsiness is a danger sign.", notes)

#     if feeding == "poor":
#         return ("RED", "Poor feeding is a danger sign.", notes)

#     if dark_urine or pale_stool:
#         return ("RED", "Dark urine or pale stool may suggest a serious underlying condition.", notes)

#     # --- RED: Jaundice in first 24h (ONLY if suspected) ---
#     if jaundice_first_24h:
#         return ("RED", "Possible jaundice in the first 24 hours needs urgent assessment.", notes)

#     if age_hours < 24 and yellow_sign_present:
#         return ("RED", "Possible jaundice signs within the first 24 hours need urgent assessment.", notes)

#     # --- AMBER: Visible jaundice concerns ---
#     if yellow_sign_present:
#         return ("AMBER", "Possible jaundice signs seen in eyes, gums, palms, or soles.", notes)

#     if jaundice_spreading:
#         return ("AMBER", "Jaundice may be worsening and should be checked the same day.", notes)

#     # --- GREEN ---
#     return ("GREEN", "No major danger sign reported. Continue monitoring and feeding well.", notes)


# def to_bool(value):
#     if isinstance(value, bool):
#         return value
#     if isinstance(value, str):
#         return value.strip().lower() in ["true", "1", "yes", "on"]
#     if isinstance(value, (int, float)):
#         return value == 1
#     return False


# def normalize_str(value):
#     if value is None:
#         return ""
#     return str(value).strip().lower()


# def safe_int(value, default=0):
#     try:
#         return int(value)
#     except Exception:
#         return default


# def run_triage(data: dict) -> tuple[str, str, list[str]]:
#     notes = []

#     age_hours = safe_int(data.get("age_hours", 0))
#     feeding = normalize_str(data.get("feeding"))

#     difficult_to_wake = to_bool(data.get("difficult_to_wake"))
#     floppy = to_bool(data.get("floppy_or_unusually_drowsy"))
#     jaundice_first_24h = to_bool(data.get("jaundice_first_24h"))
#     jaundice_spreading = to_bool(data.get("jaundice_spreading"))

#     yellow_eyes = to_bool(data.get("yellow_eyes"))
#     yellow_gums = to_bool(data.get("yellow_gums"))
#     yellow_palms = to_bool(data.get("yellow_palms_or_soles"))

#     dark_urine = to_bool(data.get("dark_urine"))
#     pale_stool = to_bool(data.get("pale_stool"))
#     darker_skin = to_bool(data.get("darker_skin_tone"))

#     yellow_sign_present = any([yellow_eyes, yellow_gums, yellow_palms])
#     poor_feeding = feeding == "poor"

#     if darker_skin:
#         notes.append(
#             "In darker skin babies, jaundice may be harder to see on the skin. "
#             "Check the eyes, gums, palms or soles, and monitor behavior closely."
#         )

#     # RED: strongest danger signs
#     if difficult_to_wake:
#         return ("RED", "Difficulty waking for feeds is a danger sign.", notes)

#     if floppy:
#         return ("RED", "Floppiness or unusual drowsiness is a danger sign.", notes)

#     if dark_urine or pale_stool:
#         return (
#             "RED",
#             "Dark urine or pale stool may suggest a serious underlying condition.",
#             notes
#         )

#     if jaundice_first_24h:
#         return (
#             "RED",
#             "Possible jaundice in the first 24 hours needs urgent assessment.",
#             notes
#         )

#     if age_hours < 24 and yellow_sign_present:
#         return (
#             "RED",
#             "Possible jaundice signs within the first 24 hours need urgent assessment.",
#             notes
#         )

#     # RED: poor feeding becomes urgent only when combined with another concern
#     if poor_feeding and yellow_sign_present:
#         return (
#             "RED",
#             "Poor feeding together with jaundice signs needs urgent assessment.",
#             notes
#         )

#     if poor_feeding and jaundice_spreading:
#         return (
#             "RED",
#             "Poor feeding with worsening jaundice signs needs urgent assessment.",
#             notes
#         )

#     # AMBER: moderate concern
#     if poor_feeding:
#         return (
#             "AMBER",
#             "Poor feeding should be reviewed the same day by a health worker.",
#             notes
#         )

#     if yellow_sign_present:
#         return (
#             "AMBER",
#             "Possible jaundice signs seen in eyes, gums, palms, or soles.",
#             notes
#         )

#     if jaundice_spreading:
#         return (
#             "AMBER",
#             "Jaundice may be worsening and should be checked the same day.",
#             notes
#         )

#     # GREEN
#     return (
#         "GREEN",
#         "No major danger sign reported. Continue monitoring and feeding well.",
#         notes
#     )



def to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ["true", "1", "yes", "on"]
    if isinstance(value, (int, float)):
        return value == 1
    return False


def normalize_str(value):
    if value is None:
        return ""
    return str(value).strip().lower()


def safe_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return default


def run_triage(data: dict) -> tuple[str, str, list[str]]:
    notes = []

    age_hours = safe_int(data.get("age_hours", 0))
    feeding = normalize_str(data.get("feeding"))

    difficult_to_wake = to_bool(data.get("difficult_to_wake"))
    floppy = to_bool(data.get("floppy_or_unusually_drowsy"))
    jaundice_first_24h = to_bool(data.get("jaundice_first_24h"))
    jaundice_spreading = to_bool(data.get("jaundice_spreading"))

    yellow_eyes = to_bool(data.get("yellow_eyes"))
    yellow_gums = to_bool(data.get("yellow_gums"))
    yellow_palms = to_bool(data.get("yellow_palms_or_soles"))

    dark_urine = to_bool(data.get("dark_urine"))
    pale_stool = to_bool(data.get("pale_stool"))
    darker_skin = to_bool(data.get("darker_skin_tone"))

    yellow_sign_present = any([yellow_eyes, yellow_gums, yellow_palms])
    poor_feeding = feeding == "poor"

    if darker_skin:
        notes.append(
            "In darker skin babies, jaundice may be harder to see on the skin. "
            "Check the eyes, gums, palms or soles, and monitor behavior closely."
        )

    if difficult_to_wake:
        return ("RED", "Difficulty waking for feeds is a danger sign.", notes)

    if floppy:
        return ("RED", "Floppiness or unusual drowsiness is a danger sign.", notes)

    if dark_urine or pale_stool:
        return (
            "RED",
            "Dark urine or pale stool may suggest a serious underlying condition.",
            notes
        )

    if jaundice_first_24h:
        return (
            "RED",
            "Possible jaundice in the first 24 hours needs urgent assessment.",
            notes
        )

    if age_hours < 24 and yellow_sign_present:
        return (
            "RED",
            "Possible jaundice signs within the first 24 hours need urgent assessment.",
            notes
        )

    if poor_feeding and yellow_sign_present:
        return (
            "RED",
            "Poor feeding together with jaundice signs needs urgent assessment.",
            notes
        )

    if poor_feeding and jaundice_spreading:
        return (
            "RED",
            "Poor feeding with worsening jaundice signs needs urgent assessment.",
            notes
        )

    if poor_feeding:
        return (
            "AMBER",
            "Poor feeding should be reviewed the same day by a health worker.",
            notes
        )

    if yellow_sign_present:
        return (
            "AMBER",
            "Possible jaundice signs seen in eyes, gums, palms, or soles.",
            notes
        )

    if jaundice_spreading:
        return (
            "AMBER",
            "Jaundice may be worsening and should be checked the same day.",
            notes
        )

    return (
        "GREEN",
        "No major danger sign reported. Continue monitoring and feeding well.",
        notes
    )