// import React from "react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry:              2,
//       staleTime:          1000 * 60 * 2,  // 2 minutes
//       refetchOnWindowFocus: false,
//     },
//   },
// });

// export function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//     </QueryClientProvider>
//   );
// }





import React, { useState } from "react";
import { Platform } from "react-native";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// Explicitly register the global network status listener with TanStack Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    // Treat as online if connected via cellular, wifi, or ethernet links
    setOnline(!!state.isConnected && !!state.isInternetReachable);
  });
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Lazily initialize QueryClient inside state to survive Hot Module Reloads (HMR) 
  // safely without destroying global states or leaking connection trees.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              // Production protection: Do not retry if the backend explicitly warns us it is a client error (e.g., 401, 404)
              if (error?.status === 401 || error?.status === 404) return false;
              return failureCount < 2;
            },
            staleTime: 1000 * 60 * 5, // Expanded to 5 mins to respect rural mobile data bundles
            gcTime: 1000 * 60 * 60 * 24, // Keep unused data garbage-collected out after 24 hours
            refetchOnWindowFocus: false,
            // Re-execute any stale queries instantly if the device regains broken signal pipelines
            refetchOnReconnect: "always", 
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}