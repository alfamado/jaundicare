/**
 * Conservative offline safety rules. They can only preserve or raise urgency;
 * image analysis is deliberately deferred until the secure server is reachable.
 */
export function evaluateOfflineSafety(payload) {
  const notes = [
    "Your photo is encrypted and queued on this browser. Image analysis will run when you reconnect.",
  ];
  const ageHours = Number(payload.age_hours);
  const ageIsKnown = Number.isFinite(ageHours) && ageHours >= 0;
  const yellowSignPresent = Boolean(
    payload.yellow_eyes || payload.yellow_gums || payload.yellow_palms_or_soles,
  );

  if (payload.darker_skin_tone) {
    notes.push("For darker skin, check the eyes, gums, palms and soles, and watch feeding and alertness closely.");
  }

  const urgent = (reason) => ({
    raw_triage_level: "RED",
    final_decision: "URGENT_HOSPITAL_REVIEW",
    parent_message: "Please seek urgent hospital care now.",
    final_decision_reason: reason,
    notes,
  });
  const sameDay = (reason) => ({
    raw_triage_level: "AMBER",
    final_decision: "SAME_DAY_CLINIC_REVIEW",
    parent_message: "Please arrange same-day assessment at an appropriate facility.",
    final_decision_reason: reason,
    notes,
  });

  if (payload.difficult_to_wake) return urgent("Difficulty waking for feeds is a danger sign.");
  if (payload.floppy_or_unusually_drowsy) return urgent("Floppiness or unusual drowsiness is a danger sign.");
  if (payload.dark_urine || payload.pale_stool) return urgent("Dark urine or very pale stool needs urgent medical assessment.");
  if (payload.jaundice_first_24h || (ageIsKnown && ageHours < 24 && yellowSignPresent)) {
    return urgent("Possible jaundice in the first 24 hours needs urgent assessment.");
  }
  if (payload.feeding === "poor" && (yellowSignPresent || payload.jaundice_spreading)) {
    return urgent("Poor feeding with jaundice signs needs urgent assessment.");
  }
  if (!ageIsKnown) return sameDay("Baby age could not be confirmed while offline.");
  if (payload.feeding === "poor") return sameDay("Poor feeding should be reviewed the same day.");
  if (yellowSignPresent || payload.jaundice_spreading) {
    return sameDay("Possible jaundice signs should be reviewed by a health worker today.");
  }

  return {
    raw_triage_level: "GREEN",
    final_decision: "HOME_MONITORING",
    parent_message: "No major danger sign was reported. Continue feeding and monitor closely.",
    final_decision_reason: "No major danger sign was reported in the offline questions.",
    notes,
  };
}
