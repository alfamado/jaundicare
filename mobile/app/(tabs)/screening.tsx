// import React, { useState, useRef } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Alert, Image,
//   Switch, Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,      setImageUri]      = useState<string | null>(null);
//   const [skinTone,      setSkinTone]      = useState<string | null>(null);
//   const [feeding,       setFeeding]       = useState<"good" | "poor">("good");
//   const [state,         setState]         = useState("");
//   const [loading,       setLoading]       = useState(false);
//   const [result,        setResult]        = useState<ScreeningResult | null>(null);

//   // Boolean symptom flags
//   const [symptoms, setSymptoms] = useState({
//     difficult_to_wake:           false,
//     floppy_or_unusually_drowsy:  false,
//     jaundice_first_24h:          false,
//     jaundice_spreading:          false,
//     yellow_eyes:                 false,
//     yellow_gums:                 false,
//     yellow_palms_or_soles:       false,
//     dark_urine:                  false,
//     pale_stool:                  false,
//     darker_skin_tone:            false,
//   });

//   const toggle = (key: keyof typeof symptoms) =>
//     setSymptoms((p) => ({ ...p, [key]: !p[key] }));

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Camera permission needed",
//         "Please allow camera access in your device settings to take a photo.",
//         [{ text: "OK" }]
//       );
//       return;
//     }

//     Alert.alert("Choose photo", "Take a new photo or pick from gallery", [
//       {
//         text: "Camera",
//         onPress: async () => {
//           const res = await ImagePicker.launchCameraAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             quality: 0.9,
//             allowsEditing: true,
//             aspect: [1, 1],
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       {
//         text: "Gallery",
//         onPress: async () => {
//           const res = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             quality: 0.9,
//             allowsEditing: true,
//             aspect: [1, 1],
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or select a photo first.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           symptoms.difficult_to_wake,
//         floppy_or_unusually_drowsy:  symptoms.floppy_or_unusually_drowsy,
//         jaundice_first_24h:          symptoms.jaundice_first_24h,
//         jaundice_spreading:          symptoms.jaundice_spreading,
//         yellow_eyes:                 symptoms.yellow_eyes,
//         yellow_gums:                 symptoms.yellow_gums,
//         yellow_palms_or_soles:       symptoms.yellow_palms_or_soles,
//         dark_urine:                  symptoms.dark_urine,
//         pale_stool:                  symptoms.pale_stool,
//         darker_skin_tone:            symptoms.darker_skin_tone,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         user_state:                  state || undefined,
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(err?.response?.data?.detail ?? err?.message ?? "Screening failed. Check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding("good");
//     setState("");
//     setSymptoms({
//       difficult_to_wake: false, floppy_or_unusually_drowsy: false,
//       jaundice_first_24h: false, jaundice_spreading: false,
//       yellow_eyes: false, yellow_gums: false, yellow_palms_or_soles: false,
//       dark_urine: false, pale_stool: false, darker_skin_tone: false,
//     });
//   };

//   const SymptomsToggle = ({
//     label, field, urgent = false,
//   }: { label: string; field: keyof typeof symptoms; urgent?: boolean }) => (
//     <View style={[s.symptomRow, urgent && s.symptomRowUrgent]}>
//       <Text style={s.symptomLabel}>{label}</Text>
//       <Switch
//         value={symptoms[field]}
//         onValueChange={() => toggle(field)}
//         trackColor={{ false: Colors.border, true: urgent ? Colors.rust : Colors.coral }}
//         thumbColor="#fff"
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           // Result view
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           // Form view
//           <>
//             {/* Camera section */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby photo</Text>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               <TouchableOpacity style={s.cameraBtn} onPress={pickImage}>
//                 {imageUri ? (
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                 ) : (
//                   <View style={s.cameraPlaceholder}>
//                     <Ionicons name="camera-outline" size={36} color={Colors.brownLight} />
//                     <Text style={s.cameraPlaceholderText}>Take photo or choose from gallery</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {imageUri && (
//                 <TouchableOpacity style={s.retakeBtn} onPress={pickImage}>
//                   <Ionicons name="camera-reverse-outline" size={15} color={Colors.coral} />
//                   <Text style={s.retakeBtnText}>Retake photo</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Baby age */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Age auto-filled from profile: {profile.age_hours} hours
//                 </Text>
//               </View>
//             )}

//             {/* Location */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Location</Text>

//               {/* State selector */}
//               <Text style={s.label}>State</Text>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={{ marginBottom: 12 }}
//               >
//                 <View style={s.stateRow}>
//                   {STATES.slice(0, 10).map((st) => (
//                     <TouchableOpacity
//                       key={st}
//                       style={[s.stateChip, state === st && s.stateChipSelected]}
//                       onPress={() => setState(st)}
//                     >
//                       <Text style={[s.stateChipText, state === st && s.stateChipTextSelected]}>
//                         {st}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                   <TouchableOpacity
//                     style={s.stateChip}
//                     onPress={() =>
//                       Alert.alert(
//                         "Select state",
//                         "Choose your state",
//                         STATES.map((st) => ({
//                           text:    st,
//                           onPress: () => setState(st),
//                         }))
//                       )
//                     }
//                   >
//                     <Text style={s.stateChipText}>More…</Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>

//               {/* GPS button */}
//               <TouchableOpacity
//                 style={[s.gpsBtn, location.status === "granted" && s.gpsBtnGranted]}
//                 onPress={requestLocation}
//               >
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={16}
//                   color={location.status === "granted" ? Colors.sage : Colors.coral}
//                 />
//                 <Text style={[s.gpsBtnText, location.status === "granted" && { color: Colors.sage }]}>
//                   {location.status === "loading" ? "Getting location..." : location.message}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Skin tone */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby's skin tone</Text>
//               <Text style={s.cardSub}>Helps adjust detection sensitivity for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => {
//                       setSkinTone(tone.key);
//                       if (["medium_dark", "dark"].includes(tone.key)) {
//                         setSymptoms(p => ({ ...p, darker_skin_tone: true }));
//                       }
//                     }}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Feeding */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>How is the baby feeding?</Text>
//               <View style={s.feedingRow}>
//                 {(["good", "poor"] as const).map((opt) => (
//                   <TouchableOpacity
//                     key={opt}
//                     style={[s.feedingBtn, feeding === opt && (opt === "good" ? s.feedingGood : s.feedingPoor)]}
//                     onPress={() => setFeeding(opt)}
//                   >
//                     <Ionicons
//                       name={opt === "good" ? "checkmark-circle-outline" : "warning-outline"}
//                       size={22}
//                       color={feeding === opt ? "#fff" : Colors.brownLight}
//                     />
//                     <Text style={[s.feedingBtnText, feeding === opt && { color: "#fff" }]}>
//                       {opt === "good" ? "Good — feeding normally" : "Poor — struggling to feed"}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Symptoms */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Signs to check</Text>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Difficult to wake for feeds" field="difficult_to_wake"   urgent />
//                 <SymptomsToggle label="Floppy or unusually drowsy"  field="floppy_or_unusually_drowsy" urgent />
//                 <SymptomsToggle label="Yellowing in first 24 hours" field="jaundice_first_24h" urgent />
//                 <SymptomsToggle label="Dark urine"                  field="dark_urine"         urgent />
//                 <SymptomsToggle label="Pale stool"                  field="pale_stool"         urgent />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — report to health worker
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Yellow in whites of eyes"      field="yellow_eyes" />
//                 <SymptomsToggle label="Yellow tinge in the gums"       field="yellow_gums" />
//                 <SymptomsToggle label="Yellow palms or soles"          field="yellow_palms_or_soles" />
//                 <SymptomsToggle label="Yellowing appears to be spreading" field="jaundice_spreading" />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.cream }]}>
//                   <Ionicons name="information-circle-outline" size={13} color={Colors.brownLight} />
//                   <Text style={[s.signsHeaderText, { color: Colors.brownLight }]}>
//                     Additional context
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Darker skin baby" field="darker_skin_tone" />
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri) && { opacity: 0.6 }]}
//               onPress={submit}
//               disabled={loading || !imageUri}
//             >
//               {loading
//                 ? <ActivityIndicator color="#fff" />
//                 : (
//                   <>
//                     <Ionicons name="scan-outline" size={18} color="#fff" />
//                     <Text style={s.submitBtnText}>Analyze screening</Text>
//                   </>
//                 )
//               }
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>
//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },

//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius:    Radius.lg,
//     padding:         16,
//     marginBottom:    14,
//     ...Shadow.sm,
//   },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 4 },
//   cardSub:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 12 },

//   cameraBtn: {
//     borderWidth:  1.5,
//     borderColor:  Colors.border,
//     borderStyle:  "dashed",
//     borderRadius: Radius.lg,
//     overflow:     "hidden",
//     minHeight:    180,
//     alignItems:   "center",
//     justifyContent: "center",
//   },
//   preview: { width: "100%", height: 220 },
//   cameraPlaceholder: { alignItems: "center", gap: 10, padding: 30 },
//   cameraPlaceholderText: {
//     fontFamily: Fonts.medium,
//     fontSize:   14,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//   },
//   retakeBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      10,
//   },
//   retakeBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     backgroundColor: Colors.sagePale,
//     borderRadius:    Radius.md,
//     padding:         10,
//     marginBottom:    14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 8 },

//   stateRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
//   stateChip: {
//     paddingHorizontal: 12,
//     paddingVertical:   7,
//     borderRadius:      Radius.full,
//     borderWidth:       1,
//     borderColor:       Colors.border,
//     backgroundColor:   Colors.cream,
//   },
//   stateChipSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   stateChipText:         { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },
//   stateChipTextSelected: { color: Colors.coral },

//   gpsBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            8,
//     borderWidth:    1.5,
//     borderColor:    Colors.coral,
//     borderRadius:   Radius.md,
//     padding:        11,
//   },
//   gpsBtnGranted: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   gpsBtnText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral, flex: 1 },

//   skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
//   skinChip: {
//     alignItems:   "center",
//     gap:          4,
//     padding:      6,
//     borderRadius: Radius.md,
//     borderWidth:  1.5,
//     borderColor:  "transparent",
//     width:        58,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 30, height: 30, borderRadius: 15 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   feedingRow: { gap: 10 },
//   feedingBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            10,
//     borderWidth:    1.5,
//     borderColor:    Colors.border,
//     borderRadius:   Radius.md,
//     padding:        12,
//   },
//   feedingGood:    { backgroundColor: Colors.sage,  borderColor: Colors.sage },
//   feedingPoor:    { backgroundColor: Colors.rust,  borderColor: Colors.rust },
//   feedingBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight, flex: 1 },

//   signsGroup: { marginBottom: 14 },
//   signsHeader: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     borderRadius:    Radius.md,
//     padding:         8,
//     marginBottom:    8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },

//   symptomRow: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   symptomRowUrgent: { backgroundColor: "#fff9f9", marginHorizontal: -4, paddingHorizontal: 4 },
//   symptomLabel:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, paddingRight: 12 },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius:    Radius.lg,
//     padding:         15,
//     flexDirection:   "row",
//     alignItems:      "center",
//     justifyContent:  "center",
//     gap:             8,
//     marginTop:       4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },

//   resetBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      16,
//     padding:        12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },
// });


/**
 * JaundiCare — Screening Screen
 * Camera capture, symptom form, and result display.
 */

// import React, { useState, useRef } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Alert, Image,
//   Switch, Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,      setImageUri]      = useState<string | null>(null);
//   const [skinTone,      setSkinTone]      = useState<string | null>(null);
//   const [feeding,       setFeeding]       = useState<"good" | "poor">("good");
//   const [state,         setState]         = useState("");
//   const [loading,       setLoading]       = useState(false);
//   const [result,        setResult]        = useState<ScreeningResult | null>(null);

//   // Boolean symptom flags
//   const [symptoms, setSymptoms] = useState({
//     difficult_to_wake:           false,
//     floppy_or_unusually_drowsy:  false,
//     jaundice_first_24h:          false,
//     jaundice_spreading:          false,
//     yellow_eyes:                 false,
//     yellow_gums:                 false,
//     yellow_palms_or_soles:       false,
//     dark_urine:                  false,
//     pale_stool:                  false,
//     darker_skin_tone:            false,
//   });

//   const toggle = (key: keyof typeof symptoms) =>
//     setSymptoms((p) => ({ ...p, [key]: !p[key] }));

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Camera permission needed",
//         "Please allow camera access in your device settings to take a photo.",
//         [{ text: "OK" }]
//       );
//       return;
//     }

//     Alert.alert("Choose photo", "Take a new photo or pick from gallery", [
//       {
//         text: "Camera",
//         onPress: async () => {
//           const res = await ImagePicker.launchCameraAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       {
//         text: "Gallery",
//         onPress: async () => {
//           const res = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or select a photo first.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           symptoms.difficult_to_wake,
//         floppy_or_unusually_drowsy:  symptoms.floppy_or_unusually_drowsy,
//         jaundice_first_24h:          symptoms.jaundice_first_24h,
//         jaundice_spreading:          symptoms.jaundice_spreading,
//         yellow_eyes:                 symptoms.yellow_eyes,
//         yellow_gums:                 symptoms.yellow_gums,
//         yellow_palms_or_soles:       symptoms.yellow_palms_or_soles,
//         dark_urine:                  symptoms.dark_urine,
//         pale_stool:                  symptoms.pale_stool,
//         darker_skin_tone:            symptoms.darker_skin_tone,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         user_state:                  state || undefined,
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(err?.response?.data?.detail ?? err?.message ?? "Screening failed. Check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding("good");
//     setState("");
//     setSymptoms({
//       difficult_to_wake: false, floppy_or_unusually_drowsy: false,
//       jaundice_first_24h: false, jaundice_spreading: false,
//       yellow_eyes: false, yellow_gums: false, yellow_palms_or_soles: false,
//       dark_urine: false, pale_stool: false, darker_skin_tone: false,
//     });
//   };

//   const SymptomsToggle = ({
//     label, field, urgent = false,
//   }: { label: string; field: keyof typeof symptoms; urgent?: boolean }) => (
//     <View style={[s.symptomRow, urgent && s.symptomRowUrgent]}>
//       <Text style={s.symptomLabel}>{label}</Text>
//       <Switch
//         value={symptoms[field]}
//         onValueChange={() => toggle(field)}
//         trackColor={{ false: Colors.border, true: urgent ? Colors.rust : Colors.coral }}
//         thumbColor="#fff"
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           // Result view
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           // Form view
//           <>
//             {/* Camera section */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby photo</Text>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               <TouchableOpacity style={s.cameraBtn} onPress={pickImage}>
//                 {imageUri ? (
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                 ) : (
//                   <View style={s.cameraPlaceholder}>
//                     <Ionicons name="camera-outline" size={36} color={Colors.brownLight} />
//                     <Text style={s.cameraPlaceholderText}>Take photo or choose from gallery</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {imageUri && (
//                 <TouchableOpacity style={s.retakeBtn} onPress={pickImage}>
//                   <Ionicons name="camera-reverse-outline" size={15} color={Colors.coral} />
//                   <Text style={s.retakeBtnText}>Retake photo</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Baby age */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Age auto-filled from profile: {profile.age_hours} hours
//                 </Text>
//               </View>
//             )}

//             {/* Location */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Location</Text>

//               {/* State selector */}
//               <Text style={s.label}>State</Text>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={{ marginBottom: 12 }}
//               >
//                 <View style={s.stateRow}>
//                   {STATES.slice(0, 10).map((st) => (
//                     <TouchableOpacity
//                       key={st}
//                       style={[s.stateChip, state === st && s.stateChipSelected]}
//                       onPress={() => setState(st)}
//                     >
//                       <Text style={[s.stateChipText, state === st && s.stateChipTextSelected]}>
//                         {st}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                   <TouchableOpacity
//                     style={s.stateChip}
//                     onPress={() =>
//                       Alert.alert(
//                         "Select state",
//                         "Choose your state",
//                         STATES.map((st) => ({
//                           text:    st,
//                           onPress: () => setState(st),
//                         }))
//                       )
//                     }
//                   >
//                     <Text style={s.stateChipText}>More…</Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>

//               {/* GPS button */}
//               <TouchableOpacity
//                 style={[s.gpsBtn, location.status === "granted" && s.gpsBtnGranted]}
//                 onPress={requestLocation}
//               >
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={16}
//                   color={location.status === "granted" ? Colors.sage : Colors.coral}
//                 />
//                 <Text style={[s.gpsBtnText, location.status === "granted" && { color: Colors.sage }]}>
//                   {location.status === "loading" ? "Getting location..." : location.message}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Skin tone */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby's skin tone</Text>
//               <Text style={s.cardSub}>Helps adjust detection sensitivity for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => {
//                       setSkinTone(tone.key);
//                       if (["medium_dark", "dark"].includes(tone.key)) {
//                         setSymptoms(p => ({ ...p, darker_skin_tone: true }));
//                       }
//                     }}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Feeding */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>How is the baby feeding?</Text>
//               <View style={s.feedingRow}>
//                 {(["good", "poor"] as const).map((opt) => (
//                   <TouchableOpacity
//                     key={opt}
//                     style={[s.feedingBtn, feeding === opt && (opt === "good" ? s.feedingGood : s.feedingPoor)]}
//                     onPress={() => setFeeding(opt)}
//                   >
//                     <Ionicons
//                       name={opt === "good" ? "checkmark-circle-outline" : "warning-outline"}
//                       size={22}
//                       color={feeding === opt ? "#fff" : Colors.brownLight}
//                     />
//                     <Text style={[s.feedingBtnText, feeding === opt && { color: "#fff" }]}>
//                       {opt === "good" ? "Good — feeding normally" : "Poor — struggling to feed"}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Symptoms */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Signs to check</Text>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Difficult to wake for feeds" field="difficult_to_wake"   urgent />
//                 <SymptomsToggle label="Floppy or unusually drowsy"  field="floppy_or_unusually_drowsy" urgent />
//                 <SymptomsToggle label="Yellowing in first 24 hours" field="jaundice_first_24h" urgent />
//                 <SymptomsToggle label="Dark urine"                  field="dark_urine"         urgent />
//                 <SymptomsToggle label="Pale stool"                  field="pale_stool"         urgent />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — report to health worker
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Yellow in whites of eyes"      field="yellow_eyes" />
//                 <SymptomsToggle label="Yellow tinge in the gums"       field="yellow_gums" />
//                 <SymptomsToggle label="Yellow palms or soles"          field="yellow_palms_or_soles" />
//                 <SymptomsToggle label="Yellowing appears to be spreading" field="jaundice_spreading" />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.cream }]}>
//                   <Ionicons name="information-circle-outline" size={13} color={Colors.brownLight} />
//                   <Text style={[s.signsHeaderText, { color: Colors.brownLight }]}>
//                     Additional context
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Darker skin baby" field="darker_skin_tone" />
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri) && { opacity: 0.6 }]}
//               onPress={submit}
//               disabled={loading || !imageUri}
//             >
//               {loading
//                 ? <ActivityIndicator color="#fff" />
//                 : (
//                   <>
//                     <Ionicons name="scan-outline" size={18} color="#fff" />
//                     <Text style={s.submitBtnText}>Analyze screening</Text>
//                   </>
//                 )
//               }
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>
//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },

//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius:    Radius.lg,
//     padding:         16,
//     marginBottom:    14,
//     ...Shadow.sm,
//   },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 4 },
//   cardSub:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 12 },

//   cameraBtn: {
//     borderWidth:  1.5,
//     borderColor:  Colors.border,
//     borderStyle:  "dashed",
//     borderRadius: Radius.lg,
//     overflow:     "hidden",
//     minHeight:    180,
//     alignItems:   "center",
//     justifyContent: "center",
//   },
//   preview: { width: "100%", height: 220 },
//   cameraPlaceholder: { alignItems: "center", gap: 10, padding: 30 },
//   cameraPlaceholderText: {
//     fontFamily: Fonts.medium,
//     fontSize:   14,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//   },
//   retakeBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      10,
//   },
//   retakeBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     backgroundColor: Colors.sagePale,
//     borderRadius:    Radius.md,
//     padding:         10,
//     marginBottom:    14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 8 },

//   stateRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
//   stateChip: {
//     paddingHorizontal: 12,
//     paddingVertical:   7,
//     borderRadius:      Radius.full,
//     borderWidth:       1,
//     borderColor:       Colors.border,
//     backgroundColor:   Colors.cream,
//   },
//   stateChipSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   stateChipText:         { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },
//   stateChipTextSelected: { color: Colors.coral },

//   gpsBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            8,
//     borderWidth:    1.5,
//     borderColor:    Colors.coral,
//     borderRadius:   Radius.md,
//     padding:        11,
//   },
//   gpsBtnGranted: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   gpsBtnText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral, flex: 1 },

//   skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
//   skinChip: {
//     alignItems:   "center",
//     gap:          4,
//     padding:      6,
//     borderRadius: Radius.md,
//     borderWidth:  1.5,
//     borderColor:  "transparent",
//     width:        58,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 30, height: 30, borderRadius: 15 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   feedingRow: { gap: 10 },
//   feedingBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            10,
//     borderWidth:    1.5,
//     borderColor:    Colors.border,
//     borderRadius:   Radius.md,
//     padding:        12,
//   },
//   feedingGood:    { backgroundColor: Colors.sage,  borderColor: Colors.sage },
//   feedingPoor:    { backgroundColor: Colors.rust,  borderColor: Colors.rust },
//   feedingBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight, flex: 1 },

//   signsGroup: { marginBottom: 14 },
//   signsHeader: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     borderRadius:    Radius.md,
//     padding:         8,
//     marginBottom:    8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },

//   symptomRow: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   symptomRowUrgent: { backgroundColor: "#fff9f9", marginHorizontal: -4, paddingHorizontal: 4 },
//   symptomLabel:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, paddingRight: 12 },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius:    Radius.lg,
//     padding:         15,
//     flexDirection:   "row",
//     alignItems:      "center",
//     justifyContent:  "center",
//     gap:             8,
//     marginTop:       4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },

//   resetBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      16,
//     padding:        12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },
// });



/**
 * JaundiCare — Screening Screen
 * Camera capture, symptom form, and result display.
 */

// import React, { useState, useRef } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Alert, Image,
//   Switch, Platform, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,      setImageUri]      = useState<string | null>(null);
//   const [skinTone,      setSkinTone]      = useState<string | null>(null);
//   const [feeding,       setFeeding]       = useState<"good" | "poor">("good");
//   const [state,         setState]         = useState("");
//   const [loading,       setLoading]       = useState(false);
//   const [result,        setResult]        = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);

//   // Boolean symptom flags
//   const [symptoms, setSymptoms] = useState({
//     difficult_to_wake:           false,
//     floppy_or_unusually_drowsy:  false,
//     jaundice_first_24h:          false,
//     jaundice_spreading:          false,
//     yellow_eyes:                 false,
//     yellow_gums:                 false,
//     yellow_palms_or_soles:       false,
//     dark_urine:                  false,
//     pale_stool:                  false,
//     darker_skin_tone:            false,
//   });

//   const toggle = (key: keyof typeof symptoms) =>
//     setSymptoms((p) => ({ ...p, [key]: !p[key] }));

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Camera permission needed",
//         "Please allow camera access in your device settings to take a photo.",
//         [{ text: "OK" }]
//       );
//       return;
//     }

//     Alert.alert("Choose photo", "Take a new photo or pick from gallery", [
//       {
//         text: "Camera",
//         onPress: async () => {
//           const res = await ImagePicker.launchCameraAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       {
//         text: "Gallery",
//         onPress: async () => {
//           const res = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or select a photo first.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;

//       // GPS takes priority over manually selected state for facility search
//       const hasGPS = location.latitude != null && location.longitude != null;

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           symptoms.difficult_to_wake,
//         floppy_or_unusually_drowsy:  symptoms.floppy_or_unusually_drowsy,
//         jaundice_first_24h:          symptoms.jaundice_first_24h,
//         jaundice_spreading:          symptoms.jaundice_spreading,
//         yellow_eyes:                 symptoms.yellow_eyes,
//         yellow_gums:                 symptoms.yellow_gums,
//         yellow_palms_or_soles:       symptoms.yellow_palms_or_soles,
//         dark_urine:                  symptoms.dark_urine,
//         pale_stool:                  symptoms.pale_stool,
//         darker_skin_tone:            symptoms.darker_skin_tone,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         // Only send state if GPS is not available — GPS is more accurate
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(err?.response?.data?.detail ?? err?.message ?? "Screening failed. Check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding("good");
//     setState("");
//     setSymptoms({
//       difficult_to_wake: false, floppy_or_unusually_drowsy: false,
//       jaundice_first_24h: false, jaundice_spreading: false,
//       yellow_eyes: false, yellow_gums: false, yellow_palms_or_soles: false,
//       dark_urine: false, pale_stool: false, darker_skin_tone: false,
//     });
//   };

//   const SymptomsToggle = ({
//     label, field, urgent = false,
//   }: { label: string; field: keyof typeof symptoms; urgent?: boolean }) => (
//     <View style={[s.symptomRow, urgent && s.symptomRowUrgent]}>
//       <Text style={s.symptomLabel}>{label}</Text>
//       <Switch
//         value={symptoms[field]}
//         onValueChange={() => toggle(field)}
//         trackColor={{ false: Colors.border, true: urgent ? Colors.rust : Colors.coral }}
//         thumbColor="#fff"
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           // Result view
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           // Form view
//           <>
//             {/* Camera section */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby photo</Text>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               <TouchableOpacity style={s.cameraBtn} onPress={pickImage}>
//                 {imageUri ? (
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                 ) : (
//                   <View style={s.cameraPlaceholder}>
//                     <Ionicons name="camera-outline" size={36} color={Colors.brownLight} />
//                     <Text style={s.cameraPlaceholderText}>Take photo or choose from gallery</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {imageUri && (
//                 <TouchableOpacity style={s.retakeBtn} onPress={pickImage}>
//                   <Ionicons name="camera-reverse-outline" size={15} color={Colors.coral} />
//                   <Text style={s.retakeBtnText}>Retake photo</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Baby age */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Age auto-filled from profile: {profile.age_hours} hours
//                 </Text>
//               </View>
//             )}

//             {/* Location */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Location</Text>

//               {/* State selector */}
//               <Text style={s.label}>State (optional — GPS is more accurate)</Text>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={{ marginBottom: 12 }}
//               >
//                 <View style={s.stateRow}>
//                   {STATES.slice(0, 10).map((st) => (
//                     <TouchableOpacity
//                       key={st}
//                       style={[s.stateChip, state === st && s.stateChipSelected]}
//                       onPress={() => setState(st)}
//                     >
//                       <Text style={[s.stateChipText, state === st && s.stateChipTextSelected]}>
//                         {st}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                   <TouchableOpacity
//                     style={[s.stateChip, s.stateChipMore]}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Text style={s.stateChipText}>More…</Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>

//               {/* GPS button — preferred over manual state */}
//               <TouchableOpacity
//                 style={[s.gpsBtn, location.status === "granted" && s.gpsBtnGranted]}
//                 onPress={requestLocation}
//               >
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={16}
//                   color={location.status === "granted" ? Colors.sage : Colors.coral}
//                 />
//                 <Text style={[s.gpsBtnText, location.status === "granted" && { color: Colors.sage }]}>
//                   {location.status === "loading"
//                     ? "Getting location..."
//                     : location.status === "granted"
//                     ? `GPS location set — overrides state selection`
//                     : location.message}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Skin tone */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby's skin tone</Text>
//               <Text style={s.cardSub}>Helps adjust detection sensitivity for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => {
//                       setSkinTone(tone.key);
//                       if (["medium_dark", "dark"].includes(tone.key)) {
//                         setSymptoms(p => ({ ...p, darker_skin_tone: true }));
//                       }
//                     }}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Feeding */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>How is the baby feeding?</Text>
//               <View style={s.feedingRow}>
//                 {(["good", "poor"] as const).map((opt) => (
//                   <TouchableOpacity
//                     key={opt}
//                     style={[s.feedingBtn, feeding === opt && (opt === "good" ? s.feedingGood : s.feedingPoor)]}
//                     onPress={() => setFeeding(opt)}
//                   >
//                     <Ionicons
//                       name={opt === "good" ? "checkmark-circle-outline" : "warning-outline"}
//                       size={22}
//                       color={feeding === opt ? "#fff" : Colors.brownLight}
//                     />
//                     <Text style={[s.feedingBtnText, feeding === opt && { color: "#fff" }]}>
//                       {opt === "good" ? "Good — feeding normally" : "Poor — struggling to feed"}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Symptoms */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Signs to check</Text>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Difficult to wake for feeds" field="difficult_to_wake"   urgent />
//                 <SymptomsToggle label="Floppy or unusually drowsy"  field="floppy_or_unusually_drowsy" urgent />
//                 <SymptomsToggle label="Yellowing in first 24 hours" field="jaundice_first_24h" urgent />
//                 <SymptomsToggle label="Dark urine"                  field="dark_urine"         urgent />
//                 <SymptomsToggle label="Pale stool"                  field="pale_stool"         urgent />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — report to health worker
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Yellow in whites of eyes"      field="yellow_eyes" />
//                 <SymptomsToggle label="Yellow tinge in the gums"       field="yellow_gums" />
//                 <SymptomsToggle label="Yellow palms or soles"          field="yellow_palms_or_soles" />
//                 <SymptomsToggle label="Yellowing appears to be spreading" field="jaundice_spreading" />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.cream }]}>
//                   <Ionicons name="information-circle-outline" size={13} color={Colors.brownLight} />
//                   <Text style={[s.signsHeaderText, { color: Colors.brownLight }]}>
//                     Additional context
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Darker skin baby" field="darker_skin_tone" />
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri) && { opacity: 0.6 }]}
//               onPress={submit}
//               disabled={loading || !imageUri}
//             >
//               {loading
//                 ? <ActivityIndicator color="#fff" />
//                 : (
//                   <>
//                     <Ionicons name="scan-outline" size={18} color="#fff" />
//                     <Text style={s.submitBtnText}>Analyze screening</Text>
//                   </>
//                 )
//               }
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>

//       {/* Full state picker modal — fixes Android Alert truncation */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => { setState(item); setShowStatePicker(false); }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },

//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius:    Radius.lg,
//     padding:         16,
//     marginBottom:    14,
//     ...Shadow.sm,
//   },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 4 },
//   cardSub:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 12 },

//   cameraBtn: {
//     borderWidth:  1.5,
//     borderColor:  Colors.border,
//     borderStyle:  "dashed",
//     borderRadius: Radius.lg,
//     overflow:     "hidden",
//     minHeight:    180,
//     alignItems:   "center",
//     justifyContent: "center",
//   },
//   preview: { width: "100%", height: 220 },
//   cameraPlaceholder: { alignItems: "center", gap: 10, padding: 30 },
//   cameraPlaceholderText: {
//     fontFamily: Fonts.medium,
//     fontSize:   14,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//   },
//   retakeBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      10,
//   },
//   retakeBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     backgroundColor: Colors.sagePale,
//     borderRadius:    Radius.md,
//     padding:         10,
//     marginBottom:    14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 8 },

//   stateRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
//   stateChip: {
//     paddingHorizontal: 12,
//     paddingVertical:   7,
//     borderRadius:      Radius.full,
//     borderWidth:       1,
//     borderColor:       Colors.border,
//     backgroundColor:   Colors.cream,
//   },
//   stateChipSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   stateChipText:         { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },
//   stateChipTextSelected: { color: Colors.coral },

//   gpsBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            8,
//     borderWidth:    1.5,
//     borderColor:    Colors.coral,
//     borderRadius:   Radius.md,
//     padding:        11,
//   },
//   gpsBtnGranted: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   gpsBtnText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral, flex: 1 },

//   skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
//   skinChip: {
//     alignItems:   "center",
//     gap:          4,
//     padding:      6,
//     borderRadius: Radius.md,
//     borderWidth:  1.5,
//     borderColor:  "transparent",
//     width:        58,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 30, height: 30, borderRadius: 15 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   feedingRow: { gap: 10 },
//   feedingBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            10,
//     borderWidth:    1.5,
//     borderColor:    Colors.border,
//     borderRadius:   Radius.md,
//     padding:        12,
//   },
//   feedingGood:    { backgroundColor: Colors.sage,  borderColor: Colors.sage },
//   feedingPoor:    { backgroundColor: Colors.rust,  borderColor: Colors.rust },
//   feedingBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight, flex: 1 },

//   signsGroup: { marginBottom: 14 },
//   signsHeader: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     borderRadius:    Radius.md,
//     padding:         8,
//     marginBottom:    8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },

//   symptomRow: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   symptomRowUrgent: { backgroundColor: "#fff9f9", marginHorizontal: -4, paddingHorizontal: 4 },
//   symptomLabel:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, paddingRight: 12 },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius:    Radius.lg,
//     padding:         15,
//     flexDirection:   "row",
//     alignItems:      "center",
//     justifyContent:  "center",
//     gap:             8,
//     marginTop:       4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },

//   resetBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      16,
//     padding:        12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   stateChipMore: { borderColor: Colors.coral, borderStyle: "dashed" },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:    { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });



/**
 * JaundiCare — Screening Screen
 * Camera capture, symptom form, and result display.
 */

// import React, { useState, useRef } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Alert, Image,
//   Switch, Platform, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,      setImageUri]      = useState<string | null>(null);
//   const [skinTone,      setSkinTone]      = useState<string | null>(null);
//   const [feeding,       setFeeding]       = useState<"good" | "poor">("good");
//   const [state,         setState]         = useState("");
//   const [loading,       setLoading]       = useState(false);
//   const [result,        setResult]        = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);

//   // Boolean symptom flags
//   const [symptoms, setSymptoms] = useState({
//     difficult_to_wake:           false,
//     floppy_or_unusually_drowsy:  false,
//     jaundice_first_24h:          false,
//     jaundice_spreading:          false,
//     yellow_eyes:                 false,
//     yellow_gums:                 false,
//     yellow_palms_or_soles:       false,
//     dark_urine:                  false,
//     pale_stool:                  false,
//     darker_skin_tone:            false,
//   });

//   const toggle = (key: keyof typeof symptoms) =>
//     setSymptoms((p) => ({ ...p, [key]: !p[key] }));

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Camera permission needed",
//         "Please allow camera access in your device settings to take a photo.",
//         [{ text: "OK" }]
//       );
//       return;
//     }

//     Alert.alert("Choose photo", "Take a new photo or pick from gallery", [
//       {
//         text: "Camera",
//         onPress: async () => {
//           const res = await ImagePicker.launchCameraAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       {
//         text: "Gallery",
//         onPress: async () => {
//           const res = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or select a photo first.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;

//       // GPS takes priority over manually selected state for facility search
//       const hasGPS = location.latitude != null && location.longitude != null;

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           symptoms.difficult_to_wake,
//         floppy_or_unusually_drowsy:  symptoms.floppy_or_unusually_drowsy,
//         jaundice_first_24h:          symptoms.jaundice_first_24h,
//         jaundice_spreading:          symptoms.jaundice_spreading,
//         yellow_eyes:                 symptoms.yellow_eyes,
//         yellow_gums:                 symptoms.yellow_gums,
//         yellow_palms_or_soles:       symptoms.yellow_palms_or_soles,
//         dark_urine:                  symptoms.dark_urine,
//         pale_stool:                  symptoms.pale_stool,
//         darker_skin_tone:            symptoms.darker_skin_tone,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         // Only send state if GPS is not available — GPS is more accurate
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(err?.response?.data?.detail ?? err?.message ?? "Screening failed. Check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding("good");
//     setState("");
//     setSymptoms({
//       difficult_to_wake: false, floppy_or_unusually_drowsy: false,
//       jaundice_first_24h: false, jaundice_spreading: false,
//       yellow_eyes: false, yellow_gums: false, yellow_palms_or_soles: false,
//       dark_urine: false, pale_stool: false, darker_skin_tone: false,
//     });
//   };

//   const SymptomsToggle = ({
//     label, field, urgent = false,
//   }: { label: string; field: keyof typeof symptoms; urgent?: boolean }) => (
//     <View style={[s.symptomRow, urgent && s.symptomRowUrgent]}>
//       <Text style={s.symptomLabel}>{label}</Text>
//       <Switch
//         value={symptoms[field]}
//         onValueChange={() => toggle(field)}
//         trackColor={{ false: Colors.border, true: urgent ? Colors.rust : Colors.coral }}
//         thumbColor="#fff"
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           // Result view
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           // Form view
//           <>
//             {/* Camera section */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby photo</Text>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               <TouchableOpacity style={s.cameraBtn} onPress={pickImage}>
//                 {imageUri ? (
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                 ) : (
//                   <View style={s.cameraPlaceholder}>
//                     <Ionicons name="camera-outline" size={36} color={Colors.brownLight} />
//                     <Text style={s.cameraPlaceholderText}>Take photo or choose from gallery</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {imageUri && (
//                 <TouchableOpacity style={s.retakeBtn} onPress={pickImage}>
//                   <Ionicons name="camera-reverse-outline" size={15} color={Colors.coral} />
//                   <Text style={s.retakeBtnText}>Retake photo</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Baby age */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Age auto-filled from profile: {profile.age_hours} hours
//                 </Text>
//               </View>
//             )}

//             {/* Location */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Location</Text>

//               {/* State selector — shows selected state first, then others */}
//               <Text style={s.label}>State (optional — GPS is more accurate)</Text>

//               {/* Show selected state as a highlighted chip if picked from More */}
//               {state && !STATES.slice(0, 10).includes(state) && (
//                 <View style={s.selectedStateBanner}>
//                   <Ionicons name="checkmark-circle" size={15} color={Colors.coral} />
//                   <Text style={s.selectedStateText}>Selected: {state}</Text>
//                   <TouchableOpacity onPress={() => setState("")}>
//                     <Ionicons name="close-circle" size={15} color={Colors.brownLight} />
//                   </TouchableOpacity>
//                 </View>
//               )}

//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={{ marginBottom: 12 }}
//               >
//                 <View style={s.stateRow}>
//                   {STATES.slice(0, 10).map((st) => (
//                     <TouchableOpacity
//                       key={st}
//                       style={[s.stateChip, state === st && s.stateChipSelected]}
//                       onPress={() => setState(st)}
//                     >
//                       <Text style={[s.stateChipText, state === st && s.stateChipTextSelected]}>
//                         {st}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                   <TouchableOpacity
//                     style={[s.stateChip, s.stateChipMore]}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Text style={[s.stateChipText, { color: Colors.coral }]}>More…</Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>

//               {/* GPS button */}
//               <TouchableOpacity
//                 style={[s.gpsBtn, location.status === "granted" && s.gpsBtnGranted]}
//                 onPress={requestLocation}
//               >
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={16}
//                   color={location.status === "granted" ? Colors.sage : Colors.coral}
//                 />
//                 <Text style={[s.gpsBtnText, location.status === "granted" && { color: Colors.sage }]}>
//                   {location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "granted"
//                     ? "GPS active — nearby facilities will be accurate"
//                     : "Tap to use GPS for accurate facility search"}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Skin tone */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby's skin tone</Text>
//               <Text style={s.cardSub}>Helps adjust detection sensitivity for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => {
//                       setSkinTone(tone.key);
//                       if (["medium_dark", "dark"].includes(tone.key)) {
//                         setSymptoms(p => ({ ...p, darker_skin_tone: true }));
//                       }
//                     }}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Feeding */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>How is the baby feeding?</Text>
//               <View style={s.feedingRow}>
//                 {(["good", "poor"] as const).map((opt) => (
//                   <TouchableOpacity
//                     key={opt}
//                     style={[s.feedingBtn, feeding === opt && (opt === "good" ? s.feedingGood : s.feedingPoor)]}
//                     onPress={() => setFeeding(opt)}
//                   >
//                     <Ionicons
//                       name={opt === "good" ? "checkmark-circle-outline" : "warning-outline"}
//                       size={22}
//                       color={feeding === opt ? "#fff" : Colors.brownLight}
//                     />
//                     <Text style={[s.feedingBtnText, feeding === opt && { color: "#fff" }]}>
//                       {opt === "good" ? "Good — feeding normally" : "Poor — struggling to feed"}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Symptoms */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Signs to check</Text>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Difficult to wake for feeds" field="difficult_to_wake"   urgent />
//                 <SymptomsToggle label="Floppy or unusually drowsy"  field="floppy_or_unusually_drowsy" urgent />
//                 <SymptomsToggle label="Yellowing in first 24 hours" field="jaundice_first_24h" urgent />
//                 <SymptomsToggle label="Dark urine"                  field="dark_urine"         urgent />
//                 <SymptomsToggle label="Pale stool"                  field="pale_stool"         urgent />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — report to health worker
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Yellow in whites of eyes"      field="yellow_eyes" />
//                 <SymptomsToggle label="Yellow tinge in the gums"       field="yellow_gums" />
//                 <SymptomsToggle label="Yellow palms or soles"          field="yellow_palms_or_soles" />
//                 <SymptomsToggle label="Yellowing appears to be spreading" field="jaundice_spreading" />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.cream }]}>
//                   <Ionicons name="information-circle-outline" size={13} color={Colors.brownLight} />
//                   <Text style={[s.signsHeaderText, { color: Colors.brownLight }]}>
//                     Additional context
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Darker skin baby" field="darker_skin_tone" />
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri) && { opacity: 0.6 }]}
//               onPress={submit}
//               disabled={loading || !imageUri}
//             >
//               {loading
//                 ? <ActivityIndicator color="#fff" />
//                 : (
//                   <>
//                     <Ionicons name="scan-outline" size={18} color="#fff" />
//                     <Text style={s.submitBtnText}>Analyze screening</Text>
//                   </>
//                 )
//               }
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>

//       {/* Full state picker modal — fixes Android Alert truncation */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => { setState(item); setShowStatePicker(false); }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },

//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius:    Radius.lg,
//     padding:         16,
//     marginBottom:    14,
//     ...Shadow.sm,
//   },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 4 },
//   cardSub:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 12 },

//   cameraBtn: {
//     borderWidth:  1.5,
//     borderColor:  Colors.border,
//     borderStyle:  "dashed",
//     borderRadius: Radius.lg,
//     overflow:     "hidden",
//     minHeight:    180,
//     alignItems:   "center",
//     justifyContent: "center",
//   },
//   preview: { width: "100%", height: 220 },
//   cameraPlaceholder: { alignItems: "center", gap: 10, padding: 30 },
//   cameraPlaceholderText: {
//     fontFamily: Fonts.medium,
//     fontSize:   14,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//   },
//   retakeBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      10,
//   },
//   retakeBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     backgroundColor: Colors.sagePale,
//     borderRadius:    Radius.md,
//     padding:         10,
//     marginBottom:    14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 8 },

//   stateRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
//   stateChip: {
//     paddingHorizontal: 12,
//     paddingVertical:   7,
//     borderRadius:      Radius.full,
//     borderWidth:       1,
//     borderColor:       Colors.border,
//     backgroundColor:   Colors.cream,
//   },
//   stateChipSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   stateChipText:         { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },
//   stateChipTextSelected: { color: Colors.coral },

//   gpsBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            8,
//     borderWidth:    1.5,
//     borderColor:    Colors.coral,
//     borderRadius:   Radius.md,
//     padding:        11,
//   },
//   gpsBtnGranted: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   gpsBtnText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral, flex: 1 },

//   skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
//   skinChip: {
//     alignItems:   "center",
//     gap:          4,
//     padding:      6,
//     borderRadius: Radius.md,
//     borderWidth:  1.5,
//     borderColor:  "transparent",
//     width:        58,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 30, height: 30, borderRadius: 15 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   feedingRow: { gap: 10 },
//   feedingBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            10,
//     borderWidth:    1.5,
//     borderColor:    Colors.border,
//     borderRadius:   Radius.md,
//     padding:        12,
//   },
//   feedingGood:    { backgroundColor: Colors.sage,  borderColor: Colors.sage },
//   feedingPoor:    { backgroundColor: Colors.rust,  borderColor: Colors.rust },
//   feedingBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight, flex: 1 },

//   signsGroup: { marginBottom: 14 },
//   signsHeader: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     borderRadius:    Radius.md,
//     padding:         8,
//     marginBottom:    8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },

//   symptomRow: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   symptomRowUrgent: { backgroundColor: "#fff9f9", marginHorizontal: -4, paddingHorizontal: 4 },
//   symptomLabel:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, paddingRight: 12 },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius:    Radius.lg,
//     padding:         15,
//     flexDirection:   "row",
//     alignItems:      "center",
//     justifyContent:  "center",
//     gap:             8,
//     marginTop:       4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },

//   resetBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      16,
//     padding:        12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   stateChipMore: { borderColor: Colors.coral, borderStyle: "dashed" },

//   selectedStateBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: "#fff5f2",
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: Colors.coral,
//   },
//   selectedStateText: {
//     fontFamily: Fonts.semibold,
//     fontSize: 13,
//     color: Colors.coral,
//     flex: 1,
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:    { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });



/**
 * JaundiCare — Screening Screen
 * Camera capture, symptom form, and result display.
 */

// import React, { useState, useRef } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Alert, Image,
//   Switch, Platform, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,      setImageUri]      = useState<string | null>(null);
//   const [skinTone,      setSkinTone]      = useState<string | null>(null);
//   const [feeding,       setFeeding]       = useState<"good" | "poor">("good");
//   const [state,         setState]         = useState("");
//   const [loading,       setLoading]       = useState(false);
//   const [result,        setResult]        = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);

//   // Boolean symptom flags
//   const [symptoms, setSymptoms] = useState({
//     difficult_to_wake:           false,
//     floppy_or_unusually_drowsy:  false,
//     jaundice_first_24h:          false,
//     jaundice_spreading:          false,
//     yellow_eyes:                 false,
//     yellow_gums:                 false,
//     yellow_palms_or_soles:       false,
//     dark_urine:                  false,
//     pale_stool:                  false,
//     darker_skin_tone:            false,
//   });

//   const toggle = (key: keyof typeof symptoms) =>
//     setSymptoms((p) => ({ ...p, [key]: !p[key] }));

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Camera permission needed",
//         "Please allow camera access in your device settings to take a photo.",
//         [{ text: "OK" }]
//       );
//       return;
//     }

//     Alert.alert("Choose photo", "Take a new photo or pick from gallery", [
//       {
//         text: "Camera",
//         onPress: async () => {
//           const res = await ImagePicker.launchCameraAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       {
//         text: "Gallery",
//         onPress: async () => {
//           const res = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or select a photo first.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;

//       // GPS takes priority over manually selected state for facility search
//       const hasGPS = location.latitude != null && location.longitude != null;

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           symptoms.difficult_to_wake,
//         floppy_or_unusually_drowsy:  symptoms.floppy_or_unusually_drowsy,
//         jaundice_first_24h:          symptoms.jaundice_first_24h,
//         jaundice_spreading:          symptoms.jaundice_spreading,
//         yellow_eyes:                 symptoms.yellow_eyes,
//         yellow_gums:                 symptoms.yellow_gums,
//         yellow_palms_or_soles:       symptoms.yellow_palms_or_soles,
//         dark_urine:                  symptoms.dark_urine,
//         pale_stool:                  symptoms.pale_stool,
//         darker_skin_tone:            symptoms.darker_skin_tone,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         // Only send state if GPS is not available — GPS is more accurate
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(err?.response?.data?.detail ?? err?.message ?? "Screening failed. Check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding("good");
//     setState("");
//     setSymptoms({
//       difficult_to_wake: false, floppy_or_unusually_drowsy: false,
//       jaundice_first_24h: false, jaundice_spreading: false,
//       yellow_eyes: false, yellow_gums: false, yellow_palms_or_soles: false,
//       dark_urine: false, pale_stool: false, darker_skin_tone: false,
//     });
//   };

//   const SymptomsToggle = ({
//     label, field, urgent = false,
//   }: { label: string; field: keyof typeof symptoms; urgent?: boolean }) => (
//     <View style={[s.symptomRow, urgent && s.symptomRowUrgent]}>
//       <Text style={s.symptomLabel}>{label}</Text>
//       <Switch
//         value={symptoms[field]}
//         onValueChange={() => toggle(field)}
//         trackColor={{ false: Colors.border, true: urgent ? Colors.rust : Colors.coral }}
//         thumbColor="#fff"
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           // Result view
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           // Form view
//           <>
//             {/* Camera section */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby photo</Text>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               <TouchableOpacity style={s.cameraBtn} onPress={pickImage}>
//                 {imageUri ? (
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                 ) : (
//                   <View style={s.cameraPlaceholder}>
//                     <Ionicons name="camera-outline" size={36} color={Colors.brownLight} />
//                     <Text style={s.cameraPlaceholderText}>Take photo or choose from gallery</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {imageUri && (
//                 <TouchableOpacity style={s.retakeBtn} onPress={pickImage}>
//                   <Ionicons name="camera-reverse-outline" size={15} color={Colors.coral} />
//                   <Text style={s.retakeBtnText}>Retake photo</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Baby age */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Age auto-filled from profile: {profile.age_hours} hours
//                 </Text>
//               </View>
//             )}

//             {/* Location */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Location</Text>

//               {/* State selector — shows selected state first, then others */}
//               <Text style={s.label}>State (optional — GPS is more accurate)</Text>

//               {/* Show selected state as a highlighted chip if picked from More */}
//               {state && !STATES.slice(0, 10).includes(state) && (
//                 <View style={s.selectedStateBanner}>
//                   <Ionicons name="checkmark-circle" size={15} color={Colors.coral} />
//                   <Text style={s.selectedStateText}>Selected: {state}</Text>
//                   <TouchableOpacity onPress={() => setState("")}>
//                     <Ionicons name="close-circle" size={15} color={Colors.brownLight} />
//                   </TouchableOpacity>
//                 </View>
//               )}

//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={{ marginBottom: 12 }}
//               >
//                 <View style={s.stateRow}>
//                   {STATES.slice(0, 10).map((st) => (
//                     <TouchableOpacity
//                       key={st}
//                       style={[s.stateChip, state === st && s.stateChipSelected]}
//                       onPress={() => setState(st)}
//                     >
//                       <Text style={[s.stateChipText, state === st && s.stateChipTextSelected]}>
//                         {st}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                   <TouchableOpacity
//                     style={[s.stateChip, s.stateChipMore]}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Text style={[s.stateChipText, { color: Colors.coral }]}>More…</Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>

//               {/* GPS button */}
//               <TouchableOpacity
//                 style={[s.gpsBtn, location.status === "granted" && s.gpsBtnGranted]}
//                 onPress={requestLocation}
//               >
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={16}
//                   color={location.status === "granted" ? Colors.sage : Colors.coral}
//                 />
//                 <Text style={[s.gpsBtnText, location.status === "granted" && { color: Colors.sage }]}>
//                   {location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "granted"
//                     ? "GPS active — nearby facilities will be accurate"
//                     : "Tap to use GPS for accurate facility search"}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Skin tone */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby's skin tone</Text>
//               <Text style={s.cardSub}>Helps adjust detection sensitivity for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => {
//                       setSkinTone(tone.key);
//                       if (["medium_dark", "dark"].includes(tone.key)) {
//                         setSymptoms(p => ({ ...p, darker_skin_tone: true }));
//                       }
//                     }}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Feeding */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>How is the baby feeding?</Text>
//               <View style={s.feedingRow}>
//                 {(["good", "poor"] as const).map((opt) => (
//                   <TouchableOpacity
//                     key={opt}
//                     style={[s.feedingBtn, feeding === opt && (opt === "good" ? s.feedingGood : s.feedingPoor)]}
//                     onPress={() => setFeeding(opt)}
//                   >
//                     <Ionicons
//                       name={opt === "good" ? "checkmark-circle-outline" : "warning-outline"}
//                       size={22}
//                       color={feeding === opt ? "#fff" : Colors.brownLight}
//                     />
//                     <Text style={[s.feedingBtnText, feeding === opt && { color: "#fff" }]}>
//                       {opt === "good" ? "Good — feeding normally" : "Poor — struggling to feed"}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Symptoms */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Signs to check</Text>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Difficult to wake for feeds" field="difficult_to_wake"   urgent />
//                 <SymptomsToggle label="Floppy or unusually drowsy"  field="floppy_or_unusually_drowsy" urgent />
//                 <SymptomsToggle label="Yellowing in first 24 hours" field="jaundice_first_24h" urgent />
//                 <SymptomsToggle label="Dark urine"                  field="dark_urine"         urgent />
//                 <SymptomsToggle label="Pale stool"                  field="pale_stool"         urgent />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — report to health worker
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Yellow in whites of eyes"      field="yellow_eyes" />
//                 <SymptomsToggle label="Yellow tinge in the gums"       field="yellow_gums" />
//                 <SymptomsToggle label="Yellow palms or soles"          field="yellow_palms_or_soles" />
//                 <SymptomsToggle label="Yellowing appears to be spreading" field="jaundice_spreading" />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.cream }]}>
//                   <Ionicons name="information-circle-outline" size={13} color={Colors.brownLight} />
//                   <Text style={[s.signsHeaderText, { color: Colors.brownLight }]}>
//                     Additional context
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Darker skin baby" field="darker_skin_tone" />
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri) && { opacity: 0.6 }]}
//               onPress={submit}
//               disabled={loading || !imageUri}
//             >
//               {loading
//                 ? <ActivityIndicator color="#fff" />
//                 : (
//                   <>
//                     <Ionicons name="scan-outline" size={18} color="#fff" />
//                     <Text style={s.submitBtnText}>Analyze screening</Text>
//                   </>
//                 )
//               }
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>

//       {/* Full state picker modal — fixes Android Alert truncation */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => { setState(item); setShowStatePicker(false); }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },

//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius:    Radius.lg,
//     padding:         16,
//     marginBottom:    14,
//     ...Shadow.sm,
//   },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 4 },
//   cardSub:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 12 },

//   cameraBtn: {
//     borderWidth:  1.5,
//     borderColor:  Colors.border,
//     borderStyle:  "dashed",
//     borderRadius: Radius.lg,
//     overflow:     "hidden",
//     minHeight:    180,
//     alignItems:   "center",
//     justifyContent: "center",
//   },
//   preview: { width: "100%", height: 220 },
//   cameraPlaceholder: { alignItems: "center", gap: 10, padding: 30 },
//   cameraPlaceholderText: {
//     fontFamily: Fonts.medium,
//     fontSize:   14,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//   },
//   retakeBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      10,
//   },
//   retakeBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     backgroundColor: Colors.sagePale,
//     borderRadius:    Radius.md,
//     padding:         10,
//     marginBottom:    14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 8 },

//   stateRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
//   stateChip: {
//     paddingHorizontal: 12,
//     paddingVertical:   7,
//     borderRadius:      Radius.full,
//     borderWidth:       1,
//     borderColor:       Colors.border,
//     backgroundColor:   Colors.cream,
//   },
//   stateChipSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   stateChipText:         { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },
//   stateChipTextSelected: { color: Colors.coral },

//   gpsBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            8,
//     borderWidth:    1.5,
//     borderColor:    Colors.coral,
//     borderRadius:   Radius.md,
//     padding:        11,
//   },
//   gpsBtnGranted: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   gpsBtnText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral, flex: 1 },

//   skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
//   skinChip: {
//     alignItems:   "center",
//     gap:          4,
//     padding:      6,
//     borderRadius: Radius.md,
//     borderWidth:  1.5,
//     borderColor:  "transparent",
//     width:        58,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 30, height: 30, borderRadius: 15 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   feedingRow: { gap: 10 },
//   feedingBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            10,
//     borderWidth:    1.5,
//     borderColor:    Colors.border,
//     borderRadius:   Radius.md,
//     padding:        12,
//   },
//   feedingGood:    { backgroundColor: Colors.sage,  borderColor: Colors.sage },
//   feedingPoor:    { backgroundColor: Colors.rust,  borderColor: Colors.rust },
//   feedingBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight, flex: 1 },

//   signsGroup: { marginBottom: 14 },
//   signsHeader: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     borderRadius:    Radius.md,
//     padding:         8,
//     marginBottom:    8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },

//   symptomRow: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   symptomRowUrgent: { backgroundColor: "#fff9f9", marginHorizontal: -4, paddingHorizontal: 4 },
//   symptomLabel:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, paddingRight: 12 },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius:    Radius.lg,
//     padding:         15,
//     flexDirection:   "row",
//     alignItems:      "center",
//     justifyContent:  "center",
//     gap:             8,
//     marginTop:       4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },

//   resetBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      16,
//     padding:        12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   stateChipMore: { borderColor: Colors.coral, borderStyle: "dashed" },

//   selectedStateBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: "#fff5f2",
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: Colors.coral,
//   },
//   selectedStateText: {
//     fontFamily: Fonts.semibold,
//     fontSize: 13,
//     color: Colors.coral,
//     flex: 1,
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:    { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });



/**
 * JaundiCare — Screening Screen
 * Camera capture, symptom form, and result display.
 */

// import React, { useState, useRef } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Alert, Image,
//   Switch, Platform, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,      setImageUri]      = useState<string | null>(null);
//   const [skinTone,      setSkinTone]      = useState<string | null>(null);
//   const [feeding,       setFeeding]       = useState<"good" | "poor">("good");
//   const [state,         setState]         = useState("");
//   const [loading,       setLoading]       = useState(false);
//   const [result,        setResult]        = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);

//   // Boolean symptom flags
//   const [symptoms, setSymptoms] = useState({
//     difficult_to_wake:           false,
//     floppy_or_unusually_drowsy:  false,
//     jaundice_first_24h:          false,
//     jaundice_spreading:          false,
//     yellow_eyes:                 false,
//     yellow_gums:                 false,
//     yellow_palms_or_soles:       false,
//     dark_urine:                  false,
//     pale_stool:                  false,
//     darker_skin_tone:            false,
//   });

//   const toggle = (key: keyof typeof symptoms) =>
//     setSymptoms((p) => ({ ...p, [key]: !p[key] }));

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Camera permission needed",
//         "Please allow camera access in your device settings to take a photo.",
//         [{ text: "OK" }]
//       );
//       return;
//     }

//     Alert.alert("Choose photo", "Take a new photo or pick from gallery", [
//       {
//         text: "Camera",
//         onPress: async () => {
//           const res = await ImagePicker.launchCameraAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       {
//         text: "Gallery",
//         onPress: async () => {
//           const res = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: "images",
//             quality: 0.9,
//             allowsEditing: false,
//           });
//           if (!res.canceled) setImageUri(res.assets[0].uri);
//         },
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or select a photo first.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;

//       // GPS takes priority over manually selected state for facility search
//       const hasGPS = location.latitude != null && location.longitude != null;

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           symptoms.difficult_to_wake,
//         floppy_or_unusually_drowsy:  symptoms.floppy_or_unusually_drowsy,
//         jaundice_first_24h:          symptoms.jaundice_first_24h,
//         jaundice_spreading:          symptoms.jaundice_spreading,
//         yellow_eyes:                 symptoms.yellow_eyes,
//         yellow_gums:                 symptoms.yellow_gums,
//         yellow_palms_or_soles:       symptoms.yellow_palms_or_soles,
//         dark_urine:                  symptoms.dark_urine,
//         pale_stool:                  symptoms.pale_stool,
//         darker_skin_tone:            symptoms.darker_skin_tone,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         // Only send state if GPS is not available — GPS is more accurate
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(err?.response?.data?.detail ?? err?.message ?? "Screening failed. Check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding("good");
//     setState("");
//     setSymptoms({
//       difficult_to_wake: false, floppy_or_unusually_drowsy: false,
//       jaundice_first_24h: false, jaundice_spreading: false,
//       yellow_eyes: false, yellow_gums: false, yellow_palms_or_soles: false,
//       dark_urine: false, pale_stool: false, darker_skin_tone: false,
//     });
//   };

//   const SymptomsToggle = ({
//     label, field, urgent = false,
//   }: { label: string; field: keyof typeof symptoms; urgent?: boolean }) => (
//     <View style={[s.symptomRow, urgent && s.symptomRowUrgent]}>
//       <Text style={s.symptomLabel}>{label}</Text>
//       <Switch
//         value={symptoms[field]}
//         onValueChange={() => toggle(field)}
//         trackColor={{ false: Colors.border, true: urgent ? Colors.rust : Colors.coral }}
//         thumbColor="#fff"
//       />
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           // Result view
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           // Form view
//           <>
//             {/* Camera section */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby photo</Text>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               <TouchableOpacity style={s.cameraBtn} onPress={pickImage}>
//                 {imageUri ? (
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                 ) : (
//                   <View style={s.cameraPlaceholder}>
//                     <Ionicons name="camera-outline" size={36} color={Colors.brownLight} />
//                     <Text style={s.cameraPlaceholderText}>Take photo or choose from gallery</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {imageUri && (
//                 <TouchableOpacity style={s.retakeBtn} onPress={pickImage}>
//                   <Ionicons name="camera-reverse-outline" size={15} color={Colors.coral} />
//                   <Text style={s.retakeBtnText}>Retake photo</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Baby age */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Age auto-filled from profile: {profile.age_hours} hours
//                 </Text>
//               </View>
//             )}

//             {/* Location */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Location</Text>

//               {/* State selector — shows selected state first, then others */}
//               <Text style={s.label}>State (optional — GPS is more accurate)</Text>

//               {/* Show selected state as a highlighted chip if picked from More */}
//               {state && !STATES.slice(0, 10).includes(state) && (
//                 <View style={s.selectedStateBanner}>
//                   <Ionicons name="checkmark-circle" size={15} color={Colors.coral} />
//                   <Text style={s.selectedStateText}>Selected: {state}</Text>
//                   <TouchableOpacity onPress={() => setState("")}>
//                     <Ionicons name="close-circle" size={15} color={Colors.brownLight} />
//                   </TouchableOpacity>
//                 </View>
//               )}

//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={{ marginBottom: 12 }}
//               >
//                 <View style={s.stateRow}>
//                   {STATES.slice(0, 10).map((st) => (
//                     <TouchableOpacity
//                       key={st}
//                       style={[s.stateChip, state === st && s.stateChipSelected]}
//                       onPress={() => setState(st)}
//                     >
//                       <Text style={[s.stateChipText, state === st && s.stateChipTextSelected]}>
//                         {st}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                   <TouchableOpacity
//                     style={[s.stateChip, s.stateChipMore]}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Text style={[s.stateChipText, { color: Colors.coral }]}>More…</Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>

//               {/* GPS button */}
//               <TouchableOpacity
//                 style={[s.gpsBtn, location.status === "granted" && s.gpsBtnGranted]}
//                 onPress={requestLocation}
//               >
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={16}
//                   color={location.status === "granted" ? Colors.sage : Colors.coral}
//                 />
//                 <Text style={[s.gpsBtnText, location.status === "granted" && { color: Colors.sage }]}>
//                   {location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "granted"
//                     ? "Location enabled — showing nearby facilities"
//                     : location.status === "denied"
//                     ? "Location access denied — select your state above"
//                     : "Enable location to find nearby facilities"}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Skin tone */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Baby's skin tone</Text>
//               <Text style={s.cardSub}>Helps adjust detection sensitivity for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => {
//                       setSkinTone(tone.key);
//                       if (["medium_dark", "dark"].includes(tone.key)) {
//                         setSymptoms(p => ({ ...p, darker_skin_tone: true }));
//                       }
//                     }}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Feeding */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>How is the baby feeding?</Text>
//               <View style={s.feedingRow}>
//                 {(["good", "poor"] as const).map((opt) => (
//                   <TouchableOpacity
//                     key={opt}
//                     style={[s.feedingBtn, feeding === opt && (opt === "good" ? s.feedingGood : s.feedingPoor)]}
//                     onPress={() => setFeeding(opt)}
//                   >
//                     <Ionicons
//                       name={opt === "good" ? "checkmark-circle-outline" : "warning-outline"}
//                       size={22}
//                       color={feeding === opt ? "#fff" : Colors.brownLight}
//                     />
//                     <Text style={[s.feedingBtnText, feeding === opt && { color: "#fff" }]}>
//                       {opt === "good" ? "Good — feeding normally" : "Poor — struggling to feed"}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Symptoms */}
//             <View style={s.card}>
//               <Text style={s.cardTitle}>Signs to check</Text>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Difficult to wake for feeds" field="difficult_to_wake"   urgent />
//                 <SymptomsToggle label="Floppy or unusually drowsy"  field="floppy_or_unusually_drowsy" urgent />
//                 <SymptomsToggle label="Yellowing in first 24 hours" field="jaundice_first_24h" urgent />
//                 <SymptomsToggle label="Dark urine"                  field="dark_urine"         urgent />
//                 <SymptomsToggle label="Pale stool"                  field="pale_stool"         urgent />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — report to health worker
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Yellow in whites of eyes"      field="yellow_eyes" />
//                 <SymptomsToggle label="Yellow tinge in the gums"       field="yellow_gums" />
//                 <SymptomsToggle label="Yellow palms or soles"          field="yellow_palms_or_soles" />
//                 <SymptomsToggle label="Yellowing appears to be spreading" field="jaundice_spreading" />
//               </View>

//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.cream }]}>
//                   <Ionicons name="information-circle-outline" size={13} color={Colors.brownLight} />
//                   <Text style={[s.signsHeaderText, { color: Colors.brownLight }]}>
//                     Additional context
//                   </Text>
//                 </View>
//                 <SymptomsToggle label="Darker skin baby" field="darker_skin_tone" />
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri) && { opacity: 0.6 }]}
//               onPress={submit}
//               disabled={loading || !imageUri}
//             >
//               {loading
//                 ? <ActivityIndicator color="#fff" />
//                 : (
//                   <>
//                     <Ionicons name="scan-outline" size={18} color="#fff" />
//                     <Text style={s.submitBtnText}>Analyze screening</Text>
//                   </>
//                 )
//               }
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>

//       {/* Full state picker modal — fixes Android Alert truncation */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => { setState(item); setShowStatePicker(false); }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },

//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius:    Radius.lg,
//     padding:         16,
//     marginBottom:    14,
//     ...Shadow.sm,
//   },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 4 },
//   cardSub:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 12 },

