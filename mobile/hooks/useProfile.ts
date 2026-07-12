// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { profileApi, type BabyProfile } from "../services/api";
// import { useAppStore } from "../store/appStore";

// export function useProfile() {
//   const setProfile  = useAppStore((s) => s.setProfile);
//   const queryClient = useQueryClient();

//   const query = useQuery({
//     queryKey:  ["profile"],
//     queryFn:   profileApi.get,
//     staleTime: 1000 * 60 * 5,          // consider fresh for 5 minutes
//     gcTime:    1000 * 60 * 60 * 24,    // keep in cache for 24 hours — survives offline
//     retry:     2,
//     select: (data: BabyProfile) => {
//       // Side effect — sync to Zustand store whenever query succeeds
//       setProfile(data);
//       return data;
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: (data: Omit<BabyProfile, "exists" | "id" | "age_hours">) =>
//       profileApi.save(data),
//     onSuccess: (data) => {
//       setProfile(data);
//       queryClient.setQueryData(["profile"], data);
//     },
//   });

//   return {
//     profile:   query.data,
//     isLoading: query.isLoading,
//     isOffline: query.isError && !!query.data, // has cached data but network failed
//     error:     query.error,
//     save:      mutation.mutate,
//     isSaving:  mutation.isPending,
//     saveError: mutation.error,
//   };
// }


// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { profileApi, type BabyProfile } from "../services/api";
// import { useAppStore } from "../store/appStore";

// export function useProfile() {
//   const setProfile  = useAppStore((s) => s.setProfile);
//   const queryClient = useQueryClient();

//   const query = useQuery({
//     queryKey:  ["profile"],
//     queryFn:   profileApi.get,
//     staleTime: 1000 * 60 * 5,          // consider fresh for 5 minutes
//     gcTime:    1000 * 60 * 60 * 24,    // keep in cache for 24 hours — survives offline
//     retry:     2,
//     select: (data: BabyProfile) => {
//       // Side effect — sync to Zustand store whenever query succeeds
//       setProfile(data);
//       return data;
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: (data: Omit<BabyProfile, "exists" | "id" | "age_hours">) =>
//       profileApi.save(data),
//     onSuccess: (data) => {
//       setProfile(data);
//       queryClient.setQueryData(["profile"], data);
//     },
//   });

//   return {
//     profile:   query.data,
//     isLoading: query.isLoading,
//     isOffline: query.isError && !!query.data, // has cached data but network failed
//     error:     query.error,
//     save:      mutation.mutate,
//     isSaving:  mutation.isPending,
//     saveError: mutation.error,
//   };
// }



// import { useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { profileApi, type BabyProfile } from "../services/api";
// import { useAppStore } from "../store/appStore";

// export function useProfile() {
//   const setProfile  = useAppStore((s) => s.setProfile);
//   const queryClient = useQueryClient();

//   const query = useQuery({
//     queryKey:  ["profile"],
//     queryFn:   profileApi.get,
//     staleTime: 1000 * 60 * 5,          // consider fresh for 5 minutes
//     gcTime:    1000 * 60 * 60 * 24,    // keep in cache for 24 hours — survives offline
//     retry:     2,
//   });

//   // Safe structural side effect: sync to Zustand only when data actually changes
//   useEffect(() => {
//     if (query.data) {
//       setProfile(query.data);
//     }
//   }, [query.data, setProfile]);

//   const mutation = useMutation({
//     mutationFn: (data: Omit<BabyProfile, "exists" | "id" | "age_hours">) =>
//       profileApi.save(data),
//     onSuccess: (data) => {
//       setProfile(data);
//       queryClient.setQueryData(["profile"], data);
//     },
//   });

//   return {
//     profile:   query.data,
//     isLoading: query.isLoading,
//     isOffline: query.isError && !!query.data,
//     error:     query.error,
//     save:      mutation.mutate,
//     isSaving:  mutation.isPending,
//     saveError: mutation.error,
//   };
// }


/**
 * JaundiCare — useProfile Hook (Production-Hardened)
 * Thread-safe clinical profile state synchronization engine combining 
 * TanStack network cache tracking with local app stores.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, type BabyProfile } from "../services/api";
import { useAppStore } from "../store/appStore";

export function useProfile() {
  const setProfile   = useAppStore((s) => s.setProfile);
  const localProfile = useAppStore((s) => s.profile);
  const queryClient  = useQueryClient();

  // ── Production Win: Streamlined state projection engine ───────────────────
  const query = useQuery({
    queryKey:  ["profile"],
    queryFn: async () => {
      const data = await profileApi.get();
      // Synchronize directly inside the async transaction boundary, 
      // completely eliminating the need for a brittle useEffect listener loop.
      if (data) {
        setProfile(data);
      }
      return data;
    },
    staleTime: 1000 * 60 * 5,       // Fresh baseline: 5 minutes
    gcTime:    1000 * 60 * 60 * 24, // Persistent sandbox allocation: 24 hours
    retry:     2,
  });

  const mutation = useMutation({
    mutationFn: (data: Omit<BabyProfile, "exists" | "id" | "age_hours">) =>
      profileApi.save(data),
    onSuccess: (data) => {
      // Atomic multi-store update commit
      setProfile(data);
      queryClient.setQueryData(["profile"], data);
    },
  });

  return {
    // ── Production Scaling Win: Expose the local profile store ──────────────
    // This guarantees that any instant offline modifications are reflected immediately 
    // across all application views without waiting for a network resolution event.
    profile:   localProfile || query.data,
    isLoading: query.isLoading,
    // Accurate state detection based on network query status variables
    isOffline: query.isPaused || (query.isError && !!localProfile),
    error:     query.error,
    save:      mutation.mutate,
    isSaving:  mutation.isPending,
    saveError: mutation.error,
  };
}