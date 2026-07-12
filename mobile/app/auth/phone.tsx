// /**
//  * JaundiCare — Phone Entry Screen
//  * User enters their Nigerian phone number to receive OTP.
//  */

// import React, { useState } from "react";
// import {
//   View, Text, TextInput, TouchableOpacity,
//   StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
// } from "react-native";
// import { router } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { API_BASE_URL } from "../../services/api";

// export default function PhoneScreen() {
//   const [phone,   setPhone]   = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState("");

//   const formatDisplay = (value: string) => {
//     // Strip non-digits
//     const digits = value.replace(/\D/g, "");
//     // Format as 0801 234 5678
//     if (digits.length <= 4) return digits;
//     if (digits.length <= 7) return `${digits.slice(0,4)} ${digits.slice(4)}`;
//     return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7,11)}`;
//   };

//   const handleChange = (value: string) => {
//     const digits = value.replace(/\D/g, "").slice(0, 11);
//     setPhone(digits);
//     setError("");
//   };

//   const isValid = phone.length === 11 && phone.startsWith("0");

//   const requestOTP = async () => {
//     if (!isValid) {
//       setError("Enter a valid 11-digit Nigerian phone number starting with 0.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ phone_number: phone }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.detail ?? "Could not send OTP. Please try again.");
//         return;
//       }

//       router.push({ pathname: "/auth/otp", params: { phone } });
//     } catch {
//       setError("Network error. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       <KeyboardAvoidingView
//         style={s.container}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <View style={s.iconWrap}>
//           <Ionicons name="water" size={34} color={Colors.coral} />
//         </View>

//         <Text style={s.title}>Welcome to JaundiCare</Text>
//         <Text style={s.sub}>Enter your phone number to get started. We'll send you a verification code.</Text>

//         <View style={s.inputWrap}>
//           <View style={s.prefix}>
//             <Text style={s.prefixText}>🇳🇬 +234</Text>
//           </View>
//           <TextInput
//             style={s.input}
//             value={formatDisplay(phone)}
//             onChangeText={handleChange}
//             keyboardType="phone-pad"
//             placeholder="0801 234 5678"
//             placeholderTextColor={Colors.brownLight}
//             maxLength={13}
//             autoFocus
//           />
//         </View>

//         {error !== "" && (
//           <View style={s.errorWrap}>
//             <Ionicons name="alert-circle-outline" size={14} color={Colors.rust} />
//             <Text style={s.errorText}>{error}</Text>
//           </View>
//         )}

//         <TouchableOpacity
//           style={[s.btn, (!isValid || loading) && { opacity: 0.5 }]}
//           onPress={requestOTP}
//           disabled={!isValid || loading}
//         >
//           {loading
//             ? <ActivityIndicator color="#fff" />
//             : <Text style={s.btnText}>Send verification code</Text>
//           }
//         </TouchableOpacity>

//         <Text style={s.disclaimer}>
//           Your phone number is used only for verification. We never share it with third parties.
//         </Text>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:      { flex: 1, backgroundColor: Colors.background },
//   container: { flex: 1, padding: 24, justifyContent: "center" },
//   iconWrap: {
//     width: 72, height: 72, borderRadius: 36,
//     borderWidth: 2, borderColor: Colors.coral,
//     backgroundColor: Colors.cream,
//     alignItems: "center", justifyContent: "center",
//     alignSelf: "center", marginBottom: 24,
//   },
//   title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.earth, textAlign: "center", marginBottom: 10 },
//   sub:   { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight, textAlign: "center", lineHeight: 22, marginBottom: 32 },
//   inputWrap: {
//     flexDirection: "row", alignItems: "center",
//     borderWidth: 1.5, borderColor: Colors.border,
//     borderRadius: Radius.lg, overflow: "hidden",
//     backgroundColor: Colors.card, marginBottom: 12, ...Shadow.sm,
//   },
//   prefix:     { paddingHorizontal: 14, paddingVertical: 16, borderRightWidth: 1, borderRightColor: Colors.border },
//   prefixText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
//   input: {
//     flex: 1, padding: 14,
//     fontFamily: Fonts.regular, fontSize: 16, color: Colors.earth,
//     letterSpacing: 1,
//   },
//   errorWrap: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     backgroundColor: Colors.rustPale, borderRadius: Radius.md,
//     padding: 10, marginBottom: 12,
//   },
//   errorText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.rust, flex: 1 },
//   btn: {
//     backgroundColor: Colors.coral, borderRadius: Radius.lg,
//     padding: 16, alignItems: "center", marginBottom: 16, ...Shadow.md,
//   },
//   btnText:     { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
//   disclaimer:  { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center", lineHeight: 17 },
// });