//   cameraBtn: {
//     borderWidth:  1.5,
//     borderColor:  Colors.border,
//     borderStyle:  "dashed",
//     borderRadius: Radius.lg,
//     overflow:     "hidden",
//     minHeight:    180,
//     alignItems:   "center",
//     justifyContent: "center",
//   },
//   preview: { width: "100%", height: 220 },
//   cameraPlaceholder: { alignItems: "center", gap: 10, padding: 30 },
//   cameraPlaceholderText: {
//     fontFamily: Fonts.medium,
//     fontSize:   14,
//     color:      Colors.brownLight,
//     textAlign:  "center",
//   },
//   retakeBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      10,
//   },
//   retakeBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     backgroundColor: Colors.sagePale,
//     borderRadius:    Radius.md,
//     padding:         10,
//     marginBottom:    14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 8 },

//   stateRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
//   stateChip: {
//     paddingHorizontal: 12,
//     paddingVertical:   7,
//     borderRadius:      Radius.full,
//     borderWidth:       1,
//     borderColor:       Colors.border,
//     backgroundColor:   Colors.cream,
//   },
//   stateChipSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   stateChipText:         { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },
//   stateChipTextSelected: { color: Colors.coral },

//   gpsBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            8,
//     borderWidth:    1.5,
//     borderColor:    Colors.coral,
//     borderRadius:   Radius.md,
//     padding:        11,
//   },
//   gpsBtnGranted: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   gpsBtnText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral, flex: 1 },

//   skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
//   skinChip: {
//     alignItems:   "center",
//     gap:          4,
//     padding:      6,
//     borderRadius: Radius.md,
//     borderWidth:  1.5,
//     borderColor:  "transparent",
//     width:        58,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 30, height: 30, borderRadius: 15 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   feedingRow: { gap: 10 },
//   feedingBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     gap:            10,
//     borderWidth:    1.5,
//     borderColor:    Colors.border,
//     borderRadius:   Radius.md,
//     padding:        12,
//   },
//   feedingGood:    { backgroundColor: Colors.sage,  borderColor: Colors.sage },
//   feedingPoor:    { backgroundColor: Colors.rust,  borderColor: Colors.rust },
//   feedingBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight, flex: 1 },

//   signsGroup: { marginBottom: 14 },
//   signsHeader: {
//     flexDirection:   "row",
//     alignItems:      "center",
//     gap:             6,
//     borderRadius:    Radius.md,
//     padding:         8,
//     marginBottom:    8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },

//   symptomRow: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   symptomRowUrgent: { backgroundColor: "#fff9f9", marginHorizontal: -4, paddingHorizontal: 4 },
//   symptomLabel:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, paddingRight: 12 },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius:    Radius.lg,
//     padding:         15,
//     flexDirection:   "row",
//     alignItems:      "center",
//     justifyContent:  "center",
//     gap:             8,
//     marginTop:       4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },

//   resetBtn: {
//     flexDirection:  "row",
//     alignItems:     "center",
//     justifyContent: "center",
//     gap:            6,
//     marginTop:      16,
//     padding:        12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   stateChipMore: { borderColor: Colors.coral, borderStyle: "dashed" },

//   selectedStateBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: "#fff5f2",
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: Colors.coral,
//   },
//   selectedStateText: {
//     fontFamily: Fonts.semibold,
//     fontSize: 13,
//     color: Colors.coral,
//     flex: 1,
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:    { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });






/**
 * JaundiCare — Screening Screen (v3)
 * Simplified UX: big feeding cards, combined symptoms,
 * facility preference selector, LGA picker, silent GPS.
 */

// import React, { useState, useEffect } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Image,
//   Switch, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// // Combined symptom groups — reduced from 10 to 7
// const URGENT_SYMPTOMS = [
//   {
//     key: "hard_to_wake",
//     label: "Hard to wake up or very floppy",
//     icon: "moon-outline" as const,
//     // Maps to two backend fields
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],
//   },
//   {
//     key: "jaundice_first_24h",
//     label: "Yellowing appeared in first 24 hours",
//     icon: "warning-outline" as const,
//     fields: ["jaundice_first_24h"],
//   },
//   {
//     key: "dark_urine_pale_stool",
//     label: "Urine is dark OR stool is very pale",
//     icon: "water-outline" as const,
//     fields: ["dark_urine", "pale_stool"],
//   },
//   {
//     key: "jaundice_spreading",
//     label: "Yellowing appears to be spreading",
//     icon: "trending-up-outline" as const,
//     fields: ["jaundice_spreading"],
//   },
// ];

// const WATCH_SYMPTOMS = [
//   {
//     key: "yellow_eyes",
//     label: "Yellow in the whites of the eyes",
//     icon: "eye-outline" as const,
//     fields: ["yellow_eyes"],
//   },
//   {
//     key: "yellow_gums_palms",
//     label: "Yellow on gums, palms or soles of feet",
//     icon: "hand-left-outline" as const,
//     fields: ["yellow_gums", "yellow_palms_or_soles"],
//   },
//   {
//     key: "darker_skin",
//     label: "Baby has darker skin tone",
//     icon: "person-outline" as const,
//     fields: ["darker_skin_tone"],
//   },
// ];

// const FACILITY_PREFERENCES = [
//   {
//     key: "nearest",
//     icon: "navigate-outline" as const,
//     label: "Nearest",
//     sub: "Fastest to reach",
//   },
//   {
//     key: "government",
//     icon: "business-outline" as const,
//     label: "Government",
//     sub: "Lower cost",
//   },
//   {
//     key: "clinic",
//     icon: "medkit-outline" as const,
//     label: "Clinic / PHC",
//     sub: "Basic care",
//   },
// ];

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);
//   const [state,       setState]       = useState("");
//   const [lga,         setLga]         = useState("");
//   const [preference,  setPreference]  = useState("nearest");
//   const [loading,     setLoading]     = useState(false);
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);

//   // Combined symptom state — one key per combined symptom
//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
//     hard_to_wake:        false,
//     jaundice_first_24h:  false,
//     dark_urine_pale_stool: false,
//     jaundice_spreading:  false,
//     yellow_eyes:         false,
//     yellow_gums_palms:   false,
//     darker_skin:         false,
//   });

//   // Auto-set darker_skin_tone when medium_dark or dark skin tone is selected
//   useEffect(() => {
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {
//       setSymptoms(p => ({ ...p, darker_skin: true }));
//     }
//   }, [skinTone]);

//   // Silent GPS request on screen load
//   useEffect(() => {
//     requestLocation();
//   }, []);

//   const toggleSymptom = (key: string) =>
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   // Expand combined symptoms back to individual backend fields
//   const expandSymptoms = () => {
//     const expanded: Record<string, boolean> = {};
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];
//     for (const group of allGroups) {
//       const isOn = symptoms[group.key] ?? false;
//       for (const field of group.fields) {
//         // If multiple groups map to same field, use OR logic
//         expanded[field] = expanded[field] || isOn;
//       }
//     }
//     return expanded;
//   };

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       showToast("Camera permission needed. Please enable in settings.");
//       return;
//     }

//     // Show options without Alert — inline UI is better on budget phones
//     // We use a simple two-button approach at bottom of card (see UI below)
//   };

//   const openCamera = async () => {
//     const res = await ImagePicker.launchCameraAsync({
//       mediaTypes: "images",
//       quality: 0.9,
//       allowsEditing: false,
//     });
//     if (!res.canceled) setImageUri(res.assets[0].uri);
//   };

//   const openGallery = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: "images",
//       quality: 0.9,
//       allowsEditing: false,
//     });
//     if (!res.canceled) setImageUri(res.assets[0].uri);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or choose a photo first.");
//       return;
//     }
//     if (!feeding) {
//       showToast("Please tell us how baby is feeding.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;
//       const hasGPS   = location.latitude != null && location.longitude != null;
//       const expanded  = expandSymptoms();

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           expanded.difficult_to_wake ?? false,
//         floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,
//         jaundice_first_24h:          expanded.jaundice_first_24h ?? false,
//         jaundice_spreading:          expanded.jaundice_spreading ?? false,
//         yellow_eyes:                 expanded.yellow_eyes ?? false,
//         yellow_gums:                 expanded.yellow_gums ?? false,
//         yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,
//         dark_urine:                  expanded.dark_urine ?? false,
//         pale_stool:                  expanded.pale_stool ?? false,
//         darker_skin_tone:            expanded.darker_skin_tone ?? false,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         user_lga:                    hasGPS ? undefined : (lga || undefined),
//         facility_preference:         preference,
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(
//         err?.response?.data?.detail ??
//         err?.message ??
//         "Screening failed. Check your connection and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding(null);
//     setState("");
//     setLga("");
//     setPreference("nearest");
//     setSymptoms({
//       hard_to_wake: false,
//       jaundice_first_24h: false,
//       dark_urine_pale_stool: false,
//       jaundice_spreading: false,
//       yellow_eyes: false,
//       yellow_gums_palms: false,
//       darker_skin: false,
//     });
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {/* ── STEP 1: Photo ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
//                 <Text style={s.cardTitle}>Baby photo</Text>
//               </View>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               {imageUri ? (
//                 <>
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                   <View style={s.photoActions}>
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Retake</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Gallery</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               ) : (
//                 <View style={s.photoButtons}>
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>
//                     <Ionicons name="camera" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Take photo</Text>
//                   </TouchableOpacity>
//                   <View style={s.photoDivider} />
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>
//                     <Ionicons name="images" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Choose from gallery</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {/* Age auto-fill */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Baby age: {profile.age_hours}h — auto-filled from profile
//                 </Text>
//               </View>
//             )}

//             {/* ── STEP 2: Feeding ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
//                 <Text style={s.cardTitle}>How is baby feeding?</Text>
//               </View>
//               <View style={s.feedingRow}>
//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}
//                   onPress={() => setFeeding("good")}
//                 >
//                   <Text style={s.feedingIcon}>🍼</Text>
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>
//                     Feeding well
//                   </Text>
//                   <Text style={s.feedingSub}>Latching and feeding normally</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}
//                   onPress={() => setFeeding("poor")}
//                 >
//                   <Text style={s.feedingIcon}>⚠️</Text>
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>
//                     Struggling
//                   </Text>
//                   <Text style={s.feedingSub}>Not feeding much or refusing</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* ── STEP 3: Symptoms ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
//                 <Text style={s.cardTitle}>What do you notice?</Text>
//               </View>
//               <Text style={s.cardSub}>Toggle everything you can see or have noticed.</Text>

//               {/* Urgent signs */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 {URGENT_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.rust }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>

//               {/* Watch closely */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — tell your health worker
//                   </Text>
//                 </View>
//                 {WATCH_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.amber }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 4: Skin tone ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>
//                 <Text style={s.cardTitle}>Baby's skin tone</Text>
//               </View>
//               <Text style={s.cardSub}>Helps us adjust detection for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => setSkinTone(tone.key)}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 5: Location ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>
//                 <Text style={s.cardTitle}>Location</Text>
//               </View>

//               {/* GPS status */}
//               <View style={[
//                 s.gpsStatus,
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,
//               ]}>
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={15}
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}
//                 />
//                 <Text style={[
//                   s.gpsText,
//                   location.status === "granted" && { color: Colors.sage },
//                 ]}>
//                   {location.status === "granted"
//                     ? "Location enabled — showing nearby facilities"
//                     : location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "denied"
//                     ? "Location denied — select state below"
//                     : "Getting your location..."}
//                 </Text>
//               </View>

//               {/* State + LGA fallback — only show if GPS not available */}
//               {location.status !== "granted" && (
//                 <>
//                   <TouchableOpacity
//                     style={s.pickerBtn}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />
//                     <Text style={s.pickerBtnText}>
//                       {state || "Select your state"}
//                     </Text>
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                   </TouchableOpacity>

//                   {state !== "" && (
//                     <TouchableOpacity
//                       style={[s.pickerBtn, { marginTop: 8 }]}
//                       onPress={() => setShowLgaPicker(true)}
//                     >
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />
//                       <Text style={s.pickerBtnText}>
//                         {lga || "Select your LGA (optional)"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>

//             {/* ── STEP 6: Facility Preference ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>
//                 <Text style={s.cardTitle}>Where would you like to go?</Text>
//               </View>
//               <Text style={s.cardSub}>We will find the best match near you.</Text>
//               <View style={s.prefRow}>
//                 {FACILITY_PREFERENCES.map((pref) => (
//                   <TouchableOpacity
//                     key={pref.key}
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}
//                     onPress={() => setPreference(pref.key)}
//                   >
//                     <Ionicons
//                       name={pref.icon}
//                       size={22}
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}
//                     />
//                     <Text style={[
//                       s.prefLabel,
//                       preference === pref.key && { color: Colors.coral },
//                     ]}>
//                       {pref.label}
//                     </Text>
//                     <Text style={s.prefSub}>{pref.sub}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri || !feeding) && { opacity: 0.55 }]}
//               onPress={submit}
//               disabled={loading || !imageUri || !feeding}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="scan-outline" size={20} color="#fff" />
//                   <Text style={s.submitBtnText}>Analyze screening</Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {(!imageUri || !feeding) && (
//               <Text style={s.submitHint}>
//                 {!imageUri ? "Photo required" : "Please select how baby is feeding"}
//               </Text>
//             )}
//           </>
//         )}
//       </ScrollView>

//       {/* State picker modal */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setState(item);
//                     setLga("");
//                     setShowStatePicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* LGA picker modal */}
//       <Modal visible={showLgaPicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your LGA</Text>
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={lgaOptions}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setLga(item);
//                     setShowLgaPicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {lga === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     marginBottom: 14,
//     ...Shadow.sm,
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
//   stepNum: {
//     width: 26, height: 26, borderRadius: 13,
//     backgroundColor: Colors.coral,
//     alignItems: "center", justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },

//   // Photo
//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },
//   photoButtons: {
//     flexDirection: "row",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//     overflow: "hidden",
//     minHeight: 140,
//   },
//   photoBigBtn: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     padding: 20,
//   },
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },
//   photoDivider:    { width: 1, backgroundColor: Colors.border },
//   photoActions:    { flexDirection: "row", gap: 10 },
//   photoBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     padding: 9,
//   },
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   // Age banner
//   ageBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: Colors.sagePale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginBottom: 14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   // Feeding cards
//   feedingRow: { flexDirection: "row", gap: 10 },
//   feedingCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     gap: 4,
//   },
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },
//   feedingIcon:  { fontSize: 28 },
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },

//   // Symptoms
//   signsGroup:  { marginBottom: 14 },
//   signsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },
//   symptomRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 11,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     gap: 10,
//   },
//   symptomIcon:  { width: 22 },
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },

//   // Skin tone
//   skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
//   skinChip: {
//     alignItems: "center",
//     gap: 4,
//     padding: 6,
//     borderRadius: Radius.md,
//     borderWidth: 1.5,
//     borderColor: "transparent",
//     width: 60,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 32, height: 32, borderRadius: 16 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   // GPS
//   gpsStatus: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: Radius.md,
//     padding: 11,
//     marginBottom: 10,
//   },
//   gpsGranted: { backgroundColor: Colors.sagePale },
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },

//   // State/LGA picker buttons
//   pickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.md,
//     padding: 12,
//     backgroundColor: Colors.cream,
//   },
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   // Facility preference
//   prefRow: { flexDirection: "row", gap: 8 },
//   prefCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 12,
//     alignItems: "center",
//     gap: 4,
//   },
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   // Submit
//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginTop: 4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },

//   // Reset
//   resetBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     marginTop: 16,
//     padding: 12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   // Modals
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });



// /**
//  * JaundiCare — Screening Screen (v3)
//  * Simplified UX: big feeding cards, combined symptoms,
//  * facility preference selector, LGA picker, silent GPS.
//  */

// import React, { useState, useEffect } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Image,
//   Switch, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// // Combined symptom groups — reduced from 10 to 7
// const URGENT_SYMPTOMS = [
//   {
//     key: "hard_to_wake",
//     label: "Hard to wake up or very floppy",
//     icon: "moon-outline" as const,
//     // Maps to two backend fields
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],
//   },
//   {
//     key: "jaundice_first_24h",
//     label: "Yellowing appeared in first 24 hours",
//     icon: "warning-outline" as const,
//     fields: ["jaundice_first_24h"],
//   },
//   {
//     key: "dark_urine_pale_stool",
//     label: "Urine is dark OR stool is very pale",
//     icon: "water-outline" as const,
//     fields: ["dark_urine", "pale_stool"],
//   },
//   {
//     key: "jaundice_spreading",
//     label: "Yellowing appears to be spreading",
//     icon: "trending-up-outline" as const,
//     fields: ["jaundice_spreading"],
//   },
// ];

// const WATCH_SYMPTOMS = [
//   {
//     key: "yellow_eyes",
//     label: "Yellow in the whites of the eyes",
//     icon: "eye-outline" as const,
//     fields: ["yellow_eyes"],
//   },
//   {
//     key: "yellow_gums_palms",
//     label: "Yellow on gums, palms or soles of feet",
//     icon: "hand-left-outline" as const,
//     fields: ["yellow_gums", "yellow_palms_or_soles"],
//   },
//   {
//     key: "darker_skin",
//     label: "Baby has darker skin tone",
//     icon: "person-outline" as const,
//     fields: ["darker_skin_tone"],
//   },
// ];

// const FACILITY_PREFERENCES = [
//   {
//     key: "nearest",
//     icon: "navigate-outline" as const,
//     label: "Nearest",
//     sub: "Fastest to reach",
//   },
//   {
//     key: "government",
//     icon: "business-outline" as const,
//     label: "Govt",
//     sub: "Lower cost",
//   },
//   {
//     key: "clinic",
//     icon: "medkit-outline" as const,
//     label: "Clinic/PHC",
//     sub: "Basic care",
//   },
// ];

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);
//   const [state,       setState]       = useState("");
//   const [lga,         setLga]         = useState("");
//   const [preference,  setPreference]  = useState("nearest");
//   const [loading,     setLoading]     = useState(false);
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);

//   // Combined symptom state — one key per combined symptom
//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
//     hard_to_wake:        false,
//     jaundice_first_24h:  false,
//     dark_urine_pale_stool: false,
//     jaundice_spreading:  false,
//     yellow_eyes:         false,
//     yellow_gums_palms:   false,
//     darker_skin:         false,
//   });

//   // Auto-set darker_skin_tone when medium_dark or dark skin tone is selected
//   useEffect(() => {
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {
//       setSymptoms(p => ({ ...p, darker_skin: true }));
//     }
//   }, [skinTone]);

//   // Silent GPS request on screen load
//   useEffect(() => {
//     requestLocation();
//   }, []);

//   const toggleSymptom = (key: string) =>
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   // Expand combined symptoms back to individual backend fields
//   const expandSymptoms = () => {
//     const expanded: Record<string, boolean> = {};
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];
//     for (const group of allGroups) {
//       const isOn = symptoms[group.key] ?? false;
//       for (const field of group.fields) {
//         // If multiple groups map to same field, use OR logic
//         expanded[field] = expanded[field] || isOn;
//       }
//     }
//     return expanded;
//   };

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       showToast("Camera permission needed. Please enable in settings.");
//       return;
//     }

//     // Show options without Alert — inline UI is better on budget phones
//     // We use a simple two-button approach at bottom of card (see UI below)
//   };

//   const openCamera = async () => {
//     const res = await ImagePicker.launchCameraAsync({
//       mediaTypes: "images",
//       quality: 0.9,
//       allowsEditing: false,
//     });
//     if (!res.canceled) setImageUri(res.assets[0].uri);
//   };

//   const openGallery = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: "images",
//       quality: 0.9,
//       allowsEditing: false,
//     });
//     if (!res.canceled) setImageUri(res.assets[0].uri);
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or choose a photo first.");
//       return;
//     }
//     if (!feeding) {
//       showToast("Please tell us how baby is feeding.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;
//       const hasGPS   = location.latitude != null && location.longitude != null;
//       const expanded  = expandSymptoms();

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           expanded.difficult_to_wake ?? false,
//         floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,
//         jaundice_first_24h:          expanded.jaundice_first_24h ?? false,
//         jaundice_spreading:          expanded.jaundice_spreading ?? false,
//         yellow_eyes:                 expanded.yellow_eyes ?? false,
//         yellow_gums:                 expanded.yellow_gums ?? false,
//         yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,
//         dark_urine:                  expanded.dark_urine ?? false,
//         pale_stool:                  expanded.pale_stool ?? false,
//         darker_skin_tone:            expanded.darker_skin_tone ?? false,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         user_lga:                    hasGPS ? undefined : (lga || undefined),
//         facility_preference:         preference,
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(
//         err?.response?.data?.detail ??
//         err?.message ??
//         "Screening failed. Check your connection and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding(null);
//     setState("");
//     setLga("");
//     setPreference("nearest");
//     setSymptoms({
//       hard_to_wake: false,
//       jaundice_first_24h: false,
//       dark_urine_pale_stool: false,
//       jaundice_spreading: false,
//       yellow_eyes: false,
//       yellow_gums_palms: false,
//       darker_skin: false,
//     });
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {/* ── STEP 1: Photo ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
//                 <Text style={s.cardTitle}>Baby photo</Text>
//               </View>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               {imageUri ? (
//                 <>
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                   <View style={s.photoActions}>
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Retake</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Gallery</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               ) : (
//                 <View style={s.photoButtons}>
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>
//                     <Ionicons name="camera" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Take photo</Text>
//                   </TouchableOpacity>
//                   <View style={s.photoDivider} />
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>
//                     <Ionicons name="images" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Choose from gallery</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {/* Age auto-fill */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Baby age: {profile.age_hours}h — auto-filled from profile
//                 </Text>
//               </View>
//             )}

//             {/* ── STEP 2: Feeding ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
//                 <Text style={s.cardTitle}>How is baby feeding?</Text>
//               </View>
//               <View style={s.feedingRow}>
//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}
//                   onPress={() => setFeeding("good")}
//                 >
//                   <Text style={s.feedingIcon}>🍼</Text>
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>
//                     Feeding well
//                   </Text>
//                   <Text style={s.feedingSub}>Latching and feeding normally</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}
//                   onPress={() => setFeeding("poor")}
//                 >
//                   <Text style={s.feedingIcon}>⚠️</Text>
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>
//                     Struggling
//                   </Text>
//                   <Text style={s.feedingSub}>Not feeding much or refusing</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* ── STEP 3: Symptoms ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
//                 <Text style={s.cardTitle}>What do you notice?</Text>
//               </View>
//               <Text style={s.cardSub}>Toggle everything you can see or have noticed.</Text>

//               {/* Urgent signs */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 {URGENT_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.rust }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>

//               {/* Watch closely */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — tell your health worker
//                   </Text>
//                 </View>
//                 {WATCH_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.amber }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 4: Skin tone ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>
//                 <Text style={s.cardTitle}>Baby's skin tone</Text>
//               </View>
//               <Text style={s.cardSub}>Helps us adjust detection for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => setSkinTone(tone.key)}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 5: Location ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>
//                 <Text style={s.cardTitle}>Location</Text>
//               </View>

//               {/* GPS status */}
//               <View style={[
//                 s.gpsStatus,
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,
//               ]}>
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={15}
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}
//                 />
//                 <Text style={[
//                   s.gpsText,
//                   location.status === "granted" && { color: Colors.sage },
//                 ]}>
//                   {location.status === "granted"
//                     ? "Location enabled — showing nearby facilities"
//                     : location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "denied"
//                     ? "Location denied — select state below"
//                     : "Getting your location..."}
//                 </Text>
//               </View>

//               {/* State + LGA fallback — only show if GPS not available */}
//               {location.status !== "granted" && (
//                 <>
//                   <TouchableOpacity
//                     style={s.pickerBtn}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />
//                     <Text style={s.pickerBtnText}>
//                       {state || "Select your state"}
//                     </Text>
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                   </TouchableOpacity>

//                   {state !== "" && (
//                     <TouchableOpacity
//                       style={[s.pickerBtn, { marginTop: 8 }]}
//                       onPress={() => setShowLgaPicker(true)}
//                     >
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />
//                       <Text style={s.pickerBtnText}>
//                         {lga || "Select your LGA (optional)"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>

//             {/* ── STEP 6: Facility Preference ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>
//                 <Text style={s.cardTitle}>Where would you like to go?</Text>
//               </View>
//               <Text style={s.cardSub}>We will find the best match near you.</Text>
//               <View style={s.prefRow}>
//                 {FACILITY_PREFERENCES.map((pref) => (
//                   <TouchableOpacity
//                     key={pref.key}
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}
//                     onPress={() => setPreference(pref.key)}
//                   >
//                     <Ionicons
//                       name={pref.icon}
//                       size={22}
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}
//                     />
//                     <Text style={[
//                       s.prefLabel,
//                       preference === pref.key && { color: Colors.coral },
//                     ]}>
//                       {pref.label}
//                     </Text>
//                     <Text style={s.prefSub}>{pref.sub}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || !imageUri || !feeding) && { opacity: 0.55 }]}
//               onPress={submit}
//               disabled={loading || !imageUri || !feeding}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="scan-outline" size={20} color="#fff" />
//                   <Text style={s.submitBtnText}>Analyze screening</Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {(!imageUri || !feeding) && (
//               <Text style={s.submitHint}>
//                 {!imageUri ? "Photo required" : "Please select how baby is feeding"}
//               </Text>
//             )}
//           </>
//         )}
//       </ScrollView>

//       {/* State picker modal */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setState(item);
//                     setLga("");
//                     setShowStatePicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* LGA picker modal */}
//       <Modal visible={showLgaPicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your LGA</Text>
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={lgaOptions}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setLga(item);
//                     setShowLgaPicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {lga === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     marginBottom: 14,
//     ...Shadow.sm,
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
//   stepNum: {
//     width: 26, height: 26, borderRadius: 13,
//     backgroundColor: Colors.coral,
//     alignItems: "center", justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },

//   // Photo
//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },
//   photoButtons: {
//     flexDirection: "row",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//     overflow: "hidden",
//     minHeight: 140,
//   },
//   photoBigBtn: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     padding: 20,
//   },
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },
//   photoDivider:    { width: 1, backgroundColor: Colors.border },
//   photoActions:    { flexDirection: "row", gap: 10 },
//   photoBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     padding: 9,
//   },
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   // Age banner
//   ageBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: Colors.sagePale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginBottom: 14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   // Feeding cards
//   feedingRow: { flexDirection: "row", gap: 10 },
//   feedingCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     gap: 4,
//   },
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },
//   feedingIcon:  { fontSize: 28 },
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },

//   // Symptoms
//   signsGroup:  { marginBottom: 14 },
//   signsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },
//   symptomRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 11,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     gap: 10,
//   },
//   symptomIcon:  { width: 22 },
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },

//   // Skin tone
//   skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },
//   skinChip: {
//     alignItems: "center",
//     gap: 3,
//     padding: 5,
//     borderRadius: Radius.md,
//     borderWidth: 1.5,
//     borderColor: "transparent",
//     flex: 1,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 26, height: 26, borderRadius: 13 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },

//   // GPS
//   gpsStatus: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: Radius.md,
//     padding: 11,
//     marginBottom: 10,
//   },
//   gpsGranted: { backgroundColor: Colors.sagePale },
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },

//   // State/LGA picker buttons
//   pickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.md,
//     padding: 12,
//     backgroundColor: Colors.cream,
//   },
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   // Facility preference
//   prefRow: { flexDirection: "row", gap: 8 },
//   prefCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 12,
//     alignItems: "center",
//     gap: 4,
//   },
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   // Submit
//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginTop: 4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },

//   // Reset
//   resetBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     marginTop: 16,
//     padding: 12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   // Modals
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });



/**
 * JaundiCare — Screening Screen (v4)
 * Simplified UX: big feeding cards, combined symptoms,
 * facility preference selector, LGA picker, silent GPS.
 * Image compression and states loading
 */

// import React, { useState, useEffect } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Image,
//   Switch, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator"; // Added optimization package
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// // Combined symptom groups — reduced from 10 to 7
// const URGENT_SYMPTOMS = [
//   {
//     key: "hard_to_wake",
//     label: "Hard to wake up or very floppy",
//     icon: "moon-outline" as const,
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],
//   },
//   {
//     key: "jaundice_first_24h",
//     label: "Yellowing appeared in first 24 hours",
//     icon: "warning-outline" as const,
//     fields: ["jaundice_first_24h"],
//   },
//   {
//     key: "dark_urine_pale_stool",
//     label: "Urine is dark OR stool is very pale",
//     icon: "water-outline" as const,
//     fields: ["dark_urine", "pale_stool"],
//   },
//   {
//     key: "jaundice_spreading",
//     label: "Yellowing appears to be spreading",
//     icon: "trending-up-outline" as const,
//     fields: ["jaundice_spreading"],
//   },
// ];

// const WATCH_SYMPTOMS = [
//   {
//     key: "yellow_eyes",
//     label: "Yellow in the whites of the eyes",
//     icon: "eye-outline" as const,
//     fields: ["yellow_eyes"],
//   },
//   {
//     key: "yellow_gums_palms",
//     label: "Yellow on gums, palms or soles of feet",
//     icon: "hand-left-outline" as const,
//     fields: ["yellow_gums", "yellow_palms_or_soles"],
//   },
//   {
//     key: "darker_skin",
//     label: "Baby has darker skin tone",
//     icon: "person-outline" as const,
//     fields: ["darker_skin_tone"],
//   },
// ];

// const FACILITY_PREFERENCES = [
//   {
//     key: "nearest",
//     icon: "navigate-outline" as const,
//     label: "Nearest",
//     sub: "Fastest to reach",
//   },
//   {
//     key: "government",
//     icon: "business-outline" as const,
//     label: "Govt",
//     sub: "Lower cost",
//   },
//   {
//     key: "clinic",
//     icon: "medkit-outline" as const,
//     label: "Clinic/PHC",
//     sub: "Basic care",
//   },
// ];

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);
//   const [state,       setState]       = useState("");
//   const [lga,         setLga]         = useState("");
//   const [preference,  setPreference]  = useState("nearest");
//   const [loading,     setLoading]     = useState(false);
//   const [compressing, setCompressing] = useState(false); // Added dedicated state for compression feedback
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);

//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
//     hard_to_wake:         false,
//     jaundice_first_24h:   false,
//     dark_urine_pale_stool: false,
//     jaundice_spreading:   false,
//     yellow_eyes:          false,
//     yellow_gums_palms:    false,
//     darker_skin:          false,
//   });

