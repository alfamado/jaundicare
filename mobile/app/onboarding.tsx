// import React, { useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, Dimensions,
// } from "react-native";
// import { router } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../store/appStore";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// const { width } = Dimensions.get("window");

// type Role = "parent" | "health_worker";

// const steps = [
//   {
//     icon:  "water" as const,
//     color: Colors.coral,
//     title: "Welcome to JaundiCare",
//     body:  "JaundiCare helps parents and health workers detect newborn jaundice early using AI-assisted image screening, symptom triage, and referral support.",
//     note:  "This is a screening support tool. It does not replace a doctor, midwife, or bilirubin test.",
//   },
//   {
//     icon:  "people" as const,
//     color: Colors.amber,
//     title: "Who are you?",
//     body:  "This helps us show the most relevant experience for you.",
//   },
//   {
//     icon:  "checkmark-circle" as const,
//     color: Colors.sage,
//     title: "You are all set",
//     body:  "Start by creating a baby profile so the app can track age automatically, then run your first screening.",
//   },
// ];

// export default function OnboardingScreen() {
//   const [step, setStep]   = useState(0);
//   const [role, setRole]   = useState<Role | null>(null);
//   const finishOnboarding  = useAppStore((s) => s.finishOnboarding);

//   const goNext = () => {
//     if (step < 2) setStep(step + 1);
//   };

//   const finish = () => {
//     if (!role) return;
//     finishOnboarding(role);
//     router.replace(role === "health_worker" ? "/(tabs)/chw" : "/(tabs)/profile");
//   };

//   const current = steps[step];

//   return (
//     <SafeAreaView style={s.safe}>
//       <View style={s.container}>

//         {/* Icon */}
//         <View style={[s.iconWrap, { backgroundColor: current.color + "18", borderColor: current.color }]}>
//           <Ionicons name={current.icon} size={36} color={current.color} />
//         </View>

//         {/* Text */}
//         <Text style={s.title}>{current.title}</Text>
//         <Text style={s.body}>{current.body}</Text>

//         {/* Step 1 disclaimer */}
//         {step === 0 && (
//           <View style={s.note}>
//             <Ionicons name="shield-checkmark-outline" size={14} color={Colors.brownLight} />
//             <Text style={s.noteText}>{current.note}</Text>
//           </View>
//         )}

//         {/* Step 2 role selection */}
//         {step === 1 && (
//           <View style={s.roleGrid}>
//             {([
//               {
//                 key:      "parent" as Role,
//                 icon:     "person-outline" as const,
//                 title:    "Parent or caregiver",
//                 subtitle: "I want to monitor my baby's health",
//               },
//               {
//                 key:      "health_worker" as Role,
//                 icon:     "medkit-outline" as const,
//                 title:    "Health worker or CHW",
//                 subtitle: "I support newborn care in the community",
//               },
//             ]).map((option) => (
//               <TouchableOpacity
//                 key={option.key}
//                 style={[s.roleCard, role === option.key && s.roleCardSelected]}
//                 onPress={() => { setRole(option.key); goNext(); }}
//               >
//                 <Ionicons
//                   name={option.icon}
//                   size={28}
//                   color={role === option.key ? Colors.coral : Colors.brownLight}
//                 />
//                 <Text style={[s.roleTitle, role === option.key && { color: Colors.coral }]}>
//                   {option.title}
//                 </Text>
//                 <Text style={s.roleSub}>{option.subtitle}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {/* Step 3 action list */}
//         {step === 2 && (
//           <View style={s.actionList}>
//             {[
//               role === "health_worker" ? "Open Community Care Mode" : "Create a baby profile",
//               role === "health_worker" ? "Start an assisted screening" : "Run a screening",
//               role === "health_worker" ? "Track follow-up reminders" : "View your result and next steps",
//             ].map((action, i) => (
//               <View key={i} style={s.actionRow}>
//                 <View style={s.actionNum}>
//                   <Text style={s.actionNumText}>{i + 1}</Text>
//                 </View>
//                 <Text style={s.actionText}>{action}</Text>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* Progress dots */}
//         <View style={s.dots}>
//           {[0, 1, 2].map((i) => (
//             <View key={i} style={[s.dot, step === i && s.dotActive]} />
//           ))}
//         </View>

//         {/* CTA */}
//         {step === 0 && (
//           <TouchableOpacity style={s.primaryBtn} onPress={goNext}>
//             <Text style={s.primaryBtnText}>Get started</Text>
//           </TouchableOpacity>
//         )}

//         {step === 2 && role && (
//           <TouchableOpacity style={s.primaryBtn} onPress={finish}>
//             <Text style={s.primaryBtnText}>Open JaundiCare</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:      { flex: 1, backgroundColor: Colors.background },
//   container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },

//   iconWrap: {
//     width: 88, height: 88,
//     borderRadius: 44,
//     borderWidth: 1.5,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 24,
//   },

//   title: {
//     fontFamily: Fonts.bold,
//     fontSize:   24,
//     color:      Colors.earth,
//     textAlign:  "center",
//     marginBottom: 12,
//   },
//   body: {
//     fontFamily: Fonts.regular,
//     fontSize:   15,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//     lineHeight: 24,
//     marginBottom: 20,
//     maxWidth:   320,
//   },

