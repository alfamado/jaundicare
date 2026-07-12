/**
 * JaundiCare — API Service
 * All calls to the FastAPI backend go through here.
 * Change API_BASE_URL to your deployed URL when ready.
 */

// import axios from "axios";

// For local development on physical device, use your machine's local IP
// Find it by running `ipconfig` (Windows) and looking for IPv4 Address
// e.g. "http://192.168.1.100:8000"
// For Android emulator: "http://10.0.2.2:8000"
// For iOS simulator:    "http://127.0.0.1:8000"
// export const API_BASE_URL = "http://10.41.25.92:8000"; // ← change this to your local IP or deployed URL when ready
// export const API_BASE_URL = "https://jaundicare-api.onrender.com";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000, // 30s — image uploads need more time on slow Nigerian networks
// });

// // ── Types ──────────────────────────────────────────────────────
// export interface BabyProfile {
//   exists: boolean;
//   id?: string;
//   baby_name?: string;
//   parent_name?: string;
//   date_of_birth?: string;
//   time_of_birth?: string;
//   sex?: string;
//   gestational_age_weeks?: number;
//   age_hours?: number;
// }

// export interface Facility {
//   id: string;
//   name: string;
//   type: "primary" | "secondary" | "tertiary";
//   state: string;
//   address: string;
//   phone?: string;
//   latitude?: number;
//   longitude?: number;
//   distance_km?: number;
//   services: string[];
//   far_fallback?: boolean;
//   fallback_note?: string;
// }

// export interface ScreeningResult {
//   success: boolean;
//   screening_id: string;
//   created_at: string;
//   filename?: string;
//   image_prediction?: string;
//   image_confidence?: number;
//   confidence_band?: string;
//   raw_triage_level: string;
//   raw_triage_reason: string;
//   final_decision: string;
//   final_decision_reason: string;
//   parent_message: string;
//   notes: string[];
//   baby_age_hours?: number;
//   recommended_facilities: Facility[];
// }

// export interface ScreeningHistoryItem extends ScreeningResult {
//   symptoms: Record<string, unknown>;
//   cloudinary_url?: string;
// }

// // ── Profile ─────────────────────────────────────────────────────
// export const profileApi = {
//   get: async (): Promise<BabyProfile> => {
//     const { data } = await api.get("/profile/baby");
//     return data;
//   },

//   save: async (profile: Omit<BabyProfile, "exists" | "id" | "age_hours">): Promise<BabyProfile> => {
//     const { data } = await api.post("/profile/baby", profile);
//     return data;
//   },
// };

// // ── Screening ────────────────────────────────────────────────────
// export interface ScreeningPayload {
//   imageUri: string;
//   age_hours?: number;
//   feeding: "good" | "poor";
//   difficult_to_wake: boolean;
//   floppy_or_unusually_drowsy: boolean;
//   jaundice_first_24h: boolean;
//   jaundice_spreading: boolean;
//   yellow_eyes: boolean;
//   yellow_gums: boolean;
//   yellow_palms_or_soles: boolean;
//   dark_urine: boolean;
//   pale_stool: boolean;
//   darker_skin_tone: boolean;
//   skin_tone_category?: string;
//   user_latitude?: number;
//   user_longitude?: number;
//   user_state?: string;
//   user_lga?: string;
//   ui_language?: string;
// }

// export const screeningApi = {
//   analyze: async (payload: ScreeningPayload): Promise<ScreeningResult> => {
//     const formData = new FormData();

//     // Attach image
//     const filename  = payload.imageUri.split("/").pop() || "image.jpg";
//     const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
//     const mimeType  = extension === "png" ? "image/png" : "image/jpeg";

//     formData.append("image", {
//       uri:  payload.imageUri,
//       name: filename,
//       type: mimeType,
//     } as unknown as Blob);

//     // Attach all other fields
//     const boolFields = [
//       "difficult_to_wake", "floppy_or_unusually_drowsy", "jaundice_first_24h",
//       "jaundice_spreading", "yellow_eyes", "yellow_gums", "yellow_palms_or_soles",
//       "dark_urine", "pale_stool", "darker_skin_tone",
//     ] as const;

//     formData.append("feeding", payload.feeding);
//     boolFields.forEach(f => formData.append(f, String(payload[f])));