//   useEffect(() => {
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {
//       setSymptoms(p => ({ ...p, darker_skin: true }));
//     }
//   }, [skinTone]);

//   useEffect(() => {
//     requestLocation();
//   }, []);

//   const toggleSymptom = (key: string) =>
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   const expandSymptoms = () => {
//     const expanded: Record<string, boolean> = {};
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];
//     for (const group of allGroups) {
//       const isOn = symptoms[group.key] ?? false;
//       for (const field of group.fields) {
//         expanded[field] = expanded[field] || isOn;
//       }
//     }
//     return expanded;
//   };

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       showToast("Camera permission needed. Please enable in settings.");
//       return;
//     }
//   };

//   // Helper compression pipeline to reduce resolution and file weight
//   const processAndOptimizeImage = async (originalUri: string) => {
//     setCompressing(true);
//     try {
//       // Targets standard 800px width (maintains aspect ratio), saves as JPEG, drops quality to 70%
//       const manipulatedImage = await ImageManipulator.manipulateAsync(
//         originalUri,
//         [{ resize: { width: 800 } }],
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
//       );
//       setImageUri(manipulatedImage.uri);
//     } catch (err) {
//       showToast("Could not optimize image. Using original file.");
//       setImageUri(originalUri);
//     } finally {
//       setCompressing(false);
//     }
//   };

//   const openCamera = async () => {
//     const res = await ImagePicker.launchCameraAsync({
//       mediaTypes: "images",
//       quality: 0.8, // Initial target quality
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const openGallery = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: "images",
//       quality: 0.8, // Initial target quality
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or choose a photo first.");
//       return;
//     }
//     if (!feeding) {
//       showToast("Please tell us how baby is feeding.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;
//       const hasGPS   = location.latitude != null && location.longitude != null;
//       const expanded  = expandSymptoms();

//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           expanded.difficult_to_wake ?? false,
//         floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,
//         jaundice_first_24h:          expanded.jaundice_first_24h ?? false,
//         jaundice_spreading:          expanded.jaundice_spreading ?? false,
//         yellow_eyes:                 expanded.yellow_eyes ?? false,
//         yellow_gums:                 expanded.yellow_gums ?? false,
//         yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,
//         dark_urine:                  expanded.dark_urine ?? false,
//         pale_stool:                  expanded.pale_stool ?? false,
//         darker_skin_tone:            expanded.darker_skin_tone ?? false,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         user_lga:                    hasGPS ? undefined : (lga || undefined),
//         facility_preference:         preference,
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       showToast(
//         err?.response?.data?.detail ??
//         err?.message ??
//         "Screening failed. Check your connection and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding(null);
//     setState("");
//     setLga("");
//     setPreference("nearest");
//     setSymptoms({
//       hard_to_wake: false,
//       jaundice_first_24h: false,
//       dark_urine_pale_stool: false,
//       jaundice_spreading: false,
//       yellow_eyes: false,
//       yellow_gums_palms: false,
//       darker_skin: false,
//     });
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {/* ── STEP 1: Photo ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
//                 <Text style={s.cardTitle}>Baby photo</Text>
//               </View>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               {compressing ? (
//                 /* Clear processing indicator so the UI doesn't look dead on a budget phone while scaling */
//                 <View style={s.compressingContainer}>
//                   <ActivityIndicator size="small" color={Colors.coral} />
//                   <Text style={s.compressingText}>Optimizing image size...</Text>
//                 </View>
//               ) : imageUri ? (
//                 <>
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                   <View style={s.photoActions}>
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Retake</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Gallery</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               ) : (
//                 <View style={s.photoButtons}>
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>
//                     <Ionicons name="camera" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Take photo</Text>
//                   </TouchableOpacity>
//                   <View style={s.photoDivider} />
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>
//                     <Ionicons name="images" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Choose from gallery</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {/* Age auto-fill */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Baby age: {profile.age_hours}h — auto-filled from profile
//                 </Text>
//               </View>
//             )}

//             {/* ── STEP 2: Feeding ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
//                 <Text style={s.cardTitle}>How is baby feeding?</Text>
//               </View>
//               <View style={s.feedingRow}>
//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}
//                   onPress={() => setFeeding("good")}
//                 >
//                   <Text style={s.feedingIcon}>🍼</Text>
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>
//                     Feeding well
//                   </Text>
//                   <Text style={s.feedingSub}>Latching and feeding normally</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}
//                   onPress={() => setFeeding("poor")}
//                 >
//                   <Text style={s.feedingIcon}>⚠️</Text>
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>
//                     Struggling
//                   </Text>
//                   <Text style={s.feedingSub}>Not feeding much or refusing</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* ── STEP 3: Symptoms ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
//                 <Text style={s.cardTitle}>What do you notice?</Text>
//               </View>
//               <Text style={s.cardSub}>Toggle everything you can see or have noticed.</Text>

//               {/* Urgent signs */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 {URGENT_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.rust }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>

//               {/* Watch closely */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — tell your health worker
//                   </Text>
//                 </View>
//                 {WATCH_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.amber }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 4: Skin tone ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>
//                 <Text style={s.cardTitle}>Baby's skin tone</Text>
//               </View>
//               <Text style={s.cardSub}>Helps us adjust detection for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => setSkinTone(tone.key)}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 5: Location ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>
//                 <Text style={s.cardTitle}>Location</Text>
//               </View>

//               {/* GPS status */}
//               <View style={[
//                 s.gpsStatus,
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,
//               ]}>
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={15}
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}
//                 />
//                 <Text style={[
//                   s.gpsText,
//                   location.status === "granted" && { color: Colors.sage },
//                 ]}>
//                   {location.status === "granted"
//                     ? "Location enabled — showing nearby facilities"
//                     : location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "denied"
//                     ? "Location denied — select state below"
//                     : "Getting your location..."}
//                 </Text>
//               </View>

//               {/* State + LGA fallback — only show if GPS not available */}
//               {location.status !== "granted" && (
//                 <>
//                   <TouchableOpacity
//                     style={s.pickerBtn}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />
//                     <Text style={s.pickerBtnText}>
//                       {state || "Select your state"}
//                     </Text>
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                   </TouchableOpacity>

//                   {state !== "" && (
//                     <TouchableOpacity
//                       style={[s.pickerBtn, { marginTop: 8 }]}
//                       onPress={() => setShowLgaPicker(true)}
//                     >
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />
//                       <Text style={s.pickerBtnText}>
//                         {lga || "Select your LGA (optional)"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>

//             {/* ── STEP 6: Facility Preference ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>
//                 <Text style={s.cardTitle}>Where would you like to go?</Text>
//               </View>
//               <Text style={s.cardSub}>We will find the best match near you.</Text>
//               <View style={s.prefRow}>
//                 {FACILITY_PREFERENCES.map((pref) => (
//                   <TouchableOpacity
//                     key={pref.key}
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}
//                     onPress={() => setPreference(pref.key)}
//                   >
//                     <Ionicons
//                       name={pref.icon}
//                       size={22}
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}
//                     />
//                     <Text style={[
//                       s.prefLabel,
//                       preference === pref.key && { color: Colors.coral },
//                     ]}>
//                       {pref.label}
//                     </Text>
//                     <Text style={s.prefSub}>{pref.sub}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || compressing || !imageUri || !feeding) && { opacity: 0.55 }]}
//               onPress={submit}
//               disabled={loading || compressing || !imageUri || !feeding}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="scan-outline" size={20} color="#fff" />
//                   <Text style={s.submitBtnText}>Analyze screening</Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {(!imageUri || !feeding) && (
//               <Text style={s.submitHint}>
//                 {!imageUri ? "Photo required" : "Please select how baby is feeding"}
//               </Text>
//             )}
//           </>
//         )}
//       </ScrollView>

//       {/* State picker modal */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setState(item);
//                     setLga("");
//                     setShowStatePicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* LGA picker modal */}
//       <Modal visible={showLgaPicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your LGA</Text>
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={lgaOptions}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setLga(item);
//                     setShowLgaPicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {lga === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     marginBottom: 14,
//     ...Shadow.sm,
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
//   stepNum: {
//     width: 26, height: 26, borderRadius: 13,
//     backgroundColor: Colors.coral,
//     alignItems: "center", justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },

//   // Photo Compression State Styles
//   compressingContainer: {
//     minHeight: 140,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//   },
//   compressingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },

//   // Photo
//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },
//   photoButtons: {
//     flexDirection: "row",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//     overflow: "hidden",
//     minHeight: 140,
//   },
//   photoBigBtn: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     padding: 20,
//   },
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },
//   photoDivider:    { width: 1, backgroundColor: Colors.border },
//   photoActions:    { flexDirection: "row", gap: 10 },
//   photoBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     padding: 9,
//   },
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   // Age banner
//   ageBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: Colors.sagePale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginBottom: 14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   // Feeding cards
//   feedingRow: { flexDirection: "row", gap: 10 },
//   feedingCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     gap: 4,
//   },
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },
//   feedingIcon:  { fontSize: 28 },
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },

//   // Symptoms
//   signsGroup:  { marginBottom: 14 },
//   signsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },
//   symptomRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 11,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     gap: 10,
//   },
//   symptomIcon:  { width: 22 },
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },

//   // Skin tone
//   skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },
//   skinChip: {
//     alignItems: "center",
//     gap: 3,
//     padding: 5,
//     borderRadius: Radius.md,
//     borderWidth: 1.5,
//     borderColor: "transparent",
//     flex: 1,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 26, height: 26, borderRadius: 13 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },

//   // GPS
//   gpsStatus: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: Radius.md,
//     padding: 11,
//     marginBottom: 10,
//   },
//   gpsGranted: { backgroundColor: Colors.sagePale },
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },

//   // State/LGA picker buttons
//   pickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.md,
//     padding: 12,
//     backgroundColor: Colors.cream,
//   },
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   // Facility preference
//   prefRow: { flexDirection: "row", gap: 8 },
//   prefCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 12,
//     alignItems: "center",
//     gap: 4,
//   },
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   // Submit
//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginTop: 4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },

//   // Reset
//   resetBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     marginTop: 16,
//     padding: 12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   // Modals
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });


// /**
//  * JaundiCare — Screening Screen (v4)
//  * Simplified UX: big feeding cards, combined symptoms,
//  * facility preference selector, LGA picker, silent GPS.
//  * Image compression and states loading
//  */

// import React, { useState, useEffect } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Image,
//   Switch, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator"; 
// import NetInfo from "@react-native-community/netinfo"; // Added network connectivity hook
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { saveScreeningOffline } from "../../services/offlineStore"; // Added offline system driver
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../components/Toast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// const URGENT_SYMPTOMS = [
//   {
//     key: "hard_to_wake",
//     label: "Hard to wake up or very floppy",
//     icon: "moon-outline" as const,
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],
//   },
//   {
//     key: "jaundice_first_24h",
//     label: "Yellowing appeared in first 24 hours",
//     icon: "warning-outline" as const,
//     fields: ["jaundice_first_24h"],
//   },
//   {
//     key: "dark_urine_pale_stool",
//     label: "Urine is dark OR stool is very pale",
//     icon: "water-outline" as const,
//     fields: ["dark_urine", "pale_stool"],
//   },
//   {
//     key: "jaundice_spreading",
//     label: "Yellowing appears to be spreading",
//     icon: "trending-up-outline" as const,
//     fields: ["jaundice_spreading"],
//   },
// ];

// const WATCH_SYMPTOMS = [
//   {
//     key: "yellow_eyes",
//     label: "Yellow in the whites of the eyes",
//     icon: "eye-outline" as const,
//     fields: ["yellow_eyes"],
//   },
//   {
//     key: "yellow_gums_palms",
//     label: "Yellow on gums, palms or soles of feet",
//     icon: "hand-left-outline" as const,
//     fields: ["yellow_gums", "yellow_palms_or_soles"],
//   },
//   {
//     key: "darker_skin",
//     label: "Baby has darker skin tone",
//     icon: "person-outline" as const,
//     fields: ["darker_skin_tone"],
//   },
// ];

// const FACILITY_PREFERENCES = [
//   {
//     key: "nearest",
//     icon: "navigate-outline" as const,
//     label: "Nearest",
//     sub: "Fastest to reach",
//   },
//   {
//     key: "government",
//     icon: "business-outline" as const,
//     label: "Govt",
//     sub: "Lower cost",
//   },
//   {
//     key: "clinic",
//     icon: "medkit-outline" as const,
//     label: "Clinic/PHC",
//     sub: "Basic care",
//   },
// ];

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);
//   const [state,       setState]       = useState("");
//   const [lga,         setLga]         = useState("");
//   const [preference,  setPreference]  = useState("nearest");
//   const [loading,     setLoading]     = useState(false);
//   const [compressing, setCompressing] = useState(false); 
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);

//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
//     hard_to_wake:         false,
//     jaundice_first_24h:   false,
//     dark_urine_pale_stool: false,
//     jaundice_spreading:   false,
//     yellow_eyes:          false,
//     yellow_gums_palms:    false,
//     darker_skin:          false,
//   });

//   useEffect(() => {
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {
//       setSymptoms(p => ({ ...p, darker_skin: true }));
//     }
//   }, [skinTone]);

//   useEffect(() => {
//     requestLocation();
//   }, []);

//   const toggleSymptom = (key: string) =>
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   const expandSymptoms = () => {
//     const expanded: Record<string, boolean> = {};
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];
//     for (const group of allGroups) {
//       const isOn = symptoms[group.key] ?? false;
//       for (const field of group.fields) {
//         expanded[field] = expanded[field] || isOn;
//       }
//     }
//     return expanded;
//   };

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       showToast("Camera permission needed. Please enable in settings.");
//       return;
//     }
//   };

//   const processAndOptimizeImage = async (originalUri: string) => {
//     setCompressing(true);
//     try {
//       const manipulatedImage = await ImageManipulator.manipulateAsync(
//         originalUri,
//         [{ resize: { width: 800 } }],
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
//       );
//       setImageUri(manipulatedImage.uri);
//     } catch (err) {
//       showToast("Could not optimize image. Using original file.");
//       setImageUri(originalUri);
//     } finally {
//       setCompressing(false);
//     }
//   };

//   const openCamera = async () => {
//     const res = await ImagePicker.launchCameraAsync({
//       mediaTypes: "images",
//       quality: 0.8, 
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const openGallery = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: "images",
//       quality: 0.8, 
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or choose a photo first.");
//       return;
//     }
//     if (!feeding) {
//       showToast("Please tell us how baby is feeding.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const ageHours = profile?.age_hours ?? undefined;
//       const hasGPS   = location.latitude != null && location.longitude != null;
//       const expanded  = expandSymptoms();

//       // Check device network link state via NetInfo abstraction layer
//       const netState = await NetInfo.fetch();

//       if (!netState.isConnected || !netState.isInternetReachable) {
//         // Fallback placeholder mock schema for Step 6 ONNX engine local execution path
//         const localAIEval = {
//           triageLevel: (symptoms.hard_to_wake || symptoms.jaundice_first_24h) ? ("RED" as const) : symptoms.yellow_eyes ? ("AMBER" as const) : ("GREEN" as const),
//           decisionReason: "Offline local model triage assessment.",
//           confidence: 0.85
//         };

//         // Cache structural items directly inside the offline store queue system wrapper
//         const localRecordId = await saveScreeningOffline({
//           ageHours: ageHours ?? 0,
//           feedingStatus: feeding,
//           state: hasGPS ? "GPS Location" : (state || "Unknown"),
//           observedSigns: Object.keys(expanded).filter(key => expanded[key]),
//         }, localAIEval, imageUri);

//         // Populate unified screen results wrapper directly using offline models parameters
//         const offlineResultData: ScreeningResult = {
//           id: localRecordId,
//           triage_level: localAIEval.triageLevel,
//           decision_reason: localAIEval.decisionReason,
//           confidence: localAIEval.confidence,
//           image_url: imageUri, // Temporarily renders structural file system path directly
//           created_at: new Date().toISOString(),
//           suggestions: ["Keep monitoring baby", "Seek verification when connection returns"],
//           nearby_facilities: []
//         };

//         setResult(offlineResultData);
//         setLastResult(offlineResultData);
//         storeFollowUp(offlineResultData.triage_level);

//         showToast("Saved offline! Data will sync automatically when network returns.");
//         setLoading(false);
//         return;
//       }

//       // Live configuration path continues unhindered
//       const data = await screeningApi.analyze({
//         imageUri,
//         age_hours:                   ageHours,
//         feeding,
//         difficult_to_wake:           expanded.difficult_to_wake ?? false,
//         floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,
//         jaundice_first_24h:          expanded.jaundice_first_24h ?? false,
//         jaundice_spreading:          expanded.jaundice_spreading ?? false,
//         yellow_eyes:                 expanded.yellow_eyes ?? false,
//         yellow_gums:                 expanded.yellow_gums ?? false,
//         yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,
//         dark_urine:                  expanded.dark_urine ?? false,
//         pale_stool:                  expanded.pale_stool ?? false,
//         darker_skin_tone:            expanded.darker_skin_tone ?? false,
//         skin_tone_category:          skinTone ?? undefined,
//         user_latitude:               location.latitude  ?? undefined,
//         user_longitude:              location.longitude ?? undefined,
//         user_state:                  hasGPS ? undefined : (state || undefined),
//         user_lga:                    hasGPS ? undefined : (lga || undefined),
//         facility_preference:         preference,
//         ui_language:                 "en",
//       });

//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision || data.triage_level);
//     } catch (err: any) {
//       showToast(
//         err?.response?.data?.detail ??
//         err?.message ??
//         "Screening failed. Check your connection and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding(null);
//     setState("");
//     setLga("");
//     setPreference("nearest");
//     setSymptoms({
//       hard_to_wake: false,
//       jaundice_first_24h: false,
//       dark_urine_pale_stool: false,
//       jaundice_spreading: false,
//       yellow_eyes: false,
//       yellow_gums_palms: false,
//       darker_skin: false,
//     });
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {/* ── STEP 1: Photo ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
//                 <Text style={s.cardTitle}>Baby photo</Text>
//               </View>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               {compressing ? (
//                 <View style={s.compressingContainer}>
//                   <ActivityIndicator size="small" color={Colors.coral} />
//                   <Text style={s.compressingText}>Optimizing image size...</Text>
//                 </View>
//               ) : imageUri ? (
//                 <>
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                   <View style={s.photoActions}>
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Retake</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Gallery</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               ) : (
//                 <View style={s.photoButtons}>
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>
//                     <Ionicons name="camera" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Take photo</Text>
//                   </TouchableOpacity>
//                   <View style={s.photoDivider} />
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>
//                     <Ionicons name="images" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Choose from gallery</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {/* Age auto-fill */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Baby age: {profile.age_hours}h — auto-filled from profile
//                 </Text>
//               </View>
//             )}

//             {/* ── STEP 2: Feeding ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
//                 <Text style={s.cardTitle}>How is baby feeding?</Text>
//               </View>
//               <View style={s.feedingRow}>
//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}
//                   onPress={() => setFeeding("good")}
//                 >
//                   <Text style={s.feedingIcon}>🍼</Text>
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>
//                     Feeding well
//                   </Text>
//                   <Text style={s.feedingSub}>Latching and feeding normally</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}
//                   onPress={() => setFeeding("poor")}
//                 >
//                   <Text style={s.feedingIcon}>⚠️</Text>
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>
//                     Struggling
//                   </Text>
//                   <Text style={s.feedingSub}>Not feeding much or refusing</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* ── STEP 3: Symptoms ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
//                 <Text style={s.cardTitle}>What do you notice?</Text>
//               </View>
//               <Text style={s.cardSub}>Toggle everything you can see or have noticed.</Text>

//               {/* Urgent signs */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 {URGENT_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.rust }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>

//               {/* Watch closely */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — tell your health worker
//                   </Text>
//                 </View>
//                 {WATCH_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.amber }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 4: Skin tone ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>
//                 <Text style={s.cardTitle}>Baby's skin tone</Text>
//               </View>
//               <Text style={s.cardSub}>Helps us adjust detection for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => setSkinTone(tone.key)}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 5: Location ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>
//                 <Text style={s.cardTitle}>Location</Text>
//               </View>

//               <View style={[
//                 s.gpsStatus,
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,
//               ]}>
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={15}
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}
//                 />
//                 <Text style={[
//                   s.gpsText,
//                   location.status === "granted" && { color: Colors.sage },
//                 ]}>
//                   {location.status === "granted"
//                     ? "Location enabled — showing nearby facilities"
//                     : location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "denied"
//                     ? "Location denied — select state below"
//                     : "Getting your location..."}
//                 </Text>
//               </View>

//               {location.status !== "granted" && (
//                 <>
//                   <TouchableOpacity
//                     style={s.pickerBtn}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />
//                     <Text style={s.pickerBtnText}>
//                       {state || "Select your state"}
//                     </Text>
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                   </TouchableOpacity>

//                   {state !== "" && (
//                     <TouchableOpacity
//                       style={[s.pickerBtn, { marginTop: 8 }]}
//                       onPress={() => setShowLgaPicker(true)}
//                     >
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />
//                       <Text style={s.pickerBtnText}>
//                         {lga || "Select your LGA (optional)"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>

//             {/* ── STEP 6: Facility Preference ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>
//                 <Text style={s.cardTitle}>Where would you like to go?</Text>
//               </View>
//               <Text style={s.cardSub}>We will find the best match near you.</Text>
//               <View style={s.prefRow}>
//                 {FACILITY_PREFERENCES.map((pref) => (
//                   <TouchableOpacity
//                     key={pref.key}
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}
//                     onPress={() => setPreference(pref.key)}
//                   >
//                     <Ionicons
//                       name={pref.icon}
//                       size={22}
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}
//                     />
//                     <Text style={[
//                       s.prefLabel,
//                       preference === pref.key && { color: Colors.coral },
//                     ]}>
//                       {pref.label}
//                     </Text>
//                     <Text style={s.prefSub}>{pref.sub}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || compressing || !imageUri || !feeding) && { opacity: 0.55 }]}
//               onPress={submit}
//               disabled={loading || compressing || !imageUri || !feeding}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="scan-outline" size={20} color="#fff" />
//                   <Text style={s.submitBtnText}>Analyze screening</Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {(!imageUri || !feeding) && (
//               <Text style={s.submitHint}>
//                 {!imageUri ? "Photo required" : "Please select how baby is feeding"}
//               </Text>
//             )}
//           </>
//         )}
//       </ScrollView>

//       {/* State picker modal */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setState(item);
//                     setLga("");
//                     setShowStatePicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* LGA picker modal */}
//       <Modal visible={showLgaPicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your LGA</Text>
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={lgaOptions}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setLga(item);
//                     setShowLgaPicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {lga === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     marginBottom: 14,
//     ...Shadow.sm,
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
//   stepNum: {
//     width: 26, height: 26, borderRadius: 13,
//     backgroundColor: Colors.coral,
//     alignItems: "center", justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },

//   compressingContainer: {
//     minHeight: 140,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//   },
//   compressingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },

//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },
//   photoButtons: {
//     flexDirection: "row",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//     overflow: "hidden",
//     minHeight: 140,
//   },
//   photoBigBtn: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     padding: 20,
//   },
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },
//   photoDivider:    { width: 1, backgroundColor: Colors.border },
//   photoActions:    { flexDirection: "row", gap: 10 },
//   photoBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     padding: 9,
//   },
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: Colors.sagePale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginBottom: 14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   feedingRow: { flexDirection: "row", gap: 10 },
//   feedingCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     gap: 4,
//   },
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },
//   feedingIcon:  { fontSize: 28 },
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },

//   signsGroup:  { marginBottom: 14 },
//   signsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },
//   symptomRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 11,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     gap: 10,
//   },
//   symptomIcon:  { width: 22 },
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },

//   skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },
//   skinChip: {
//     alignItems: "center",
//     gap: 3,
//     padding: 5,
//     borderRadius: Radius.md,
//     borderWidth: 1.5,
//     borderColor: "transparent",
//     flex: 1,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 26, height: 26, borderRadius: 13 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },

//   gpsStatus: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: Radius.md,
//     padding: 11,
//     marginBottom: 10,
//   },
//   gpsGranted: { backgroundColor: Colors.sagePale },
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },

//   pickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.md,
//     padding: 12,
//     backgroundColor: Colors.cream,
//   },
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   prefRow: { flexDirection: "row", gap: 8 },
//   prefCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 12,
//     alignItems: "center",
//     gap: 4,
//   },
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginTop: 4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },

//   resetBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     marginTop: 16,
//     padding: 12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });


// /**
//  * JaundiCare — Screening Screen (v4)
//  * Simplified UX: big feeding cards, combined symptoms,
//  * facility preference selector, LGA picker, silent GPS.
//  * Image compression and states loading
//  */

// import React, { useState, useEffect } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Image,
//   Switch, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { saveScreeningOffline } from "../../services/offlineStore";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../hooks/useToast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];

// const STATES = Object.keys(LGA_DATA).sort();

// const URGENT_SYMPTOMS = [
//   {
//     key: "hard_to_wake",
//     label: "Hard to wake up or very floppy",
//     icon: "moon-outline" as const,
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],
//   },
//   {
//     key: "jaundice_first_24h",
//     label: "Yellowing appeared in first 24 hours",
//     icon: "warning-outline" as const,
//     fields: ["jaundice_first_24h"],
//   },
//   {
//     key: "dark_urine_pale_stool",
//     label: "Urine is dark OR stool is very pale",
//     icon: "water-outline" as const,
//     fields: ["dark_urine", "pale_stool"],
//   },
//   {
//     key: "jaundice_spreading",
//     label: "Yellowing appears to be spreading",
//     icon: "trending-up-outline" as const,
//     fields: ["jaundice_spreading"],
//   },
// ];

// const WATCH_SYMPTOMS = [
//   {
//     key: "yellow_eyes",
//     label: "Yellow in the whites of the eyes",
//     icon: "eye-outline" as const,
//     fields: ["yellow_eyes"],
//   },
//   {
//     key: "yellow_gums_palms",
//     label: "Yellow on gums, palms or soles of feet",
//     icon: "hand-left-outline" as const,
//     fields: ["yellow_gums", "yellow_palms_or_soles"],
//   },
//   {
//     key: "darker_skin",
//     label: "Baby has darker skin tone",
//     icon: "person-outline" as const,
//     fields: ["darker_skin_tone"],
//   },
// ];

// const FACILITY_PREFERENCES = [
//   {
//     key: "nearest",
//     icon: "navigate-outline" as const,
//     label: "Nearest",
//     sub: "Fastest to reach",
//   },
//   {
//     key: "government",
//     icon: "business-outline" as const,
//     label: "Govt",
//     sub: "Lower cost",
//   },
//   {
//     key: "clinic",
//     icon: "medkit-outline" as const,
//     label: "Clinic/PHC",
//     sub: "Basic care",
//   },
// ];

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);
//   const [state,       setState]       = useState("");
//   const [lga,         setLga]         = useState("");
//   const [preference,  setPreference]  = useState("nearest");
//   const [loading,     setLoading]     = useState(false);
//   const [compressing, setCompressing] = useState(false);
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);

//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
//     hard_to_wake:         false,
//     jaundice_first_24h:   false,
//     dark_urine_pale_stool: false,
//     jaundice_spreading:   false,
//     yellow_eyes:          false,
//     yellow_gums_palms:    false,
//     darker_skin:          false,
//   });

//   useEffect(() => {
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {
//       setSymptoms(p => ({ ...p, darker_skin: true }));
//     }
//   }, [skinTone]);

//   useEffect(() => {
//     requestLocation();
//   }, []);

//   const toggleSymptom = (key: string) =>
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   const expandSymptoms = () => {
//     const expanded: Record<string, boolean> = {};
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];
//     for (const group of allGroups) {
//       const isOn = symptoms[group.key] ?? false;
//       for (const field of group.fields) {
//         expanded[field] = expanded[field] || isOn;
//       }
//     }
//     return expanded;
//   };

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       showToast("Camera permission needed. Please enable in settings.");
//       return;
//     }
//   };

//   const processAndOptimizeImage = async (originalUri: string) => {
//     setCompressing(true);
//     try {
//       const manipulatedImage = await ImageManipulator.manipulateAsync(
//         originalUri,
//         [{ resize: { width: 800 } }],
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
//       );
//       setImageUri(manipulatedImage.uri);
//     } catch (err) {
//       showToast("Could not optimize image. Using original file.");
//       setImageUri(originalUri);
//     } finally {
//       setCompressing(false);
//     }
//   };

//   const openCamera = async () => {
//     const res = await ImagePicker.launchCameraAsync({
//       mediaTypes: "images",
//       quality: 0.8,
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const openGallery = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: "images",
//       quality: 0.8,
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or choose a photo first.");
//       return;
//     }
//     if (!feeding) {
//       showToast("Please tell us how baby is feeding.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     const ageHours = profile?.age_hours ?? undefined;
//     const hasGPS   = location.latitude != null && location.longitude != null;
//     const expanded  = expandSymptoms();

//     const apiPayload = {
//       imageUri,
//       age_hours:                   ageHours,
//       feeding,
//       difficult_to_wake:           expanded.difficult_to_wake ?? false,
//       floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,
//       jaundice_first_24h:          expanded.jaundice_first_24h ?? false,
//       jaundice_spreading:          expanded.jaundice_spreading ?? false,
//       yellow_eyes:                 expanded.yellow_eyes ?? false,
//       yellow_gums:                 expanded.yellow_gums ?? false,
//       yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,
//       dark_urine:                  expanded.dark_urine ?? false,
//       pale_stool:                  expanded.pale_stool ?? false,
//       darker_skin_tone:            expanded.darker_skin_tone ?? false,
//       skin_tone_category:          skinTone ?? undefined,
//       user_latitude:               location.latitude  ?? undefined,
//       user_longitude:              location.longitude ?? undefined,
//       user_state:                  hasGPS ? undefined : (state || undefined),
//       user_lga:                    hasGPS ? undefined : (lga || undefined),
//       facility_preference:         preference,
//       ui_language:                 "en",
//     };

//     try {
//       const data = await screeningApi.analyze(apiPayload);
//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       console.log("[Screening] Server evaluation error, switching to offline fallback strategy...");
//       try {
//         const localOfflineId = await saveScreeningOffline(apiPayload);

//         const offlineResultData: ScreeningResult = {
//           screening_id: localOfflineId,
//           raw_triage_level: "OFFLINE_PENDING",
//           final_decision: "PENDING_SYNC",
//           final_decision_reason: "Screening data saved locally on device. Analysis processing will automatically trigger once network connectivity becomes available.",
//           notes: ["Your local sync queue has saved this interaction successfully."],
//           recommended_facilities: [],
          
//           // ── Added Missing Required API Properties ──────────────────────
//           success: true,
//           created_at: new Date().toISOString(),
//           raw_triage_reason: "Saved offline dynamically pending network connection.",
//           parent_message: "Your data has been secured locally on this device.",
//         };

//         setResult(offlineResultData);
//         setLastResult(offlineResultData);
//         showToast("Offline mode: Screening safely saved to sync queue!");
//       } catch (offlineWriteError) {
//         showToast(
//           err?.response?.data?.detail ??
//           err?.message ??
//           "Screening failed. Check your connection and try again."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding(null);
//     setState("");
//     setLga("");
//     setPreference("nearest");
//     setSymptoms({
//       hard_to_wake: false,
//       jaundice_first_24h: false,
//       dark_urine_pale_stool: false,
//       jaundice_spreading: false,
//       yellow_eyes: false,
//       yellow_gums_palms: false,
//       darker_skin: false,
//     });
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {/* ── STEP 1: Photo ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
//                 <Text style={s.cardTitle}>Baby photo</Text>
//               </View>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               {compressing ? (
//                 <View style={s.compressingContainer}>
//                   <ActivityIndicator size="small" color={Colors.coral} />
//                   <Text style={s.compressingText}>Optimizing image size...</Text>
//                 </View>
//               ) : imageUri ? (
//                 <>
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                   <View style={s.photoActions}>
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Retake</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Gallery</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               ) : (
//                 <View style={s.photoButtons}>
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>
//                     <Ionicons name="camera" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Take photo</Text>
//                   </TouchableOpacity>
//                   <View style={s.photoDivider} />
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>
//                     <Ionicons name="images" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Choose from gallery</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {/* Age auto-fill */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Baby age: {profile.age_hours}h — auto-filled from profile
//                 </Text>
//               </View>
//             )}

//             {/* ── STEP 2: Feeding ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
//                 <Text style={s.cardTitle}>How is baby feeding?</Text>
//               </View>
//               <View style={s.feedingRow}>
//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}
//                   onPress={() => setFeeding("good")}
//                 >
//                   <Text style={s.feedingIcon}>🍼</Text>
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>
//                     Feeding well
//                   </Text>
//                   <Text style={s.feedingSub}>Latching and feeding normally</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}
//                   onPress={() => setFeeding("poor")}
//                 >
//                   <Text style={s.feedingIcon}>⚠️</Text>
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>
//                     Struggling
//                   </Text>
//                   <Text style={s.feedingSub}>Not feeding much or refusing</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* ── STEP 3: Symptoms ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
//                 <Text style={s.cardTitle}>What do you notice?</Text>
//               </View>
//               <Text style={s.cardSub}>Toggle everything you can see or have noticed.</Text>

//               {/* Urgent signs */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 {URGENT_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.rust }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>

//               {/* Watch closely */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — tell your health worker
//                   </Text>
//                 </View>
//                 {WATCH_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.amber }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 4: Skin tone ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>
//                 <Text style={s.cardTitle}>Baby's skin tone</Text>
//               </View>
//               <Text style={s.cardSub}>Helps us adjust detection for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => setSkinTone(tone.key)}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 5: Location ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>
//                 <Text style={s.cardTitle}>Location</Text>
//               </View>

//               <View style={[
//                 s.gpsStatus,
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,
//               ]}>
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={15}
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}
//                 />
//                 <Text style={[
//                   s.gpsText,
//                   location.status === "granted" && { color: Colors.sage },
//                 ]}>
//                   {location.status === "granted"
//                     ? "Location enabled — showing nearby facilities"
//                     : location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "denied"
//                     ? "Location denied — select state below"
//                     : "Getting your location..."}
//                 </Text>
//               </View>

//               {location.status !== "granted" && (
//                 <>
//                   <TouchableOpacity
//                     style={s.pickerBtn}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />
//                     <Text style={s.pickerBtnText}>
//                       {state || "Select your state"}
//                     </Text>
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                   </TouchableOpacity>

//                   {state !== "" && (
//                     <TouchableOpacity
//                       style={[s.pickerBtn, { marginTop: 8 }]}
//                       onPress={() => setShowLgaPicker(true)}
//                     >
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />
//                       <Text style={s.pickerBtnText}>
//                         {lga || "Select your LGA (optional)"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>

//             {/* ── STEP 6: Facility Preference ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>
//                 <Text style={s.cardTitle}>Where would you like to go?</Text>
//               </View>
//               <Text style={s.cardSub}>We will find the best match near you.</Text>
//               <View style={s.prefRow}>
//                 {FACILITY_PREFERENCES.map((pref) => (
//                   <TouchableOpacity
//                     key={pref.key}
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}
//                     onPress={() => setPreference(pref.key)}
//                   >
//                     <Ionicons
//                       name={pref.icon}
//                       size={22}
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}
//                     />
//                     <Text style={[
//                       s.prefLabel,
//                       preference === pref.key && { color: Colors.coral },
//                     ]}>
//                       {pref.label}
//                     </Text>
//                     <Text style={s.prefSub}>{pref.sub}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Submit */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || compressing || !imageUri || !feeding) && { opacity: 0.55 }]}
//               onPress={submit}
//               disabled={loading || compressing || !imageUri || !feeding}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="scan-outline" size={20} color="#fff" />
//                   <Text style={s.submitBtnText}>Analyze screening</Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {(!imageUri || !feeding) && (
//               <Text style={s.submitHint}>
//                 {!imageUri ? "Photo required" : "Please select how baby is feeding"}
//               </Text>
//             )}
//           </>
//         )}
//       </ScrollView>

