// /**
//  * Maps the backend decision status to the exact translation keys in i18n
//  */
// export function getNextStepTranslationKeys(decision: string): string[] {
//   switch (decision) {
//     case "URGENT_HOSPITAL_REVIEW":
//       return ["next.urgent.1", "next.urgent.2", "next.urgent.3"];
      
//     case "SAME_DAY_CLINIC_REVIEW":
//       return ["next.same_day.1", "next.same_day.2", "next.same_day.3"];
      
//     case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
//       return ["next.recheck.1", "next.recheck.2", "next.recheck.3"];
      
//     case "MONITOR_CLOSELY":
//     default:
//       return ["next.monitor.1", "next.monitor.2", "next.monitor.3"];
//   }
// }

/**
 * JaundiCare — screeningUtils.ts
 * Maps backend decision statuses to safe i18n translation namespaces.
 */

// Explicitly tie this to the same source strings used across decision maps
export type TriageDecision = 
  | "URGENT_HOSPITAL_REVIEW" 
  | "RED"
  | "SAME_DAY_CLINIC_REVIEW" 
  | "RECHECK_SOON_OR_CLINIC_IF_CONCERNED" 
  | "AMBER"
  | "ROUTINE_CARE" 
  | "MONITOR_CLOSELY"
  | "GREEN";

/**
 * Maps the backend decision status to the exact translation keys in i18n.
 * Returns a clean, flexible list of strings for UI loops.
 */
export function getNextStepTranslationKeys(decision: string): string[] {
  const normalizedStatus = decision?.toUpperCase().trim();

  switch (normalizedStatus) {
    // 🚨 Critical Risk Steps
    case "URGENT_HOSPITAL_REVIEW":
    case "RED":
      return ["next.urgent.1", "next.urgent.2", "next.urgent.3"];
      
    // ⚠️ Moderate Risk Steps
    case "SAME_DAY_CLINIC_REVIEW":
    case "AMBER":
      return ["next.same_day.1", "next.same_day.2", "next.same_day.3"];
      
    // ⏳ Early Warning / Recheck Steps
    case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
      return ["next.recheck.1", "next.recheck.2", "next.recheck.3"];
      
    // ✅ Low Risk Steps (Safe Fallbacks)
    case "ROUTINE_CARE":
    case "MONITOR_CLOSELY":
    case "GREEN":
    default:
      return ["next.monitor.1", "next.monitor.2", "next.monitor.3"];
  }
}