/**
 * JaundiCare — Phone Entry Screen (High-Scale Production Ready)
 * Standardizes E.164 serialization, handles input masking gracefully without digit truncation,
 * and tracks contextual roles and languages safely.
 */

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
import { useAppStore } from "../../store/appStore"; 
import { API_BASE_URL } from "../../services/api";

export default function PhoneScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Safely inherit local user configuration options from the Zustand state layer
  const currentLanguage = useAppStore((s) => s.language) || "en";
  const onboardingRole = useAppStore((s) => s.onboarded) ? "parent" : "parent"; // Map to system defaults if needed

  const formatDisplay = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  };

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setPhone(digits);
    setError("");
  };

  const isValid = phone.length === 11 && phone.startsWith("0");

  const requestOTP = async () => {
    if (!isValid) {
      setError("Enter a valid 11-digit Nigerian phone number starting with 0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ 
          phone_number: phone,
          role: onboardingRole,
          language: currentLanguage
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail ?? "Could not send OTP. Please try again.");
        return;
      }

      router.push({ pathname: "./auth/otp", params: { phone } });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={s.scrollContainer}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.iconWrap}>
            <Ionicons name="water" size={34} color={Colors.coral} />
          </View>

          <Text style={s.title}>Welcome to JaundiCare</Text>
          <Text style={s.sub}>
            Enter your phone number to get started. We'll send you a verification code.
          </Text>

          <View style={s.inputWrap}>
            <View style={s.prefix}>
              <Text style={s.prefixText}>🇳🇬 +234</Text>
            </View>
            <TextInput
              style={s.input}
              value={formatDisplay(phone)}
              onChangeText={handleChange}
              keyboardType="phone-pad"
              placeholder="0801 234 5678"
              placeholderTextColor={Colors.brownLight}
              maxLength={14} // Adjusted to 14 to allow space characters without stripping native digits
              autoFocus
            />
          </View>

          {error !== "" && (
            <View style={s.errorWrap}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.rust} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.btn, (!isValid || loading) && { opacity: 0.5 }]}
            onPress={requestOTP}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Send verification code</Text>
            )}
          </TouchableOpacity>

          <Text style={s.disclaimer}>
            Your phone number is used only for verification. We never share it with third parties.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.background },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: "center" },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: Colors.coral,
    backgroundColor: Colors.cream,
    alignItems: "center", justifyContent: "center",
    alignSelf: "center", marginBottom: 24,
  },
  title:      { fontFamily: Fonts.bold, fontSize: 24, color: Colors.earth, textAlign: "center", marginBottom: 10 },
  sub:        { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.lg, overflow: "hidden",
    backgroundColor: Colors.card, marginBottom: 12, ...Shadow.sm,
  },
  prefix:     { paddingHorizontal: 14, paddingVertical: 16, borderRightWidth: 1, borderRightColor: Colors.border },
  prefixText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
  input: {
    flex: 1, padding: 14,
    fontFamily: Fonts.regular, fontSize: 16, color: Colors.earth,
    letterSpacing: 1,
  },
  errorWrap: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.rustPale, borderRadius: Radius.md,
    padding: 10, marginBottom: 12,
  },
  errorText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.rust, flex: 1 },
  btn: {
    backgroundColor: Colors.coral, borderRadius: Radius.lg,
    padding: 16, alignItems: "center", marginBottom: 16, ...Shadow.md,
  },
  btnText:     { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
  disclaimer:  { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center", lineHeight: 17 },
});