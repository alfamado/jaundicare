import { Colors } from "./colors";

export function decisionConfig(decision: string) {
  switch (decision) {
    case "URGENT_HOSPITAL_REVIEW":
      return { label: "Urgent — Go to hospital now", icon: "🚨", color: Colors.statusRed };
    case "SAME_DAY_CLINIC_REVIEW":
      return { label: "Same-day clinic review",      icon: "⚠️", color: Colors.statusAmber };
    case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
      return { label: "Recheck soon",                icon: "⚠️", color: Colors.statusAmber };
    default:
      return { label: "Monitor at home",             icon: "✅", color: Colors.statusGreen };
  }
}

export const URGENT_DECISIONS = [
  "URGENT_HOSPITAL_REVIEW",
  "SAME_DAY_CLINIC_REVIEW",
  "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
];