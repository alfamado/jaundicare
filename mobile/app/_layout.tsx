// import { useEffect } from "react";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import {
//   useFonts,
//   Outfit_400Regular,
//   Outfit_500Medium,
//   Outfit_600SemiBold,
//   Outfit_700Bold,
// } from "@expo-google-fonts/outfit";
// import * as SplashScreen from "expo-splash-screen";
// import { useAppStore } from "../store/appStore";
// import { Providers } from "../components/Providers";
// import { Colors } from "../constants/colors";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const onboarded = useAppStore((s) => s.onboarded);

//   const [fontsLoaded] = useFonts({
//     Outfit_400Regular,
//     Outfit_500Medium,
//     Outfit_600SemiBold,
//     Outfit_700Bold,
//   });

//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//       if (!onboarded) {
//         router.replace("/onboarding");
//       }
//     }
//   }, [fontsLoaded, onboarded]);

//   if (!fontsLoaded) return null;

//   return (
//     <Providers>
//       <StatusBar style="light" backgroundColor={Colors.earth} />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="onboarding" />
//         <Stack.Screen name="(tabs)"     />
//       </Stack>
//     </Providers>
//   );
// }







// import { useEffect } from "react";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import {
//   useFonts,
//   Outfit_400Regular,
//   Outfit_500Medium,
//   Outfit_600SemiBold,
//   Outfit_700Bold,
// } from "@expo-google-fonts/outfit";
// import * as SplashScreen from "expo-splash-screen";
// import NetInfo from "@react-native-community/netinfo"; // Added network telemetry listener
// import { useAppStore } from "../store/appStore";
// import { Providers } from "../components/Providers";
// import { Colors } from "../constants/colors";
// // Assuming syncOfflineStore represents your queue processing function
// import { syncOfflineStore } from "../services/offlineStore"; 

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const onboarded = useAppStore((s) => s.onboarded);

//   const [fontsLoaded] = useFonts({
//     Outfit_400Regular,
//     Outfit_500Medium,
//     Outfit_600SemiBold,
//     Outfit_700Bold,
//   });

//   // Handle routing logic based on font loading and onboarding status
//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//       if (!onboarded) {
//         router.replace("/onboarding");
//       }
//     }
//   }, [fontsLoaded, onboarded]);

