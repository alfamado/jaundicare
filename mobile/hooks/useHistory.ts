// import { useMemo } from "react";
// import { useAppStore } from "../store/appStore";
// import type { ScreeningHistoryItem } from "../services/api";

// export function useHistory() {
//   // Pulling the history array directly from your Zustand store
//   const rawHistory = useAppStore((s) => s.history || []);
//   const profile = useAppStore((s) => s.profile);

//   /**
//    * Cleans, sanitizes, and sorts the history logs from newest to oldest.
//    * Filters out corrupted or incomplete runs automatically.
//    */
//   const formattedHistory = useMemo(() => {
//     return [...rawHistory]
//       .filter((item) => item && item.id && (item.triage_level || item.final_decision))
//       .map((item: ScreeningHistoryItem) => {
//         // Resolve triage tier prioritizing final decision parameters if present
//         const resolvedTriage = item.final_decision || item.triage_level || "GREEN";
        
//         return {
//           id: item.id,
//           triage_level: resolvedTriage as "RED" | "AMBER" | "GREEN",
//           decision_reason: item.decision_reason || "No summary notes provided.",
//           created_at: item.created_at || new Date().toISOString(),
//           baby_name: profile?.baby_name || "Baby",
//         };
//       })
//       .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//   }, [rawHistory, profile]);

//   /**
//    * Helper utility to quickly get urgent (RED) cases needing priority follow-ups.
//    */
//   const urgentCases = useMemo(() => {
//     return formattedHistory.filter((item) => item.triage_level === "RED");
//   }, [formattedHistory]);

//   return {
//     history: formattedHistory,
//     urgentCases,
//     hasHistory: formattedHistory.length > 0,
//     totalCount: formattedHistory.length,
//   };
// }

// import { useMemo } from "react";
// import { useAppStore } from "../store/appStore";
// import type { ScreeningHistoryItem } from "../services/api";

// export function useHistory() {
//   const rawHistory = useAppStore((s) => s.history || []);
//   const profile    = useAppStore((s) => s.profile);

//   const formattedHistory = useMemo(() => {
//     return [...rawHistory]
//       .filter((item) => item && item.screening_id && (item.raw_triage_level || item.final_decision))
//       .map((item: ScreeningHistoryItem) => {
//         const resolvedTriage = item.final_decision || item.raw_triage_level || "GREEN";
//         return {
//           id:              item.screening_id,
//           triage_level:    resolvedTriage as "RED" | "AMBER" | "GREEN",
//           decision_reason: item.final_decision_reason || "No summary notes provided.",
//           created_at:      item.created_at || new Date().toISOString(),
//           baby_name:       profile?.baby_name || "Baby",
//         };
//       })
//       .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//   }, [rawHistory, profile]);

//   const urgentCases = useMemo(() => {
//     return formattedHistory.filter(
//       (item) =>
//         item.triage_level === "RED" ||
//         item.triage_level === "URGENT_HOSPITAL_REVIEW"
//     );
//   }, [formattedHistory]);

//   return {
//     history:    formattedHistory,
//     urgentCases,
//     hasHistory: formattedHistory.length > 0,
//     totalCount: formattedHistory.length,
//   };
// }




// import { useMemo } from "react";
// import { useAppStore } from "../store/appStore";

// export function useHistory() {
//   const rawHistory = useAppStore((s) => s.history || []);
//   const profile    = useAppStore((s) => s.profile);

//   const formattedHistory = useMemo(() => {
//     return [...rawHistory]
//       // Safe guard: allow items through if they are pending offline sync
//       .filter((item) => item && (item.screening_id || item.id))
//       .map((item) => {
//         const resolvedTriage = item.final_decision || item.raw_triage_level || "GREEN";
        
//         return {
//           id:              item.screening_id || item.id,
//           triage_level:    resolvedTriage, // Allowed to pass full backend strings or offline fallback tags safely
//           decision_reason: item.final_decision_reason || "Processing result layout details...",
//           created_at:      item.created_at || new Date().toISOString(),
//           baby_name:       profile?.baby_name || "Baby",
//           isOffline:       item.isOffline || item.final_decision === "PENDING_SYNC",
//         };
//       })
//       // Order items chronologically so the newest screening is displayed first
//       .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//   }, [rawHistory, profile]);