//       {/* State picker modal */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setState(item);
//                     setLga("");
//                     setShowStatePicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* LGA picker modal */}
//       <Modal visible={showLgaPicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your LGA</Text>
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={lgaOptions}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setLga(item);
//                     setShowLgaPicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {lga === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     marginBottom: 14,
//     ...Shadow.sm,
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
//   stepNum: {
//     width: 26, height: 26, borderRadius: 13,
//     backgroundColor: Colors.coral,
//     alignItems: "center", justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },

//   compressingContainer: {
//     minHeight: 140,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//   },
//   compressingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },

//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },
//   photoButtons: {
//     flexDirection: "row",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//     overflow: "hidden",
//     minHeight: 140,
//   },
//   photoBigBtn: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     padding: 20,
//   },
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },
//   photoDivider:    { width: 1, backgroundColor: Colors.border },
//   photoActions:    { flexDirection: "row", gap: 10 },
//   photoBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     padding: 9,
//   },
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: Colors.sagePale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginBottom: 14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   feedingRow: { flexDirection: "row", gap: 10 },
//   feedingCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     gap: 4,
//   },
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },
//   feedingIcon:  { fontSize: 28 },
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },

//   signsGroup:  { marginBottom: 14 },
//   signsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },
//   symptomRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 11,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     gap: 10,
//   },
//   symptomIcon:  { width: 22 },
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },

//   skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },
//   skinChip: {
//     alignItems: "center",
//     gap: 3,
//     padding: 5,
//     borderRadius: Radius.md,
//     borderWidth: 1.5,
//     borderColor: "transparent",
//     flex: 1,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:       { width: 26, height: 26, borderRadius: 13 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },

//   gpsStatus: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: Radius.md,
//     padding: 11,
//     marginBottom: 10,
//   },
//   gpsGranted: { backgroundColor: Colors.sagePale },
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },

//   pickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.md,
//     padding: 12,
//     backgroundColor: Colors.cream,
//   },
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   prefRow: { flexDirection: "row", gap: 8 },
//   prefCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 12,
//     alignItems: "center",
//     gap: 4,
//   },
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginTop: 4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },

//   resetBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     marginTop: 16,
//     padding: 12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });




// /**
//  * JaundiCare — Screening Screen (v4)
//  * Simplified UX: big feeding cards, combined symptoms,
//  * facility preference selector, LGA picker, silent GPS.
//  * Image compression and states loading
//  * model working with offline fallback and local storage.
//  */

// import React, { useState, useEffect } from "react";
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, ActivityIndicator, Image,
//   Switch, Modal, FlatList,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { screeningApi, type ScreeningResult } from "../../services/api";
// import { saveScreeningOffline } from "../../services/offlineStore";
// import { useLocation } from "../../hooks/useLocation";
// import { ResultCard } from "../../components/ResultCard";
// import { useToast } from "../../hooks/useToast";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { LGA_DATA } from "../../constants/lgaData";

// // Import your newly created on-device ML helper script from the root
// import { runLocalInferenceWithUri } from "../../localInference";

// const SKIN_TONES = [
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },
//   { key: "light",       color: "#e8b98a", label: "Light"      },
//   { key: "medium",      color: "#c68642", label: "Medium"     },
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
//   { key: "dark",        color: "#4a2912", label: "Dark"       },
// ];
// const STATES = Object.keys(LGA_DATA).sort();

// const URGENT_SYMPTOMS = [
//   {
//     key: "hard_to_wake",
//     label: "Hard to wake up or very floppy",
//     icon: "moon-outline" as const,
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],
//   },
//   {
//     key: "jaundice_first_24h",
//     label: "Yellowing appeared in first 24 hours",
//     icon: "warning-outline" as const,
//     fields: ["jaundice_first_24h"],
//   },
//   {
//     key: "dark_urine_pale_stool",
//     label: "Urine is dark OR stool is very pale",
//     icon: "water-outline" as const,
//     fields: ["dark_urine", "pale_stool"],
//   },
//   {
//     key: "jaundice_spreading",
//     label: "Yellowing appears to be spreading",
//     icon: "trending-up-outline" as const,
//     fields: ["jaundice_spreading"],
//   },
// ];
// const WATCH_SYMPTOMS = [
//   {
//     key: "yellow_eyes",
//     label: "Yellow in the whites of the eyes",
//     icon: "eye-outline" as const,
//     fields: ["yellow_eyes"],
//   },
//   {
//     key: "yellow_gums_palms",
//     label: "Yellow on gums, palms or soles of feet",
//     icon: "hand-left-outline" as const,
//     fields: ["yellow_gums", "yellow_palms_or_soles"],
//   },
//   {
//     key: "darker_skin",
//     label: "Baby has darker skin tone",
//     icon: "person-outline" as const,
//     fields: ["darker_skin_tone"],
//   },
// ];
// const FACILITY_PREFERENCES = [
//   {
//     key: "nearest",
//     icon: "navigate-outline" as const,
//     label: "Nearest",
//     sub: "Fastest to reach",
//   },
//   {
//     key: "government",
//     icon: "business-outline" as const,
//     label: "Govt",
//     sub: "Lower cost",
//   },
//   {
//     key: "clinic",
//     icon: "medkit-outline" as const,
//     label: "Clinic/PHC",
//     sub: "Basic care",
//   },
// ];

// export default function ScreeningScreen() {
//   const profile       = useAppStore((s) => s.profile);
//   const setLastResult = useAppStore((s) => s.setLastScreening);
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);
//   const [state,       setState]       = useState("");
//   const [lga,         setLga]         = useState("");
//   const [preference,  setPreference]  = useState("nearest");
//   const [loading,     setLoading]     = useState(false);
//   const [compressing, setCompressing] = useState(false);
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);
//   const [showStatePicker, setShowStatePicker] = useState(false);
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);
//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
//     hard_to_wake:         false,
//     jaundice_first_24h:   false,
//     dark_urine_pale_stool: false,
//     jaundice_spreading:   false,
//     yellow_eyes:          false,
//     yellow_gums_palms:    false,
//     darker_skin:          false,
//   });

//   useEffect(() => {
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {
//       setSymptoms(p => ({ ...p, darker_skin: true }));
//     }
//   }, [skinTone]);

//   useEffect(() => {
//     requestLocation();
//   }, []);

//   const toggleSymptom = (key: string) =>
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   const expandSymptoms = () => {
//     const expanded: Record<string, boolean> = {};
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];
//     for (const group of allGroups) {
//       const isOn = symptoms[group.key] ?? false;
//       for (const field of group.fields) {
//         expanded[field] = expanded[field] || isOn;
//       }
//     }
//     return expanded;
//   };

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       showToast("Camera permission needed. Please enable in settings.");
//       return;
//     }
//   };

//   const processAndOptimizeImage = async (originalUri: string) => {
//     setCompressing(true);
//     try {
//       const manipulatedImage = await ImageManipulator.manipulateAsync(
//         originalUri,
//         [{ resize: { width: 800 } }],
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
//       );
//       setImageUri(manipulatedImage.uri);
//     } catch (err) {
//       showToast("Could not optimize image. Using original file.");
//       setImageUri(originalUri);
//     } finally {
//       setCompressing(false);
//     }
//   };

//   const openCamera = async () => {
//     const res = await ImagePicker.launchCameraAsync({
//       mediaTypes: "images",
//       quality: 0.8,
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const openGallery = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: "images",
//       quality: 0.8,
//       allowsEditing: false,
//     });
//     if (!res.canceled && res.assets && res.assets[0]) {
//       await processAndOptimizeImage(res.assets[0].uri);
//     }
//   };

//   const submit = async () => {
//     if (!imageUri) {
//       showToast("Please take or choose a photo first.");
//       return;
//     }
//     if (!feeding) {
//       showToast("Please tell us how baby is feeding.");
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     const ageHours = profile?.age_hours ?? undefined;
//     const hasGPS   = location.latitude != null && location.longitude != null;
//     const expanded  = expandSymptoms();
//     const apiPayload = {
//       imageUri,
//       age_hours:                   ageHours,
//       feeding,
//       difficult_to_wake:           expanded.difficult_to_wake ?? false,
//       floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,
//       jaundice_first_24h:          expanded.jaundice_first_24h ?? false,
//       jaundice_spreading:          expanded.jaundice_spreading ?? false,
//       yellow_eyes:                 expanded.yellow_eyes ?? false,
//       yellow_gums:                 expanded.yellow_gums ?? false,
//       yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,
//       dark_urine:                  expanded.dark_urine ?? false,
//       pale_stool:                  expanded.pale_stool ?? false,
//       darker_skin_tone:            expanded.darker_skin_tone ?? false,
//       skin_tone_category:          skinTone ?? undefined,
//       user_latitude:               location.latitude  ?? undefined,
//       user_longitude:              location.longitude ?? undefined,
//       user_state:                  hasGPS ? undefined : (state || undefined),
//       user_lga:                    hasGPS ? undefined : (lga || undefined),
//       facility_preference:         preference,
//       ui_language:                 "en",
//     };

//     try {
//       const data = await screeningApi.analyze(apiPayload);
//       setResult(data);
//       setLastResult(data);
//       storeFollowUp(data.final_decision);
//     } catch (err: any) {
//       console.log("[Screening] Server evaluation error, switching to localized edge inference model...");
      
//       try {
//         // 1. Save data safely to sync queue for bookkeeping
//         const localOfflineId = await saveScreeningOffline(apiPayload);

//         // 2. Fire up the on-device model using the captured image path
//         const localPredictions = await runLocalInferenceWithUri(imageUri);

//         let triageLevel = "OFFLINE_PENDING";
//         let decisionReason = "Screening data saved locally. Deep learning classification was processed entirely offline on-device.";
//         let notesText = ["Processed on local hardware due to limited internet connectivity."];

//         if (localPredictions && localPredictions.length >= 2) {
//           const probHealthy = localPredictions[0];
//           const probJaundice = localPredictions[1];

//           // Threshold-based Triage classification (Jaundice risk > 50%)
//           if (probJaundice > 0.50) {
//             triageLevel = "ATTENTION_REQUIRED";
//             decisionReason = `On-device analysis detected a high likelihood of elevated bilirubin levels (${(probJaundice * 100).toFixed(1)}%). Please visit a local health facility.`;
//             notesText.push("High confidence matching for local sclera color discoloration metrics.");
//           } else {
//             triageLevel = "LOW_RISK";
//             decisionReason = `On-device analysis indicates baby is at low risk for physiological jaundice (${(probHealthy * 100).toFixed(1)}% healthy validation). Keep monitoring.`;
//             notesText.push("Sclera classification falls into standard clearance margins.");
//           }
//         } else {
//           decisionReason += " Internal ML inference encountered a matrix configuration issue; result will sync when online.";
//         }

//         // 3. Construct a fully functioning screening card payload for the UI
//         const offlineResultData: ScreeningResult = {
//           screening_id: localOfflineId,
//           raw_triage_level: triageLevel,
//           final_decision: triageLevel === "ATTENTION_REQUIRED" ? "SEEK_MEDICAL_ATTENTION" : "MONITOR_AT_HOME",
//           final_decision_reason: decisionReason,
//           notes: notesText,
//           recommended_facilities: [],
//           success: true,
//           created_at: new Date().toISOString(),
//           raw_triage_reason: "Computed via on-device MobileNetV2 edge execution.",
//           parent_message: "Calculations safely evaluated without cloud dependencies.",
//         };

//         setResult(offlineResultData);
//         setLastResult(offlineResultData);
//         showToast("Screening complete: Running via offline edge engine!");

//       } catch (offlineWriteError) {
//         showToast(
//           err?.response?.data?.detail ??
//           err?.message ??
//           "Screening execution failed. Check your configuration parameters."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setImageUri(null);
//     setResult(null);
//     setSkinTone(null);
//     setFeeding(null);
//     setState("");
//     setLga("");
//     setPreference("nearest");
//     setSymptoms({
//       hard_to_wake: false,
//       jaundice_first_24h: false,
//       dark_urine_pale_stool: false,
//       jaundice_spreading: false,
//       yellow_eyes: false,
//       yellow_gums_palms: false,
//       darker_skin: false,
//     });
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];
//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <Text style={s.heading}>Baby Screening</Text>

//         {result ? (
//           <>
//             <ResultCard
//               result={result}
//               babyName={profile?.baby_name}
//               gestationalAgeWeeks={profile?.gestational_age_weeks}
//             />
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
//               <Text style={s.resetBtnText}>New screening</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {/* ── STEP 1: Photo ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
//                 <Text style={s.cardTitle}>Baby photo</Text>
//               </View>
//               <Text style={s.cardSub}>
//                 Use natural light. Focus on the face, eyes, gums, and palms.
//               </Text>

//               {compressing ? (
//                 <View style={s.compressingContainer}>
//                   <ActivityIndicator size="small" color={Colors.coral} />
//                   <Text style={s.compressingText}>Optimizing image size...</Text>
//                 </View>
//               ) : imageUri ? (
//                 <>
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
//                   <View style={s.photoActions}>
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Retake</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />
//                       <Text style={s.photoBtnText}>Gallery</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               ) : (
//                 <View style={s.photoButtons}>
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>
//                     <Ionicons name="camera" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Take photo</Text>
//                   </TouchableOpacity>
//                   <View style={s.photoDivider} />
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>
//                     <Ionicons name="images" size={28} color={Colors.coral} />
//                     <Text style={s.photoBigBtnText}>Choose from gallery</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {/* Age auto-fill */}
//             {profile?.age_hours != null && (
//               <View style={s.ageBanner}>
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />
//                 <Text style={s.ageBannerText}>
//                   Baby age: {profile.age_hours}h — auto-filled from profile
//                 </Text>
//               </View>
//             )}

//             {/* ── STEP 2: Feeding ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
//                 <Text style={s.cardTitle}>How is baby feeding?</Text>
//               </View>
//               <View style={s.feedingRow}>
//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}
//                   onPress={() => setFeeding("good")}
//                 >
//                   <Text style={s.feedingIcon}>🍼</Text>
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>
//                     Feeding well
//                   </Text>
//                   <Text style={s.feedingSub}>Latching and feeding normally</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}
//                   onPress={() => setFeeding("poor")}
//                 >
//                   <Text style={s.feedingIcon}>⚠️</Text>
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>
//                     Struggling
//                   </Text>
//                   <Text style={s.feedingSub}>Not feeding much or refusing</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* ── STEP 3: Symptoms ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
//                 <Text style={s.cardTitle}>What do you notice?</Text>
//               </View>
//               <Text style={s.cardSub}>Toggle everything you can see or have noticed.</Text>

//               {/* Urgent signs */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
//                     Urgent signs — seek help immediately if present
//                   </Text>
//                 </View>
//                 {URGENT_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.rust }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>

//               {/* Watch closely */}
//               <View style={s.signsGroup}>
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
//                     Watch closely — tell your health worker
//                   </Text>
//                 </View>
//                 {WATCH_SYMPTOMS.map((symptom) => (
//                   <View key={symptom.key} style={s.symptomRow}>
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>
//                     <Switch
//                       value={symptoms[symptom.key] ?? false}
//                       onValueChange={() => toggleSymptom(symptom.key)}
//                       trackColor={{ false: Colors.border, true: Colors.amber }}
//                       thumbColor="#fff"
//                     />
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 4: Skin tone ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>
//                 <Text style={s.cardTitle}>Baby's skin tone</Text>
//               </View>
//               <Text style={s.cardSub}>Helps us adjust detection for darker skin.</Text>
//               <View style={s.skinRow}>
//                 {SKIN_TONES.map((tone) => (
//                   <TouchableOpacity
//                     key={tone.key}
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
//                     onPress={() => setSkinTone(tone.key)}
//                   >
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
//                     <Text style={s.skinLabel}>{tone.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* ── STEP 5: Location ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>
//                 <Text style={s.cardTitle}>Location</Text>
//               </View>

//               <View style={[
//                 s.gpsStatus,
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,
//               ]}>
//                 <Ionicons
//                   name={location.status === "granted" ? "location" : "location-outline"}
//                   size={15}
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}
//                 />
//                 <Text style={[
//                   s.gpsText,
//                   location.status === "granted" && { color: Colors.sage },
//                 ]}>
//                   {location.status === "granted"
//                     ? "Location enabled — showing nearby facilities"
//                     : location.status === "loading"
//                     ? "Getting your location..."
//                     : location.status === "denied"
//                     ? "Location denied — select state below"
//                     : "Getting your location..."}
//                 </Text>
//               </View>

//               {location.status !== "granted" && (
//                 <>
//                   <TouchableOpacity
//                     style={s.pickerBtn}
//                     onPress={() => setShowStatePicker(true)}
//                   >
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />
//                     <Text style={s.pickerBtnText}>
//                       {state || "Select your state"}
//                     </Text>
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                   </TouchableOpacity>

//                   {state !== "" && (
//                     <TouchableOpacity
//                       style={[s.pickerBtn, { marginTop: 8 }]}
//                       onPress={() => setShowLgaPicker(true)}
//                     >
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />
//                       <Text style={s.pickerBtnText}>
//                         {lga || "Select your LGA (optional)"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </View>

//             {/* ── STEP 6: Facility Preference ── */}
//             <View style={s.card}>
//               <View style={s.stepHeader}>
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>
//                 <Text style={s.cardTitle}>Where would you like to go?</Text>
//               </View>
//               <Text style={s.cardSub}>We will find the best match near you.</Text>
//               <View style={s.prefRow}>
//                 {FACILITY_PREFERENCES.map((pref) => (
//                   <TouchableOpacity
//                     key={pref.key}
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}
//                     onPress={() => setPreference(pref.key)}
//                   >
//                     <Ionicons
//                       name={pref.icon}
//                       size={22}
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}
//                     />
//                     <Text style={[
//                       s.prefLabel,
//                       preference === pref.key && { color: Colors.coral },
//                     ]}>
//                       {pref.label}
//                     </Text>
//                     <Text style={s.prefSub}>{pref.sub}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Submit Button */}
//             <TouchableOpacity
//               style={[s.submitBtn, (loading || compressing || !imageUri || !feeding) && { opacity: 0.55 }]}
//               onPress={submit}
//               disabled={loading || compressing || !imageUri || !feeding}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="scan-outline" size={20} color="#fff" />
//                   <Text style={s.submitBtnText}>Analyze screening</Text>
//                 </>
//               )}
//             </TouchableOpacity>

//             {(!imageUri || !feeding) && (
//               <Text style={s.submitHint}>
//                 {!imageUri ? "Photo required" : "Please select how baby is feeding"}
//               </Text>
//             )}
//           </>
//         )}
//       </ScrollView>

//       {/* State picker modal */}
//       <Modal visible={showStatePicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your state</Text>
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={STATES}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, state === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setState(item);
//                     setLga("");
//                     setShowStatePicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {state === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* LGA picker modal */}
//       <Modal visible={showLgaPicker} animationType="slide" transparent>
//         <View style={s.modalOverlay}>
//           <View style={s.modalBox}>
//             <View style={s.modalHeader}>
//               <Text style={s.modalTitle}>Select your LGA</Text>
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>
//                 <Ionicons name="close" size={24} color={Colors.earth} />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={lgaOptions}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}
//                   onPress={() => {
//                     setLga(item);
//                     setShowLgaPicker(false);
//                   }}
//                 >
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>
//                     {item}
//                   </Text>
//                   {lga === item && (
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {ToastComponent}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: Colors.background },
//   scroll:  { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 16,
//     marginBottom: 14,
//     ...Shadow.sm,
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
//   stepNum: {
//     width: 26, height: 26, borderRadius: 13,
//     backgroundColor: Colors.coral,
//     alignItems: "center", justifyContent: "center",
//   },
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },

//   compressingContainer: {
//     minHeight: 140,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//   },
//   compressingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },

//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },
//   photoButtons: {
//     flexDirection: "row",
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderStyle: "dashed",
//     borderRadius: Radius.lg,
//     overflow: "hidden",
//     minHeight: 140,
//   },
//   photoBigBtn: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     padding: 20,
//   },
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },
//   photoDivider:    { width: 1, backgroundColor: Colors.border },
//   photoActions:    { flexDirection: "row", gap: 10 },
//   photoBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     padding: 9,
//   },
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

//   ageBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: Colors.sagePale,
//     borderRadius: Radius.md,
//     padding: 10,
//     marginBottom: 14,
//   },
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

//   feedingRow: { flexDirection: "row", gap: 10 },
//   feedingCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 14,
//     alignItems: "center",
//     gap: 4,
//   },
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },
//   feedingIcon:  { fontSize: 28 },
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },

//   signsGroup:  { marginBottom: 14 },
//   signsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     borderRadius: Radius.md,
//     padding: 8,
//     marginBottom: 8,
//   },
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },
//   symptomRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 11,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     gap: 10,
//   },
//   symptomIcon:  { width: 22 },
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },

//   skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },
//   skinChip: {
//     alignItems: "center",
//     gap: 3,
//     padding: 5,
//     borderRadius: Radius.md,
//     borderWidth: 1.5,
//     borderColor: "transparent",
//     flex: 1,
//   },
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   skinSwatch:      { width: 26, height: 26, borderRadius: 13 },
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },

//   gpsStatus: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: Radius.md,
//     padding: 11,
//     marginBottom: 10,
//   },
//   gpsGranted: { backgroundColor: Colors.sagePale },
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },

//   pickerBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.md,
//     padding: 12,
//     backgroundColor: Colors.cream,
//   },
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

//   prefRow: { flexDirection: "row", gap: 8 },
//   prefCard: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.border,
//     borderRadius: Radius.lg,
//     padding: 12,
//     alignItems: "center",
//     gap: 4,
//   },
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

//   submitBtn: {
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.lg,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginTop: 4,
//     ...Shadow.md,
//   },
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },

//   resetBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     marginTop: 16,
//     padding: 12,
//   },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalBox: {
//     backgroundColor: Colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     paddingBottom: 30,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   modalItemSelected:     { backgroundColor: "#fff5f2" },
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },
// });




// /**  
//  * JaundiCare — Screening Screen (v4.1 Production)  
//  * Simplified UX: big feeding cards, combined symptoms,  
//  * facility preference selector, LGA picker, silent GPS.  
//  * Image compression and states loading  
//  * model working with offline fallback and local storage.  
//  */

// import React, { useState, useEffect, useRef } from "react";  
// import {  
//   View, Text, ScrollView, TouchableOpacity,  
//   StyleSheet, ActivityIndicator, Image,  
//   Switch, Modal, FlatList,  
// } from "react-native";  
// import { SafeAreaView } from "react-native-safe-area-context";  
// import * as ImagePicker from "expo-image-picker";  
// import * as ImageManipulator from "expo-image-manipulator";  
// import { Ionicons } from "@expo/vector-icons";  
// import { useAppStore } from "../../store/appStore";  
// import { screeningApi, type ScreeningResult } from "../../services/api";  
// import { saveScreeningOffline } from "../../services/offlineStore";  
// import { useLocation } from "../../hooks/useLocation";  
// import { ResultCard } from "../../components/ResultCard";  
// import { useToast } from "../../hooks/useToast";  
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";  
// import { LGA_DATA } from "../../constants/lgaData";  
// import { runLocalInferenceWithUri } from "../../localInference";

// const SKIN_TONES = [  
//   { key: "very_light",  color: "#f8d5b4", label: "Very light" },  
//   { key: "light",       color: "#e8b98a", label: "Light"      },  
//   { key: "medium",      color: "#c68642", label: "Medium"     },  
//   { key: "medium_dark", color: "#8d5524", label: "Med dark"   },  
//   { key: "dark",        color: "#4a2912", label: "Dark"       },  
// ];  
// const STATES = Object.keys(LGA_DATA).sort();

// const URGENT_SYMPTOMS = [  
//   {  
//     key: "hard_to_wake",  
//     label: "Hard to wake up or very floppy",  
//     icon: "moon-outline" as const,  
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],  
//   },  
//   {  
//     key: "jaundice_first_24h",  
//     label: "Yellowing appeared in first 24 hours",  
//     icon: "warning-outline" as const,  
//     fields: ["jaundice_first_24h"],  
//   },  
//   {  
//     key: "dark_urine_pale_stool",  
//     label: "Urine is dark OR stool is very pale",  
//     icon: "water-outline" as const,  
//     fields: ["dark_urine", "pale_stool"],  
//   },  
//   {  
//     key: "jaundice_spreading",  
//     label: "Yellowing appears to be spreading",  
//     icon: "trending-up-outline" as const,  
//     fields: ["jaundice_spreading"],  
//   },  
// ];  
// const WATCH_SYMPTOMS = [  
//   {  
//     key: "yellow_eyes",  
//     label: "Yellow in the whites of the eyes",  
//     icon: "eye-outline" as const,  
//     fields: ["yellow_eyes"],  
//   },  
//   {  
//     key: "yellow_gums_palms",  
//     label: "Yellow on gums, palms or soles of feet",  
//     icon: "hand-left-outline" as const,  
//     fields: ["yellow_gums", "yellow_palms_or_soles"],  
//   },  
//   {  
//     key: "darker_skin",  
//     label: "Baby has darker skin tone",  
//     icon: "person-outline" as const,  
//     fields: ["darker_skin_tone"],  
//   },  
// ];  
// const FACILITY_PREFERENCES = [  
//   {  
//     key: "nearest",  
//     icon: "navigate-outline" as const,  
//     label: "Nearest",  
//     sub: "Fastest to reach",  
//   },  
//   {  
//     key: "government",  
//     icon: "business-outline" as const,  
//     label: "Govt",  
//     sub: "Lower cost",  
//   },  
//   {  
//     key: "clinic",  
//     icon: "medkit-outline" as const,  
//     label: "Clinic/PHC",  
//     sub: "Basic care",  
//   },  
// ];

// export default function ScreeningScreen() {  
//   const profile       = useAppStore((s) => s.profile);  
//   const setLastResult = useAppStore((s) => s.setLastScreening);  
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { location, requestLocation } = useLocation();  
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);  
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);  
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);  
//   const [state,       setState]       = useState("");  
//   const [lga,         setLga]         = useState("");  
//   const [preference,  setPreference]  = useState("nearest");  
//   const [loading,     setLoading]     = useState(false);  
//   const [compressing, setCompressing] = useState(false);  
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);  
//   const [showStatePicker, setShowStatePicker] = useState(false);  
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);  
//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({  
//     hard_to_wake:         false,  
//     jaundice_first_24h:   false,  
//     dark_urine_pale_stool: false,  
//     jaundice_spreading:   false,  
//     yellow_eyes:          false,  
//     yellow_gums_palms:    false,  
//     darker_skin:          false,  
//   });

//   // Safe tracking reference to ignore memory leak trace outcomes on immediate screen resets
//   const isComponentActive = useRef(true);

//   useEffect(() => {  
//     isComponentActive.current = true;
//     return () => { isComponentActive.current = false; };
//   }, []);

//   useEffect(() => {  
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {  
//       setSymptoms(p => ({ ...p, darker_skin: true }));  
//     }  
//   }, [skinTone]);

//   useEffect(() => {  
//     requestLocation();  
//   }, []);

//   const toggleSymptom = (key: string) =>  
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   const expandSymptoms = () => {  
//     const expanded: Record<string, boolean> = {};  
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];  
//     for (const group of allGroups) {  
//       const isOn = symptoms[group.key] ?? false;  
//       for (const field of group.fields) {  
//         expanded[field] = expanded[field] || isOn;  
//       }  
//     }  
//     return expanded;  
//   };

//   const pickImage = async () => {  
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();  
//     if (status !== "granted") {  
//       showToast("Camera permission needed. Please enable in settings.");  
//       return true;  
//     }  
//     return false;  
//   };

//   const processAndOptimizeImage = async (originalUri: string) => {  
//     setCompressing(true);  
//     try {  
//       const manipulatedImage = await ImageManipulator.manipulateAsync(  
//         originalUri,  
//         [{ resize: { width: 800 } }],  
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }  
//       );  
//       if (isComponentActive.current) {
//         setImageUri(manipulatedImage.uri);  
//       }
//     } catch (err) {  
//       showToast("Could not optimize image. Using original file.");  
//       if (isComponentActive.current) {
//         setImageUri(originalUri);  
//       }
//     } finally {  
//       if (isComponentActive.current) {
//         setCompressing(false);  
//       }
//     }  
//   };

//   const openCamera = async () => {  
//     const isDenied = await pickImage();
//     if (isDenied) return;

//     const res = await ImagePicker.launchCameraAsync({  
//       mediaTypes: "images",  
//       quality: 0.8,  
//       allowsEditing: false,  
//     });  
//     if (!res.canceled && res.assets && res.assets[0]) {  
//       await processAndOptimizeImage(res.assets[0].uri);  
//     }  
//   };

//   const openGallery = async () => {  
//     const res = await ImagePicker.launchImageLibraryAsync({  
//       mediaTypes: "images",  
//       quality: 0.8,  
//       allowsEditing: false,  
//     });  
//     if (!res.canceled && res.assets && res.assets[0]) {  
//       await processAndOptimizeImage(res.assets[0].uri);  
//     }  
//   };

//   const submit = async () => {  
//     if (!imageUri) {  
//       showToast("Please take or choose a photo first.");  
//       return;  
//     }  
//     if (!feeding) {  
//       showToast("Please tell us how baby is feeding.");  
//       return;  
//     }

//     setLoading(true);  
//     setResult(null);

//     const ageHours = profile?.age_hours ?? undefined;  
//     const hasGPS   = location.latitude != null && location.longitude != null;  
//     const expanded  = expandSymptoms();  
//     const apiPayload = {  
//       imageUri,  
//       age_hours:                   ageHours,  
//       feeding,  
//       difficult_to_wake:           expanded.difficult_to_wake ?? false,  
//       floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,  
//       jaundice_first_24h:          expanded.jaundice_first_24h ?? false,  
//       jaundice_spreading:          expanded.jaundice_spreading ?? false,  
//       yellow_eyes:                 expanded.yellow_eyes ?? false,  
//       yellow_gums:                 expanded.yellow_gums ?? false,  
//       yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,  
//       dark_urine:                  expanded.dark_urine ?? false,  
//       pale_stool:                  expanded.pale_stool ?? false,  
//       darker_skin_tone:            expanded.darker_skin_tone ?? false,  
//       skin_tone_category:          skinTone ?? undefined,  
//       user_latitude:               location.latitude  ?? undefined,  
//       user_longitude:              location.longitude ?? undefined,  
//       user_state:                  hasGPS ? undefined : (state || undefined),  
//       user_lga:                    hasGPS ? undefined : (lga || undefined),  
//       facility_preference:         preference,  
//       ui_language:                 "en",  
//     };

//     try {  
//       const data = await screeningApi.analyze(apiPayload);  
      
//       if (!isComponentActive.current) return;

//       setResult(data);  
//       setLastResult(data);  
//       storeFollowUp(data.final_decision);  
//     } catch (err: any) {  
//       console.log("[Screening] Server evaluation error, switching to localized edge inference model...");  
       
//       try {  
//         // 1. Fire up the on-device model using the captured image path
//         const localPredictions = await runLocalInferenceWithUri(imageUri);

//         let triageLevel = "OFFLINE_PENDING";  
//         let decisionReason = "Screening data saved locally. Deep learning classification was processed entirely offline on-device.";  
//         let notesText = ["Processed on local hardware due to limited internet connectivity."];  

//         if (localPredictions && localPredictions.length >= 2) {  
//           const probHealthy = localPredictions[0];  
//           const probJaundice = localPredictions[1];  

//           if (probJaundice > 0.50) {  
//             triageLevel = "ATTENTION_REQUIRED";  
//             decisionReason = `On-device analysis detected a high likelihood of elevated bilirubin levels (${(probJaundice * 100).toFixed(1)}%). Please visit a local health facility.`;  
//             notesText.push("High confidence matching for local sclera color discoloration metrics.");  
//           } else {  
//             triageLevel = "LOW_RISK";  
//             decisionReason = `On-device analysis indicates baby is at low risk for physiological jaundice (${(probHealthy * 100).toFixed(1)}% healthy validation). Keep monitoring.`;  
//             notesText.push("Sclera classification falls into standard clearance margins.");  
//           }  
//         } else {  
//           decisionReason += " Internal ML inference encountered a matrix configuration issue; result will sync when online.";  
//         }  

//         // 2. Construct a fully functioning screening card payload for the UI  
//         const offlineResultData: ScreeningResult = {  
//           screening_id: "pending_local_sync_id",  
//           raw_triage_level: triageLevel,  
//           final_decision: triageLevel === "ATTENTION_REQUIRED" ? "SEEK_MEDICAL_ATTENTION" : "MONITOR_AT_HOME",  
//           final_decision_reason: decisionReason,  
//           notes: notesText,  
//           recommended_facilities: [],  
//           success: true,  
//           created_at: new Date().toISOString(),  
//           raw_triage_reason: "Computed via on-device MobileNetV2 edge execution.",  
//           parent_message: "Calculations safely evaluated without cloud dependencies.",  
//         };  