//   note: {
//     flexDirection:   "row",
//     gap:             8,
//     backgroundColor: Colors.amberPale,
//     borderRadius:    Radius.md,
//     padding:         12,
//     alignItems:      "flex-start",
//     marginBottom:    20,
//   },
//   noteText: {
//     fontFamily: Fonts.medium,
//     fontSize:   13,
//     color:      Colors.brownLight,
//     flex:       1,
//     lineHeight: 20,
//   },

//   roleGrid:     { width: "100%", gap: 12, marginBottom: 20 },
//   roleCard: {
//     backgroundColor: Colors.card,
//     borderRadius:    Radius.lg,
//     padding:         16,
//     alignItems:      "center",
//     borderWidth:     1.5,
//     borderColor:     Colors.border,
//     ...Shadow.sm,
//   },
//   roleCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   roleTitle: {
//     fontFamily:   Fonts.semibold,
//     fontSize:     15,
//     color:        Colors.earth,
//     marginTop:    10,
//     marginBottom: 4,
//     textAlign:    "center",
//   },
//   roleSub: {
//     fontFamily: Fonts.regular,
//     fontSize:   13,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//   },

//   actionList:   { width: "100%", gap: 10, marginBottom: 24 },
//   actionRow:    { flexDirection: "row", alignItems: "center", gap: 12 },
//   actionNum: {
//     width:           28,
//     height:          28,
//     borderRadius:    14,
//     backgroundColor: Colors.coral,
//     alignItems:      "center",
//     justifyContent:  "center",
//   },
//   actionNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   actionText:    { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   dots:    { flexDirection: "row", gap: 6, marginBottom: 28 },
//   dot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
//   dotActive:{ backgroundColor: Colors.coral, width: 20 },

//   primaryBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius:    Radius.lg,
//     paddingVertical: 14,
//     paddingHorizontal: 40,
//     ...Shadow.md,
//   },
//   primaryBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
// });




/**
 * JaundiCare — Onboarding Screen (v2)
 * Step 1: Language selection + welcome audio
 * Step 2: Role selection (parent / health worker)
 * Step 3: You are all set
 */

// import React, { useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet,
// } from "react-native";
// import { router } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../store/appStore";
// import { useWelcomeAudio } from "../hooks/useAudio";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// type Role = "parent" | "health_worker";

// const LANGUAGES = [
//   { key: "en",  label: "English",          native: "English"      },
//   { key: "yo",  label: "Yoruba",           native: "Yorùbá"       },
//   { key: "ha",  label: "Hausa",            native: "Hausa"        },
//   { key: "ig",  label: "Igbo",             native: "Igbo"         },
//   { key: "pcm", label: "Nigerian Pidgin",  native: "Naija Pidgin" },
// ];

// export default function OnboardingScreen() {
//   const [step, setStep]     = useState(0);
//   const [role, setRole]     = useState<Role | null>(null);
//   const [lang, setLang]     = useState("en");

//   const finishOnboarding = useAppStore((s) => s.finishOnboarding);
//   const setLanguage      = useAppStore((s) => s.setLanguage);
//   const { playWelcome, stopAudio } = useWelcomeAudio();

//   const selectLanguage = (key: string) => {
//     setLang(key);
//     setLanguage(key);
//     playWelcome(key);
//   };

//   const goNext = () => setStep((s) => s + 1);

//   const finish = () => {
//     if (!role) return;
//     stopAudio();
//     finishOnboarding(role);
//     router.replace(role === "health_worker" ? "/(tabs)/chw" : "/(tabs)/profile");
//   };

//   // ── Step 0: Language selection ──────────────────────────────
//   if (step === 0) {
//     return (
//       <SafeAreaView style={s.safe}>
//         <View style={s.container}>
//           <View style={s.iconWrap}>
//             <Ionicons name="water" size={34} color={Colors.coral} />
//           </View>

//           <Text style={s.title}>Welcome to JaundiCare</Text>
//           <Text style={s.sub}>Choose your language</Text>
//           <Text style={s.sub2}>Tap to hear a welcome message</Text>

//           <View style={s.langGrid}>
//             {LANGUAGES.map((l) => (
//               <TouchableOpacity
//                 key={l.key}
//                 style={[s.langCard, lang === l.key && s.langCardSelected]}
//                 onPress={() => selectLanguage(l.key)}
//               >
//                 <Text style={[s.langLabel, lang === l.key && { color: Colors.coral }]}>
//                   {l.native}
//                 </Text>
//                 <Text style={s.langSub}>{l.label}</Text>
//                 {lang === l.key && (
//                   <View style={s.langCheck}>
//                     <Ionicons name="checkmark" size={12} color="#fff" />
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <TouchableOpacity style={s.primaryBtn} onPress={goNext}>
//             <Text style={s.primaryBtnText}>Continue</Text>
//             <Ionicons name="arrow-forward" size={18} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ── Step 1: Role selection ──────────────────────────────────
//   if (step === 1) {
//     return (
//       <SafeAreaView style={s.safe}>
//         <View style={s.container}>
//           <View style={[s.iconWrap, { borderColor: Colors.amber }]}>
//             <Ionicons name="people" size={34} color={Colors.amber} />
//           </View>