//   const urgentCases = useMemo(() => {
//     return formattedHistory.filter(
//       (item) =>
//         item.triage_level === "RED" ||
//         item.triage_level === "URGENT_HOSPITAL_REVIEW"
//     );
//   }, [formattedHistory]);

//   return {
//     history:    formattedHistory,
//     urgentCases,
//     hasHistory: formattedHistory.length > 0,
//     totalCount: formattedHistory.length,
//   };
// }



// import { useMemo } from "react";
// import { useAppStore } from "../store/appStore";
// // 🌟 Brought back your explicit API type import!
// import type { ScreeningHistoryItem } from "../services/api";

// // Create an extended type that allows our custom offline properties
// interface ExtendedHistoryItem extends ScreeningHistoryItem {
//   id?: string;
//   isOffline?: boolean;
// }

// export function useHistory() {
//   const rawHistory = useAppStore((s) => s.history || []) as ExtendedHistoryItem[];
//   const profile    = useAppStore((s) => s.profile);

//   const formattedHistory = useMemo(() => {
//     return [...rawHistory]
//       .filter((item) => item && (item.screening_id || item.id))
//       .map((item: ExtendedHistoryItem) => {
//         const resolvedTriage = item.final_decision || item.raw_triage_level || "GREEN";
        
//         return {
//           id:              item.screening_id || item.id,
//           triage_level:    resolvedTriage,
//           decision_reason: item.final_decision_reason || "Processing result layout details...",
//           created_at:      item.created_at || new Date().toISOString(),
//           baby_name:       profile?.baby_name || "Baby",
//           isOffline:       item.isOffline || item.final_decision === "PENDING_SYNC",
//         };
//       })
//       .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//   }, [rawHistory, profile]);

//   const urgentCases = useMemo(() => {
//     return formattedHistory.filter(
//       (item) =>
//         item.triage_level === "RED" ||
//         item.triage_level === "URGENT_HOSPITAL_REVIEW"
//     );
//   }, [formattedHistory]);

//   return {
//     history:    formattedHistory,
//     urgentCases,
//     hasHistory: formattedHistory.length > 0,
//     totalCount: formattedHistory.length,
//   };
// }



/**
 * JaundiCare — useHistory hook (Production-Hardened)
 * Optimized data projection mapping for offline-first clinical logs.
 */

import { useMemo } from "react";
import { useAppStore } from "../store/appStore";
import type { ScreeningHistoryItem } from "../services/api";

interface ExtendedHistoryItem extends ScreeningHistoryItem {
  id?: string;
  isOffline?: boolean;
}

export function useHistory() {
  const rawHistory = useAppStore((s) => s.history || []) as ExtendedHistoryItem[];
  const profile    = useAppStore((s) => s.profile);

  const formattedHistory = useMemo(() => {
    return [...rawHistory]
      .filter((item) => item && (item.screening_id || item.id))
      .map((item: ExtendedHistoryItem) => {
        const resolvedTriage = item.final_decision || item.raw_triage_level || "GREEN";
        
        return {
          id:              item.screening_id || item.id,
          triage_level:    resolvedTriage,
          decision_reason: item.final_decision_reason || "Processing result layout details...",
          // ── Production Win: Capture timestamp string cleanly without dynamic runtime shift ──
          created_at:      item.created_at || "2026-01-01T00:00:00.000Z", // Safe baseline, though offline records should set a permanent date at generation
          baby_name:       profile?.baby_name || "Baby",
          isOffline:       item.isOffline || item.final_decision === "PENDING_SYNC",
        };
      })
      // ── Production Scaling Win: Lexicographical ISO string sorting ──
      // This achieves blazing fast O(N log N) execution without instantiating single Date objects.
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [rawHistory, profile]);

  // Combined optimization: Derived values can be grouped cleanly or left separated. 
  // Since formattedHistory is memoized, this filter is highly lightweight.
  const urgentCases = useMemo(() => {
    return formattedHistory.filter(
      (item) =>
        item.triage_level === "RED" ||
        item.triage_level === "URGENT_HOSPITAL_REVIEW"
    );
  }, [formattedHistory]);

  return {
    history:    formattedHistory,
    urgentCases,
    hasHistory: formattedHistory.length > 0,
    totalCount: formattedHistory.length,
  };
}