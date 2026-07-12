// import { useQuery } from "@tanstack/react-query";
// import { screeningApi } from "../services/api";
// import { useAppStore } from "../store/appStore";

// export function useScreeningHistory() {
//   const setHistory = useAppStore((s) => s.setHistory);
//   const history    = useAppStore((s) => s.history);

//   const query = useQuery({
//     queryKey:  ["history"],
//     queryFn:   async () => {
//       const data = await screeningApi.history();
//       setHistory(data);
//       return data;
//     },
//     staleTime:            1000 * 60 * 2,       // fresh for 2 minutes
//     gcTime:               1000 * 60 * 60 * 24, // cached for 24 hours offline
//     retry:                2,
//     initialData:          history.length > 0 ? history : undefined,
//     initialDataUpdatedAt: Date.now() - 1000 * 60 * 3, // treat initial data as 3 mins old
//   });

//   return {
//     history:   query.data ?? history,  // fall back to Zustand cache if query fails
//     isLoading: query.isLoading,
//     isOffline: query.isError && history.length > 0,
//     refetch:   query.refetch,
//   };
// }



// import { useQuery } from "@tanstack/react-query";
// import { screeningApi } from "../services/api";
// import { useAppStore } from "../store/appStore";

// export function useScreeningHistory() {
//   const setHistory = useAppStore((s) => s.setHistory);
//   const history    = useAppStore((s) => s.history);

//   const query = useQuery({
//     queryKey:  ["history"],
//     queryFn:   async () => {
//       const data = await screeningApi.history();
//       setHistory(data);
//       return data;
//     },
//     staleTime:            1000 * 60 * 2,       // fresh for 2 minutes
//     gcTime:               1000 * 60 * 60 * 24, // cached for 24 hours offline
//     retry:                2,
//     initialData:          history.length > 0 ? history : undefined,
//     initialDataUpdatedAt: Date.now() - 1000 * 60 * 3, // treat initial data as 3 mins old
//   });

//   return {
//     history:   query.data ?? history,  // fall back to Zustand cache if query fails
//     isLoading: query.isLoading,
//     isOffline: query.isError && history.length > 0,
//     refetch:   query.refetch,
//   };
// }




// import { useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { screeningApi } from "../services/api";
// import { useAppStore } from "../store/appStore";

// export function useScreeningHistory() {
//   const setHistory = useAppStore((s) => s.setHistory);
//   const history    = useAppStore((s) => s.history);

//   const query = useQuery({
//     queryKey:  ["history"],
//     queryFn:   screeningApi.history, // Kept purely functional with no side effects
//     staleTime: 1000 * 60 * 5,        // Increased to 5 mins to prevent aggressive offline refetch hammering
//     gcTime:    1000 * 60 * 60 * 24,   // cached for 24 hours offline
//     retry:     2,
//   });

//   // Safely update the offline backing store when network fetches complete successfully
//   useEffect(() => {
//     if (query.data) {
//       setHistory(query.data);
//     }
//   }, [query.data, setHistory]);

//   return {
//     // If the network query hasn't returned data or failed, fall back gracefully to the local store state
//     history:   query.data ?? history, 
//     isLoading: query.isLoading,
//     isOffline: query.isError && history.length > 0,
//     refetch:   query.refetch,
//   };
// }