//     if (payload.age_hours != null)       formData.append("age_hours", String(payload.age_hours));
//     if (payload.skin_tone_category)      formData.append("skin_tone_category", payload.skin_tone_category);
//     if (payload.user_latitude != null)   formData.append("user_latitude", String(payload.user_latitude));
//     if (payload.user_longitude != null)  formData.append("user_longitude", String(payload.user_longitude));
//     if (payload.user_state)              formData.append("user_state", payload.user_state);
//     if (payload.user_lga)                formData.append("user_lga", payload.user_lga);
//     formData.append("ui_language", payload.ui_language || "en");

//     const { data } = await api.post<ScreeningResult>("/screening/analyze", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     return data;
//   },

//   history: async (): Promise<ScreeningHistoryItem[]> => {
//     const { data } = await api.get("/screening/history");
//     return data;
//   },
// };

// // ── Facilities ────────────────────────────────────────────────────
// export const facilityApi = {
//   recommend: async (params: {
//     state?: string;
//     lat?: number;
//     lon?: number;
//     triage_level?: string;
//   }): Promise<Facility[]> => {
//     const { data } = await api.get("/facilities/recommend", { params });
//     return data.facilities || [];
//   },
// };




// /**
//  * JaundiCare — API Service
//  * All calls to the FastAPI backend go through here.
//  * Change API_BASE_URL to your deployed URL when ready.
//  */

// import axios from "axios";

// For local development on physical device, use your machine's local IP
// Find it by running `ipconfig` (Windows) and looking for IPv4 Address
// e.g. "http://192.168.1.100:8000"
// For Android emulator: "http://10.0.2.2:8000"
// For iOS simulator:    "http://127.0.0.1:8000"
// export const API_BASE_URL = "http://192.168.1.100:8000"; // ← change this to your local IP
// export const API_BASE_URL = "https://jaundicare-api.onrender.com";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000, // 30s — image uploads need more time on slow Nigerian networks
// });

// // ── Types ──────────────────────────────────────────────────────
// export interface BabyProfile {
//   exists: boolean;
//   id?: string;
//   baby_name?: string;
//   parent_name?: string;
//   date_of_birth?: string;
//   time_of_birth?: string;
//   sex?: string;
//   gestational_age_weeks?: number;
//   age_hours?: number;
// }

// export interface Facility {
//   id: string;
//   name: string;
//   type: "primary" | "secondary" | "tertiary";
//   state: string;
//   address: string;
//   phone?: string;
//   latitude?: number;
//   longitude?: number;
//   distance_km?: number;
//   services: string[];
//   far_fallback?: boolean;
//   fallback_note?: string;
// }

// export interface ScreeningResult {
//   success: boolean;
//   screening_id: string;
//   created_at: string;
//   filename?: string;
//   image_prediction?: string;
//   image_confidence?: number;
//   confidence_band?: string;
//   raw_triage_level: string;
//   raw_triage_reason: string;
//   final_decision: string;
//   final_decision_reason: string;
//   parent_message: string;
//   notes: string[];
//   baby_age_hours?: number;
//   recommended_facilities: Facility[];
// }

// export interface ScreeningHistoryItem extends ScreeningResult {
//   symptoms: Record<string, unknown>;
//   cloudinary_url?: string;
// }

// // ── Profile ─────────────────────────────────────────────────────
// export const profileApi = {
//   get: async (): Promise<BabyProfile> => {
//     const { data } = await api.get("/profile/baby");
//     return data;
//   },

//   save: async (profile: Omit<BabyProfile, "exists" | "id" | "age_hours">): Promise<BabyProfile> => {
//     const { data } = await api.post("/profile/baby", profile);
//     return data;
//   },
// };

// // ── Screening ────────────────────────────────────────────────────
// export interface ScreeningPayload {
//   imageUri: string;
//   age_hours?: number;
//   feeding: "good" | "poor";
//   difficult_to_wake: boolean;
//   floppy_or_unusually_drowsy: boolean;
//   jaundice_first_24h: boolean;
//   jaundice_spreading: boolean;
//   yellow_eyes: boolean;
//   yellow_gums: boolean;
//   yellow_palms_or_soles: boolean;
//   dark_urine: boolean;
//   pale_stool: boolean;
//   darker_skin_tone: boolean;
//   skin_tone_category?: string;
//   user_latitude?: number;
//   user_longitude?: number;
//   user_state?: string;
//   user_lga?: string;
//   facility_preference?: string;
//   ui_language?: string;
// }

