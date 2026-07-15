// /**
//  * JaundiCare — OTP Verification Screen
//  * 6-digit code entry with countdown timer and resend option.
//  */

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View, Text, TextInput, TouchableOpacity,
//   StyleSheet, ActivityIndicator,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { API_BASE_URL } from "../../services/api";
// import { useAuth } from "../../hooks/useAuth";

// const OTP_LENGTH   = 6;
// const RESEND_SECS  = 60;

// export default function OTPScreen() {
//   const { phone }    = useLocalSearchParams<{ phone: string }>();
//   const { login }    = useAuth();

//   const [code,      setCode]      = useState("");
//   const [loading,   setLoading]   = useState(false);
//   const [error,     setError]     = useState("");
//   const [countdown, setCountdown] = useState(RESEND_SECS);
//   const [resending, setResending] = useState(false);
//   const inputRef = useRef<TextInput>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval>>();

//   useEffect(() => {
//     startCountdown();
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, []);

//   const startCountdown = () => {
//     setCountdown(RESEND_SECS);
//     timerRef.current = setInterval(() => {
//       setCountdown((c) => {
//         if (c <= 1) { clearInterval(timerRef.current); return 0; }
//         return c - 1;
//       });
//     }, 1000);
//   };

//   const handleCodeChange = (value: string) => {
//     const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
//     setCode(digits);
//     setError("");
//     if (digits.length === OTP_LENGTH) verify(digits);
//   };

//   const verify = async (otp: string) => {
//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ phone_number: phone, code: otp }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.detail ?? "Verification failed. Please try again.");
//         setCode("");
//         return;
//       }

//       await login(data);

//       // New user → onboarding, existing user → dashboard
//       if (data.is_new_user) {
//         router.replace("/onboarding");
//       } else {
//         router.replace("/(tabs)");
//       }
//     } catch {
//       setError("Network error. Please check your connection.");
//       setCode("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resendOTP = async () => {
//     setResending(true);
//     setError("");
//     setCode("");

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ phone_number: phone }),
//       });

//       if (res.ok) {
//         startCountdown();
//       } else {
//         const data = await res.json();
//         setError(data.detail ?? "Could not resend OTP.");
//       }
//     } catch {
//       setError("Network error. Please try again.");
//     } finally {
//       setResending(false);
//     }
//   };

//   const maskedPhone = phone
//     ? `${phone.slice(0, 4)} *** ${phone.slice(-4)}`
//     : "";

//   return (
//     <SafeAreaView style={s.safe}>
//       <View style={s.container}>
//         <TouchableOpacity style={s.back} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={22} color={Colors.earth} />
//         </TouchableOpacity>

//         <View style={s.iconWrap}>
//           <Ionicons name="phone-portrait-outline" size={34} color={Colors.coral} />
//         </View>

//         <Text style={s.title}>Enter verification code</Text>
//         <Text style={s.sub}>
//           We sent a 6-digit code to{"\n"}
//           <Text style={s.phone}>{maskedPhone}</Text>
//         </Text>

//         {/* OTP input */}
//         <TouchableOpacity style={s.codeWrap} onPress={() => inputRef.current?.focus()} activeOpacity={1}>
//           {Array.from({ length: OTP_LENGTH }).map((_, i) => (
//             <View
//               key={i}
//               style={[
//                 s.codeBox,
//                 code.length === i && s.codeBoxActive,
//                 code.length > i && s.codeBoxFilled,
//               ]}
//             >
//               <Text style={s.codeText}>{code[i] ?? ""}</Text>
//             </View>
//           ))}
//         </TouchableOpacity>

//         {/* Hidden input captures keystrokes */}
//         <TextInput
//           ref={inputRef}
//           value={code}
//           onChangeText={handleCodeChange}
//           keyboardType="number-pad"
//           maxLength={OTP_LENGTH}
//           style={s.hiddenInput}
//           autoFocus
//         />

//         {loading && (
//           <View style={s.verifying}>
//             <ActivityIndicator color={Colors.coral} size="small" />
//             <Text style={s.verifyingText}>Verifying...</Text>
//           </View>
//         )}