//   // Handle background synchronization when internet connection restores
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener((state) => {
//       if (state.isConnected && state.isInternetReachable) {
//         // Trigger automated sync for pending offline screening data packets
//         syncOfflineStore().catch((err) => {
//           console.error("Background sync processing failed: ", err);
//         });
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   if (!fontsLoaded) return null;

//   return (
//     <Providers>
//       <StatusBar style="light" backgroundColor={Colors.earth} />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="onboarding" />
//         <Stack.Screen name="(tabs)"     />
//       </Stack>
//     </Providers>
//   );
// }




// import { useEffect } from "react";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import {
//   useFonts,
//   Outfit_400Regular,
//   Outfit_500Medium,
//   Outfit_600SemiBold,
//   Outfit_700Bold,
// } from "@expo-google-fonts/outfit";
// import * as SplashScreen from "expo-splash-screen";
// import NetInfo from "@react-native-community/netinfo";
// import { useAppStore } from "../store/appStore";
// import { Providers } from "../components/Providers";
// import { Colors } from "../constants/colors";
// import { syncOfflineStore } from "../services/offlineStore";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const onboarded = useAppStore((s) => s.onboarded);

//   const [fontsLoaded] = useFonts({
//     Outfit_400Regular,
//     Outfit_500Medium,
//     Outfit_600SemiBold,
//     Outfit_700Bold,
//   });

//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//       if (!onboarded) {
//         router.replace("/onboarding");
//       }
//     }
//   }, [fontsLoaded, onboarded]);

//   // Background sync — fires when connection restores
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener((state) => {
//       // Explicit true check — isInternetReachable can be null on Android
//       if (state.isConnected && state.isInternetReachable === true) {
//         syncOfflineStore().catch((err) => {
//           console.error("Background sync failed:", err);
//         });
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   if (!fontsLoaded) return null;

//   return (
//     <Providers>
//       <StatusBar style="light" backgroundColor={Colors.earth} />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="onboarding" />
//         <Stack.Screen name="(tabs)" />
//       </Stack>
//     </Providers>
//   );
// }


// import { useEffect } from "react";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import {
//   useFonts,
//   Outfit_400Regular,
//   Outfit_500Medium,
//   Outfit_600SemiBold,
//   Outfit_700Bold,
// } from "@expo-google-fonts/outfit";
// import * as SplashScreen from "expo-splash-screen";
// import NetInfo from "@react-native-community/netinfo";
// import { useAppStore } from "../store/appStore";
// import { Providers } from "../components/Providers";
// import { Colors } from "../constants/colors";
// import { syncOfflineStore } from "../services/offlineStore";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const onboarded = useAppStore((s) => s.onboarded);

//   const [fontsLoaded] = useFonts({
//     Outfit_400Regular,
//     Outfit_500Medium,
//     Outfit_600SemiBold,
//     Outfit_700Bold,
//   });

//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//       if (!onboarded) {
//         router.replace("/onboarding");
//       }
//     }
//   }, [fontsLoaded, onboarded]);

//   // Background sync — fires when connection restores
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener((state) => {
//       // Explicit true check — isInternetReachable can be null on Android
//       if (state.isConnected && state.isInternetReachable === true) {
//         syncOfflineStore().catch((err) => {
//           console.error("Background sync failed:", err);
//         });
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   if (!fontsLoaded) return null;

//   return (
//     <Providers>
//       <StatusBar style="light" backgroundColor={Colors.earth} />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="onboarding" />
//         <Stack.Screen name="(tabs)" />
//       </Stack>
//     </Providers>
//   );
// }


// import { useEffect } from "react";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import {
//   useFonts,
//   Outfit_400Regular,
//   Outfit_500Medium,
//   Outfit_600SemiBold,
//   Outfit_700Bold,
// } from "@expo-google-fonts/outfit";
// import * as SplashScreen from "expo-splash-screen";
// import NetInfo from "@react-native-community/netinfo";
// import { useAppStore } from "../store/appStore";
// import { Providers } from "../components/Providers";
// import { Colors } from "../constants/colors";
// import { syncOfflineStore } from "../services/offlineStore";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const onboarded = useAppStore((s) => s.onboarded);

//   const [fontsLoaded] = useFonts({
//     Outfit_400Regular,
//     Outfit_500Medium,
//     Outfit_600SemiBold,
//     Outfit_700Bold,
//   });

//   // Secure dynamic navigation routing effect
//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
      
//       // Delay navigation to the next macro-task tick to guarantee Expo Router is fully mounted
//       if (!onboarded) {
//         const timer = setTimeout(() => {
//           router.replace("/onboarding");
//         }, 1);
//         return () => clearTimeout(timer);
//       }
//     }
//   }, [fontsLoaded, onboarded]);

//   // Protected network mutation synchronization engine
//   useEffect(() => {
//     let isInitialMount = true;

//     const unsubscribe = NetInfo.addEventListener((state) => {
//       // Intercept the initial listener snapshot fire to save processing power on boot
//       if (isInitialMount) {
//         isInitialMount = false;
//         return;
//       }

//       // Explicit true check — isInternetReachable can be null on Android platforms
//       if (state.isConnected && state.isInternetReachable === true) {
//         syncOfflineStore().catch((err) => {
//           console.error("Background data sync transaction execution failed:", err);
//         });
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   if (!fontsLoaded) return null;

//   return (
//     <Providers>
//       <StatusBar style="light" backgroundColor={Colors.earth} />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="onboarding" />
//         <Stack.Screen name="(tabs)" />
//       </Stack>
//     </Providers>
//   );
// }


// import { useEffect } from "react";
// import { Platform, StatusBar as RNStatusBar } from "react-native";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import {
//   useFonts,
//   Outfit_400Regular,
//   Outfit_500Medium,
//   Outfit_600SemiBold,
//   Outfit_700Bold,
// } from "@expo-google-fonts/outfit";
// import * as SplashScreen from "expo-splash-screen";
// import NetInfo from "@react-native-community/netinfo";
// import { useAppStore } from "../store/appStore";
// import { Providers } from "../components/Providers";
// import { Colors } from "../constants/colors";
// import { syncOfflineStore } from "../services/offlineStore";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const onboarded = useAppStore((s) => s.onboarded);

//   const [fontsLoaded] = useFonts({
//     Outfit_400Regular,
//     Outfit_500Medium,
//     Outfit_600SemiBold,
//     Outfit_700Bold,
//   });

//   // Secure dynamic navigation routing effect
//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
      
//       // Native Android hardware configuration mapping
//       if (Platform.OS === "android") {
//         RNStatusBar.setBackgroundColor(Colors.earth);
//         RNStatusBar.setBarStyle("light-content");
//       }
      
//       // Delay navigation to the next macro-task tick to guarantee Expo Router is fully mounted
//       if (!onboarded) {
//         const timer = setTimeout(() => {
//           router.replace("/onboarding");
//         }, 1);
//         return () => clearTimeout(timer);
//       }
//     }
//   }, [fontsLoaded, onboarded]);

//   // Protected network mutation synchronization engine
//   useEffect(() => {
//     let isInitialMount = true;

//     const unsubscribe = NetInfo.addEventListener((state) => {
//       // Intercept the initial listener snapshot fire to save processing power on boot
//       if (isInitialMount) {
//         isInitialMount = false;
//         return;
//       }

//       // Explicit true check — isInternetReachable can be null on Android platforms
//       if (state.isConnected && state.isInternetReachable === true) {
//         syncOfflineStore().catch((err) => {
//           console.error("Background data sync transaction execution failed:", err);
//         });
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   if (!fontsLoaded) return null;

//   return (
//     <Providers>
//       {/* Fixed: Removed the cross-platform invalid backgroundColor property to solve TS(2322) */}
//       <StatusBar style="light" />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="onboarding" />
//         <Stack.Screen name="(tabs)" />
//       </Stack>
//     </Providers>
//   );
// }




/**
 * JaundiCare — Root Layout Engine (Production Ready)
 * Orchestrates cross-platform status bars, handles conditional boot-time routing loops,
 * manages offline queue network synchronizations, and declares the total structural screen stack manifest.
 */

import { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import NetInfo from "@react-native-community/netinfo";
import { useAppStore } from "../store/appStore";
import { Providers } from "../components/Providers";
import { Colors } from "../constants/colors";
import { syncOfflineStore } from "../services/offlineStoreSecure";
import { useAuth } from "../hooks/useAuth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const onboarded = useAppStore((s) => s.onboarded); // Zustand store uses a selector function
  const { isAuthenticated, isHydrated, refreshSessionInBackground } = useAuth();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  // Secure dynamic navigation routing effect
  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      SplashScreen.hideAsync();
      
      // Native Android status bar theme synchronization
      if (Platform.OS === "android") {
        RNStatusBar.setBackgroundColor(Colors.earth || "#000000");
        RNStatusBar.setBarStyle("light-content");
      }
      
      // Enqueue routing evaluation to the next macro-task tick to guarantee Expo Router is fully mounted
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          router.replace("/auth/phone");
        } else if (!onboarded) {
          router.replace("/onboarding");
        } else {
          // User is onboarded and authenticated, push safely to dashboard destination
          router.replace("/(tabs)");
        }
      }, 1);
      
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, isAuthenticated, isHydrated, onboarded]);

  // Protected network mutation synchronization engine
  useEffect(() => {
    if (!isAuthenticated) return;

    let isInitialMount = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      // Intercept the initial listener snapshot fire to save processing power on boot
      if (isInitialMount) {
        isInitialMount = false;
        if (state.isConnected && state.isInternetReachable === true) {
          refreshSessionInBackground().then((refreshed) => {
            if (refreshed) {
              return syncOfflineStore();
            }
          }).catch((error) => {
            console.error("Initial session refresh failed:", error);
          });
        }
        return;
      }

      // Explicit true check — isInternetReachable can be null on Android platforms
      if (state.isConnected && state.isInternetReachable === true) {
        syncOfflineStore().catch((err) => {
          console.error("Background data sync transaction execution failed:", err);
        });
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  if (!fontsLoaded || !isHydrated) return null;

  return (
    <Providers>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Core Auth & Core Application Navigation Gateways */}
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />

        {/* Clinical Overlays Configured as Focused Modals */}
        <Stack.Screen 
          name="nomogram" 
          options={{ 
            presentation: "modal",
            animation: "slide_from_bottom"
          }} 
        />
        <Stack.Screen 
          name="care" 
          options={{ 
            presentation: "modal",
            animation: "slide_from_bottom"
          }} 
        />
        <Stack.Screen 
          name="analytics" 
          options={{ 
            presentation: "card",
            animation: "slide_from_right"
          }} 
        />
      </Stack>
    </Providers>
  );
}