//         // 3. Save telemetry data with local context explicitly attached to the schema payload 
//         const offlineId = await saveScreeningOffline({
//           ...apiPayload,
//           facility_preference: `${preference} | local_triage:${triageLevel} | local_prob:${localPredictions ? localPredictions[1].toFixed(2) : 'null'}`
//         //   metadata: {
//         //     local_triage_tier: triageLevel,
//         //     local_inference_processed: true,
//         //     local_jaundice_probability: localPredictions ? localPredictions[1] : null
//         //   }
//         });

//         offlineResultData.screening_id = offlineId;

//         if (!isComponentActive.current) return;

//         setResult(offlineResultData);  
//         setLastResult(offlineResultData);  
//         showToast("Screening complete: Running via offline edge engine!");  

//       } catch (offlineWriteError) {  
//         if (!isComponentActive.current) return;
//         showToast(  
//           err?.response?.data?.detail ??  
//           err?.message ??  
//           "Screening execution failed. Check your configuration parameters."  
//         );  
//       }  
//     } finally {  
//       if (isComponentActive.current) {
//         setLoading(false);  
//       }
//     }  
//   };

//   const reset = () => {  
//     setImageUri(null);  
//     setResult(null);  
//     setSkinTone(null);  
//     setFeeding(null);  
//     setState("");  
//     setLga("");  
//     setPreference("nearest");  
//     setSymptoms({  
//       hard_to_wake: false,  
//       jaundice_first_24h: false,  
//       dark_urine_pale_stool: false,  
//       jaundice_spreading: false,  
//       yellow_eyes: false,  
//       yellow_gums_palms: false,  
//       darker_skin: false,  
//     });  
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];  
//   return (  
//     <SafeAreaView style={s.safe}>  
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>  
//         <Text style={s.heading}>Baby Screening</Text>  

//         {result ? (  
//           <>  
//             <ResultCard  
//               result={result}  
//               babyName={profile?.baby_name}  
//               gestationalAgeWeeks={profile?.gestational_age_weeks}  
//             />  
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>  
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />  
//               <Text style={s.resetBtnText}>New screening</Text>  
//             </TouchableOpacity>  
//           </>  
//         ) : (  
//           <>  
//             {/* ── STEP 1: Photo ── */}  
//             <View style={s.card}>  
//               <View style={s.stepHeader}>  
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>  
//                 <Text style={s.cardTitle}>Baby photo</Text>  
//               </View>  
//               <Text style={s.cardSub}>  
//                 Use natural light. Focus on the face, eyes, gums, and palms.  
//               </Text>  

//               {compressing ? (  
//                 <View style={s.compressingContainer}>  
//                   <ActivityIndicator size="small" color={Colors.coral} />  
//                   <Text style={s.compressingText}>Optimizing image size...</Text>  
//                 </View>  
//               ) : imageUri ? (  
//                 <>  
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />  
//                   <View style={s.photoActions}>  
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>  
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />  
//                       <Text style={s.photoBtnText}>Retake</Text>  
//                     </TouchableOpacity>  
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>  
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />  
//                       <Text style={s.photoBtnText}>Gallery</Text>  
//                     </TouchableOpacity>  
//                   </View>  
//                 </>  
//               ) : (  
//                 <View style={s.photoButtons}>  
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>  
//                     <Ionicons name="camera" size={28} color={Colors.coral} />  
//                     <Text style={s.photoBigBtnText}>Take photo</Text>  
//                   </TouchableOpacity>  
//                   <View style={s.photoDivider} />  
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>  
//                     <Ionicons name="images" size={28} color={Colors.coral} />  
//                     <Text style={s.photoBigBtnText}>Choose from gallery</Text>  
//                   </TouchableOpacity>  
//                 </View>  
//               )}  
//             </View>  

//             {/* Age auto-fill */}  
//             {profile?.age_hours != null && (  
//               <View style={s.ageBanner}>  
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />  
//                 <Text style={s.ageBannerText}>  
//                   Baby age: {profile.age_hours}h — auto-filled from profile  
//                 </Text>  
//               </View>  
//             )}  

//             {/* ── STEP 2: Feeding ── */}  
//             <View style={s.card}>  
//               <View style={s.stepHeader}>  
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>  
//                 <Text style={s.cardTitle}>How is baby feeding?</Text>  
//               </View>  
//               <View style={s.feedingRow}>  
//                 <TouchableOpacity  
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}  
//                   onPress={() => setFeeding("good")}  
//                 >  
//                   <Text style={s.feedingIcon}>🍼</Text>  
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>  
//                     Feeding well  
//                   </Text>  
//                   <Text style={s.feedingSub}>Latching and feeding normally</Text>  
//                 </TouchableOpacity>  

//                 <TouchableOpacity  
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}  
//                   onPress={() => setFeeding("poor")}  
//                 >  
//                   <Text style={s.feedingIcon}>⚠️</Text>  
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>  
//                     Struggling  
//                   </Text>  
//                   <Text style={s.feedingSub}>Not feeding much or refusing</Text>  
//                 </TouchableOpacity>  
//               </View>  
//             </View>  

//             {/* ── STEP 3: Symptoms ── */}  
//             <View style={s.card}>  
//               <View style={s.stepHeader}>  
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>  
//                 <Text style={s.cardTitle}>What do you notice?</Text>  
//               </View>  
//               <Text style={s.cardSub}>Toggle everything you can see or have noticed.</Text>  

//               {/* Urgent signs */}  
//               <View style={s.signsGroup}>  
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>  
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />  
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>  
//                     Urgent signs — seek help immediately if present  
//                   </Text>  
//                 </View>  
//                 {URGENT_SYMPTOMS.map((symptom) => (  
//                   <View key={symptom.key} style={s.symptomRow}>  
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />  
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>  
//                     <Switch  
//                       value={symptoms[symptom.key] ?? false}  
//                       onValueChange={() => toggleSymptom(symptom.key)}  
//                       trackColor={{ false: Colors.border, true: Colors.rust }}  
//                       thumbColor="#fff"  
//                     />  
//                   </View>  
//                 ))}  
//               </View>  

//               {/* Watch closely */}  
//               <View style={s.signsGroup}>  
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>  
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />  
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>  
//                     Watch closely — tell your health worker  
//                   </Text>  
//                 </View>  
//                 {WATCH_SYMPTOMS.map((symptom) => (  
//                   <View key={symptom.key} style={s.symptomRow}>  
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />  
//                     <Text style={s.symptomLabel}>{symptom.label}</Text>  
//                     <Switch  
//                       value={symptoms[symptom.key] ?? false}  
//                       onValueChange={() => toggleSymptom(symptom.key)}  
//                       trackColor={{ false: Colors.border, true: Colors.amber }}  
//                       thumbColor="#fff"  
//                     />  
//                   </View>  
//                 ))}  
//               </View>  
//             </View>  

//             {/* ── STEP 4: Skin tone ── */}  
//             <View style={s.card}>  
//               <View style={s.stepHeader}>  
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>  
//                 <Text style={s.cardTitle}>Baby's skin tone</Text>  
//               </View>  
//               <Text style={s.cardSub}>Helps us adjust detection for darker skin.</Text>  
//               <View style={s.skinRow}>  
//                 {SKIN_TONES.map((tone) => (  
//                   <TouchableOpacity  
//                     key={tone.key}  
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}  
//                     onPress={() => setSkinTone(tone.key)}  
//                   >  
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />  
//                     <Text style={s.skinLabel}>{tone.label}</Text>  
//                   </TouchableOpacity>  
//                 ))}  
//               </View>  
//             </View>  

//             {/* ── STEP 5: Location ── */}  
//             <View style={s.card}>  
//               <View style={s.stepHeader}>  
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>  
//                 <Text style={s.cardTitle}>Location</Text>  
//               </View>  

//               <View style={[  
//                 s.gpsStatus,  
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,  
//               ]}>  
//                 <Ionicons  
//                   name={location.status === "granted" ? "location" : "location-outline"}  
//                   size={15}  
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}  
//                 />  
//                 <Text style={[  
//                   s.gpsText,  
//                   location.status === "granted" && { color: Colors.sage },  
//                 ]}>  
//                   {location.status === "granted"  
//                     ? "Location enabled — showing nearby facilities"  
//                     : location.status === "loading"  
//                     ? "Getting your location..."  
//                     : location.status === "denied"  
//                     ? "Location denied — select state below"  
//                     : "Getting your location..."}  
//                 </Text>  
//               </View>  

//               {location.status !== "granted" && (  
//                 <>  
//                   <TouchableOpacity  
//                     style={s.pickerBtn}  
//                     onPress={() => setShowStatePicker(true)}  
//                   >  
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />  
//                     <Text style={s.pickerBtnText}>  
//                       {state || "Select your state"}  
//                     </Text>  
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />  
//                   </TouchableOpacity>  

//                   {state !== "" && (  
//                     <TouchableOpacity  
//                       style={[s.pickerBtn, { marginTop: 8 }]}  
//                       onPress={() => setShowLgaPicker(true)}  
//                     >  
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />  
//                       <Text style={s.pickerBtnText}>  
//                         {lga || "Select your LGA (optional)"}  
//                       </Text>  
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />  
//                     </TouchableOpacity>  
//                   )}  
//                 </>  
//               )}  
//             </View>  

//             {/* ── STEP 6: Facility Preference ── */}  
//             <View style={s.card}>  
//               <View style={s.stepHeader}>  
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>  
//                 <Text style={s.cardTitle}>Where would you like to go?</Text>  
//               </View>  
//               <Text style={s.cardSub}>We will find the best match near you.</Text>  
//               <View style={s.prefRow}>  
//                 {FACILITY_PREFERENCES.map((pref) => (  
//                   <TouchableOpacity  
//                     key={pref.key}  
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}  
//                     onPress={() => setPreference(pref.key)}  
//                   >  
//                     <Ionicons  
//                       name={pref.icon}  
//                       size={22}  
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}  
//                     />  
//                     <Text style={[  
//                       s.prefLabel,  
//                       preference === pref.key && { color: Colors.coral },  
//                     ]}>  
//                       {pref.label}  
//                     </Text>  
//                     <Text style={s.prefSub}>{pref.sub}</Text>  
//                   </TouchableOpacity>  
//                 ))}  
//               </View>  
//             </View>  

//             {/* Submit Button */}  
//             <TouchableOpacity  
//               style={[s.submitBtn, (loading || compressing || !imageUri || !feeding) && { opacity: 0.55 }]}  
//               onPress={submit}  
//               disabled={loading || compressing || !imageUri || !feeding}  
//             >  
//               {loading ? (  
//                 <ActivityIndicator color="#fff" />  
//               ) : (  
//                 <>  
//                   <Ionicons name="scan-outline" size={20} color="#fff" />  
//                   <Text style={s.submitBtnText}>Analyze screening</Text>  
//                 </>  
//               )}  
//             </TouchableOpacity>  

//             {(!imageUri || !feeding) && (  
//               <Text style={s.submitHint}>  
//                 {!imageUri ? "Photo required" : "Please select how baby is feeding"}  
//               </Text>  
//             )}  
//           </>  
//         )}  
//       </ScrollView>  

//       {/* State picker modal */}  
//       <Modal visible={showStatePicker} animationType="slide" transparent>  
//         <View style={s.modalOverlay}>  
//           <View style={s.modalBox}>  
//             <View style={s.modalHeader}>  
//               <Text style={s.modalTitle}>Select your state</Text>  
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>  
//                 <Ionicons name="close" size={24} color={Colors.earth} />  
//               </TouchableOpacity>  
//             </View>  
//             <FlatList  
//               data={STATES}  
//               keyExtractor={(item) => item}  
//               renderItem={({ item }) => (  
//                 <TouchableOpacity  
//                   style={[s.modalItem, state === item && s.modalItemSelected]}  
//                   onPress={() => {  
//                     setState(item);  
//                     setLga("");  
//                     setShowStatePicker(false);  
//                   }}  
//                 >  
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>  
//                     {item}  
//                   </Text>  
//                   {state === item && (  
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />  
//                   )}  
//                 </TouchableOpacity>  
//               )}  
//             />  
//           </View>  
//         </View>  
//       </Modal>  

//       {/* LGA picker modal */}  
//       <Modal visible={showLgaPicker} animationType="slide" transparent>  
//         <View style={s.modalOverlay}>  
//           <View style={s.modalBox}>  
//             <View style={s.modalHeader}>  
//               <Text style={s.modalTitle}>Select your LGA</Text>  
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>  
//                 <Ionicons name="close" size={24} color={Colors.earth} />  
//               </TouchableOpacity>  
//             </View>  
//             <FlatList  
//               data={lgaOptions}  
//               keyExtractor={(item) => item}  
//               renderItem={({ item }) => (  
//                 <TouchableOpacity  
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}  
//                   onPress={() => {  
//                     setLga(item);  
//                     setShowLgaPicker(false);  
//                   }}  
//                 >  
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>  
//                     {item}  
//                   </Text>  
//                   {lga === item && (  
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />  
//                   )}  
//                 </TouchableOpacity>  
//               )}  
//             />  
//           </View>  
//         </View>  
//       </Modal>  

//       {ToastComponent}  
//     </SafeAreaView>  
//   );  
// }

// const s = StyleSheet.create({  
//   safe:    { flex: 1, backgroundColor: Colors.background },  
//   scroll:  { flex: 1 },  
//   content: { padding: 16, paddingBottom: 40 },  
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },  

//   card: {  
//     backgroundColor: Colors.card,  
//     borderRadius: Radius.lg,  
//     padding: 16,  
//     marginBottom: 14,  
//     ...Shadow.sm,  
//   },  
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },  
//   stepNum: {  
//     width: 26, height: 26, borderRadius: 13,  
//     backgroundColor: Colors.coral,  
//     alignItems: "center", justifyContent: "center",  
//   },  
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },  
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },  
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },  

//   compressingContainer: {  
//     minHeight: 140,  
//     alignItems: "center",  
//     justifyContent: "center",  
//     gap: 10,  
//     borderWidth: 1.5,  
//     borderColor: Colors.border,  
//     borderStyle: "dashed",  
//     borderRadius: Radius.lg,  
//   },  
//   compressingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },  

//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },  
//   photoButtons: {  
//     flexDirection: "row",  
//     borderWidth: 1.5,  
//     borderColor: Colors.border,  
//     borderStyle: "dashed",  
//     borderRadius: Radius.lg,  
//     overflow: "hidden",  
//     minHeight: 140,  
//   },  
//   photoBigBtn: {  
//     flex: 1,  
//     alignItems: "center",  
//     justifyContent: "center",  
//     gap: 8,  
//     padding: 20,  
//   },  
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },  
//   photoDivider:    { width: 1, backgroundColor: Colors.border },  
//   photoActions:    { flexDirection: "row", gap: 10 },  
//   photoBtn: {  
//     flex: 1,  
//     flexDirection: "row",  
//     alignItems: "center",  
//     justifyContent: "center",  
//     gap: 6,  
//     borderWidth: 1.5,  
//     borderColor: Colors.coral,  
//     borderRadius: Radius.md,  
//     padding: 9,  
//   },  
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },  

//   ageBanner: {  
//     flexDirection: "row",  
//     alignItems: "center",  
//     gap: 6,  
//     backgroundColor: Colors.sagePale,  
//     borderRadius: Radius.md,  
//     padding: 10,  
//     marginBottom: 14,  
//   },  
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },  

//   feedingRow: { flexDirection: "row", gap: 10 },  
//   feedingCard: {  
//     flex: 1,  
//     borderWidth: 1.5,  
//     borderColor: Colors.border,  
//     borderRadius: Radius.lg,  
//     padding: 14,  
//     alignItems: "center",  
//     gap: 4,  
//   },  
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },  
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },  
//   feedingIcon:  { fontSize: 28 },  
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },  
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },  

//   signsGroup:  { marginBottom: 14 },  
//   signsHeader: {  
//     flexDirection: "row",  
//     alignItems: "center",  
//     gap: 6,  
//     borderRadius: Radius.md,  
//     padding: 8,  
//     marginBottom: 8,  
//   },  
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },  
//   symptomRow: {  
//     flexDirection: "row",  
//     alignItems: "center",  
//     paddingVertical: 11,  
//     borderBottomWidth: 1,  
//     borderBottomColor: Colors.border,  
//     gap: 10,  
//   },  
//   symptomIcon:  { width: 22 },  
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },  

//   skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },  
//   skinChip: {  
//     alignItems: "center",  
//     gap: 3,  
//     padding: 5,  
//     borderRadius: Radius.md,  
//     borderWidth: 1.5,  
//     borderColor: "transparent",  
//     flex: 1,  
//   },  
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },  
//   skinSwatch:      { width: 26, height: 26, borderRadius: 13 },  
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },  

//   gpsStatus: {  
//     flexDirection: "row",  
//     alignItems: "center",  
//     gap: 8,  
//     borderRadius: Radius.md,  
//     padding: 11,  
//     marginBottom: 10,  
//   },  
//   gpsGranted: { backgroundColor: Colors.sagePale },  
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },  
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },  

//   pickerBtn: {  
//     flexDirection: "row",  
//     alignItems: "center",  
//     gap: 10,  
//     borderWidth: 1.5,  
//     borderColor: Colors.border,  
//     borderRadius: Radius.md,  
//     padding: 12,  
//     backgroundColor: Colors.cream,  
//   },  
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },  

//   prefRow: { flexDirection: "row", gap: 8 },  
//   prefCard: {  
//     flex: 1,  
//     borderWidth: 1.5,  
//     borderColor: Colors.border,  
//     borderRadius: Radius.lg,  
//     padding: 12,  
//     alignItems: "center",  
//     gap: 4,  
//   },  
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },  
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },  
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },  

//   submitBtn: {  
//     backgroundColor: Colors.coral,  
//     borderRadius: Radius.lg,  
//     padding: 16,  
//     flexDirection: "row",  
//     alignItems: "center",  
//     justifyContent: "center",  
//     gap: 8,  
//     marginTop: 4,  
//     ...Shadow.md,  
//   },  
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },  
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },  

//   resetBtn: {  
//     flexDirection: "row",  
//     alignItems: "center",  
//     justifyContent: "center",  
//     gap: 6,  
//     marginTop: 16,  
//     padding: 12,  
//   },  
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },  

//   modalOverlay: {  
//     flex: 1,  
//     backgroundColor: "rgba(0,0,0,0.5)",  
//     justifyContent: "flex-end",  
//   },  
//   modalBox: {  
//     backgroundColor: Colors.background,  
//     borderTopLeftRadius: 20,  
//     borderTopRightRadius: 20,  
//     maxHeight: "80%",  
//     paddingBottom: 30,  
//   },  
//   modalHeader: {  
//     flexDirection: "row",  
//     justifyContent: "space-between",  
//     alignItems: "center",  
//     padding: 16,  
//     borderBottomWidth: 1,  
//     borderBottomColor: Colors.border,  
//   },  
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },  
//   modalItem: {  
//     flexDirection: "row",  
//     alignItems: "center",  
//     justifyContent: "space-between",  
//     paddingVertical: 14,  
//     paddingHorizontal: 16,  
//     borderBottomWidth: 1,  
//     borderBottomColor: Colors.border,  
//   },  
//   modalItemSelected:     { backgroundColor: "#fff5f2" },  
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },  
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },  
// });






// /**    
//  * JaundiCare — Screening Screen (v4.1 Production-Hardened)    
//  * Simplified UX: big feeding cards, combined symptoms,    
//  * facility preference selector, LGA picker, silent GPS.    
//  * Image compression and states loading    
//  * model working with offline fallback and local storage.    
//  */

// import React, { useState, useEffect, useRef } from "react";    
// import {    
//   View, Text, ScrollView, TouchableOpacity,    
//   StyleSheet, ActivityIndicator, Image,    
//   Switch, Modal, FlatList,    
// } from "react-native";    
// import { SafeAreaView } from "react-native-safe-area-context";    
// import * as ImagePicker from "expo-image-picker";    
// import * as ImageManipulator from "expo-image-manipulator";    
// import { Ionicons } from "@expo/vector-icons";    
// import { useAppStore } from "../../store/appStore";    
// import { screeningApi, type ScreeningResult } from "../../services/api";    
// import { saveScreeningOffline } from "../../services/offlineStore";    
// import { useLocation } from "../../hooks/useLocation";    
// import { ResultCard } from "../../components/ResultCard";    
// import { useToast } from "../../hooks/useToast";    
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";    
// import { LGA_DATA } from "../../constants/lgaData";    
// import { runLocalInferenceWithUri } from "../../localInference";
// import { useTranslations } from "../../hooks/useTranslations";
// import { decisionConfig } from "../../constants/decisionMap";

// const SKIN_TONES = [    
//   { key: "very_light",  color: "#f8d5b4", labelKey: "skin.very_light",  fallbackLabel: "Very light" },    
//   { key: "light",       color: "#e8b98a", labelKey: "skin.light",       fallbackLabel: "Light"      },    
//   { key: "medium",      color: "#c68642", labelKey: "skin.medium",      fallbackLabel: "Medium"     },    
//   { key: "medium_dark", color: "#8d5524", labelKey: "skin.medium_dark", fallbackLabel: "Med dark"   },    
//   { key: "dark",        color: "#4a2912", labelKey: "skin.dark",        fallbackLabel: "Dark"       },    
// ];    

// const STATES = Object.keys(LGA_DATA).sort();

// const URGENT_SYMPTOMS = [    
//   {    
//     key: "hard_to_wake",    
//     labelKey: "symptom.hard_to_wake",
//     fallbackLabel: "Hard to wake up or very floppy",    
//     icon: "moon-outline" as const,    
//     fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],    
//   },    
//   {    
//     key: "jaundice_first_24h",    
//     labelKey: "symptom.jaundice_first_24h",
//     fallbackLabel: "Yellowing appeared in first 24 hours",    
//     icon: "warning-outline" as const,    
//     fields: ["jaundice_first_24h"],    
//   },    
//   {    
//     key: "dark_urine_pale_stool",    
//     labelKey: "symptom.dark_urine_pale_stool",
//     fallbackLabel: "Urine is dark OR stool is very pale",    
//     icon: "water-outline" as const,    
//     fields: ["dark_urine", "pale_stool"],    
//   },    
//   {    
//     key: "jaundice_spreading",    
//     labelKey: "symptom.jaundice_spreading",
//     fallbackLabel: "Yellowing appears to be spreading",    
//     icon: "trending-up-outline" as const,    
//     fields: ["jaundice_spreading"],    
//   },    
// ];    

// const WATCH_SYMPTOMS = [    
//   {    
//     key: "yellow_eyes",    
//     labelKey: "symptom.yellow_eyes",
//     fallbackLabel: "Yellow in the whites of the eyes",    
//     icon: "eye-outline" as const,    
//     fields: ["yellow_eyes"],    
//   },    
//   {    
//     key: "yellow_gums_palms",    
//     labelKey: "symptom.yellow_gums_palms",
//     fallbackLabel: "Yellow on gums, palms or soles of feet",    
//     icon: "hand-left-outline" as const,    
//     fields: ["yellow_gums", "yellow_palms_or_soles"],    
//   },    
//   {    
//     key: "darker_skin",    
//     labelKey: "symptom.darker_skin",
//     fallbackLabel: "Baby has darker skin tone",    
//     icon: "person-outline" as const,    
//     fields: ["darker_skin_tone"],    
//   },    
// ];    

// const FACILITY_PREFERENCES = [    
//   {    
//     key: "nearest",    
//     icon: "navigate-outline" as const,    
//     labelKey: "pref.nearest",
//     subKey: "pref.nearest_sub",
//     fallbackLabel: "Nearest",    
//     fallbackSub: "Fastest to reach",    
//   },    
//   {    
//     key: "government",    
//     icon: "business-outline" as const,    
//     labelKey: "pref.govt",
//     subKey: "pref.govt_sub",
//     fallbackLabel: "Govt",    
//     fallbackSub: "Lower cost",    
//   },    
//   {    
//     key: "clinic",    
//     icon: "medkit-outline" as const,    
//     labelKey: "pref.clinic",
//     subKey: "pref.clinic_sub",
//     fallbackLabel: "Clinic/PHC",    
//     fallbackSub: "Basic care",    
//   },    
// ];

// export default function ScreeningScreen() {    
//   const profile       = useAppStore((s) => s.profile);    
//   const setLastResult = useAppStore((s) => s.setLastScreening);    
//   const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

//   const { t, language } = useTranslations();
//   const { location, requestLocation } = useLocation();    
//   const { showToast, ToastComponent }  = useToast();

//   const [imageUri,    setImageUri]    = useState<string | null>(null);    
//   const [skinTone,    setSkinTone]    = useState<string | null>(null);    
//   const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);    
//   const [state,       setState]       = useState("");    
//   const [lga,         setLga]         = useState("");    
//   const [preference,  setPreference]  = useState("nearest");    
//   const [loading,     setLoading]     = useState(false);    
//   const [compressing, setCompressing] = useState(false);    
//   const [result,      setResult]      = useState<ScreeningResult | null>(null);    
//   const [showStatePicker, setShowStatePicker] = useState(false);    
//   const [showLgaPicker,   setShowLgaPicker]   = useState(false);    
//   const [symptoms, setSymptoms] = useState<Record<string, boolean>>({    
//     hard_to_wake:         false,    
//     jaundice_first_24h:   false,    
//     dark_urine_pale_stool: false,    
//     jaundice_spreading:   false,    
//     yellow_eyes:          false,    
//     yellow_gums_palms:    false,    
//     darker_skin:          false,    
//   });

//   const isComponentActive = useRef(true);

//   useEffect(() => {    
//     isComponentActive.current = true;  
//     return () => { isComponentActive.current = false; };  
//   }, []);

//   useEffect(() => {    
//     if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {    
//       setSymptoms(p => ({ ...p, darker_skin: true }));    
//     }    
//   }, [skinTone]);

//   useEffect(() => {    
//     requestLocation();    
//   }, []);

//   const toggleSymptom = (key: string) =>    
//     setSymptoms(p => ({ ...p, [key]: !p[key] }));

//   const expandSymptoms = () => {    
//     const expanded: Record<string, boolean> = {};    
//     const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];    
//     for (const group of allGroups) {    
//       const isOn = symptoms[group.key] ?? false;    
//       for (const field of group.fields) {    
//         expanded[field] = expanded[field] || isOn;    
//       }    
//     }    
//     return expanded;    
//   };

//   const pickImage = async () => {    
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();    
//     if (status !== "granted") {      
//       if (isComponentActive.current) {
//         showToast(t("error.camera_permission") === "error.camera_permission" ? "Camera permission needed. Please enable in settings." : t("error.camera_permission"));    
//       }
//       return true;    
//     }    
//     return false;    
//   };

//   const processAndOptimizeImage = async (originalUri: string) =>    {    
//     setCompressing(true);    
//     try {    
//       const manipulatedImage = await ImageManipulator.manipulateAsync(    
//         originalUri,    
//         [{ resize: { width: 800 } }],    
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }    
//       );    
//       if (isComponentActive.current) {  
//         setImageUri(manipulatedImage.uri);    
//       }  
//     } catch (err) {    
//       if (isComponentActive.current) {
//         showToast(t("error.image_optimize") === "error.image_optimize" ? "Could not optimize image. Using original file." : t("error.image_optimize"));    
//         setImageUri(originalUri);    
//       }  
//     } finally {    
//       if (isComponentActive.current) {  
//         setCompressing(false);    
//       }  
//     }    
//   };

//   const openCamera = async () => {    
//     const isDenied = await pickImage();  
//     if (isDenied) return;

//     const res = await ImagePicker.launchCameraAsync({    
//       mediaTypes: "images",    
//       quality: 0.8,    
//       allowsEditing: false,    
//     });    
//     if (!res.canceled && res.assets && res.assets[0]) {    
//       await processAndOptimizeImage(res.assets[0].uri);    
//     }    
//   };

//   const openGallery = async () => {    
//     const res = await ImagePicker.launchImageLibraryAsync({    
//       mediaTypes: "images",    
//       quality: 0.8,    
//       allowsEditing: false,    
//     });    
//     if (!res.canceled && res.assets && res.assets[0]) {    
//       await processAndOptimizeImage(res.assets[0].uri);    
//     }    
//   };

//   const submit = async () => {    
//     if (!imageUri) {    
//       showToast(t("error.photo_required") === "error.photo_required" ? "Please take or choose a photo first." : t("error.photo_required"));    
//       return;    
//     }    
//     if (!feeding) {    
//       showToast(t("error.feeding_required") === "error.feeding_required" ? "Please tell us how baby is feeding." : t("error.feeding_required"));    
//       return;    
//     }

//     setLoading(true);    
//     setResult(null);

//     const ageHours  = profile?.age_hours ?? undefined;    
//     const hasGPS    = location.latitude != null && location.longitude != null;    
//     const expanded  = expandSymptoms();    
//     const apiPayload = {    
//       imageUri,    
//       age_hours:                   ageHours,    
//       feeding,    
//       difficult_to_wake:           expanded.difficult_to_wake ?? false,    
//       floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,    
//       jaundice_first_24h:          expanded.jaundice_first_24h ?? false,    
//       jaundice_spreading:          expanded.jaundice_spreading ?? false,    
//       yellow_eyes:                 expanded.yellow_eyes ?? false,    
//       yellow_gums:                 expanded.yellow_gums ?? false,    
//       yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,    
//       dark_urine:                  expanded.dark_urine ?? false,    
//       pale_stool:                  expanded.pale_stool ?? false,    
//       darker_skin_tone:            expanded.darker_skin_tone ?? false,    
//       skin_tone_category:          skinTone ?? undefined,    
//       user_latitude:               location.latitude  ?? undefined,    
//       user_longitude:              location.longitude ?? undefined,    
//       user_state:                  hasGPS ? undefined : (state || undefined),    
//       user_lga:                    hasGPS ? undefined : (lga || undefined),    
//       facility_preference:         preference,    
//       ui_language:                 language,    
//     };

//     try {    
//       const data = await screeningApi.analyze(apiPayload);    
       
//       if (!isComponentActive.current) return;

//       setResult(data);    
//       setLastResult(data);    
//       storeFollowUp(data.final_decision);    
//     } catch (err: any) {    
//       console.log("[Screening] Server evaluation error, switching to localized edge inference model...");    
         
//       try {    
//         const localPredictions = await runLocalInferenceWithUri(imageUri);

//         let triageLevel = "OFFLINE_PENDING";    
//         let decisionReason = t("offline.processing_msg") === "offline.processing_msg" 
//           ? "Screening data saved locally. Deep learning classification was processed entirely offline on-device." 
//           : t("offline.processing_msg");    
//         let notesText = [t("offline.hardware_note") === "offline.hardware_note" ? "Processed on local hardware due to limited internet connectivity." : t("offline.hardware_note")];  

//         if (localPredictions && localPredictions.length >= 2) {    
//           const probHealthy = localPredictions[0];    
//           const probJaundice = localPredictions[1];  

//           if (probJaundice > 0.50) {    
//             triageLevel = "URGENT_HOSPITAL_REVIEW";    
//             decisionReason = `${t("status.urgent")}: ${(probJaundice * 100).toFixed(1)}%.`;    
//             notesText.push("High confidence matching for local sclera color discoloration metrics.");    
//           } else {    
//             triageLevel = "ROUTINE_CARE";    
//             decisionReason = `${t("status.monitor")}: ${(probHealthy * 100).toFixed(1)}%.`;    
//             notesText.push("Sclera classification falls into standard clearance margins.");    
//           }    
//         }  

//         const offlineResultData: ScreeningResult = {    
//           screening_id: "pending_local_sync_id",    
//           raw_triage_level: triageLevel,    
//           final_decision: triageLevel === "URGENT_HOSPITAL_REVIEW" ? "SEEK_MEDICAL_ATTENTION" : "MONITOR_AT_HOME",    
//           final_decision_reason: decisionReason,    
//           notes: notesText,    
//           recommended_facilities: [],    
//           success: true,    
//           created_at: new Date().toISOString(),    
//           raw_triage_reason: "Computed via on-device MobileNetV2 edge execution.",    
//           parent_message: "Calculations safely evaluated without cloud dependencies.",    
//         };  

//         const offlineId = await saveScreeningOffline({  
//           ...apiPayload,  
//           facility_preference: `${preference} | local_triage:${triageLevel} | local_prob:${localPredictions ? localPredictions[1].toFixed(2) : 'null'}`  
//         });

//         offlineResultData.screening_id = offlineId;

//         if (!isComponentActive.current) return;

//         setResult(offlineResultData);    
//         setLastResult(offlineResultData);    
//         showToast(t("offline.complete") === "offline.complete" ? "Screening complete: Running via offline edge engine!" : t("offline.complete"));  

//       } catch (offlineWriteError) {    
//         if (!isComponentActive.current) return;  
//         showToast(    
//           err?.response?.data?.detail ??    
//           err?.message ??    
//           "Screening execution failed. Check your configuration parameters."    
//         );    
//       }    
//     } finally {    
//       if (isComponentActive.current) {  
//         setLoading(false);    
//       }  
//     }    
//   };