//         {error !== "" && (
//           <View style={s.errorWrap}>
//             <Ionicons name="alert-circle-outline" size={14} color={Colors.rust} />
//             <Text style={s.errorText}>{error}</Text>
//           </View>
//         )}

//         {/* Resend */}
//         <View style={s.resendRow}>
//           {countdown > 0 ? (
//             <Text style={s.countdownText}>Resend code in {countdown}s</Text>
//           ) : (
//             <TouchableOpacity onPress={resendOTP} disabled={resending}>
//               {resending
//                 ? <ActivityIndicator size="small" color={Colors.coral} />
//                 : <Text style={s.resendText}>Resend code</Text>
//               }
//             </TouchableOpacity>
//           )}
//         </View>

//         <Text style={s.disclaimer}>
//           Did not receive it? Check your SMS inbox or wait for the timer to resend.
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:      { flex: 1, backgroundColor: Colors.background },
//   container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
//   back:      { position: "absolute", top: 16, left: 16, padding: 8 },
//   iconWrap: {
//     width: 72, height: 72, borderRadius: 36,
//     borderWidth: 2, borderColor: Colors.coral,
//     backgroundColor: Colors.cream,
//     alignItems: "center", justifyContent: "center", marginBottom: 24,
//   },
//   title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.earth, textAlign: "center", marginBottom: 10 },
//   sub:   { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight, textAlign: "center", lineHeight: 22, marginBottom: 32 },
//   phone: { fontFamily: Fonts.semibold, color: Colors.earth },
//   codeWrap: { flexDirection: "row", gap: 10, marginBottom: 8 },
//   codeBox: {
//     width: 46, height: 56, borderRadius: Radius.md,
//     borderWidth: 1.5, borderColor: Colors.border,
//     backgroundColor: Colors.card, alignItems: "center", justifyContent: "center",
//   },
//   codeBoxActive: { borderColor: Colors.coral, borderWidth: 2 },
//   codeBoxFilled: { borderColor: Colors.earth, backgroundColor: Colors.cream },
//   codeText:   { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth },
//   hiddenInput:{ position: "absolute", opacity: 0, width: 1, height: 1 },
//   verifying:  { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
//   verifyingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },
//   errorWrap: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     backgroundColor: Colors.rustPale, borderRadius: Radius.md,
//     padding: 10, marginTop: 12, width: "100%",
//   },
//   errorText:     { fontFamily: Fonts.medium, fontSize: 13, color: Colors.rust, flex: 1 },
//   resendRow:     { marginTop: 24 },
//   countdownText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
//   resendText:    { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.coral },
//   disclaimer:    { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center", lineHeight: 17, marginTop: 24, maxWidth: 280 },
// });






