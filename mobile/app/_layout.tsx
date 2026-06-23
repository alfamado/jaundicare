import { useEffect } from "react";
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
import { useAppStore } from "../store/appStore";
import { Providers } from "../components/Providers";
import { Colors } from "../constants/colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const onboarded = useAppStore((s) => s.onboarded);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      if (!onboarded) {
        router.replace("/onboarding");
      }
    }
  }, [fontsLoaded, onboarded]);

  if (!fontsLoaded) return null;

  return (
    <Providers>
      <StatusBar style="light" backgroundColor={Colors.earth} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)"     />
      </Stack>
    </Providers>
  );
}
