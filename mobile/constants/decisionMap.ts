// import { Colors } from "./colors";

// export function decisionConfig(decision: string) {
//   switch (decision) {
//     case "URGENT_HOSPITAL_REVIEW":
//       return { label: "Urgent — Go to hospital now", icon: "🚨", color: Colors.statusRed };
//     case "SAME_DAY_CLINIC_REVIEW":
//       return { label: "Same-day clinic review",      icon: "⚠️", color: Colors.statusAmber };
//     case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
//       return { label: "Recheck soon",                icon: "⚠️", color: Colors.statusAmber };
//     default:
//       return { label: "Monitor at home",             icon: "✅", color: Colors.statusGreen };
//   }
// }

// export const URGENT_DECISIONS = [
//   "URGENT_HOSPITAL_REVIEW",
//   "SAME_DAY_CLINIC_REVIEW",
//   "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
// ];





// import { Colors } from "./colors";

// export function decisionConfig(decision: string) {
//   switch (decision) {
//     // 🚨 Urgent / High Risk States
//     case "URGENT_HOSPITAL_REVIEW":
//     case "RED":
//       return { label: "Urgent — Go to hospital now", icon: "🚨", color: Colors.statusRed };

//     // ⚠️ Moderate Risk States
//     case "SAME_DAY_CLINIC_REVIEW":
//     case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
//     case "AMBER":
//       return { label: "Same-day clinic review",      icon: "⚠️", color: Colors.statusAmber };

//     // ⏳ Offline / Pending Sync States
//     case "PENDING_SYNC":
//     case "OFFLINE_PENDING":
//       return { label: "Pending Sync",                icon: "⏳", color: "#6B7280" }; // A neutral gray for waiting

//     // ✅ Low Risk States (Default Fallback)
//     case "ROUTINE_CARE":
//     case "GREEN":
//     default:
//       return { label: "Monitor at home",             icon: "✅", color: Colors.statusGreen };
//   }
// }

// export const URGENT_DECISIONS = [
//   "URGENT_HOSPITAL_REVIEW",
//   "SAME_DAY_CLINIC_REVIEW",
//   "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
//   "RED",
//   "AMBER",
// ];


// import { Colors } from "./colors";

// export function decisionConfig(decision: string) {
//   switch (decision) {
//     // 🚨 Urgent / High Risk States
//     case "URGENT_HOSPITAL_REVIEW":
//     case "RED":
//       return { 
//         labelKey: "status.urgent", // Maps to "Urgent review"
//         icon: "🚨", 
//         color: Colors.statusRed 
//       };

//     // ⚠️ Moderate Risk States
//     case "SAME_DAY_CLINIC_REVIEW":
//     case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
//     case "AMBER":
//       return { 
//         labelKey: "status.same_day", // Maps to "Same-day check"
//         icon: "⚠️", 
//         color: Colors.statusAmber 
//       };

//     // ⏳ Offline / Pending Sync States
//     case "PENDING_SYNC":
//     case "OFFLINE_PENDING":
//       return { 
//         labelKey: "common.location_getting", // Temporary fallback or plain string since sync isn't in en.json yet
//         icon: "⏳", 
//         color: "#6B7280" 
//       };

//     // ✅ Low Risk States (Default Fallback)
//     case "ROUTINE_CARE":
//     case "GREEN":
//     default:
//       return { 
//         labelKey: "status.monitor", // Maps to "Monitor closely"
//         icon: "✅", 
//         color: Colors.statusGreen 
//       };
//   }
// }

// // Separate arrays so you can handle loud alerts vs regular outpatient instructions cleanly
// export const CRITICAL_DECISIONS = ["URGENT_HOSPITAL_REVIEW", "RED"];
// export const ELEVATED_DECISIONS = ["SAME_DAY_CLINIC_REVIEW", "RECHECK_SOON_OR_CLINIC_IF_CONCERNED", "AMBER"];



// import { Colors } from "./colors";

// export interface DecisionLayout {
//   label: string;
//   icon: string;
//   color: string;
// }

// // Pass the active translation compile tool directly into the decision function
// export function decisionConfig(decision: string, t: (key: string) => string): DecisionLayout {
//   switch (decision) {
//     case "URGENT_HOSPITAL_REVIEW":
//     case "RED":
//       return { label: t("status.urgent"), icon: "🚨", color: Colors.statusRed };

//     case "SAME_DAY_CLINIC_REVIEW":
//     case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
//     case "AMBER":
//       return { label: t("status.same_day"), icon: "⚠️", color: Colors.statusAmber };

//     case "PENDING_SYNC":
//     case "OFFLINE_PENDING":
//       return { label: t("status.pending"), icon: "⏳", color: "#6B7280" };

//     case "ROUTINE_CARE":
//     case "GREEN":
//     default:
//       return { label: t("status.monitor"), icon: "✅", color: Colors.statusGreen };
//   }
// }



import { Colors } from "./colors";

export interface DecisionLayout {
  label: string;
  icon: string;
  color: string;
}

// ── Make 't' optional to prevent ts(2554) compilation crashes ──────────────────
export function decisionConfig(decision: string, t?: (key: string) => string): DecisionLayout {
  // Safe string lookup helper if the translation function isn't provided in-stride
  const translate = (key: string, fallback: string) => (t ? t(key) : fallback);

  switch (decision) {
    // 🚨 Urgent / High Risk States
    case "URGENT_HOSPITAL_REVIEW":
    case "RED":
      return { 
        label: translate("status.urgent", "Urgent review"), 
        icon: "🚨", 
        color: Colors.statusRed 
      };

    // ⚠️ Moderate Risk States
    case "SAME_DAY_CLINIC_REVIEW":
    case "RECHECK_SOON_OR_CLINIC_IF_CONCERNED":
    case "AMBER":
      return { 
        label: translate("status.same_day", "Same-day check"), 
        icon: "⚠️", 
        color: Colors.statusAmber 
      };

    // ⏳ Offline / Pending Sync States
    case "PENDING_SYNC":
    case "OFFLINE_PENDING":
      return { 
        label: translate("status.pending", "Pending Sync"), 
        icon: "⏳", 
        color: "#6B7280" 
      };

    // ✅ Low Risk States (Default Fallback)
    case "ROUTINE_CARE":
    case "GREEN":
    default:
      return { 
        label: translate("status.monitor", "Monitor closely"), 
        icon: "✅", 
        color: Colors.statusGreen 
      };
  }
}

export const CRITICAL_DECISIONS = ["URGENT_HOSPITAL_REVIEW", "RED"];
export const ELEVATED_DECISIONS = ["SAME_DAY_CLINIC_REVIEW", "RECHECK_SOON_OR_CLINIC_IF_CONCERNED", "AMBER"];