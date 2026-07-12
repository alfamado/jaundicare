// /**
//  * JaundiCare — Secure Storage & Auth State Management
//  * Encapsulates hardware-encrypted token workflows using Expo SecureStore.
//  */

// import { useState, useEffect } from 'react';
// import * as SecureStore from 'expo-secure-store';

// // Storage keys kept clear of plain text exposure
// const ACCESS_TOKEN_KEY = 'jaundicare_access_token';
// const REFRESH_TOKEN_KEY = 'jaundicare_refresh_token';
// const USER_PROFILE_KEY = 'jaundicare_user_profile';

// interface UserProfile {
//   id: string;
//   phone_number: string;
//   role: 'parent' | 'chw';
// }

// export function useAuthStore() {
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);

//   // Initialize auth state on application cold start
//   useEffect(() => {
//     async function bootstrapAsync() {
//       try {
//         const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
//         const profileStr = await SecureStore.getItemAsync(USER_PROFILE_KEY);
        
//         if (token && profileStr) {
//           setAccessToken(token);
//           setUserProfile(JSON.parse(profileStr));
//         }
//       } catch (e) {
//         console.error("Failed to restore secure authentication state:", e);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     bootstrapAsync();
//   }, []);

//   /**
//    * Securely saves session payload variables upon successful OTP verification.
//    */
//   const saveSession = async (access: string, refresh: string, profile: UserProfile) => {
//     try {
//       await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
//       await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
//       await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile));
      
//       setAccessToken(access);
//       setUserProfile(profile);
//     } catch (e) {
//       console.error("SecureStore write failure:", e);
//       throw new Error("Could not cache authentication credentials safely.");
//     }
//   };

//   /**
//    * Completely clears credentials on logout or structural token expiration.
//    */
//   const clearSession = async () => {
//     try {
//       await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
//       await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
//       await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
      
//       setAccessToken(null);
//       setUserProfile(null);
//     } catch (e) {
//       console.error("SecureStore purge failure:", e);
//     }
//   };

//   return {
//     accessToken,
//     userProfile,
//     isLoading,
//     saveSession,
//     clearSession,
//     isAuthenticated: !!accessToken,
//   };
// }




/**
 * JaundiCare — Auth State Layer (Zustand)
 * High-performance, reactive UI state memory. 
 * Does NOT write directly to SecureStore. Instead, it is updated exclusively 
 * by the useAuth master service controller to act as a real-time UI mirror.
 */

import { create } from "zustand";

interface UserProfile {
  userId: string | null;
  phone: string | null;
  role: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  userId: string | null;
  phone: string | null;
  role: string | null;
  
  // Master Setters called exclusively by the useAuth lifecycle hook
  setAuthenticated: (profile: UserProfile) => void;
  clearAuthenticated: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrated: false,
  userId: null,
  phone: null,
  role: null,

  setAuthenticated: (profile) => set({
    isAuthenticated: true,
    userId: profile.userId,
    phone: profile.phone,
    role: profile.role,
  }),

  clearAuthenticated: () => set({
    isAuthenticated: false,
    userId: null,
    phone: null,
    role: null,
  }),

  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
}));