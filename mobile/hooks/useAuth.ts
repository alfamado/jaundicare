// /**
//  * JaundiCare — useAuth hook
//  * Manages JWT tokens in SecureStore, auth state, and API auth headers.
//  */

// import { useState, useEffect, useCallback } from "react";
// import * as SecureStore from "expo-secure-store";
// import { useAppStore } from "../store/appStore";
// import { API_BASE_URL } from "./api";

// const KEYS = {
//   accessToken:  "jaundicare_access_token",
//   refreshToken: "jaundicare_refresh_token",
//   userId:       "jaundicare_user_id",
//   phone:        "jaundicare_phone",
//   role:         "jaundicare_role",
// };

// export interface AuthState {
//   isAuthenticated: boolean;
//   isLoading:       boolean;
//   userId:          string | null;
//   phone:           string | null;
//   role:            string | null;
// }

// export function useAuth() {
//   const [authState, setAuthState] = useState<AuthState>({
//     isAuthenticated: false,
//     isLoading:       true,
//     userId:          null,
//     phone:           null,
//     role:            null,
//   });

//   const finishOnboarding = useAppStore((s) => s.finishOnboarding);
//   const setLanguage      = useAppStore((s) => s.setLanguage);

//   // Check stored tokens on mount
//   useEffect(() => {
//     checkStoredAuth();
//   }, []);

//   const checkStoredAuth = async () => {
//     try {
//       const [accessToken, userId, phone, role] = await Promise.all([
//         SecureStore.getItemAsync(KEYS.accessToken),
//         SecureStore.getItemAsync(KEYS.userId),
//         SecureStore.getItemAsync(KEYS.phone),
//         SecureStore.getItemAsync(KEYS.role),
//       ]);

//       if (accessToken && userId) {
//         // Try to refresh to verify token is still valid
//         const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
//         if (refreshToken) {
//           const refreshed = await tryRefresh(refreshToken);
//           if (refreshed) {
//             setAuthState({
//               isAuthenticated: true,
//               isLoading:       false,
//               userId,
//               phone,
//               role,
//             });
//             return;
//           }
//         }
//       }

//       setAuthState(s => ({ ...s, isLoading: false }));
//     } catch {
//       setAuthState(s => ({ ...s, isLoading: false }));
//     }
//   };