//   const reset = () => {    
//     setImageUri(null);    
//     setResult(null);    
//     setSkinTone(null);    
//     setFeeding(null);    
//     setState("");    
//     setLga("");    
//     setPreference("nearest");    
//     setSymptoms({    
//       hard_to_wake: false,    
//       jaundice_first_24h: false,    
//       dark_urine_pale_stool: false,    
//       jaundice_spreading: false,    
//       yellow_eyes: false,    
//       yellow_gums_palms: false,    
//       darker_skin: false,    
//     });    
//   };

//   const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];    
  
//   // Clean dynamic UI mapping derived from translation state configuration matrices
//   //const cardConfig = result ? decisionConfig(result.raw_triage_level, t) : null;

//   return (    
//     <SafeAreaView style={s.safe}>    
//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>    
//         <Text style={s.heading}>{t("screening.title") === "screening.title" ? "Baby Screening" : t("screening.title")}</Text>  

//         {result ? (    
//           <>    
//             <ResultCard    
//             //   decision={result.raw_triage_level}
//             //   action={result.final_decision_reason || result.parent_message || ""}
//               result={result}
//               babyName={profile?.baby_name}    
//               gestationalAgeWeeks={profile?.gestational_age_weeks}    
//             />    
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>    
//               <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />    
//               <Text style={s.resetBtnText}>{t("screening.new_screening") === "screening.new_screening" ? "New screening" : t("screening.new_screening")}</Text>    
//             </TouchableOpacity>    
//           </>    
//         ) : (    
//           <>    
//             {/* ── STEP 1: Photo ── */}    
//             <View style={s.card}>    
//               <View style={s.stepHeader}>    
//                 <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>    
//                 <Text style={s.cardTitle}>{t("screening.baby_photo") === "screening.baby_photo" ? "Baby photo" : t("screening.baby_photo")}</Text>    
//               </View>    
//               <Text style={s.cardSub}>    
//                 {t("screening.photo_instruction") === "screening.photo_instruction" ? "Use natural light. Focus on the face, eyes, gums, and palms." : t("screening.photo_instruction")}    
//               </Text>  

//               {compressing ? (    
//                 <View style={s.compressingContainer}>    
//                   <ActivityIndicator size="small" color={Colors.coral} />    
//                   <Text style={s.compressingText}>{t("screening.optimizing") === "screening.optimizing" ? "Optimizing image size..." : t("screening.optimizing")}</Text>    
//                 </View>    
//               ) : imageUri ? (    
//                 <>    
//                   <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />    
//                   <View style={s.photoActions}>    
//                     <TouchableOpacity style={s.photoBtn} onPress={openCamera}>    
//                       <Ionicons name="camera-outline" size={16} color={Colors.coral} />    
//                       <Text style={s.photoBtnText}>{t("screening.retake") === "screening.retake" ? "Retake" : t("screening.retake")}</Text>    
//                     </TouchableOpacity>    
//                     <TouchableOpacity style={s.photoBtn} onPress={openGallery}>    
//                       <Ionicons name="images-outline" size={16} color={Colors.coral} />    
//                       <Text style={s.photoBtnText}>{t("screening.gallery") === "screening.gallery" ? "Gallery" : t("screening.gallery")}</Text>    
//                     </TouchableOpacity>    
//                   </View>    
//                 </>    
//               ) : (    
//                 <View style={s.photoButtons}>    
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>    
//                     <Ionicons name="camera" size={28} color={Colors.coral} />    
//                     <Text style={s.photoBigBtnText}>{t("screening.take_photo") === "screening.take_photo" ? "Take photo" : t("screening.take_photo")}</Text>    
//                   </TouchableOpacity>    
//                   <View style={s.photoDivider} />    
//                   <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>    
//                     <Ionicons name="images" size={28} color={Colors.coral} />    
//                     <Text style={s.photoBigBtnText}>{t("screening.choose_gallery") === "screening.choose_gallery" ? "Choose from gallery" : t("screening.choose_gallery")}</Text>    
//                   </TouchableOpacity>    
//                 </View>    
//               )}    
//             </View>  

//             {/* Age auto-fill */}    
//             {profile?.age_hours != null && (    
//               <View style={s.ageBanner}>    
//                 <Ionicons name="person-outline" size={14} color={Colors.sage} />    
//                 <Text style={s.ageBannerText}>    
//                   {t("screening.baby_age") === "screening.baby_age" ? "Baby age" : t("screening.baby_age")}: {profile.age_hours}h — {t("screening.autofilled") === "screening.autofilled" ? "auto-filled from profile" : t("screening.autofilled")}    
//                 </Text>    
//               </View>    
//             )}  

//             {/* ── STEP 2: Feeding ── */}    
//             <View style={s.card}>    
//               <View style={s.stepHeader}>    
//                 <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>    
//                 <Text style={s.cardTitle}>{t("screening.feeding_question") === "screening.feeding_question" ? "How is baby feeding?" : t("screening.feeding_question")}</Text>    
//               </View>    
//               <View style={s.feedingRow}>    
//                 <TouchableOpacity    
//                   style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}    
//                   onPress={() => setFeeding("good")}    
//                 >    
//                   <Text style={s.feedingIcon}>🍼</Text>    
//                   <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>    
//                     {t("feeding.good") === "feeding.good" ? "Feeding well" : t("feeding.good")}    
//                   </Text>    
//                   <Text style={s.feedingSub}>{t("feeding.good_sub") === "feeding.good_sub" ? "Latching and feeding normally" : t("feeding.good_sub")}</Text>    
//                 </TouchableOpacity>  

//                 <TouchableOpacity    
//                   style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}    
//                   onPress={() => setFeeding("poor")}    
//                 >    
//                   <Text style={s.feedingIcon}>⚠️</Text>    
//                   <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>    
//                     {t("feeding.poor") === "feeding.poor" ? "Struggling" : t("feeding.poor")}    
//                   </Text>    
//                   <Text style={s.feedingSub}>{t("feeding.poor_sub") === "feeding.poor_sub" ? "Not feeding much or refusing" : t("feeding.poor_sub")}</Text>    
//                 </TouchableOpacity>    
//               </View>    
//             </View>  

//             {/* ── STEP 3: Symptoms ── */}    
//             <View style={s.card}>    
//               <View style={s.stepHeader}>    
//                 <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>    
//                 <Text style={s.cardTitle}>{t("screening.symptoms_question") === "screening.symptoms_question" ? "What do you notice?" : t("screening.symptoms_question")}</Text>    
//               </View>    
//               <Text style={s.cardSub}>{t("screening.symptoms_sub") === "screening.symptoms_sub" ? "Toggle everything you can see or have noticed." : t("screening.symptoms_sub")}</Text>  

//               {/* Urgent signs */}    
//               <View style={s.signsGroup}>    
//                 <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>    
//                   <Ionicons name="warning-outline" size={13} color={Colors.rust} />    
//                   <Text style={[s.signsHeaderText, { color: Colors.rust }]}>    
//                     {t("symptom.urgent_header") === "symptom.urgent_header" ? "Urgent signs — seek help immediately if present" : t("symptom.urgent_header")}    
//                   </Text>    
//                 </View>    
//                 {URGENT_SYMPTOMS.map((symptom) => (    
//                   <View key={symptom.key} style={s.symptomRow}>    
//                     <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />    
//                     <Text style={s.symptomLabel}>{t(symptom.labelKey) === symptom.labelKey ? symptom.fallbackLabel : t(symptom.labelKey)}</Text>    
//                     <Switch    
//                       value={symptoms[symptom.key] ?? false}    
//                       onValueChange={() => toggleSymptom(symptom.key)}    
//                       trackColor={{ false: Colors.border, true: Colors.rust }}    
//                       thumbColor="#fff"    
//                     />    
//                   </View>    
//                 ))}    
//               </View>  

//               {/* Watch closely */}    
//               <View style={s.signsGroup}>    
//                 <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>    
//                   <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />    
//                   <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>    
//                     {t("symptom.watch_header") === "symptom.watch_header" ? "Watch closely — tell your health worker" : t("symptom.watch_header")}    
//                   </Text>    
//                 </View>    
//                 {WATCH_SYMPTOMS.map((symptom) => (    
//                   <View key={symptom.key} style={s.symptomRow}>    
//                     <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />    
//                     <Text style={s.symptomLabel}>{t(symptom.labelKey) === symptom.labelKey ? symptom.fallbackLabel : t(symptom.labelKey)}</Text>    
//                     <Switch    
//                       value={symptoms[symptom.key] ?? false}    
//                       onValueChange={() => toggleSymptom(symptom.key)}    
//                       trackColor={{ false: Colors.border, true: Colors.amber }}    
//                       thumbColor="#fff"    
//                     />    
//                   </View>    
//                 ))}    
//               </View>    
//             </View>  

//             {/* ── STEP 4: Skin tone ── */}    
//             <View style={s.card}>    
//               <View style={s.stepHeader}>    
//                 <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>    
//                 <Text style={s.cardTitle}>{t("skin.title") === "skin.title" ? "Baby's skin tone" : t("skin.title")}</Text>    
//               </View>    
//               <Text style={s.cardSub}>{t("skin.sub") === "skin.sub" ? "Helps us adjust detection for darker skin." : t("skin.sub")}</Text>    
//               <View style={s.skinRow}>    
//                 {SKIN_TONES.map((tone) => (    
//                   <TouchableOpacity    
//                     key={tone.key}    
//                     style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}    
//                     onPress={() => setSkinTone(tone.key)}    
//                   >    
//                     <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />    
//                     <Text style={s.skinLabel}>{t(tone.labelKey) === tone.labelKey ? tone.fallbackLabel : t(tone.labelKey)}</Text>    
//                   </TouchableOpacity>    
//                 ))}    
//               </View>    
//             </View>  

//             {/* ── STEP 5: Location ── */}    
//             <View style={s.card}>    
//               <View style={s.stepHeader}>    
//                 <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>    
//                 <Text style={s.cardTitle}>{t("location.title") === "location.title" ? "Location" : t("location.title")}</Text>    
//               </View>  

//               <View style={[    
//                 s.gpsStatus,    
//                 location.status === "granted" ? s.gpsGranted : s.gpsPending,    
//               ]}>    
//                 <Ionicons    
//                   name={location.status === "granted" ? "location" : "location-outline"}    
//                   size={15}    
//                   color={location.status === "granted" ? Colors.sage : Colors.brownLight}    
//                 />    
//                 <Text style={[    
//                   s.gpsText,    
//                   location.status === "granted" && { color: Colors.sage },    
//                 ]}>    
//                   {location.status === "granted"    
//                     ? (t("gps.enabled") === "gps.enabled" ? "Location enabled — showing nearby facilities" : t("gps.enabled"))    
//                     : location.status === "loading"    
//                     ? (t("gps.loading") === "gps.loading" ? "Getting your location..." : t("gps.loading"))    
//                     : location.status === "denied"    
//                     ? (t("gps.denied") === "gps.denied" ? "Location denied — select state below" : t("gps.denied"))    
//                     : (t("gps.loading") === "gps.loading" ? "Getting your location..." : t("gps.loading"))}    
//                 </Text>    
//               </View>  

//               {location.status !== "granted" && (    
//                 <>    
//                   <TouchableOpacity    
//                     style={s.pickerBtn}    
//                     onPress={() => setShowStatePicker(true)}    
//                   >    
//                     <Ionicons name="map-outline" size={16} color={Colors.coral} />    
//                     <Text style={s.pickerBtnText}>    
//                       {state || (t("location.select_state") === "location.select_state" ? "Select your state" : t("location.select_state"))}    
//                     </Text>    
//                     <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />    
//                   </TouchableOpacity>  

//                   {state !== "" && (    
//                     <TouchableOpacity    
//                       style={[s.pickerBtn, { marginTop: 8 }]}    
//                       onPress={() => setShowLgaPicker(true)}    
//                     >    
//                       <Ionicons name="location-outline" size={16} color={Colors.coral} />    
//                       <Text style={s.pickerBtnText}>    
//                         {lga || (t("location.select_lga") === "location.select_lga" ? "Select your LGA (optional)" : t("location.select_lga"))}    
//                       </Text>    
//                       <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />    
//                     </TouchableOpacity>    
//                   )}    
//                 </>    
//               )}    
//             </View>  

//             {/* ── STEP 6: Facility Preference ── */}    
//             <View style={s.card}>    
//               <View style={s.stepHeader}>    
//                 <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>    
//                 <Text style={s.cardTitle}>{t("pref.title") === "pref.title" ? "Where would you like to go?" : t("pref.title")}</Text>    
//               </View>    
//               <Text style={s.cardSub}>{t("pref.sub") === "pref.sub" ? "We will find the best match near you." : t("pref.sub")}</Text>    
//               <View style={s.prefRow}>    
//                 {FACILITY_PREFERENCES.map((pref) => (    
//                   <TouchableOpacity    
//                     key={pref.key}    
//                     style={[s.prefCard, preference === pref.key && s.prefCardSelected]}    
//                     onPress={() => setPreference(pref.key)}    
//                   >    
//                     <Ionicons    
//                       name={pref.icon}    
//                       size={22}    
//                       color={preference === pref.key ? Colors.coral : Colors.brownLight}    
//                     />    
//                     <Text style={[    
//                       s.prefLabel,    
//                       preference === pref.key && { color: Colors.coral },    
//                     ]}>    
//                       {t(pref.labelKey) === pref.labelKey ? pref.fallbackLabel : t(pref.labelKey)}    
//                     </Text>    
//                     <Text style={s.prefSub}>{t(pref.subKey) === pref.subKey ? pref.fallbackSub : t(pref.subKey)}</Text>    
//                   </TouchableOpacity>    
//                 ))}    
//               </View>    
//             </View>  

//             {/* Submit Button */}    
//             <TouchableOpacity    
//               style={[s.submitBtn, (loading || compressing || !imageUri || !feeding) && { opacity: 0.55 }]}    
//               onPress={submit}    
//               disabled={loading || compressing || !imageUri || !feeding}    
//             >    
//               {loading ? (    
//                 <ActivityIndicator color="#fff" />    
//               ) : (    
//                 <>    
//                   <Ionicons name="scan-outline" size={20} color="#fff" />    
//                   <Text style={s.submitBtnText}>{t("screening.analyze") === "screening.analyze" ? "Analyze screening" : t("screening.analyze")}</Text>    
//                 </>    
//               )}    
//             </TouchableOpacity>  

//             {(!imageUri || !feeding) && (    
//               <Text style={s.submitHint}>    
//                 {!imageUri 
//                   ? (t("error.hint_photo") === "error.hint_photo" ? "Photo required" : t("error.hint_photo")) 
//                   : (t("error.hint_feeding") === "error.hint_feeding" ? "Please select how baby is feeding" : t("error.hint_feeding"))}    
//               </Text>    
//             )}    
//           </>    
//         )}    
//       </ScrollView>  

//       {/* State picker modal */}    
//       <Modal visible={showStatePicker} animationType="slide" transparent>    
//         <View style={s.modalOverlay}>    
//           <View style={s.modalBox}>    
//             <View style={s.modalHeader}>    
//               <Text style={s.modalTitle}>{t("location.select_state") === "location.select_state" ? "Select your state" : t("location.select_state")}</Text>    
//               <TouchableOpacity onPress={() => setShowStatePicker(false)}>    
//                 <Ionicons name="close" size={24} color={Colors.earth} />    
//               </TouchableOpacity>    
//             </View>    
//             <FlatList    
//               data={STATES}    
//               keyExtractor={(item) => item}    
//               renderItem={({ item }) => (    
//                 <TouchableOpacity    
//                   style={[s.modalItem, state === item && s.modalItemSelected]}    
//                   onPress={() => {    
//                     setState(item);    
//                     setLga("");    
//                     setShowStatePicker(false);    
//                   }}    
//                 >    
//                   <Text style={[s.modalItemText, state === item && s.modalItemTextSelected]}>    
//                     {item}    
//                   </Text>    
//                   {state === item && (    
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />    
//                   )}    
//                 </TouchableOpacity>    
//               )}    
//             />    
//           </View>    
//         </View>    
//       </Modal>  

//       {/* LGA picker modal */}    
//       <Modal visible={showLgaPicker} animationType="slide" transparent>    
//         <View style={s.modalOverlay}>    
//           <View style={s.modalBox}>    
//             <View style={s.modalHeader}>    
//               <Text style={s.modalTitle}>{t("location.select_lga") === "location.select_lga" ? "Select your LGA" : t("location.select_lga")}</Text>    
//               <TouchableOpacity onPress={() => setShowLgaPicker(false)}>    
//                 <Ionicons name="close" size={24} color={Colors.earth} />    
//               </TouchableOpacity>    
//             </View>    
//             <FlatList    
//               data={lgaOptions}    
//               keyExtractor={(item) => item}    
//               renderItem={({ item }) => (    
//                 <TouchableOpacity    
//                   style={[s.modalItem, lga === item && s.modalItemSelected]}    
//                   onPress={() => {    
//                     setLga(item);    
//                     setShowLgaPicker(false);    
//                   }}    
//                 >    
//                   <Text style={[s.modalItemText, lga === item && s.modalItemTextSelected]}>    
//                     {item}    
//                   </Text>    
//                   {lga === item && (    
//                     <Ionicons name="checkmark" size={18} color={Colors.coral} />    
//                   )}    
//                 </TouchableOpacity>    
//               )}    
//             />    
//           </View>    
//         </View>    
//       </Modal>  

//       {ToastComponent}    
//     </SafeAreaView>    
//   );    
// }

// const s = StyleSheet.create({    
//   safe:    { flex: 1, backgroundColor: Colors.background },    
//   scroll:  { flex: 1 },    
//   content: { padding: 16, paddingBottom: 40 },    
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },  

//   card: {    
//     backgroundColor: Colors.card,    
//     borderRadius: Radius.lg,    
//     padding: 16,    
//     marginBottom: 14,    
//     ...Shadow.sm,    
//   },    
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },    
//   stepNum: {    
//     width: 26, height: 26, borderRadius: 13,    
//     backgroundColor: Colors.coral,    
//     alignItems: "center", justifyContent: "center",    
//   },    
//   stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },    
//   cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },    
//   cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },  

//   compressingContainer: {    
//     minHeight: 140,    
//     alignItems: "center",    
//     justifyContent: "center",    
//     gap: 10,    
//     borderWidth: 1.5,    
//     borderColor: Colors.border,    
//     borderStyle: "dashed",    
//     borderRadius: Radius.lg,    
//   },    
//   compressingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },  

//   preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },    
//   photoButtons: {    
//     flexDirection: "row",    
//     borderWidth: 1.5,    
//     borderColor: Colors.border,    
//     borderStyle: "dashed",    
//     borderRadius: Radius.lg,    
//     overflow: "hidden",    
//     minHeight: 140,    
//   },    
//   photoBigBtn: {    
//     flex: 1,    
//     alignItems: "center",    
//     justifyContent: "center",    
//     gap: 8,    
//     padding: 20,    
//   },    
//   photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },    
//   photoDivider:    { width: 1, backgroundColor: Colors.border },    
//   photoActions:    { flexDirection: "row", gap: 10 },    
//   photoBtn: {    
//     flex: 1,    
//     flexDirection: "row",    
//     alignItems: "center",    
//     justifyContent: "center",    
//     gap: 6,    
//     borderWidth: 1.5,    
//     borderColor: Colors.coral,    
//     borderRadius: Radius.md,    
//     padding: 9,    
//   },    
//   photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },  

//   ageBanner: {    
//     flexDirection: "row",    
//     alignItems: "center",    
//     gap: 6,    
//     backgroundColor: Colors.sagePale,    
//     borderRadius: Radius.md,    
//     padding: 10,    
//     marginBottom: 14,    
//   },    
//   ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },  

//   feedingRow: { flexDirection: "row", gap: 10 },    
//   feedingCard: {    
//     flex: 1,    
//     borderWidth: 1.5,    
//     borderColor: Colors.border,    
//     borderRadius: Radius.lg,    
//     padding: 14,    
//     alignItems: "center",    
//     gap: 4,    
//   },    
//   feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },    
//   feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },    
//   feedingIcon:  { fontSize: 28 },    
//   feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },    
//   feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },  

//   signsGroup:  { marginBottom: 14 },    
//   signsHeader: {    
//     flexDirection: "row",    
//     alignItems: "center",    
//     gap: 6,    
//     borderRadius: Radius.md,    
//     padding: 8,    
//     marginBottom: 8,    
//   },    
//   signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },    
//   symptomRow: {    
//     flexDirection: "row",    
//     alignItems: "center",    
//     paddingVertical: 11,    
//     borderBottomWidth: 1,    
//     borderBottomColor: Colors.border,    
//     gap: 10,    
//   },    
//   symptomIcon:  { width: 22 },    
//   symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },  

//   skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },    
//   skinChip: {    
//     alignItems: "center",    
//     gap: 3,    
//     padding: 5,    
//     borderRadius: Radius.md,    
//     borderWidth: 1.5,    
//     borderColor: "transparent",    
//     flex: 1,    
//   },    
//   skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },    
//   skinSwatch:      { width: 26, height: 26, borderRadius: 13 },    
//   skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },  

//   gpsStatus: {    
//     flexDirection: "row",    
//     alignItems: "center",    
//     gap: 8,    
//     borderRadius: Radius.md,    
//     padding: 11,    
//     marginBottom: 10,    
//   },    
//   gpsGranted: { backgroundColor: Colors.sagePale },    
//   gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },    
//   gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },  

//   pickerBtn: {    
//     flexDirection: "row",    
//     alignItems: "center",    
//     gap: 10,    
//     borderWidth: 1.5,    
//     borderColor: Colors.border,    
//     borderRadius: Radius.md,    
//     padding: 12,    
//     backgroundColor: Colors.cream,    
//   },    
//   pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },  

//   prefRow: { flexDirection: "row", gap: 8 },    
//   prefCard: {    
//     flex: 1,    
//     borderWidth: 1.5,    
//     borderColor: Colors.border,    
//     borderRadius: Radius.lg,    
//     padding: 12,    
//     alignItems: "center",    
//     gap: 4,    
//   },    
//   prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },    
//   prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },    
//   prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },  

//   submitBtn: {    
//     backgroundColor: Colors.coral,    
//     borderRadius: Radius.lg,    
//     padding: 16,    
//     flexDirection: "row",    
//     alignItems: "center",    
//     justifyContent: "center",    
//     gap: 8,    
//     marginTop: 4,    
//     ...Shadow.md,    
//   },    
//   submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },    
//   submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },  

//   resetBtn: {    
//     flexDirection: "row",    
//     alignItems: "center",    
//     justifyContent: "center",    
//     gap: 6,    
//     marginTop: 16,    
//     padding: 12,    
//   },    
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },  

//   modalOverlay: {    
//     flex: 1,    
//     backgroundColor: "rgba(0,0,0,0.5)",    
//     justifyContent: "flex-end",    
//   },    
//   modalBox: {    
//     backgroundColor: Colors.background,    
//     borderTopLeftRadius: 20,    
//     borderTopRightRadius: 20,    
//     maxHeight: "80%",    
//     paddingBottom: 30,    
//   },    
//   modalHeader: {    
//     flexDirection: "row",    
//     justifyContent: "space-between",    
//     alignItems: "center",    
//     padding: 16,    
//     borderBottomWidth: 1,    
//     borderBottomColor: Colors.border,    
//   },    
//   modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },    
//   modalItem: {    
//     flexDirection: "row",    
//     alignItems: "center",    
//     justifyContent: "space-between",    
//     paddingVertical: 14,    
//     paddingHorizontal: 16,    
//     borderBottomWidth: 1,    
//     borderBottomColor: Colors.border,    
//   },    
//   modalItemSelected:     { backgroundColor: "#fff5f2" },    
//   modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },    
//   modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },    
// });











/**      
 * JaundiCare — Screening Screen (v4.1 Production-Hardened)      
 * Simplified UX: big feeding cards, combined symptoms,      
 * facility preference selector, LGA picker, silent GPS.      
 * Image compression and states loading      
 * model working with offline fallback and local storage.      
 */

import React, { useState, useEffect, useRef } from "react";      
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import {      
  View, Text, ScrollView, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, Image,      
  Switch, Modal, FlatList,      
} from "react-native";      
import { SafeAreaView } from "react-native-safe-area-context";      
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";      
import * as ImageManipulator from "expo-image-manipulator";      
import { Ionicons } from "@expo/vector-icons";      
import { useAppStore } from "../../store/appStore";      
import { useProfile } from "../../hooks/useProfile";
import { screeningApi, type ScreeningResult } from "../../services/api";      
import { saveScreeningOffline } from "../../services/offlineStoreSecure";
import { useLocation } from "../../hooks/useLocation";      
import { ResultCard } from "../../components/ResultCard";      
import { useToast } from "../../hooks/useToast";      
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";      
import { LGA_DATA } from "../../constants/lgaData";      
import { LOCAL_MODEL_CLASS_INDEX, runLocalInferenceWithUri } from "../../localInference";
import { useTranslations } from "../../hooks/useTranslations";  
import { decisionConfig } from "../../constants/decisionMap";
import { evaluateOfflineSafety } from "../../services/offlineTriage";

const SKIN_TONES = [      
  { key: "very_light",  color: "#f8d5b4", labelKey: "skin.very_light",  fallbackLabel: "Very light" },      
  { key: "light",       color: "#e8b98a", labelKey: "skin.light",       fallbackLabel: "Light"      },      
  { key: "medium",      color: "#c68642", labelKey: "skin.medium",      fallbackLabel: "Medium"     },      
  { key: "medium_dark", color: "#8d5524", labelKey: "skin.medium_dark", fallbackLabel: "Med dark"   },      
  { key: "dark",        color: "#4a2912", labelKey: "skin.dark",        fallbackLabel: "Dark"       },      
];    

const STATES = Object.keys(LGA_DATA).sort();

const URGENT_SYMPTOMS = [      
  {      
    key: "hard_to_wake",      
    labelKey: "symptom.hard_to_wake",  
    fallbackLabel: "Hard to wake up or very floppy",      
    icon: "moon-outline" as const,      
    fields: ["difficult_to_wake", "floppy_or_unusually_drowsy"],      
  },      
  {      
    key: "jaundice_first_24h",      
    labelKey: "symptom.jaundice_first_24h",  
    fallbackLabel: "Yellowing appeared in first 24 hours",      
    icon: "warning-outline" as const,      
    fields: ["jaundice_first_24h"],      
  },      
  {      
    key: "dark_urine_pale_stool",      
    labelKey: "symptom.dark_urine_pale_stool",  
    fallbackLabel: "Urine is dark OR stool is very pale",      
    icon: "water-outline" as const,      
    fields: ["dark_urine", "pale_stool"],      
  },      
  {      
    key: "jaundice_spreading",      
    labelKey: "symptom.jaundice_spreading",  
    fallbackLabel: "Yellowing appears to be spreading",      
    icon: "trending-up-outline" as const,      
    fields: ["jaundice_spreading"],      
  },      
];    

const WATCH_SYMPTOMS = [      
  {      
    key: "yellow_eyes",      
    labelKey: "symptom.yellow_eyes",  
    fallbackLabel: "Yellow in the whites of the eyes",      
    icon: "eye-outline" as const,      
    fields: ["yellow_eyes"],      
  },      
  {      
    key: "yellow_gums_palms",      
    labelKey: "symptom.yellow_gums_palms",  
    fallbackLabel: "Yellow on gums, palms or soles of feet",      
    icon: "hand-left-outline" as const,      
    fields: ["yellow_gums", "yellow_palms_or_soles"],      
  },      
  {      
    key: "darker_skin",      
    labelKey: "symptom.darker_skin",  
    fallbackLabel: "Baby has darker skin tone",      
    icon: "person-outline" as const,      
    fields: ["darker_skin_tone"],      
  },      
];    

const FACILITY_PREFERENCES = [      
  {      
    key: "nearest",      
    icon: "navigate-outline" as const,      
    labelKey: "pref.nearest",  
    subKey: "pref.nearest_sub",  
    fallbackLabel: "Nearest",      
    fallbackSub: "Fastest to reach",      
  },      
  {      
    key: "government",      
    icon: "business-outline" as const,      
    labelKey: "pref.govt",  
    subKey: "pref.govt_sub",  
    fallbackLabel: "Govt",      
    fallbackSub: "Lower cost",      
  },      
  {      
    key: "clinic",      
    icon: "medkit-outline" as const,      
    labelKey: "pref.clinic",  
    subKey: "pref.clinic_sub",  
    fallbackLabel: "Clinic/PHC",      
    fallbackSub: "Basic care",      
  },      
];