/**
 * JaundiCare — OTP Verification Screen (High-Scale Production Ready)
 * Out-of-bounds positioning for background inputs to guarantee keyboard engagement,
 * async operation locking, and proactive memory leak cleanup routines.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
import { useAppStore } from "../../store/appStore";
import { API_BASE_URL } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useTranslations } from "../../hooks/useTranslations";

const OTP_LENGTH   = 6;
const RESEND_SECS  = 60;

export default function OTPScreen() {
  const { phone, demo } = useLocalSearchParams<{ phone: string; demo?: string }>();
  const { login }    = useAuth();
  const { t } = useTranslations();

  const [code, setCode]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [countdown, setCountdown] = useState(RESEND_SECS);
  const [resending, setResending] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Extract ongoing app states cleanly
  const currentLanguage = useAppStore((s) => s.language) || "en";
  const onboardingComplete = useAppStore((s) => s.onboarded);
  const isDemo = demo === "1";

  useEffect(() => {
    startCountdown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(RESEND_SECS);
    
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (value: string) => {
    if (loading) return; // Ignore incoming modifications while request is parsing
    
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(digits);
    setError("");
    
    if (digits.length === OTP_LENGTH) {
      verify(digits);
    }
  };

  const verify = async (otp: string) => {
    // Clear active intervals immediately to avoid updates mid-navigation
    if (timerRef.current) clearInterval(timerRef.current);
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone_number: phone, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail ?? "Verification failed. Please try again.");
        setCode("");
        startCountdown(); // Resume timing parameters smoothly if verify errors out
        return;
      }

      await login(data);

      router.replace(
        data.role === "health_worker" ? "/(tabs)/chw" : "/(tabs)/screening",
      );
    } catch {
      setError(t("ui.auth.network_error"));
      setCode("");
      startCountdown();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);
    setError("");
    setCode("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ 
          phone_number: phone,
          role: "parent",
          language: currentLanguage
        }),
      });

      if (res.ok) {
        startCountdown();
      } else {
        const data = await res.json();
        setError(data.detail ?? "Could not resend OTP.");
      }
    } catch {
      setError(t("ui.auth.retry_network"));
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone
    ? `${phone.slice(0, 4)} *** ${phone.slice(-4)}`
    : "";

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <TouchableOpacity style={s.back} onPress={() => router.back()} disabled={loading}>
          <Ionicons name="arrow-back" size={22} color={Colors.earth} />
        </TouchableOpacity>

        <View style={s.iconWrap}>
          <Ionicons name="phone-portrait-outline" size={34} color={Colors.coral} />
        </View>

        <Text style={s.title}>{t("ui.auth.enter_code")}</Text>
        <Text style={s.sub}>
          {isDemo ? t("ui.auth.demo_code") : t("ui.auth.sent_code")}{"\n"}
          <Text style={s.phone}>{maskedPhone}</Text>
        </Text>

        <TouchableOpacity 
          style={s.codeWrap} 
          onPress={() => inputRef.current?.focus()} 
          activeOpacity={1}
          disabled={loading}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                s.codeBox,
                code.length === i && s.codeBoxActive,
                code.length > i && s.codeBoxFilled,
              ]}
            >
              <Text style={s.codeText}>{code[i] ?? ""}</Text>
            </View>
          ))}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          style={s.hiddenInput}
          editable={!loading}
          autoFocus
        />

        {loading && (
          <View style={s.verifying}>
            <ActivityIndicator color={Colors.coral} size="small" />
            <Text style={s.verifyingText}>{t("ui.auth.verifying")}</Text>
          </View>
        )}

        {error !== "" && (
          <View style={s.errorWrap}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.rust} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <View style={s.resendRow}>
          {countdown > 0 ? (
            <Text style={s.countdownText}>{t("ui.auth.resend_in", { seconds: countdown })}</Text>
          ) : (
            <TouchableOpacity onPress={resendOTP} disabled={resending || loading}>
              {resending ? (
                <ActivityIndicator size="small" color={Colors.coral} />
              ) : (
                <Text style={s.resendText}>{t("ui.auth.resend")}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={s.disclaimer}>
          {isDemo
            ? t("ui.auth.demo_hint")
            : t("ui.auth.sms_hint")}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  back:      { position: "absolute", top: 16, left: 16, padding: 8 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: Colors.coral,
    backgroundColor: Colors.cream,
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.earth, textAlign: "center", marginBottom: 10 },
  sub:   { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  phone: { fontFamily: Fonts.semibold, color: Colors.earth },
  codeWrap: { flexDirection: "row", gap: 10, marginBottom: 8 },
  codeBox: {
    width: 44, height: 54, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card, alignItems: "center", justifyContent: "center",
  },
  codeBoxActive: { borderColor: Colors.coral, borderWidth: 2 },
  codeBoxFilled: { borderColor: Colors.earth, backgroundColor: Colors.cream },
  codeText:   { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth },
  
  // Safe responsive alternative to hidden sizing styles that break keyboard loops
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: -10000,
    width: 200,
    height: 40,
  },
  
  verifying:     { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  verifyingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },
  errorWrap: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.rustPale, borderRadius: Radius.md,
    padding: 10, marginTop: 12, width: "100%",
  },
  errorText:     { fontFamily: Fonts.medium, fontSize: 13, color: Colors.rust, flex: 1 },
  resendRow:     { marginTop: 24 },
  countdownText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
  resendText:    { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.coral },
  disclaimer:    { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center", lineHeight: 17, marginTop: 24, maxWidth: 280 },
});