// export const screeningApi = {
//   analyze: async (payload: ScreeningPayload): Promise<ScreeningResult> => {
//     const formData = new FormData();

//     // Attach image
//     const filename  = payload.imageUri.split("/").pop() || "image.jpg";
//     const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
//     const mimeType  = extension === "png" ? "image/png" : "image/jpeg";

//     formData.append("image", {
//       uri:  payload.imageUri,
//       name: filename,
//       type: mimeType,
//     } as unknown as Blob);

//     // Attach all other fields
//     const boolFields = [
//       "difficult_to_wake", "floppy_or_unusually_drowsy", "jaundice_first_24h",
//       "jaundice_spreading", "yellow_eyes", "yellow_gums", "yellow_palms_or_soles",
//       "dark_urine", "pale_stool", "darker_skin_tone",
//     ] as const;

//     formData.append("feeding", payload.feeding);
//     boolFields.forEach(f => formData.append(f, String(payload[f])));

//     if (payload.age_hours != null)       formData.append("age_hours", String(payload.age_hours));
//     if (payload.skin_tone_category)      formData.append("skin_tone_category", payload.skin_tone_category);
//     if (payload.user_latitude != null)   formData.append("user_latitude", String(payload.user_latitude));
//     if (payload.user_longitude != null)  formData.append("user_longitude", String(payload.user_longitude));
//     if (payload.user_state)              formData.append("user_state", payload.user_state);
//     if (payload.user_lga)                formData.append("user_lga", payload.user_lga);
//     if (payload.facility_preference)     formData.append("facility_preference", payload.facility_preference);
//     formData.append("ui_language", payload.ui_language || "en");

//     const { data } = await api.post<ScreeningResult>("/screening/analyze", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     return data;
//   },

//   history: async (): Promise<ScreeningHistoryItem[]> => {
//     const { data } = await api.get("/screening/history");
//     return data;
//   },
// };

// // ── Facilities ────────────────────────────────────────────────────
// export const facilityApi = {
//   recommend: async (params: {
//     state?: string;
//     lat?: number;
//     lon?: number;
//     triage_level?: string;
//   }): Promise<Facility[]> => {
//     const { data } = await api.get("/facilities/recommend", { params });
//     return data.facilities || [];
//   },
// };


/**
 * JaundiCare — API Service
 * All calls to the FastAPI backend go through here.
 * Change API_BASE_URL to your deployed URL when ready.
 * 
 * Integrated with master token authentication, 401 interceptor auto-refresh,
 * and multi-part image upload handling for production-level network environments.
 */

import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = "https://jaundicare-api.onrender.com";

// Master secure storage keys mapping directly to useAuth.ts architecture
const STORAGE_KEYS = {
  accessToken:  "jaundicare_access_token",
  refreshToken: "jaundicare_refresh_token",
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s — image uploads need more time on slow Nigerian networks
});

// ── Interceptors (Production Auth & Auto-Refresh Routing) ───────

// 1. Request Interceptor: Injects master token into every outgoing API transaction
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("API Request Interceptor SecureStore read failure:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Catches 401 token expirations and rotates sessions seamlessly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard condition: Intercept strictly on 401 responses and ensure we don't loop infinitely
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentRefreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);

        if (currentRefreshToken) {
          // Execute standalone HTTP post to bypass instance interceptors during token generation
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: currentRefreshToken,
          }, {
            headers: { "Content-Type": "application/json" }
          });

          if (refreshResponse.status === 200 && refreshResponse.data) {
            const { access_token, refresh_token } = refreshResponse.data;

            // Commit fresh structural credentials back to the master hardware store
            await Promise.all([
              SecureStore.setItemAsync(STORAGE_KEYS.accessToken, access_token),
              SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refresh_token),
            ]);

            // Re-assign the new working token authorization header to the original stalled request
            originalRequest.headers.Authorization = `Bearer ${access_token}`;

            // Replay the original request with the fresh token transparently
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("In-flight API token renewal engine execution failed:", refreshError);
        // Note: If the refresh token is expired/revoked, the downstream app router or useAuth hook 
        // will safely catch the terminal state and sweep local state profiles cleanly via clearSession.
      }
    }

    return Promise.reject(error);
  }
);