export default function ScreeningScreen() {      
  const setLastResult = useAppStore((s) => s.setLastScreening);      
  const storeFollowUp = useAppStore((s) => s.storeFollowUpData);
  const { profile, isLoading: profileLoading } = useProfile();
  const queryClient = useQueryClient();

  const { t, language } = useTranslations();  
  const { location, requestLocation } = useLocation();      
  const { showToast, ToastComponent }  = useToast();

  const [imageUri,    setImageUri]    = useState<string | null>(null);      
  const [skinTone,    setSkinTone]    = useState<string | null>(null);      
  const [feeding,     setFeeding]     = useState<"good" | "poor" | null>(null);      
  const [state,       setState]       = useState("");      
  const [lga,         setLga]         = useState("");      
  const [preference,  setPreference]  = useState("nearest");      
  const [shareForTraining, setShareForTraining] = useState(false);
  const [loading,     setLoading]     = useState(false);      
  const [compressing, setCompressing] = useState(false);      
  const [result,      setResult]      = useState<ScreeningResult | null>(null);      
  const [showStatePicker, setShowStatePicker] = useState(false);      
  const [showLgaPicker,   setShowLgaPicker]   = useState(false);      
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({      
    hard_to_wake:         false,      
    jaundice_first_24h:   false,      
    dark_urine_pale_stool: false,      
    jaundice_spreading:   false,      
    yellow_eyes:          false,      
    yellow_gums_palms:    false,      
    darker_skin:          false,      
  });

  const isComponentActive = useRef(true);

  useEffect(() => {      
    isComponentActive.current = true;    
    return () => { isComponentActive.current = false; };    
  }, []);

  useEffect(() => {      
    if (skinTone && ["medium_dark", "dark"].includes(skinTone)) {      
      setSymptoms(p => ({ ...p, darker_skin: true }));      
    }      
  }, [skinTone]);

  useEffect(() => {      
    requestLocation();      
  }, []);

  const toggleSymptom = (key: string) =>      
    setSymptoms(p => ({ ...p, [key]: !p[key] }));

  const expandSymptoms = () => {      
    const expanded: Record<string, boolean> = {};      
    const allGroups = [...URGENT_SYMPTOMS, ...WATCH_SYMPTOMS];      
    for (const group of allGroups) {      
      const isOn = symptoms[group.key] ?? false;      
      for (const field of group.fields) {      
        expanded[field] = expanded[field] || isOn;      
      }      
    }      
    return expanded;      
  };

  const pickImage = async () => {      
    const { status } = await ImagePicker.requestCameraPermissionsAsync();      
    if (status !== "granted") {        
      if (isComponentActive.current) {  
        showToast(t("error.camera_permission") === "error.camera_permission" ? "Camera permission needed. Please enable in settings." : t("error.camera_permission"));      
      }  
      return true;      
    }      
    return false;      
  };

  const processAndOptimizeImage = async (originalUri: string) =>    {      
    setCompressing(true);      
    try {      
      const manipulatedImage = await ImageManipulator.manipulateAsync(      
        originalUri,      
        [{ resize: { width: 800 } }],      
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }      
      );      
      if (isComponentActive.current) {    
        setImageUri(manipulatedImage.uri);      
      }    
    } catch (err) {      
      if (isComponentActive.current) {  
        showToast(t("error.image_optimize") === "error.image_optimize" ? "Could not optimize image. Using original file." : t("error.image_optimize"));      
        setImageUri(originalUri);      
      }    
    } finally {      
      if (isComponentActive.current) {    
        setCompressing(false);      
      }    
    }      
  };

  const openCamera = async () => {      
    const isDenied = await pickImage();    
    if (isDenied) return;

    const res = await ImagePicker.launchCameraAsync({      
      mediaTypes: "images",      
      quality: 0.8,      
      allowsEditing: false,      
    });      
    if (!res.canceled && res.assets && res.assets[0]) {      
      await processAndOptimizeImage(res.assets[0].uri);      
    }      
  };

  const openGallery = async () => {      
    const res = await ImagePicker.launchImageLibraryAsync({      
      mediaTypes: "images",      
      quality: 0.8,      
      allowsEditing: false,      
    });      
    if (!res.canceled && res.assets && res.assets[0]) {      
      await processAndOptimizeImage(res.assets[0].uri);      
    }      
  };

  const submit = async () => {      
    if (!profile?.exists) {
      Alert.alert(
        "Add baby's birth details",
        "We need the date and time of birth to give safe newborn guidance.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Add details", onPress: () => router.push("/(tabs)/profile") },
        ],
      );
      return;
    }
    if (!imageUri) {      
      showToast(t("error.photo_required") === "error.photo_required" ? "Please take or choose a photo first." : t("error.photo_required"));      
      return;      
    }      
    if (!feeding) {      
      showToast(t("error.feeding_required") === "error.feeding_required" ? "Please tell us how baby is feeding." : t("error.feeding_required"));      
      return;      
    }

    setLoading(true);      
    setResult(null);

    const ageHours  = profile?.age_hours ?? undefined;      
    const hasGPS    = location.latitude != null && location.longitude != null;      
    const expanded  = expandSymptoms();      
    const apiPayload = {      
      imageUri,      
      age_hours:                   ageHours,      
      feeding,      
      difficult_to_wake:           expanded.difficult_to_wake ?? false,      
      floppy_or_unusually_drowsy:  expanded.floppy_or_unusually_drowsy ?? false,      
      jaundice_first_24h:          expanded.jaundice_first_24h ?? false,      
      jaundice_spreading:          expanded.jaundice_spreading ?? false,      
      yellow_eyes:                 expanded.yellow_eyes ?? false,      
      yellow_gums:                 expanded.yellow_gums ?? false,      
      yellow_palms_or_soles:       expanded.yellow_palms_or_soles ?? false,      
      dark_urine:                  expanded.dark_urine ?? false,      
      pale_stool:                  expanded.pale_stool ?? false,      
      darker_skin_tone:            expanded.darker_skin_tone ?? false,      
      skin_tone_category:          skinTone ?? undefined,      
      user_latitude:               location.latitude  ?? undefined,      
      user_longitude:              location.longitude ?? undefined,      
      user_state:                  hasGPS ? undefined : (state || undefined),      
      user_lga:                    hasGPS ? undefined : (lga || undefined),      
      facility_preference:         preference,      
      ui_language:                 language,      
      allow_training_use:          shareForTraining,
    };

    try {      
      const data = await screeningApi.analyze(apiPayload);      
         
      if (!isComponentActive.current) return;

      setResult(data);      
      setLastResult(data);      
      storeFollowUp(data.final_decision);      
      await queryClient.invalidateQueries({ queryKey: ["history"] });
    } catch (err: any) {      
      // A real API response is not an offline event. Show it clearly instead
      // of masking a server problem with an offline result.
      if (axios.isAxiosError(err) && err.response) {
        if (isComponentActive.current) {
          showToast(
            err.response.data?.detail
              ?? "The screening service could not complete this request. Please try again.",
          );
        }
        return;
      }

      const networkState = await NetInfo.fetch();
      const deviceIsOffline =
        networkState.isConnected === false || networkState.isInternetReachable === false;

      // A timeout, server wake-up, or failed API connection while the phone
      // still has internet must never be misrepresented as an offline result.
      if (!deviceIsOffline) {
        if (isComponentActive.current) {
          showToast(
            axios.isAxiosError(err) && (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT")
              ? "The screening server is taking too long. Please try again; this result was not saved offline."
              : "We could not reach the screening server. Please try again; this result was not saved offline.",
          );
        }
        return;
      }

      console.log("[Screening] Device is offline, using local safety fallback.");
           
      try {      
        const [localPredictions, symptomSafety] = await Promise.all([
          runLocalInferenceWithUri(imageUri),
          Promise.resolve(evaluateOfflineSafety(apiPayload)),
        ]);

        let triageLevel = symptomSafety.rawTriageLevel;
        let finalDecision = symptomSafety.finalDecision;
        let decisionReason = symptomSafety.reason;
        const notesText = [
          ...symptomSafety.notes,
          "This offline screening is not a diagnosis and will be securely re-checked when the connection returns.",
        ];
        const jaundiceProbability = localPredictions?.[LOCAL_MODEL_CLASS_INDEX.jaundice];
        const normalProbability = localPredictions?.[LOCAL_MODEL_CLASS_INDEX.normal];

        // The model is allowed to escalate GREEN to same-day review. It must
        // never downgrade a RED or AMBER symptom result.
        if (
          typeof jaundiceProbability === "number" &&
          jaundiceProbability >= 0.6 &&
          triageLevel === "GREEN"
        ) {
          triageLevel = "AMBER";
          finalDecision = "SAME_DAY_CLINIC_REVIEW";
          decisionReason = "The offline image screen suggests possible jaundice. Please arrange same-day assessment.";
          notesText.push("The local image screen raised the urgency to same-day review.");
        } else if (localPredictions) {
          notesText.push("The local image screen did not reduce the symptom-based safety advice.");
        } else {
          notesText.push("The local image screen could not run; the symptom-based safety advice is shown.");
        }

        const offlineResultData: ScreeningResult = {      
          screening_id: "pending_local_sync_id",      
          raw_triage_level: triageLevel,      
          final_decision: finalDecision,
          final_decision_reason: decisionReason,      
          notes: notesText,      
          recommended_facilities: [],      
          success: true,      
          created_at: new Date().toISOString(),      
          raw_triage_reason: symptomSafety.reason,
          image_prediction: localPredictions
            ? (jaundiceProbability! >= normalProbability! ? "jaundice" : "normal")
            : undefined,
          image_confidence: localPredictions ? Math.max(jaundiceProbability!, normalProbability!) : undefined,
          confidence_band: localPredictions ? "offline_unvalidated" : undefined,
          parent_message:
            finalDecision === "URGENT_HOSPITAL_REVIEW"
              ? "Please seek urgent medical assessment now."
              : finalDecision === "SAME_DAY_CLINIC_REVIEW"
                ? "Please arrange a same-day assessment by a health worker."
                : "Continue feeding and monitoring closely. Seek care if yellowing, poor feeding, or unusual sleepiness develops.",
        };  

        const offlineId = await saveScreeningOffline(apiPayload);

        offlineResultData.screening_id = offlineId;

        if (!isComponentActive.current) return;

        setResult(offlineResultData);      
        setLastResult(offlineResultData);      
        storeFollowUp(offlineResultData.final_decision);
        showToast(t("offline.complete") === "offline.complete" ? "Screening complete: Running via offline edge engine!" : t("offline.complete"));  

      } catch (offlineWriteError) {      
        if (!isComponentActive.current) return;    
        showToast(      
          err?.response?.data?.detail ??      
          err?.message ??      
          "Screening execution failed. Check your configuration parameters."      
        );      
      }      
    } finally {      
      if (isComponentActive.current) {    
        setLoading(false);      
      }    
    }      
  };

  const reset = () => {      
    setImageUri(null);      
    setResult(null);      
    setSkinTone(null);      
    setFeeding(null);      
    setState("");      
    setLga("");      
    setPreference("nearest");      
    setShareForTraining(false);
    setSymptoms({      
      hard_to_wake: false,      
      jaundice_first_24h: false,      
      dark_urine_pale_stool: false,      
      jaundice_spreading: false,      
      yellow_eyes: false,      
      yellow_gums_palms: false,      
      darker_skin: false,      
    });      
  };

  const withdrawLatestTrainingConsent = () => {
    if (!result?.training_image_stored) return;

    Alert.alert(
      "Remove training photo?",
      "This permanently deletes the stored photo used for model improvement. Your screening result remains available.",
      [
        { text: "Keep photo", style: "cancel" },
        {
          text: "Delete photo",
          style: "destructive",
          onPress: async () => {
            try {
              await screeningApi.withdrawTrainingConsent(result.screening_id);
              setResult({ ...result, training_image_stored: false });
              setShareForTraining(false);
              showToast("Training photo deleted.");
            } catch (error: any) {
              showToast(
                error?.response?.data?.detail
                  ?? "Could not delete the training photo. Please try again while connected.",
              );
            }
          },
        },
      ],
    );
  };

  const lgaOptions = state ? (LGA_DATA[state] ?? []) : [];      
  const profilePrompt = !profile?.exists && !profileLoading ? (
    <View style={s.profileRequiredCard}>
      <Ionicons name="calendar-outline" size={22} color={Colors.coral} />
      <View style={s.profileRequiredCopy}>
        <Text style={s.profileRequiredTitle}>Start with baby's birth details</Text>
        <Text style={s.profileRequiredText}>
          Add the date and time of birth once so every screening can give safer guidance.
        </Text>
      </View>
      <TouchableOpacity style={s.profileRequiredButton} onPress={() => router.push("/(tabs)/profile")}>
        <Text style={s.profileRequiredButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  return (      
    <SafeAreaView style={s.safe}>      
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>      
        <Text style={s.heading}>{t("screening.title") === "screening.title" ? "Baby Screening" : t("screening.title")}</Text>  
        {profilePrompt}

        {result ? (      
          <>      
            <ResultCard result={result} />      
            {result.training_image_stored && (
              <TouchableOpacity style={s.withdrawConsentBtn} onPress={withdrawLatestTrainingConsent}>
                <Ionicons name="trash-outline" size={16} color={Colors.rust} />
                <Text style={s.withdrawConsentText}>Remove this training photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.resetBtn} onPress={reset}>      
              <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />      
              <Text style={s.resetBtnText}>{t("screening.new_screening") === "screening.new_screening" ? "New screening" : t("screening.new_screening")}</Text>      
            </TouchableOpacity>      
          </>      
        ) : (      
          <>      
            {/* ── STEP 1: Photo ── */}      
            <View style={s.card}>      
              <View style={s.stepHeader}>      
                <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>      
                <Text style={s.cardTitle}>{t("screening.baby_photo") === "screening.baby_photo" ? "Baby photo" : t("screening.baby_photo")}</Text>      
              </View>      
              <Text style={s.cardSub}>      
                {t("screening.photo_instruction") === "screening.photo_instruction" ? "Use natural light. Focus on the face, eyes, gums, and palms." : t("screening.photo_instruction")}      
              </Text>  

              {compressing ? (      
                <View style={s.compressingContainer}>      
                  <ActivityIndicator size="small" color={Colors.coral} />      
                  <Text style={s.compressingText}>{t("screening.optimizing") === "screening.optimizing" ? "Optimizing image size..." : t("screening.optimizing")}</Text>      
                </View>      
              ) : imageUri ? (      
                <>      
                  <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />      
                  <View style={s.photoActions}>      
                    <TouchableOpacity style={s.photoBtn} onPress={openCamera}>      
                      <Ionicons name="camera-outline" size={16} color={Colors.coral} />      
                      <Text style={s.photoBtnText}>{t("screening.retake") === "screening.retake" ? "Retake" : t("screening.retake")}</Text>      
                    </TouchableOpacity>      
                    <TouchableOpacity style={s.photoBtn} onPress={openGallery}>      
                      <Ionicons name="images-outline" size={16} color={Colors.coral} />      
                      <Text style={s.photoBtnText}>{t("screening.gallery") === "screening.gallery" ? "Gallery" : t("screening.gallery")}</Text>      
                    </TouchableOpacity>      
                  </View>      
                </>      
              ) : (      
                <View style={s.photoButtons}>      
                  <TouchableOpacity style={s.photoBigBtn} onPress={openCamera}>      
                    <Ionicons name="camera" size={28} color={Colors.coral} />      
                    <Text style={s.photoBigBtnText}>{t("screening.take_photo") === "screening.take_photo" ? "Take photo" : t("screening.take_photo")}</Text>      
                  </TouchableOpacity>      
                  <View style={s.photoDivider} />      
                  <TouchableOpacity style={s.photoBigBtn} onPress={openGallery}>      
                    <Ionicons name="images" size={28} color={Colors.coral} />      
                    <Text style={s.photoBigBtnText}>{t("screening.choose_gallery") === "screening.choose_gallery" ? "Choose from gallery" : t("screening.choose_gallery")}</Text>      
                  </TouchableOpacity>      
                </View>      
              )}      
            </View>  

            {/* Age auto-fill */}      
            {profile?.age_hours != null && (      
              <View style={s.ageBanner}>      
                <Ionicons name="person-outline" size={14} color={Colors.sage} />      
                <Text style={s.ageBannerText}>      
                  {t("screening.baby_age") === "screening.baby_age" ? "Baby age" : t("screening.baby_age")}: {profile.age_hours}h — {t("screening.autofilled") === "screening.autofilled" ? "auto-filled from profile" : t("screening.autofilled")}      
                </Text>      
              </View>      
            )}  

            {/* ── STEP 2: Feeding ── */}      
            <View style={s.card}>      
              <View style={s.stepHeader}>      
                <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>      
                <Text style={s.cardTitle}>{t("screening.feeding_question") === "screening.feeding_question" ? "How is baby feeding?" : t("screening.feeding_question")}</Text>      
              </View>      
              <View style={s.feedingRow}>      
                <TouchableOpacity      
                  style={[s.feedingCard, feeding === "good" && s.feedingCardGood]}      
                  onPress={() => setFeeding("good")}      
                >      
                  <Text style={s.feedingIcon}>🍼</Text>      
                  <Text style={[s.feedingLabel, feeding === "good" && { color: Colors.sage }]}>      
                    {t("feeding.good") === "feeding.good" ? "Feeding well" : t("feeding.good")}      
                  </Text>      
                  <Text style={s.feedingSub}>{t("feeding.good_sub") === "feeding.good_sub" ? "Latching and feeding normally" : t("feeding.good_sub")}</Text>      
                </TouchableOpacity>  

                <TouchableOpacity      
                  style={[s.feedingCard, feeding === "poor" && s.feedingCardPoor]}      
                  onPress={() => setFeeding("poor")}      
                >      
                  <Text style={s.feedingIcon}>⚠️</Text>      
                  <Text style={[s.feedingLabel, feeding === "poor" && { color: Colors.rust }]}>      
                    {t("feeding.poor") === "feeding.poor" ? "Struggling" : t("feeding.poor")}      
                  </Text>      
                  <Text style={s.feedingSub}>{t("feeding.poor_sub") === "feeding.poor_sub" ? "Not feeding much or refusing" : t("feeding.poor_sub")}</Text>      
                </TouchableOpacity>      
              </View>      
            </View>  

            {/* ── STEP 3: Symptoms ── */}      
            <View style={s.card}>      
              <View style={s.stepHeader}>      
                <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>      
                <Text style={s.cardTitle}>{t("screening.symptoms_question") === "screening.symptoms_question" ? "What do you notice?" : t("screening.symptoms_question")}</Text>      
              </View>      
              <Text style={s.cardSub}>{t("screening.symptoms_sub") === "screening.symptoms_sub" ? "Toggle everything you can see or have noticed." : t("screening.symptoms_sub")}</Text>  

              {/* Urgent signs */}      
              <View style={s.signsGroup}>      
                <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>      
                  <Ionicons name="warning-outline" size={13} color={Colors.rust} />      
                  <Text style={[s.signsHeaderText, { color: Colors.rust }]}>      
                    {t("symptom.urgent_header") === "symptom.urgent_header" ? "Urgent signs — seek help immediately if present" : t("symptom.urgent_header")}      
                  </Text>      
                </View>      
                {URGENT_SYMPTOMS.map((symptom) => (      
                  <View key={symptom.key} style={s.symptomRow}>      
                    <Ionicons name={symptom.icon} size={18} color={Colors.rust} style={s.symptomIcon} />      
                    <Text style={s.symptomLabel}>{t(symptom.labelKey) === symptom.labelKey ? symptom.fallbackLabel : t(symptom.labelKey)}</Text>      
                    <Switch      
                      value={symptoms[symptom.key] ?? false}      
                      onValueChange={() => toggleSymptom(symptom.key)}      
                      trackColor={{ false: Colors.border, true: Colors.rust }}      
                      thumbColor="#fff"      
                    />      
                  </View>      
                ))}      
              </View>  

              {/* Watch closely */}      
              <View style={s.signsGroup}>      
                <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>      
                  <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />      
                  <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>      
                    {t("symptom.watch_header") === "symptom.watch_header" ? "Watch closely — tell your health worker" : t("symptom.watch_header")}      
                  </Text>      
                </View>      
                {WATCH_SYMPTOMS.map((symptom) => (      
                  <View key={symptom.key} style={s.symptomRow}>      
                    <Ionicons name={symptom.icon} size={18} color={Colors.amberDark} style={s.symptomIcon} />      
                    <Text style={s.symptomLabel}>{t(symptom.labelKey) === symptom.labelKey ? symptom.fallbackLabel : t(symptom.labelKey)}</Text>      
                    <Switch      
                      value={symptoms[symptom.key] ?? false}      
                      onValueChange={() => toggleSymptom(symptom.key)}      
                      trackColor={{ false: Colors.border, true: Colors.amber }}      
                      thumbColor="#fff"      
                    />      
                  </View>      
                ))}      
              </View>      
            </View>  

            {/* ── STEP 4: Skin tone ── */}      
            <View style={s.card}>      
              <View style={s.stepHeader}>      
                <View style={s.stepNum}><Text style={s.stepNumText}>4</Text></View>      
                <Text style={s.cardTitle}>{t("skin.title") === "skin.title" ? "Baby's skin tone" : t("skin.title")}</Text>      
              </View>      
              <Text style={s.cardSub}>{t("skin.sub") === "skin.sub" ? "Helps us adjust detection for darker skin." : t("skin.sub")}</Text>      
              <View style={s.skinRow}>      
                {SKIN_TONES.map((tone) => (      
                  <TouchableOpacity      
                    key={tone.key}      
                    style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}      
                    onPress={() => setSkinTone(tone.key)}      
                  >      
                    <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />      
                    <Text style={s.skinLabel}>{t(tone.labelKey) === tone.labelKey ? tone.fallbackLabel : t(tone.labelKey)}</Text>      
                  </TouchableOpacity>      
                ))}      
              </View>      
            </View>  

            {/* ── STEP 5: Location ── */}      
            <View style={s.card}>      
              <View style={s.stepHeader}>      
                <View style={s.stepNum}><Text style={s.stepNumText}>5</Text></View>      
                <Text style={s.cardTitle}>{t("location.title") === "location.title" ? "Location" : t("location.title")}</Text>      
              </View>  

              <View style={[      
                s.gpsStatus,      
                location.status === "granted" ? s.gpsGranted : s.gpsPending,      
              ]}>      
                <Ionicons      
                  name={location.status === "granted" ? "location" : "location-outline"}      
                  size={15}      
                  color={location.status === "granted" ? Colors.sage : Colors.brownLight}      
                />      
                <Text style={[      
                  s.gpsText,      
                  location.status === "granted" && { color: Colors.sage },      
                ]}>      
                  {location.status === "granted"      
                    ? (t("gps.enabled") === "gps.enabled" ? "Location enabled — showing nearby facilities" : t("gps.enabled"))      
                    : location.status === "loading"      
                    ? (t("gps.loading") === "gps.loading" ? "Getting your location..." : t("gps.loading"))      
                    : location.status === "denied"      
                    ? (t("gps.denied") === "gps.denied" ? "Location denied — select state below" : t("gps.denied"))      
                    : (t("gps.loading") === "gps.loading" ? "Getting your location..." : t("gps.loading"))}      
                </Text>      
              </View>  

              {location.status !== "granted" && (      
                <>      
                  <TouchableOpacity      
                    style={s.pickerBtn}      
                    onPress={() => setShowStatePicker(true)}      
                  >      
                    <Ionicons name="map-outline" size={16} color={Colors.coral} />      
                    <Text style={s.pickerBtnText}>      
                      {state || (t("location.select_state") === "location.select_state" ? "Select your state" : t("location.select_state"))}      
                    </Text>      
                    <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />      
                  </TouchableOpacity>  

                  {state !== "" && (      
                    <TouchableOpacity      
                      style={[s.pickerBtn, { marginTop: 8 }]}      
                      onPress={() => setShowLgaPicker(true)}      
                    >      
                      <Ionicons name="location-outline" size={16} color={Colors.coral} />      
                      <Text style={s.pickerBtnText}>      
                        {lga || (t("location.select_lga") === "location.select_lga" ? "Select your LGA (optional)" : t("location.select_lga"))}      
                      </Text>      
                      <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />      
                    </TouchableOpacity>      
                  )}      
                </>      
              )}      
            </View>  

            {/* ── STEP 6: Facility Preference ── */}      
            <View style={s.card}>      
              <View style={s.stepHeader}>      
                <View style={s.stepNum}><Text style={s.stepNumText}>6</Text></View>      
                <Text style={s.cardTitle}>{t("pref.title") === "pref.title" ? "Where would you like to go?" : t("pref.title")}</Text>      
              </View>      
              <Text style={s.cardSub}>{t("pref.sub") === "pref.sub" ? "We will find the best match near you." : t("pref.sub")}</Text>      
              <View style={s.prefRow}>      
                {FACILITY_PREFERENCES.map((pref) => (      
                  <TouchableOpacity      
                    key={pref.key}      
                    style={[s.prefCard, preference === pref.key && s.prefCardSelected]}      
                    onPress={() => setPreference(pref.key)}      
                  >      
                    <Ionicons      
                      name={pref.icon}      
                      size={22}      
                      color={preference === pref.key ? Colors.coral : Colors.brownLight}      
                    />      
                    <Text style={[      
                      s.prefLabel,      
                      preference === pref.key && { color: Colors.coral },      
                    ]}>      
                      {t(pref.labelKey) === pref.labelKey ? pref.fallbackLabel : t(pref.labelKey)}      
                    </Text>      
                    <Text style={s.prefSub}>{t(pref.subKey) === pref.subKey ? pref.fallbackSub : t(pref.subKey)}</Text>      
                  </TouchableOpacity>      
                ))}      
              </View>      
            </View>  

            <View style={s.consentCard}>
              <View style={s.consentTextWrap}>
                <Text style={s.consentTitle}>Optional: help improve JaundiCare</Text>
                <Text style={s.consentText}>
                  If you choose yes, this photo may be stored in protected training storage to
                  validate and improve the model. It is not needed for your result or care
                  guidance, and you can delete it later.
                </Text>
              </View>
              <Switch
                value={shareForTraining}
                onValueChange={setShareForTraining}
                trackColor={{ false: Colors.border, true: Colors.sagePale }}
                thumbColor={shareForTraining ? Colors.sage : Colors.brownLight}
                accessibilityLabel="Allow this photo to be used for model improvement"
              />
            </View>

            {/* Submit Button */}      
            <TouchableOpacity      
              style={[s.submitBtn, (loading || compressing || !imageUri || !feeding) && { opacity: 0.55 }]}      
              onPress={submit}      
              disabled={loading || compressing || !imageUri || !feeding}      
            >      
              {loading ? (      
                <ActivityIndicator color="#fff" />      
              ) : (      
                <>      
                  <Ionicons name="scan-outline" size={20} color="#fff" />      
                  <Text style={s.submitBtnText}>{t("screening.analyze") === "screening.analyze" ? "Analyze screening" : t("screening.analyze")}</Text>      
                </>      
              )}      
            </TouchableOpacity>  

            {(!imageUri || !feeding) && (      
              <Text style={s.submitHint}>      
                {!imageUri  
                  ? (t("error.hint_photo") === "error.hint_photo" ? "Photo required" : t("error.hint_photo"))  
                  : (t("error.hint_feeding") === "error.hint_feeding" ? "Please select how baby is feeding" : t("error.hint_feeding"))}      
              </Text>      
            )}      
          </>      
        )}      
      </ScrollView>  

      {/* State picker modal */}      
      <Modal visible={showStatePicker} animationType="slide" transparent>      
        <View style={s.modalOverlay}>      
          <View style={s.modalBox}>      
            <View style={s.modalHeader}>      
              <Text style={s.modalTitle}>{t("location.select_state") === "location.select_state" ? "Select your state" : t("location.select_state")}</Text>      
              <TouchableOpacity onPress={() => setShowStatePicker(false)}>      
                <Ionicons name="close" size={24} color={Colors.earth} />      
              </TouchableOpacity>      
            </View>      
            <FlatList      
              data={STATES}      
              keyExtractor={(item) => item}      
              renderItem={({ item }) => {
                const isSelected = state === item;
                return (
                  <TouchableOpacity      
                    style={[s.modalItem, isSelected && s.modalItemSelected]}      
                    onPress={() => {      
                      setState(item);      
                      setLga("");      
                      setShowStatePicker(false);      
                    }}      
                  >      
                    <Text style={[s.modalItemText, isSelected && s.modalItemTextSelected]}>      
                      {item}      
                    </Text>      
                    {isSelected ? (      
                      <Ionicons name="checkmark" size={18} color={Colors.coral} />      
                    ) : null}      
                  </TouchableOpacity>      
                );
              }}      
            />      
          </View>      
        </View>      
      </Modal>  

      {/* LGA picker modal */}      
      <Modal visible={showLgaPicker} animationType="slide" transparent>      
        <View style={s.modalOverlay}>      
          <View style={s.modalBox}>      
            <View style={s.modalHeader}>      
              <Text style={s.modalTitle}>{t("location.select_lga") === "location.select_lga" ? "Select your LGA" : t("location.select_lga")}</Text>      
              <TouchableOpacity onPress={() => setShowLgaPicker(false)}>      
                <Ionicons name="close" size={24} color={Colors.earth} />      
              </TouchableOpacity>      
            </View>      
            <FlatList      
              data={lgaOptions}      
              keyExtractor={(item) => item}      
              renderItem={({ item }) => {
                const isSelected = lga === item;
                return (
                  <TouchableOpacity      
                    style={[s.modalItem, isSelected && s.modalItemSelected]}      
                    onPress={() => {      
                      setLga(item);      
                      setShowLgaPicker(false);      
                    }}      
                  >      
                    <Text style={[s.modalItemText, isSelected && s.modalItemTextSelected]}>      
                      {item}      
                    </Text>      
                    {isSelected ? (      
                      <Ionicons name="checkmark" size={18} color={Colors.coral} />      
                    ) : null}      
                  </TouchableOpacity>      
                );
              }}      
            />      
          </View>      
        </View>      
      </Modal>  

      {ToastComponent}      
    </SafeAreaView>      
  );      
}

const s = StyleSheet.create({      
  safe:    { flex: 1, backgroundColor: Colors.background },      
  scroll:  { flex: 1 },      
  content: { padding: 16, paddingBottom: 40 },      
  heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },  

  profileRequiredCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.amberPale, borderRadius: Radius.lg, padding: 13, marginBottom: 14, borderWidth: 1, borderColor: Colors.amber },
  profileRequiredCopy: { flex: 1 },
  profileRequiredTitle: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth, marginBottom: 2 },
  profileRequiredText: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brown, lineHeight: 16 },
  profileRequiredButton: { backgroundColor: Colors.coral, borderRadius: Radius.md, paddingHorizontal: 11, paddingVertical: 8 },
  profileRequiredButtonText: { fontFamily: Fonts.semibold, fontSize: 12, color: "#fff" },

  card: {      
    backgroundColor: Colors.card,      
    borderRadius: Radius.lg,      
    padding: 16,      
    marginBottom: 14,      
    ...Shadow.sm,      
  },      
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },      
  stepNum: {      
    width: 26, height: 26, borderRadius: 13,      
    backgroundColor: Colors.coral,      
    alignItems: "center", justifyContent: "center",      
  },      
  stepNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },      
  cardTitle:   { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },      
  cardSub:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 14, lineHeight: 20 },  

  compressingContainer: {      
    minHeight: 140,      
    alignItems: "center",      
    justifyContent: "center",      
    gap: 10,      
    borderWidth: 1.5,      
    borderColor: Colors.border,      
    borderStyle: "dashed",      
    borderRadius: Radius.lg,      
  },      
  compressingText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },  

  preview: { width: "100%", height: 220, borderRadius: Radius.md, marginBottom: 10 },      
  photoButtons: {      
    flexDirection: "row",      
    borderWidth: 1.5,      
    borderColor: Colors.border,      
    borderStyle: "dashed",      
    borderRadius: Radius.lg,      
    overflow: "hidden",      
    minHeight: 140,      
  },      
  photoBigBtn: {      
    flex: 1,      
    alignItems: "center",      
    justifyContent: "center",      
    gap: 8,      
    padding: 20,      
  },      
  photoBigBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, textAlign: "center" },      
  photoDivider:    { width: 1, backgroundColor: Colors.border },      
  photoActions:    { flexDirection: "row", gap: 10 },      
  photoBtn: {      
    flex: 1,      
    flexDirection: "row",      
    alignItems: "center",      
    justifyContent: "center",      
    gap: 6,      
    borderWidth: 1.5,      
    borderColor: Colors.coral,      
    borderRadius: Radius.md,      
    padding: 9,      
  },      
  photoBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },  

  ageBanner: {      
    flexDirection: "row",      
    alignItems: "center",      
    gap: 6,      
    backgroundColor: Colors.sagePale,      
    borderRadius: Radius.md,      
    padding: 10,      
    marginBottom: 14,      
  },      
  ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },  

  feedingRow: { flexDirection: "row", gap: 10 },      
  feedingCard: {      
    flex: 1,      
    borderWidth: 1.5,      
    borderColor: Colors.border,      
    borderRadius: Radius.lg,      
    padding: 14,      
    alignItems: "center",      
    gap: 4,      
  },      
  feedingCardGood: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },      
  feedingCardPoor: { borderColor: Colors.rust, backgroundColor: Colors.rustPale },      
  feedingIcon:  { fontSize: 28 },      
  feedingLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth },      
  feedingSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },  

  signsGroup:  { marginBottom: 14 },      
  signsHeader: {      
    flexDirection: "row",      
    alignItems: "center",      
    gap: 6,      
    borderRadius: Radius.md,      
    padding: 8,      
    marginBottom: 8,      
  },      
  signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },      
  symptomRow: {      
    flexDirection: "row",      
    alignItems: "center",      
    paddingVertical: 11,      
    borderBottomWidth: 1,      
    borderBottomColor: Colors.border,      
    gap: 10,      
  },      
  symptomIcon:  { width: 22 },      
  symptomLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, lineHeight: 20 },  

  skinRow: { flexDirection: "row", gap: 6, flexWrap: "nowrap", justifyContent: "space-between" },      
  skinChip: {      
    alignItems: "center",      
    gap: 3,      
    padding: 5,      
    borderRadius: Radius.md,      
    borderWidth: 1.5,      
    borderColor: "transparent",      
    flex: 1,      
  },      
  skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },      
  skinSwatch:      { width: 26, height: 26, borderRadius: 13 },      
  skinLabel:        { fontFamily: Fonts.regular, fontSize: 9, color: Colors.brownLight, textAlign: "center" },  

  gpsStatus: {      
    flexDirection: "row",      
    alignItems: "center",      
    gap: 8,      
    borderRadius: Radius.md,      
    padding: 11,      
    marginBottom: 10,      
  },      
  gpsGranted: { backgroundColor: Colors.sagePale },      
  gpsPending: { backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },      
  gpsText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight, flex: 1 },  

  pickerBtn: {      
    flexDirection: "row",      
    alignItems: "center",      
    gap: 10,      
    borderWidth: 1.5,      
    borderColor: Colors.border,      
    borderRadius: Radius.md,      
    padding: 12,      
    backgroundColor: Colors.cream,      
  },      
  pickerBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },  

  prefRow: { flexDirection: "row", gap: 8 },      
  prefCard: {      
    flex: 1,      
    borderWidth: 1.5,      
    borderColor: Colors.border,      
    borderRadius: Radius.lg,      
    padding: 12,      
    alignItems: "center",      
    gap: 4,      
  },      
  prefCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },      
  prefLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.brownLight },      
  prefSub:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },  

  consentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 14,
  },
  consentTextWrap: { flex: 1 },
  consentTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, marginBottom: 4 },
  consentText: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, color: Colors.brownLight },
  withdrawConsentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.rustPale,
    borderRadius: Radius.md,
    paddingVertical: 10,
    marginTop: 12,
  },
  withdrawConsentText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.rust },

  submitBtn: {      
    backgroundColor: Colors.coral,      
    borderRadius: Radius.lg,      
    padding: 16,      
    flexDirection: "row",      
    alignItems: "center",      
    justifyContent: "center",      
    gap: 8,      
    marginTop: 4,      
    ...Shadow.md,      
  },      
  submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },      
  submitHint:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, textAlign: "center", marginTop: 8 },  

  resetBtn: {      
    flexDirection: "row",      
    alignItems: "center",      
    justifyContent: "center",      
    gap: 6,      
    marginTop: 16,      
    padding: 12,      
  },      
  resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },  

  modalOverlay: {      
    flex: 1,      
    backgroundColor: "rgba(0,0,0,0.5)",      
    justifyContent: "flex-end",      
  },      
  modalBox: {      
    backgroundColor: Colors.background,      
    borderTopLeftRadius: 20,      
    borderTopRightRadius: 20,      
    maxHeight: "80%",      
    paddingBottom: 30,      
  },      
  modalHeader: {      
    flexDirection: "row",      
    justifyContent: "space-between",      
    alignItems: "center",      
    padding: 16,      
    borderBottomWidth: 1,      
    borderBottomColor: Colors.border,      
  },      
  modalTitle:            { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },      
  modalItem: {      
    flexDirection: "row",      
    alignItems: "center",      
    justifyContent: "space-between",      
    paddingVertical: 14,      
    paddingHorizontal: 16,      
    borderBottomWidth: 1,      
    borderBottomColor: Colors.border,      
  },      
  modalItemSelected:     { backgroundColor: "#fff5f2" },      
  modalItemText:         { fontFamily: Fonts.medium, fontSize: 15, color: Colors.earth },      
  modalItemTextSelected: { color: Colors.coral, fontFamily: Fonts.semibold },      
});
