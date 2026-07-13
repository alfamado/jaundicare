import type { ScreeningPayload } from "./api";

export type OfflineTriageLevel = "RED" | "AMBER" | "GREEN";
export type OfflineDecision =
  | "URGENT_HOSPITAL_REVIEW"
  | "SAME_DAY_CLINIC_REVIEW"
  | "HOME_MONITORING";

export interface OfflineTriageResult {
  rawTriageLevel: OfflineTriageLevel;
  finalDecision: OfflineDecision;
  reason: string;
  notes: string[];
}

function result(
  rawTriageLevel: OfflineTriageLevel,
  finalDecision: OfflineDecision,
  reason: string,
  notes: string[],
): OfflineTriageResult {
  return { rawTriageLevel, finalDecision, reason, notes };
}

/**
 * A compact, offline mirror of the server's symptom rules. This only preserves
 * or raises urgency; image inference can never lower an urgency created by a
 * reported danger sign.
 */
export function evaluateOfflineSafety(payload: ScreeningPayload): OfflineTriageResult {
  const notes: string[] = [];
  const ageIsKnown =
    typeof payload.age_hours === "number" &&
    Number.isFinite(payload.age_hours) &&
    payload.age_hours >= 0;
  const ageHours = payload.age_hours ?? 0;
  const yellowSignPresent =
    payload.yellow_eyes ||
    payload.yellow_gums ||
    payload.yellow_palms_or_soles;

  if (payload.darker_skin_tone) {
    notes.push(
      "In darker skin babies, check the eyes, gums, palms or soles and monitor feeding and alertness closely.",
    );
  }

  if (payload.difficult_to_wake) {
    return result("RED", "URGENT_HOSPITAL_REVIEW", "Difficulty waking for feeds is a danger sign.", notes);
  }
  if (payload.floppy_or_unusually_drowsy) {
    return result("RED", "URGENT_HOSPITAL_REVIEW", "Floppiness or unusual drowsiness is a danger sign.", notes);
  }
  if (payload.dark_urine || payload.pale_stool) {
    return result(
      "RED",
      "URGENT_HOSPITAL_REVIEW",
      "Dark urine or very pale stool may need urgent medical assessment.",
      notes,
    );
  }
  if (payload.jaundice_first_24h || (ageIsKnown && ageHours < 24 && yellowSignPresent)) {
    return result(
      "RED",
      "URGENT_HOSPITAL_REVIEW",
      "Possible jaundice in the first 24 hours needs urgent assessment.",
      notes,
    );
  }
  if (payload.feeding === "poor" && (yellowSignPresent || payload.jaundice_spreading)) {
    return result(
      "RED",
      "URGENT_HOSPITAL_REVIEW",
      "Poor feeding together with jaundice signs needs urgent assessment.",
      notes,
    );
  }

  // Without a birth time, the app cannot safely rule out the first-24-hours
  // danger rule while offline. Escalate for same-day assessment instead.
  if (!ageIsKnown) {
    return result(
      "AMBER",
      "SAME_DAY_CLINIC_REVIEW",
      "Baby's age could not be confirmed while offline. Please arrange same-day assessment.",
      notes,
    );
  }
  if (payload.feeding === "poor") {
    return result("AMBER", "SAME_DAY_CLINIC_REVIEW", "Poor feeding should be reviewed the same day.", notes);
  }
  if (yellowSignPresent || payload.jaundice_spreading) {
    return result(
      "AMBER",
      "SAME_DAY_CLINIC_REVIEW",
      "Possible jaundice signs should be reviewed by a health worker today.",
      notes,
    );
  }

  return result(
    "GREEN",
    "HOME_MONITORING",
    "No major danger sign was reported. Continue feeding and monitor closely.",
    notes,
  );
}