// ── Types ──────────────────────────────────────────────────────
export interface BabyProfile {
  exists: boolean;
  id?: string;
  baby_name?: string;
  parent_name?: string;
  date_of_birth?: string;
  time_of_birth?: string;
  sex?: string;
  gestational_age_weeks?: number;
  age_hours?: number;
}

export interface Facility {
  id: string;
  name: string;
  type: "primary" | "secondary" | "tertiary";
  state: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  services: string[];
  far_fallback?: boolean;
  fallback_note?: string;
}

export interface ScreeningResult {
  success: boolean;
  screening_id: string;
  created_at: string;
  filename?: string;
  image_prediction?: string;
  image_confidence?: number;
  confidence_band?: string;
  raw_triage_level: string;
  raw_triage_reason: string;
  final_decision: string;
  final_decision_reason: string;
  parent_message: string;
  notes: string[];
  baby_age_hours?: number;
  recommended_facilities: Facility[];
}

export interface ScreeningHistoryItem extends ScreeningResult {
  symptoms: Record<string, unknown>;
  cloudinary_url?: string;
}

// ── Profile ─────────────────────────────────────────────────────
export const profileApi = {
  get: async (): Promise<BabyProfile> => {
    const { data } = await api.get("/profile/baby");
    return data;
  },

  save: async (profile: Omit<BabyProfile, "exists" | "id" | "age_hours">): Promise<BabyProfile> => {
    const { data } = await api.post("/profile/baby", profile);
    return data;
  },
};

// ── Screening ────────────────────────────────────────────────────
export interface ScreeningPayload {
  imageUri: string;
  age_hours?: number;
  feeding: "good" | "poor";
  difficult_to_wake: boolean;
  floppy_or_unusually_drowsy: boolean;
  jaundice_first_24h: boolean;
  jaundice_spreading: boolean;
  yellow_eyes: boolean;
  yellow_gums: boolean;
  yellow_palms_or_soles: boolean;
  dark_urine: boolean;
  pale_stool: boolean;
  darker_skin_tone: boolean;
  skin_tone_category?: string;
  user_latitude?: number;
  user_longitude?: number;
  user_state?: string;
  user_lga?: string;
  facility_preference?: string;
  ui_language?: string;
}

export const screeningApi = {
  analyze: async (payload: ScreeningPayload): Promise<ScreeningResult> => {
    const formData = new FormData();

    // Attach image
    const filename  = payload.imageUri.split("/").pop() || "image.jpg";
    const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType  = extension === "png" ? "image/png" : "image/jpeg";

    formData.append("image", {
      uri:  payload.imageUri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);

    // Attach all other fields
    const boolFields = [
      "difficult_to_wake", "floppy_or_unusually_drowsy", "jaundice_first_24h",
      "jaundice_spreading", "yellow_eyes", "yellow_gums", "yellow_palms_or_soles",
      "dark_urine", "pale_stool", "darker_skin_tone",
    ] as const;

    formData.append("feeding", payload.feeding);
    boolFields.forEach(f => formData.append(f, String(payload[f])));

    if (payload.age_hours != null)       formData.append("age_hours", String(payload.age_hours));
    if (payload.skin_tone_category)      formData.append("skin_tone_category", payload.skin_tone_category);
    if (payload.user_latitude != null)   formData.append("user_latitude", String(payload.user_latitude));
    if (payload.user_longitude != null)  formData.append("user_longitude", String(payload.user_longitude));
    if (payload.user_state)              formData.append("user_state", payload.user_state);
    if (payload.user_lga)                formData.append("user_lga", payload.user_lga);
    if (payload.facility_preference)     formData.append("facility_preference", payload.facility_preference);
    formData.append("ui_language", payload.ui_language || "en");

    const { data } = await api.post<ScreeningResult>("/screening/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  history: async (): Promise<ScreeningHistoryItem[]> => {
    const { data } = await api.get("/screening/history");
    return data;
  },
};

// ── Facilities ────────────────────────────────────────────────────
export const facilityApi = {
  recommend: async (params: {
    state?: string;
    lat?: number;
    lon?: number;
    triage_level?: string;
  }): Promise<Facility[]> => {
    const { data } = await api.get("/facilities/recommend", { params });
    return data.facilities || [];
  },
};

export default api;