//   const tryRefresh = async (refreshToken: string): Promise<boolean> => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ refresh_token: refreshToken }),
//       });
//       if (!res.ok) return false;
//       const data = await res.json();
//       await storeTokens(data);
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const storeTokens = async (data: any) => {
//     await Promise.all([
//       SecureStore.setItemAsync(KEYS.accessToken,  data.access_token),
//       SecureStore.setItemAsync(KEYS.refreshToken, data.refresh_token),
//       SecureStore.setItemAsync(KEYS.userId,       data.user_id),
//       SecureStore.setItemAsync(KEYS.phone,        data.phone_number),
//       SecureStore.setItemAsync(KEYS.role,         data.role),
//     ]);

//     if (data.role) {
//       finishOnboarding(data.role as "parent" | "health_worker");
//     }
//     if (data.language) {
//       setLanguage(data.language);
//     }
//   };

//   const getAccessToken = useCallback(async (): Promise<string | null> => {
//     return SecureStore.getItemAsync(KEYS.accessToken);
//   }, []);

//   const login = async (data: any) => {
//     await storeTokens(data);
//     setAuthState({
//       isAuthenticated: true,
//       isLoading:       false,
//       userId:          data.user_id,
//       phone:           data.phone_number,
//       role:            data.role,
//     });
//   };

//   const logout = async () => {
//     try {
//       const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
//       if (refreshToken) {
//         await fetch(`${API_BASE_URL}/auth/logout`, {
//           method:  "POST",
//           headers: { "Content-Type": "application/json" },
//           body:    JSON.stringify({ refresh_token: refreshToken }),
//         });
//       }
//     } catch {}

//     await Promise.all(Object.values(KEYS).map(k => SecureStore.deleteItemAsync(k)));
//     setAuthState({ isAuthenticated: false, isLoading: false, userId: null, phone: null, role: null });
//   };

//   return { authState, login, logout, getAccessToken };
// }



// /**
//  * JaundiCare — useAuth hook (High-Scale Production Ready)
//  * Handles fast local initialization, atomic state setting, low-connectivity resilience,
//  * and background session verification.
//  */

// import { useState, useEffect, useCallback, useRef } from "react";
// import * as SecureStore from "expo-secure-store";
// import { useAppStore } from "../store/appStore";
// import { API_BASE_URL } from "../services/api";

// const KEYS = {
//   accessToken:  "jaundicare_access_token",
//   refreshToken: "jaundicare_refresh_token",
//   userId:       "jaundicare_user_id",
//   phone:        "jaundicare_phone",
//   role:         "jaundicare_role",
// };

// export interface AuthState {
//   isAuthenticated: boolean;
//   isLoading:       boolean;
//   userId:          string | null;
//   phone:           string | null;
//   role:            string | null;
// }

// export function useAuth() {
//   const [authState, setAuthState] = useState<AuthState>({
//     isAuthenticated: false,
//     isLoading:       true,
//     userId:          null,
//     phone:           null,
//     role:            null,
//   });

//   const finishOnboarding = useAppStore((s) => s.finishOnboarding);
//   const setLanguage      = useAppStore((s) => s.setLanguage);

//   // Prevent memory leaks on race conditions when components unmount mid-flight
//   const isMounted = useRef(true);

//   useEffect(() => {
//     isMounted.current = true;
//     checkStoredAuth();
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   const checkStoredAuth = async () => {
//     try {
//       const [accessToken, userId, phone, role] = await Promise.all([
//         SecureStore.getItemAsync(KEYS.accessToken),
//         SecureStore.getItemAsync(KEYS.userId),
//         SecureStore.getItemAsync(KEYS.phone),
//         SecureStore.getItemAsync(KEYS.role),
//       ]);

//       if (!isMounted.current) return;

//       // Optimistic Local Auth: Let the user see their data immediately without waiting for the network
//       if (accessToken && userId) {
//         setAuthState({
//           isAuthenticated: true,
//           isLoading:       false,
//           userId,
//           phone,
//           role,
//         });

//         // Verify/rotate session asynchronously in the background
//         const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
//         if (refreshToken) {
//           tryRefreshInBackground(refreshToken);
//         }
//         return;
//       }

//       setAuthState({ isAuthenticated: false, isLoading: false, userId: null, phone: null, role: null });
//     } catch (error) {
//       if (isMounted.current) {
//         setAuthState({ isAuthenticated: false, isLoading: false, userId: null, phone: null, role: null });
//       }
//     }
//   };

//   const tryRefreshInBackground = async (refreshToken: string): Promise<boolean> => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ refresh_token: refreshToken }),
//       });

//       if (res.status === 401) {
//         // Refresh token is expired or revoked on the server -> force logout
//         await logout();
//         return false;
//       }

//       if (!res.ok) return false; // Network hiccup, retain existing session state

//       const data = await res.json();
//       await storeTokens(data, false); // Update keys quietly without altering UI layout
//       return true;
//     } catch {
//       return false; // Silently catch offline errors to prevent app-wide lockout
//     }
//   };

//   const storeTokens = async (data: any, isInitialLogin = false) => {
//     await Promise.all([
//       SecureStore.setItemAsync(KEYS.accessToken,  data.access_token),
//       SecureStore.setItemAsync(KEYS.refreshToken, data.refresh_token),
//       SecureStore.setItemAsync(KEYS.userId,       data.user_id),
//       SecureStore.setItemAsync(KEYS.phone,        data.phone_number),
//       SecureStore.setItemAsync(KEYS.role,         data.role),
//     ]);

//     if (isInitialLogin) {
//       if (data.role) {
//         finishOnboarding(data.role as "parent" | "health_worker");
//       }
//       if (data.language) {
//         setLanguage(data.language);
//       }
//     }
//   };

//   const getAccessToken = useCallback(async (): Promise<string | null> => {
//     return SecureStore.getItemAsync(KEYS.accessToken);
//   }, []);

//   const login = async (data: any) => {
//     await storeTokens(data, true);
//     setAuthState({
//       isAuthenticated: true,
//       isLoading:       false,
//       userId:          data.user_id,
//       phone:           data.phone_number,
//       role:            data.role,
//     });
//   };

//   const logout = async () => {
//     try {
//       const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
//       if (refreshToken) {
//         await fetch(`${API_BASE_URL}/auth/logout`, {
//           method:  "POST",
//           headers: { "Content-Type": "application/json" },
//           body:    JSON.stringify({ refresh_token: refreshToken }),
//         });
//       }
//     } catch (e) {
//       // Catch network drops to ensure local store deletion proceeds flawlessly
//     }

//     await Promise.all(Object.values(KEYS).map(k => SecureStore.deleteItemAsync(k)));
    
//     if (isMounted.current) {
//       setAuthState({ isAuthenticated: false, isLoading: false, userId: null, phone: null, role: null });
//     }
//   };

//   /**
//    * High-Scale Custom Fetch wrapper with auto-refresh handling on 401 interception
//    */
//   const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
//     let token = await SecureStore.getItemAsync(KEYS.accessToken);
    
//     const headers = {
//       ...options.headers,
//       "Authorization": `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };

//     let response = await fetch(url, { ...options, headers });

//     // Handle session rotation transparently in the background if token expires mid-session
//     if (response.status === 401) {
//       const currentRefreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
//       if (currentRefreshToken) {
//         const refreshSuccessful = await tryRefreshInBackground(currentRefreshToken);
//         if (refreshSuccessful) {
//           token = await SecureStore.getItemAsync(KEYS.accessToken);
//           const retryHeaders = {
//             ...options.headers,
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           };
//           response = await fetch(url, { ...options, headers: retryHeaders });
//         }
//       }
//     }

//     return response;
//   }, []);

//   return { authState, login, logout, getAccessToken, authenticatedFetch };
// }



/**
 * JaundiCare — Master Auth Lifecycle Hook
 * Core engine for all token, session, and credential management.
 * Integrates directly with Expo SecureStore for physical device storage
 * and orchestrates immediate synchronization to the useAuthStore UI layer.
 */

import { useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";
import { useAuthStore } from "./useAuthStore";
import { clearOfflineStore } from "../services/offlineStoreSecure";
import { useAppStore } from "../store/appStore";

// Master secure hardware store keys mapping
const STORAGE_KEYS = {
  accessToken:  "jaundicare_access_token",
  refreshToken: "jaundicare_refresh_token",
  userId:       "jaundicare_user_id",
  phone:        "jaundicare_phone",
  role:         "jaundicare_role",
};

export interface AuthPayload {
  access_token: string;
  refresh_token: string;
  user_id: string;
  phone_number: string;
  role: string;
}

export const useAuth = () => {
  // Bind directly to Zustand reactive atomic setters
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const clearAuthenticated = useAuthStore((state) => state.clearAuthenticated);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const clearAppData = useAppStore((state) => state.clearStoreOnLogout);
  const setOnboardingRole = useAppStore((state) => state.finishOnboarding);

  // Bind to reactive UI read state variables if needed locally
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const userId = useAuthStore((state) => state.userId);
  const phone = useAuthStore((state) => state.phone);
  const role = useAuthStore((state) => state.role);

  /**
   * Hydrate Session
   * Reads persistent storage tokens on application cold starts to restore app state.
   */
  const hydrateSession = useCallback(async () => {
    try {
      const [token, storedUid, storedPhone, storedRole] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.getItemAsync(STORAGE_KEYS.userId),
        SecureStore.getItemAsync(STORAGE_KEYS.phone),
        SecureStore.getItemAsync(STORAGE_KEYS.role),
      ]);

      if (token && storedUid) {
        setAuthenticated({
          userId: storedUid,
          phone: storedPhone,
          role: storedRole,
        });
      } else {
        clearAuthenticated();
      }
    } catch (error) {
      console.error("Failed to hydrate authentication session from hardware store:", error);
      clearAuthenticated();
    } finally {
      setHydrated(true);
    }
  }, [setAuthenticated, clearAuthenticated, setHydrated]);

  // Trigger app hydration cycle once on layout mount
  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  /**
   * Commit Login Credentials
   * Executed directly by phone.tsx / otp.tsx screens following valid verification.
   */
  const login = async (authData: AuthPayload) => {
    try {
      // 1. Persist securely to device hardware
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.accessToken, authData.access_token),
        SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, authData.refresh_token),
        SecureStore.setItemAsync(STORAGE_KEYS.userId, authData.user_id),
        SecureStore.setItemAsync(STORAGE_KEYS.phone, authData.phone_number),
        SecureStore.setItemAsync(STORAGE_KEYS.role, authData.role),
      ]);

      // 2. Mirror configuration instantly to the UI reactive layer
      setAuthenticated({
        userId: authData.user_id,
        phone: authData.phone_number,
        role: authData.role,
      });
      // The server-provisioned role is authoritative. This prevents a role
      // selected before authentication from enabling a health-worker UI path.
      setOnboardingRole(
        authData.role === "health_worker" ? "health_worker" : "parent"
      );
    } catch (error) {
      console.error("Critical failure establishing secure login session:", error);
      throw new Error("Could not securely save login session. Please try again.");
    }
  };

  /**
   * Terminate Active Session (Logout)
   * Flushes local key bindings completely across both hardware disk and memory layers.
   */
  const logout = async () => {
    const activeUserId = await SecureStore.getItemAsync(STORAGE_KEYS.userId);
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
    try {
      if (refreshToken) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" }, timeout: 10000 },
        );
      }
    } catch {
      // Local logout must still complete when the device is offline.
    }

    try {
      await clearOfflineStore(activeUserId);
      // 1. Wipe local hardware keys simultaneously
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
        SecureStore.deleteItemAsync(STORAGE_KEYS.userId),
        SecureStore.deleteItemAsync(STORAGE_KEYS.phone),
        SecureStore.deleteItemAsync(STORAGE_KEYS.role),
      ]);
    } catch (error) {
      console.error("Non-fatal error cleaning storage keys during clearSession:", error);
    } finally {
      // 2. Always guarantee state mutation out of authenticated UI contexts
      clearAppData();
      clearAuthenticated();
    }
  };

  /**
   * Background Refresh Engine
   * Can be routinely pulled by component lifecycles or background hooks.
   */
  const refreshSessionInBackground = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
      if (!currentRefreshToken) {
        await logout();
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: currentRefreshToken,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.status === 200 && response.data) {
        const { access_token, refresh_token } = response.data;

        await Promise.all([
          SecureStore.setItemAsync(STORAGE_KEYS.accessToken, access_token),
          SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refresh_token),
        ]);
        return true;
      }
      
      await logout();
      return false;
    } catch (error) {
      console.error("Background token rotation task failed:", error);
      // Fail safely without disrupting the UI unless explicitly unauthorized
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await logout();
      }
      return false;
    }
  };

  return {
    isAuthenticated,
    isHydrated,
    userId,
    phone,
    role,
    login,
    logout,
    refreshSessionInBackground,
    hydrateSession,
  };
};