//           <Text style={s.title}>Who are you?</Text>
//           <Text style={s.sub}>This helps us show the most relevant experience for you.</Text>

//           <View style={s.roleGrid}>
//             {([
//               {
//                 key:      "parent" as Role,
//                 icon:     "person-outline" as const,
//                 title:    "Parent or caregiver",
//                 subtitle: "I want to monitor my baby's health",
//               },
//               {
//                 key:      "health_worker" as Role,
//                 icon:     "medkit-outline" as const,
//                 title:    "Health worker or CHW",
//                 subtitle: "I support newborn care in the community",
//               },
//             ]).map((option) => (
//               <TouchableOpacity
//                 key={option.key}
//                 style={[s.roleCard, role === option.key && s.roleCardSelected]}
//                 onPress={() => { setRole(option.key); goNext(); }}
//               >
//                 <Ionicons
//                   name={option.icon}
//                   size={30}
//                   color={role === option.key ? Colors.coral : Colors.brownLight}
//                 />
//                 <Text style={[s.roleTitle, role === option.key && { color: Colors.coral }]}>
//                   {option.title}
//                 </Text>
//                 <Text style={s.roleSub}>{option.subtitle}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Disclaimer */}
//           <View style={s.disclaimer}>
//             <Ionicons name="shield-checkmark-outline" size={13} color={Colors.brownLight} />
//             <Text style={s.disclaimerText}>
//               This is a screening support tool. It does not replace a doctor, midwife, or bilirubin test.
//             </Text>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ── Step 2: All set ─────────────────────────────────────────
//   return (
//     <SafeAreaView style={s.safe}>
//       <View style={s.container}>
//         <View style={[s.iconWrap, { borderColor: Colors.sage }]}>
//           <Ionicons name="checkmark-circle" size={34} color={Colors.sage} />
//         </View>

//         <Text style={s.title}>You are all set</Text>
//         <Text style={s.sub}>
//           Start by creating a baby profile so the app can track age automatically, then run your first screening.
//         </Text>

//         <View style={s.stepsList}>
//           {(role === "health_worker"
//             ? ["Open Community Care Mode", "Start an assisted screening", "Track follow-up reminders"]
//             : ["Create a baby profile", "Run a screening", "View your result and next steps"]
//           ).map((item, i) => (
//             <View key={i} style={s.stepRow}>
//               <View style={s.stepNum}>
//                 <Text style={s.stepNumText}>{i + 1}</Text>
//               </View>
//               <Text style={s.stepText}>{item}</Text>
//             </View>
//           ))}
//         </View>

//         <TouchableOpacity style={s.primaryBtn} onPress={finish}>
//           <Text style={s.primaryBtnText}>Open JaundiCare</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:      { flex: 1, backgroundColor: Colors.background },
//   container: {
//     flex: 1,
//     padding: 24,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   iconWrap: {
//     width: 80, height: 80,
//     borderRadius: 40,
//     borderWidth: 2,
//     borderColor: Colors.coral,
//     backgroundColor: Colors.cream,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//   },

