/**
 * JaundiCare — Global Store (Zustand)
 * Replaces localStorage and window._cachedProfile from app.js.
 * Persists to device storage via react-native-mmkv.
 */

// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import { MMKV } from "react-native-mmkv";
// import type { BabyProfile, ScreeningResult, ScreeningHistoryItem } from "../services/api";

// // Fast persistent storage — much faster than AsyncStorage on device
// const storage = new MMKV();

// const mmkvStorage = {
//   getItem:    (key: string) => storage.getString(key) ?? null,
//   setItem:    (key: string, value: string) => storage.set(key, value),
//   removeItem: (key: string) => storage.delete(key),
// };

// // ── App Store ─────────────────────────────────────────────────
// interface AppState {
//   // Language
//   language: string;
//   setLanguage: (lang: string) => void;

//   // Onboarding
//   onboarded: boolean;
//   role: "parent" | "health_worker" | null;
//   finishOnboarding: (role: "parent" | "health_worker") => void;

//   // Baby profile
//   profile: BabyProfile | null;
//   setProfile: (profile: BabyProfile | null) => void;

//   // Last screening result
//   lastScreening: ScreeningResult | null;
//   setLastScreening: (result: ScreeningResult | null) => void;

//   // History
//   history: ScreeningHistoryItem[];
//   setHistory: (history: ScreeningHistoryItem[]) => void;

//   // Follow-up tracking
//   lastUrgentDecision: string | null;
//   lastUrgentTime: number | null;
//   followupDismissed: boolean;
//   storeFollowUpData: (decision: string) => void;
//   dismissFollowUp: () => void;

//   // CHW caseload — stored locally on device
//   caseload: CaseloadEntry[];
//   addCase: (entry: Omit<CaseloadEntry, "id" | "addedAt">) => void;
//   removeCase: (id: string) => void;
// }

// export interface CaseloadEntry {
//   id: string;
//   name: string;
//   household?: string;
//   dob: string;
//   tob: string;
//   gestAge?: number;
//   addedAt: string;
// }

// const URGENT_DECISIONS = [
//   "URGENT_HOSPITAL_REVIEW",
//   "SAME_DAY_CLINIC_REVIEW",
//   "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
// ];

// export const useAppStore = create<AppState>()(
//   persist(
//     (set) => ({
//       language:    "en",
//       setLanguage: (lang) => set({ language: lang }),

//       onboarded: false,
//       role:      null,
//       finishOnboarding: (role) => set({ onboarded: true, role }),

//       profile:    null,
//       setProfile: (profile) => set({ profile }),

//       lastScreening:    null,
//       setLastScreening: (result) => set({ lastScreening: result }),

//       history:    [],
//       setHistory: (history) => set({ history }),

//       lastUrgentDecision: null,
//       lastUrgentTime:     null,
//       followupDismissed:  false,

//       storeFollowUpData: (decision) => {
//         if (URGENT_DECISIONS.includes(decision)) {
//           set({
//             lastUrgentDecision: decision,
//             lastUrgentTime:     Date.now(),
//             followupDismissed:  false,
//           });
//         }
//       },

//       dismissFollowUp: () => set({ followupDismissed: true }),

//       caseload:  [],
//       addCase: (entry) => set((state) => ({
//         caseload: [
//           {
//             ...entry,
//             id:      Date.now().toString(),
//             addedAt: new Date().toISOString(),
//           },
//           ...state.caseload,
//         ],
//       })),
//       removeCase: (id) => set((state) => ({
//         caseload: state.caseload.filter((c) => c.id !== id),
//       })),
//     }),
//     {
//       name:    "jaundicare-store",
//       storage: createJSONStorage(() => mmkvStorage),
//     }
//   )
// );


import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BabyProfile, ScreeningResult, ScreeningHistoryItem } from "../services/api";
 
interface AppState {
  language: string;
  setLanguage: (lang: string) => void;
 
  onboarded: boolean;
  role: "parent" | "health_worker" | null;
  finishOnboarding: (role: "parent" | "health_worker") => void;
 
  profile: BabyProfile | null;
  setProfile: (profile: BabyProfile | null) => void;
 
  lastScreening: ScreeningResult | null;
  setLastScreening: (result: ScreeningResult | null) => void;
 
  history: ScreeningHistoryItem[];
  setHistory: (history: ScreeningHistoryItem[]) => void;
 
  lastUrgentDecision: string | null;
  lastUrgentTime: number | null;
  followupDismissed: boolean;
  storeFollowUpData: (decision: string) => void;
  dismissFollowUp: () => void;
 
  caseload: CaseloadEntry[];
  addCase: (entry: Omit<CaseloadEntry, "id" | "addedAt">) => void;
  removeCase: (id: string) => void;
}
 
export interface CaseloadEntry {
  id: string;
  name: string;
  household?: string;
  dob: string;
  tob: string;
  gestAge?: number;
  addedAt: string;
}
 
const URGENT_DECISIONS = [
  "URGENT_HOSPITAL_REVIEW",
  "SAME_DAY_CLINIC_REVIEW",
  "RECHECK_SOON_OR_CLINIC_IF_CONCERNED",
];
 
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
 
      onboarded: false,
      role: null,
      finishOnboarding: (role) => set({ onboarded: true, role }),
 
      profile: null,
      setProfile: (profile) => set({ profile }),
 
      lastScreening: null,
      setLastScreening: (result) => set({ lastScreening: result }),
 
      history: [],
      setHistory: (history) => set({ history }),
 
      lastUrgentDecision: null,
      lastUrgentTime: null,
      followupDismissed: false,
 
      storeFollowUpData: (decision) => {
        if (URGENT_DECISIONS.includes(decision)) {
          set({
            lastUrgentDecision: decision,
            lastUrgentTime: Date.now(),
            followupDismissed: false,
          });
        }
      },
 
      dismissFollowUp: () => set({ followupDismissed: true }),
 
      caseload: [],
      addCase: (entry) =>
        set((state) => ({
          caseload: [
            {
              ...entry,
              id: Date.now().toString(),
              addedAt: new Date().toISOString(),
            },
            ...state.caseload,
          ],
        })),
      removeCase: (id) =>
        set((state) => ({
          caseload: state.caseload.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "jaundicare-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);