//   title: {
//     fontFamily: Fonts.bold,
//     fontSize: 24,
//     color: Colors.earth,
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   sub: {
//     fontFamily: Fonts.regular,
//     fontSize: 15,
//     color: Colors.brownLight,
//     textAlign: "center",
//     lineHeight: 24,
//     marginBottom: 6,
//     maxWidth: 320,
//   },
//   sub2: {
//     fontFamily: Fonts.medium,
//     fontSize: 13,
//     color: Colors.coral,
//     textAlign: "center",
//     marginBottom: 24,
//   },

//   // Language grid
//   langGrid: {
//     width: "100%",
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     justifyContent: "center",
//     marginBottom: 28,
//   },
//   langCard: {
//     width: "44%",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     backgroundColor: Colors.card,
//     ...Shadow.sm,
//   },
//   langCardSelected: {
//     borderColor: Colors.coral,
//     backgroundColor: "#fff5f2",
//   },
//   langLabel: {
//     fontFamily: Fonts.semibold,
//     fontSize: 16,
//     color: Colors.earth,
//     marginBottom: 2,
//   },
//   langSub: {
//     fontFamily: Fonts.regular,
//     fontSize: 11,
//     color: Colors.brownLight,
//   },
//   langCheck: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: Colors.coral,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   // Role cards
//   roleGrid: { width: "100%", gap: 12, marginBottom: 20 },
//   roleCard: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     ...Shadow.sm,
//   },
//   roleCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   roleTitle: {
//     fontFamily: Fonts.semibold,
//     fontSize: 16,
//     color: Colors.earth,
//     marginTop: 10,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   roleSub: {
//     fontFamily: Fonts.regular,
//     fontSize: 13,
//     color: Colors.brownLight,
//     textAlign: "center",
//   },

//   // Disclaimer
//   disclaimer: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     backgroundColor: Colors.amberPale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginTop: 4,
//   },
//   disclaimerText: {
//     fontFamily: Fonts.regular,
//     fontSize: 12,
//     color: Colors.brownLight,
//     flex: 1,
//     lineHeight: 18,
//   },

//   // Steps list
//   stepsList: { width: "100%", gap: 12, marginBottom: 28 },
//   stepRow:   { flexDirection: "row", alignItems: "center", gap: 12 },
//   stepNum: {
//     width: 28, height: 28,
//     borderRadius: 14,
//     backgroundColor: Colors.coral,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   stepText:    { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   // Primary button
//   primaryBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     paddingVertical: 14,
//     paddingHorizontal: 32,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     ...Shadow.md,
//   },
//   primaryBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
// });



// import React, { useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet,
// } from "react-native";
// import { router } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../store/appStore";
// import { useWelcomeAudio } from "../hooks/useAudio";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// type Role = "parent" | "health_worker";

// const LANGUAGES = [
//   { key: "en",  label: "English",          native: "English"      },
//   { key: "yo",  label: "Yoruba",           native: "Yorùbá"       },
//   { key: "ha",  label: "Hausa",            native: "Hausa"        },
//   { key: "ig",  label: "Igbo",             native: "Igbo"         },
//   { key: "pcm", label: "Nigerian Pidgin",  native: "Naija Pidgin" },
// ];

// export default function OnboardingScreen() {
//   const [step, setStep]     = useState(0);
//   const [role, setRole]     = useState<Role | null>(null);
//   const [lang, setLang]     = useState("en");

//   const finishOnboarding = useAppStore((s) => s.finishOnboarding);
//   const setLanguage      = useAppStore((s) => s.setLanguage);
//   const { playWelcome, stopAudio } = useWelcomeAudio();

//   const selectLanguage = (key: string) => {
//     setLang(key);
//     setLanguage(key);
//     playWelcome(key);
//   };

//   const goNext = () => {
//     // Fixed: Halt playing voice tracks immediately when navigating away from the language picker
//     stopAudio();
//     setStep((s) => s + 1);
//   };

//   const goBack = () => {
//     // Allow users to safely backtrack through selections without navigation crashes
//     stopAudio();
//     setStep((s) => Math.max(0, s - 1));
//   };

//   const finish = () => {
//     if (!role) return;
//     stopAudio();
//     finishOnboarding(role);
//     router.replace(role === "health_worker" ? "/(tabs)/chw" : "/(tabs)/profile");
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       {/* Universal Multi-Step Back Header Engine */}
//       {step > 0 && (
//         <View style={s.headerNav}>
//           <TouchableOpacity style={s.backBtn} onPress={goBack}>
//             <Ionicons name="arrow-back" size={22} color={Colors.earth} />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* ── Step 0: Language selection ────────────────────────────── */}
//       {step === 0 && (
//         <View style={s.container}>
//           <View style={s.iconWrap}>
//             <Ionicons name="water" size={34} color={Colors.coral} />
//           </View>

//           <Text style={s.title}>Welcome to JaundiCare</Text>
//           <Text style={s.sub}>Choose your language</Text>
//           <Text style={s.sub2}>Tap to hear a welcome message</Text>

//           <View style={s.langGrid}>
//             {LANGUAGES.map((l) => (
//               <TouchableOpacity
//                 key={l.key}
//                 style={[s.langCard, lang === l.key && s.langCardSelected]}
//                 onPress={() => selectLanguage(l.key)}
//               >
//                 <Text style={[s.langLabel, lang === l.key && { color: Colors.coral }]}>
//                   {l.native}
//                 </Text>
//                 <Text style={s.langSub}>{l.label}</Text>
//                 {lang === l.key && (
//                   <View style={s.langCheck}>
//                     <Ionicons name="checkmark" size={12} color="#fff" />
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <TouchableOpacity style={s.primaryBtn} onPress={goNext}>
//             <Text style={s.primaryBtnText}>Continue</Text>
//             <Ionicons name="arrow-forward" size={18} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* ── Step 1: Role selection ────────────────────────────────── */}
//       {step === 1 && (
//         <View style={s.container}>
//           <View style={[s.iconWrap, { borderColor: Colors.amber }]}>
//             <Ionicons name="people" size={34} color={Colors.amber} />
//           </View>

//           <Text style={s.title}>Who are you?</Text>
//           <Text style={s.sub}>This helps us show the most relevant experience for you.</Text>

//           <View style={s.roleGrid}>
//             {([
//               {
//                 key:      "parent" as Role,
//                 icon:     "person-outline" as const,
//                 title:    "Parent or caregiver",
//                 subtitle: "I want to monitor my baby's health",
//               },
//               {
//                 key:      "health_worker" as Role,
//                 icon:     "medkit-outline" as const,
//                 title:    "Health worker or CHW",
//                 subtitle: "I support newborn care in the community",
//               },
//             ]).map((option) => (
//               <TouchableOpacity
//                 key={option.key}
//                 style={[s.roleCard, role === option.key && s.roleCardSelected]}
//                 onPress={() => { setRole(option.key); setStep(2); }}
//               >
//                 <Ionicons
//                   name={option.icon}
//                   size={30}
//                   color={role === option.key ? Colors.coral : Colors.brownLight}
//                 />
//                 <Text style={[s.roleTitle, role === option.key && { color: Colors.coral }]}>
//                   {option.title}
//                 </Text>
//                 <Text style={s.roleSub}>{option.subtitle}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={s.disclaimer}>
//             <Ionicons name="shield-checkmark-outline" size={13} color={Colors.brownLight} />
//             <Text style={s.disclaimerText}>
//               This is a screening support tool. It does not replace a doctor, midwife, or bilirubin test.
//             </Text>
//           </View>
//         </View>
//       )}

//       {/* ── Step 2: All set ───────────────────────────────────────── */}
//       {step === 2 && (
//         <View style={s.container}>
//           <View style={[s.iconWrap, { borderColor: Colors.sage }]}>
//             <Ionicons name="checkmark-circle" size={34} color={Colors.sage} />
//           </View>

//           <Text style={s.title}>You are all set</Text>
//           <Text style={s.sub}>
//             Start by creating a baby profile so the app can track age automatically, then run your first screening.
//           </Text>

//           <View style={s.stepsList}>
//             {(role === "health_worker"
//               ? ["Open Community Care Mode", "Start an assisted screening", "Track follow-up reminders"]
//               : ["Create a baby profile", "Run a screening", "View your result and next steps"]
//             ).map((item, i) => (
//               <View key={i} style={s.stepRow}>
//                 <View style={s.stepNum}>
//                   <Text style={s.stepNumText}>{i + 1}</Text>
//                 </View>
//                 <Text style={s.stepText}>{item}</Text>
//               </View>
//             ))}
//           </View>

//           <TouchableOpacity style={s.primaryBtn} onPress={finish}>
//             <Text style={s.primaryBtnText}>Open JaundiCare</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:      { flex: 1, backgroundColor: Colors.background },
//   headerNav: {
//     width: "100%",
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     position: "absolute",
//     top: 50, // Accounts cleanly for iOS Dynamic Islands or standard Android notches below safe bounds
//     zIndex: 10,
//   },
//   backBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: Colors.card,
//     ...Shadow.sm,
//   },
//   container: {
//     flex: 1,
//     padding: 24,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconWrap: {
//     width: 80, height: 80,
//     borderRadius: 40,
//     borderWidth: 2,
//     borderColor: Colors.coral,
//     backgroundColor: Colors.cream,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//   },
//   title: {
//     fontFamily: Fonts.bold,
//     fontSize: 24,
//     color: Colors.earth,
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   sub: {
//     fontFamily: Fonts.regular,
//     fontSize: 15,
//     color: Colors.brownLight,
//     textAlign: "center",
//     lineHeight: 24,
//     marginBottom: 6,
//     maxWidth: 320,
//   },
//   sub2: {
//     fontFamily: Fonts.medium,
//     fontSize: 13,
//     color: Colors.coral,
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   langGrid: {
//     width: "100%",
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     justifyContent: "center",
//     marginBottom: 28,
//   },
//   langCard: {
//     width: "44%",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     backgroundColor: Colors.card,
//     ...Shadow.sm,
//   },
//   langCardSelected: {
//     borderColor: Colors.coral,
//     backgroundColor: "#fff5f2",
//   },
//   langLabel: {
//     fontFamily: Fonts.semibold,
//     fontSize: 16,
//     color: Colors.earth,
//     marginBottom: 2,
//   },
//   langSub: {
//     fontFamily: Fonts.regular,
//     fontSize: 11,
//     color: Colors.brownLight,
//   },
//   langCheck: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: Colors.coral,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   roleGrid: { width: "100%", gap: 12, marginBottom: 20 },
//   roleCard: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     ...Shadow.sm,
//   },
//   roleCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   roleTitle: {
//     fontFamily: Fonts.semibold,
//     fontSize: 16,
//     color: Colors.earth,
//     marginTop: 10,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   roleSub: {
//     fontFamily: Fonts.regular,
//     fontSize: 13,
//     color: Colors.brownLight,
//     textAlign: "center",
//   },
//   disclaimer: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     backgroundColor: Colors.amberPale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginTop: 4,
//   },
//   disclaimerText: {
//     fontFamily: Fonts.regular,
//     fontSize: 12,
//     color: Colors.brownLight,
//     flex: 1,
//     lineHeight: 18,
//   },
//   stepsList: { width: "100%", gap: 12, marginBottom: 28 },
//   stepRow:   { flexDirection: "row", alignItems: "center", gap: 12 },
//   stepNum: {
//     width: 28, height: 28,
//     borderRadius: 14,
//     backgroundColor: Colors.coral,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   stepText:    { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },
//   primaryBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     paddingVertical: 14,
//     paddingHorizontal: 32,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     ...Shadow.md,
//   },
//   primaryBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
// });



// import React, { useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet,
// } from "react-native";
// import { router } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../store/appStore";
// import { useWelcomeAudio } from "../hooks/useAudio";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// type Role = "parent" | "health_worker";

// const LANGUAGES = [
//   { key: "en",  label: "English",          native: "English"      },
//   { key: "yo",  label: "Yoruba",           native: "Yorùbá"       },
//   { key: "ha",  label: "Hausa",            native: "Hausa"        },
//   { key: "ig",  label: "Igbo",             native: "Igbo"         },
//   { key: "pcm", label: "Nigerian Pidgin",  native: "Naija Pidgin" },
// ];

// export default function OnboardingScreen() {
//   const [step, setStep]     = useState(0);
//   const [role, setRole]     = useState<Role | null>(null);
//   const [lang, setLang]     = useState("en");

//   const finishOnboarding = useAppStore((s) => s.finishOnboarding);
//   const setLanguage      = useAppStore((s) => s.setLanguage);
//   const { playWelcome, stopAudio } = useWelcomeAudio();

//   const selectLanguage = (key: string) => {
//     setLang(key);
//     setLanguage(key);
//     // This will stop any previous language track and start the new one instantly
//     playWelcome(key);
//   };

//   const goNext = () => {
//     // Audio is NOT stopped here now—it will continue playing smoothly into Step 1
//     setStep((s) => s + 1);
//   };

//   const goBack = () => {
//     // Keep audio playing even when backtracking, unless you want to explicitly kill it
//     setStep((s) => Math.max(0, s - 1));
//   };

//   const finish = () => {
//     if (!role) return;
//     // Explicitly kill the audio here as they exit onboarding and enter the main app
//     stopAudio();
//     finishOnboarding(role);
//     router.replace(role === "health_worker" ? "/(tabs)/chw" : "/(tabs)/profile");
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       {/* Universal Multi-Step Back Header Engine */}
//       {step > 0 && (
//         <View style={s.headerNav}>
//           <TouchableOpacity style={s.backBtn} onPress={goBack}>
//             <Ionicons name="arrow-back" size={22} color={Colors.earth} />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* ── Step 0: Language selection ────────────────────────────── */}
//       {step === 0 && (
//         <View style={s.container}>
//           <View style={s.iconWrap}>
//             <Ionicons name="water" size={34} color={Colors.coral} />
//           </View>

//           <Text style={s.title}>Welcome to JaundiCare</Text>
//           <Text style={s.sub}>Choose your language</Text>
//           <Text style={s.sub2}>Tap to hear a welcome message</Text>

//           <View style={s.langGrid}>
//             {LANGUAGES.map((l) => (
//               <TouchableOpacity
//                 key={l.key}
//                 style={[s.langCard, lang === l.key && s.langCardSelected]}
//                 onPress={() => selectLanguage(l.key)}
//               >
//                 <Text style={[s.langLabel, lang === l.key && { color: Colors.coral }]}>
//                   {l.native}
//                 </Text>
//                 <Text style={s.langSub}>{l.label}</Text>
//                 {lang === l.key && (
//                   <View style={s.langCheck}>
//                     <Ionicons name="checkmark" size={12} color="#fff" />
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <TouchableOpacity style={s.primaryBtn} onPress={goNext}>
//             <Text style={s.primaryBtnText}>Continue</Text>
//             <Ionicons name="arrow-forward" size={18} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* ── Step 1: Role selection ────────────────────────────────── */}
//       {step === 1 && (
//         <View style={s.container}>
//           <View style={[s.iconWrap, { borderColor: Colors.amber }]}>
//             <Ionicons name="people" size={34} color={Colors.amber} />
//           </View>

//           <Text style={s.title}>Who are you?</Text>
//           <Text style={s.sub}>This helps us show the most relevant experience for you.</Text>

//           <View style={s.roleGrid}>
//             {([
//               {
//                 key:      "parent" as Role,
//                 icon:     "person-outline" as const,
//                 title:    "Parent or caregiver",
//                 subtitle: "I want to monitor my baby's health",
//               },
//               {
//                 key:      "health_worker" as Role,
//                 icon:     "medkit-outline" as const,
//                 title:    "Health worker or CHW",
//                 subtitle: "I support newborn care in the community",
//               },
//             ]).map((option) => (
//               <TouchableOpacity
//                 key={option.key}
//                 style={[s.roleCard, role === option.key && s.roleCardSelected]}
//                 onPress={() => { setRole(option.key); setStep(2); }}
//               >
//                 <Ionicons
//                   name={option.icon}
//                   size={30}
//                   color={role === option.key ? Colors.coral : Colors.brownLight}
//                 />
//                 <Text style={[s.roleTitle, role === option.key && { color: Colors.coral }]}>
//                   {option.title}
//                 </Text>
//                 <Text style={s.roleSub}>{option.subtitle}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={s.disclaimer}>
//             <Ionicons name="shield-checkmark-outline" size={13} color={Colors.brownLight} />
//             <Text style={s.disclaimerText}>
//               This is a screening support tool. It does not replace a doctor, midwife, or bilirubin test.
//             </Text>
//           </View>
//         </View>
//       )}

//       {/* ── Step 2: All set ───────────────────────────────────────── */}
//       {step === 2 && (
//         <View style={s.container}>
//           <View style={[s.iconWrap, { borderColor: Colors.sage }]}>
//             <Ionicons name="checkmark-circle" size={34} color={Colors.sage} />
//           </View>

//           <Text style={s.title}>You are all set</Text>
//           <Text style={s.sub}>
//             Start by creating a baby profile so the app can track age automatically, then run your first screening.
//           </Text>

//           <View style={s.stepsList}>
//             {(role === "health_worker"
//               ? ["Open Community Care Mode", "Start an assisted screening", "Track follow-up reminders"]
//               : ["Create a baby profile", "Run a screening", "View your result and next steps"]
//             ).map((item, i) => (
//               <View key={i} style={s.stepRow}>
//                 <View style={s.stepNum}>
//                   <Text style={s.stepNumText}>{i + 1}</Text>
//                 </View>
//                 <Text style={s.stepText}>{item}</Text>
//               </View>
//             ))}
//           </View>

//           <TouchableOpacity style={s.primaryBtn} onPress={finish}>
//             <Text style={s.primaryBtnText}>Open JaundiCare</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:      { flex: 1, backgroundColor: Colors.background },
//   headerNav: {
//     width: "100%",
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     position: "absolute",
//     top: 50,
//     zIndex: 10,
//   },
//   backBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: Colors.card,
//     ...Shadow.sm,
//   },
//   container: {
//     flex: 1,
//     padding: 24,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconWrap: {
//     width: 80, height: 80,
//     borderRadius: 40,
//     borderWidth: 2,
//     borderColor: Colors.coral,
//     backgroundColor: Colors.cream,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//   },
//   title: {
//     fontFamily: Fonts.bold,
//     fontSize: 24,
//     color: Colors.earth,
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   sub: {
//     fontFamily: Fonts.regular,
//     fontSize: 15,
//     color: Colors.brownLight,
//     textAlign: "center",
//     lineHeight: 24,
//     marginBottom: 6,
//     maxWidth: 320,
//   },
//   sub2: {
//     fontFamily: Fonts.medium,
//     fontSize: 13,
//     color: Colors.coral,
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   langGrid: {
//     width: "100%",
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     justifyContent: "center",
//     marginBottom: 28,
//   },
//   langCard: {
//     width: "44%",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     backgroundColor: Colors.card,
//     ...Shadow.sm,
//   },
//   langCardSelected: {
//     borderColor: Colors.coral,
//     backgroundColor: "#fff5f2",
//   },
//   langLabel: {
//     fontFamily: Fonts.semibold,
//     fontSize: 16,
//     color: Colors.earth,
//     marginBottom: 2,
//   },
//   langSub: {
//     fontFamily: Fonts.regular,
//     fontSize: 11,
//     color: Colors.brownLight,
//   },
//   langCheck: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: Colors.coral,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   roleGrid: { width: "100%", gap: 12, marginBottom: 20 },
//   roleCard: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     ...Shadow.sm,
//   },
//   roleCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   roleTitle: {
//     fontFamily: Fonts.semibold,
//     fontSize: 16,
//     color: Colors.earth,
//     marginTop: 10,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   roleSub: {
//     fontFamily: Fonts.regular,
//     fontSize: 13,
//     color: Colors.brownLight,
//     textAlign: "center",
//   },
//   disclaimer: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     backgroundColor: Colors.amberPale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginTop: 4,
//   },
//   disclaimerText: {
//     fontFamily: Fonts.regular,
//     fontSize: 12,
//     color: Colors.brownLight,
//     flex: 1,
//     lineHeight: 18,
//   },
//   stepsList: { width: "100%", gap: 12, marginBottom: 28 },
//   stepRow:   { flexDirection: "row", alignItems: "center", gap: 12 },
//   stepNum: {
//     width: 28, height: 28,
//     borderRadius: 14,
//     backgroundColor: Colors.coral,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   stepText:    { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },
//   primaryBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     paddingVertical: 14,
//     paddingHorizontal: 32,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     ...Shadow.md,
//   },
//   primaryBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
// });



/**
 * JaundiCare — Onboarding Screen (Production Ready)
 * Handles native top insets dynamically across screen styles, balances multi-lingual grids,
 * and ensures total memory leak prevention for audio lifecycles on unmount.
 */

import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../store/appStore";
import { useWelcomeAudio } from "../hooks/useAudio";
import { useTranslations } from "../hooks/useTranslations";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

type Role = "parent" | "health_worker";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 10) / 2; // Perfect pixel-accurate split math accounting for gaps

const LANGUAGES = [
  { key: "en",  label: "English",          native: "English"      },
  { key: "yo",  label: "Yoruba",           native: "Yorùbá"       },
  { key: "ha",  label: "Hausa",            native: "Hausa"        },
  { key: "ig",  label: "Igbo",             native: "Igbo"         },
  { key: "pcm", label: "Nigerian Pidgin",  native: "Naija Pidgin" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep]     = useState(0);
  const [role, setRole]     = useState<Role | null>(null);
  const [lang, setLang]     = useState("en");

  const finishOnboarding = useAppStore((s) => s.finishOnboarding);
  const setLanguage      = useAppStore((s) => s.setLanguage);
  const { playWelcome, stopAudio } = useWelcomeAudio();
  const { t } = useTranslations();

  // Proactive safety hook: ensure audio stream shuts down if user leaves onboarding early
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const selectLanguage = (key: string) => {
    setLang(key);
    setLanguage(key);
    playWelcome(key);
  };

  const goNext = () => {
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = () => {
    if (!role) return;
    stopAudio();
    finishOnboarding(role);
    // Language and introductory audio are chosen before authentication, but
    // personal data and all app tabs remain unavailable until OTP verification.
    router.replace("/auth/phone");
  };

  return (
    <SafeAreaView style={s.safe} edges={["left", "right", "bottom"]}>
      {/* Dynamic Native Back Button Alignment Zone */}
      {step > 0 && (
        <View style={[s.headerNav, { top: Math.max(16, insets.top) }]}>
          <TouchableOpacity style={s.backBtn} onPress={goBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.earth} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={[s.scrollContent, { paddingTop: Math.max(60, insets.top + 20) }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Step 0: Language selection ────────────────────────────── */}
        {step === 0 && (
          <View style={s.container}>
            <View style={s.iconWrap}>
              <Ionicons name="water" size={34} color={Colors.coral} />
            </View>

            <Text style={s.title}>Welcome to JaundiCare</Text>
            <Text style={s.sub}>{t("ui.onboarding.choose_language")}</Text>
            <Text style={s.sub2}>{t("ui.onboarding.tap_audio")}</Text>

            <View style={s.langGrid}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.key}
                  style={[s.langCard, lang === l.key && s.langCardSelected]}
                  onPress={() => selectLanguage(l.key)}
                  activeOpacity={0.8}
                >
                  <Text 
                    numberOfLines={1} 
                    style={[s.langLabel, lang === l.key && { color: Colors.coral }]}
                  >
                    {l.native}
                  </Text>
                  <Text numberOfLines={1} style={s.langSub}>{l.label}</Text>
                  {lang === l.key && (
                    <View style={s.langCheck}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.primaryBtn} onPress={goNext} activeOpacity={0.8}>
              <Text style={s.primaryBtnText}>{t("ui.onboarding.continue")}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 1: Role selection ────────────────────────────────── */}
        {step === 1 && (
          <View style={s.container}>
            <View style={[s.iconWrap, { borderColor: Colors.amber }]}>
              <Ionicons name="people" size={34} color={Colors.amber} />
            </View>

            <Text style={s.title}>{t("ui.onboarding.who_are_you")}</Text>
            <Text style={s.sub}>{t("ui.onboarding.role_help")}</Text>

            <View style={s.roleGrid}>
              {([
                {
                  key:      "parent" as Role,
                  icon:     "person-outline" as const,
                  title:    t("ui.onboarding.parent"),
                  subtitle: t("ui.onboarding.parent_subtitle"),
                },
                {
                  key:      "health_worker" as Role,
                  icon:     "medkit-outline" as const,
                  title:    t("ui.onboarding.health_worker"),
                  subtitle: t("ui.onboarding.health_worker_subtitle"),
                },
              ]).map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[s.roleCard, role === option.key && s.roleCardSelected]}
                  onPress={() => { setRole(option.key); setStep(2); }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={option.icon}
                    size={30}
                    color={role === option.key ? Colors.coral : Colors.brownLight}
                  />
                  <Text style={[s.roleTitle, role === option.key && { color: Colors.coral }]}>
                    {option.title}
                  </Text>
                  <Text style={s.roleSub}>{option.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.disclaimer}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.brownLight} style={{ marginTop: 2 }} />
              <Text style={s.disclaimerText}>
                {t("ui.onboarding.safety")}
              </Text>
            </View>
          </View>
        )}

        {/* ── Step 2: All set ───────────────────────────────────────── */}
        {step === 2 && (
          <View style={s.container}>
            <View style={[s.iconWrap, { borderColor: Colors.sage }]}>
              <Ionicons name="checkmark-circle" size={34} color={Colors.sage} />
            </View>

            <Text style={s.title}>{t("ui.onboarding.ready")}</Text>
            <Text style={s.sub}>
              {t("ui.onboarding.ready_text")}
            </Text>

            <View style={s.stepsList}>
              {(role === "health_worker"
                ? [t("chw.title"), t("chw.actions.screening"), t("reminder.title")]
                : [t("profile.title"), t("screening.title"), t("result.what_next")]
              ).map((item, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepNum}>
                    <Text style={s.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.primaryBtn} onPress={finish} activeOpacity={0.8}>
              <Text style={s.primaryBtnText}>{t("ui.onboarding.open_app")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  scrollContent:{ flexGrow: 1, justifyContent: "center" },
  headerNav: {
    width: "100%",
    paddingHorizontal: 24,
    position: "absolute",
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    ...Shadow.sm,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 80, height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.coral,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.earth,
    textAlign: "center",
    marginBottom: 10,
  },
  sub: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.brownLight,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 6,
    maxWidth: 320,
  },
  sub2: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.coral,
    textAlign: "center",
    marginBottom: 24,
  },
  langGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 28,
  },
  langCard: {
    width: CARD_WIDTH,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: "center",
    backgroundColor: Colors.card,
    ...Shadow.sm,
  },
  langCardSelected: {
    borderColor: Colors.coral,
    backgroundColor: "#fff5f2",
  },
  langLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
    color: Colors.earth,
    marginBottom: 2,
  },
  langSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.brownLight,
  },
  langCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  roleGrid: { width: "100%", gap: 12, marginBottom: 20 },
  roleCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  roleCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
  roleTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
    color: Colors.earth,
    marginTop: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  roleSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.brownLight,
    textAlign: "center",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.amberPale,
    borderRadius: Radius.md,
    padding: 12,
    marginTop: 4,
    width: "100%",
  },
  disclaimerText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.brownLight,
    flex: 1,
    lineHeight: 18,
  },
  stepsList: { width: "100%", gap: 12, marginBottom: 28 },
  stepRow:   { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: Colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
  stepText:    { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },
  primaryBtn: {
    backgroundColor: Colors.coral,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...Shadow.md,
  },
  primaryBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
});
