// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { NomogramChart } from "../../components/NomogramChart";
// import { getBhutaniZone } from "../../constants/bhutaniZones";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";

// export default function NomogramScreen() {
//   const [ageHours, setAgeHours] = useState("");
//   const [tsb, setTsb]           = useState("");
//   const [result, setResult]     = useState<ReturnType<typeof getBhutaniZone> | null>(null);

//   const calculate = () => {
//     const age = parseFloat(ageHours);
//     const bilirubin = parseFloat(tsb);
//     if (isNaN(age) || isNaN(bilirubin) || age <= 0 || bilirubin <= 0) return;
//     setResult(getBhutaniZone(age, bilirubin));
//   };

//   const reset = () => { setAgeHours(""); setTsb(""); setResult(null); };

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView contentContainerStyle={s.content}>
//         <Text style={s.heading}>Bhutani Nomogram</Text>
//         <Text style={s.sub}>
//           Enter baby's age and bilirubin level to determine risk zone.
//           Based on Bhutani et al., Pediatrics 1999.
//         </Text>

//         {/* Inputs */}
//         <View style={s.card}>
//           <View style={s.field}>
//             <Text style={s.label}>Baby age (hours)</Text>
//             <TextInput
//               style={s.input}
//               value={ageHours}
//               onChangeText={setAgeHours}
//               keyboardType="numeric"
//               placeholder="e.g. 48"
//               placeholderTextColor={Colors.brownLight}
//             />
//             <Text style={s.hint}>Valid range: 24–120 hours</Text>
//           </View>
//           <View style={s.field}>
//             <Text style={s.label}>Total serum bilirubin — TSB (mg/dL)</Text>
//             <TextInput
//               style={s.input}
//               value={tsb}
//               onChangeText={setTsb}
//               keyboardType="numeric"
//               placeholder="e.g. 12.5"
//               placeholderTextColor={Colors.brownLight}
//             />
//           </View>
//           <TouchableOpacity
//             style={[s.calcBtn, (!ageHours || !tsb) && { opacity: 0.5 }]}
//             onPress={calculate}
//             disabled={!ageHours || !tsb}
//           >
//             <Ionicons name="analytics-outline" size={18} color="#fff" />
//             <Text style={s.calcBtnText}>Plot on Nomogram</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Chart */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Bhutani Nomogram</Text>
//           <NomogramChart
//             plotAge={result ? parseFloat(ageHours) : undefined}
//             plotTsb={result ? parseFloat(tsb) : undefined}
//             zone={result?.zone}
//           />
//         </View>

//         {/* Result */}
//         {result && (
//           <View style={[s.resultCard, { borderColor: result.color }]}>
//             <View style={[s.resultBadge, { backgroundColor: result.color }]}>
//               <Text style={s.resultBadgeText}>{result.label}</Text>
//             </View>
//             {result.urgent && (
//               <View style={s.urgentBanner}>
//                 <Ionicons name="warning" size={14} color={Colors.rust} />
//                 <Text style={s.urgentText}>Urgent clinical action required</Text>
//               </View>
//             )}
//             <Text style={s.resultAction}>{result.action}</Text>
//             <View style={s.readings}>
//               <Text style={s.readingItem}>Age: {ageHours} hours</Text>
//               <Text style={s.readingItem}>TSB: {tsb} mg/dL</Text>
//             </View>
//             <TouchableOpacity style={s.resetBtn} onPress={reset}>
//               <Text style={s.resetBtnText}>New reading</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={s.disclaimer}>
//           <Ionicons name="information-circle-outline" size={14} color={Colors.brownLight} />
//           <Text style={s.disclaimerText}>
//             This tool supports clinical decision-making. It does not replace a physician's assessment.
//             Always use a validated laboratory bilirubin reading.
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 6 },
//   sub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 16, lineHeight: 20 },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, marginBottom: 14, ...Shadow.sm },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 10 },
//   field: { marginBottom: 14 },
//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 6 },
//   input: {
//     backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border,
//     borderRadius: Radius.md, padding: 12, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
//   },
//   hint: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, marginTop: 4 },
//   calcBtn: {
//     backgroundColor: Colors.coral, borderRadius: Radius.lg, padding: 14,
//     flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...Shadow.md,
//   },
//   calcBtnText: { fontFamily: Fonts.semibold, fontSize: 15, color: "#fff" },
//   resultCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, borderWidth: 2, marginBottom: 14, ...Shadow.sm },
//   resultBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, alignSelf: "flex-start", marginBottom: 12 },
//   resultBadgeText: { fontFamily: Fonts.bold, fontSize: 14, color: "#fff" },
//   urgentBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.rustPale, borderRadius: Radius.md, padding: 8, marginBottom: 10 },
//   urgentText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.rust },
//   resultAction: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, lineHeight: 22, marginBottom: 12 },
//   readings: { flexDirection: "row", gap: 16 },
//   readingItem: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
//   resetBtn: { marginTop: 12, alignItems: "center", padding: 10 },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },
//   disclaimer: { flexDirection: "row", gap: 6, backgroundColor: Colors.amberPale, borderRadius: Radius.md, padding: 12, alignItems: "flex-start" },
//   disclaimerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1, lineHeight: 18 },
// });


// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { NomogramChart } from "../components/NomogramChart";
// import { getBhutaniZone } from "../constants/bhutaniZones";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// export default function NomogramScreen() {
//   const [ageHours, setAgeHours] = useState("");
//   const [tsb, setTsb]           = useState("");
//   const [result, setResult]     = useState<ReturnType<typeof getBhutaniZone> | null>(null);

//   const calculate = () => {
//     const age = parseFloat(ageHours);
//     const bilirubin = parseFloat(tsb);
    
//     if (isNaN(age) || isNaN(bilirubin) || age <= 0 || bilirubin <= 0) {
//       setResult(null); // Explicitly clear stale results if inputs become corrupted
//       return;
//     }
//     setResult(getBhutaniZone(age, bilirubin));
//   };

//   const reset = () => { 
//     setAgeHours(""); 
//     setTsb(""); 
//     setResult(null); 
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
//         <Text style={s.heading}>Bhutani Nomogram</Text>
//         <Text style={s.sub}>
//           Enter baby's age and bilirubin level to determine risk zone.
//           Based on Bhutani et al., Pediatrics 1999.
//         </Text>

//         {/* Form Inputs Module Panel */}
//         <View style={s.card}>
//           <View style={s.field}>
//             <Text style={s.label}>Baby age (hours)</Text>
//             <TextInput
//               style={s.input}
//               value={ageHours}
//               onChangeText={(txt) => { setAgeHours(txt); if(result) setResult(null); }}
//               keyboardType="numeric"
//               placeholder="e.g. 48"
//               placeholderTextColor={Colors.brownLight}
//             />
//             {/* Updated bounds text to accurately match our system capabilities */}
//             <Text style={s.hint}>Valid range: 12–120 hours</Text>
//           </View>
          
//           <View style={s.field}>
//             <Text style={s.label}>Total serum bilirubin — TSB (mg/dL)</Text>
//             <TextInput
//               style={s.input}
//               value={tsb}
//               onChangeText={(txt) => { setTsb(txt); if(result) setResult(null); }}
//               keyboardType="numeric"
//               placeholder="e.g. 12.5"
//               placeholderTextColor={Colors.brownLight}
//             />
//           </View>
          
//           <TouchableOpacity
//             style={[s.calcBtn, (!ageHours || !tsb) && { opacity: 0.5 }]}
//             onPress={calculate}
//             disabled={!ageHours || !tsb}
//             activeOpacity={0.8}
//           >
//             <Ionicons name="analytics-outline" size={18} color="#fff" />
//             <Text style={s.calcBtnText}>Plot on Nomogram</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Live Vector Chart Presentation */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Visual Triage Grid</Text>
//           <NomogramChart
//             plotAge={result ? parseFloat(ageHours) : undefined}
//             plotTsb={result ? parseFloat(tsb) : undefined}
//             zone={result?.zone}
//           />
//         </View>

//         {/* Dynamic Calculation Triage Card Output */}
//         {result && (
//           <View style={[s.resultCard, { borderColor: result.color }]}>
//             {/* Changed background style to high-contrast clear text layouts */}
//             <View style={[s.resultBadge, { backgroundColor: result.color }]}>
//               <Text style={[
//                 s.resultBadgeText, 
//                 { color: result.zone.includes("INTERMEDIATE") ? Colors.earth : "#fff" }
//               ]}>
//                 {result.label}
//               </Text>
//             </View>
            
//             {result.urgent && (
//               <View style={s.urgentBanner}>
//                 <Ionicons name="warning" size={14} color={Colors.statusRed} />
//                 <Text style={s.urgentText}>Urgent clinical action required</Text>
//               </View>
//             )}
            
//             <Text style={s.resultAction}>{result.action}</Text>
            
//             <View style={s.readings}>
//               <Text style={s.readingItem}>Age: <Text style={{ fontFamily: Fonts.semibold }}>{ageHours}h</Text></Text>
//               <Text style={s.readingItem}>TSB: <Text style={{ fontFamily: Fonts.semibold }}>{tsb} mg/dL</Text></Text>
//             </View>
            
//             <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.6}>
//               <Text style={s.resetBtnText}>Clear and run new reading</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Structural Clinical Disclaimer Info Block */}
//         <View style={s.disclaimer}>
//           <Ionicons name="information-circle-outline" size={15} color={Colors.brownLight} style={{ marginTop: 1 }} />
//           <Text style={s.disclaimerText}>
//             This tool supports clinical decision-making. It does not replace a clinician's expert assessment. Always verify against validated laboratory bilirubin markers.
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },
//   content: { padding: 16, paddingBottom: 40 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 6 },
//   sub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 16, lineHeight: 20 },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, marginBottom: 14, ...Shadow.sm },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 10 },
//   field: { marginBottom: 14 },
//   label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 6 },
//   input: {
//     backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border,
//     borderRadius: Radius.md, padding: 12, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
//   },
//   hint: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, marginTop: 4 },
//   calcBtn: {
//     backgroundColor: Colors.coral, borderRadius: Radius.lg, padding: 14,
//     flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...Shadow.md,
//   },
//   calcBtnText: { fontFamily: Fonts.semibold, fontSize: 15, color: "#fff" },
//   resultCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, borderWidth: 2, marginBottom: 14, ...Shadow.sm },
//   resultBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, alignSelf: "flex-start", marginBottom: 12 },
//   resultBadgeText: { fontFamily: Fonts.bold, fontSize: 13 },
//   urgentBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.rustPale, borderRadius: Radius.md, padding: 8, marginBottom: 10 },
//   urgentText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.statusRed },
//   resultAction: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, lineHeight: 22, marginBottom: 12 },
//   readings: { flexDirection: "row", gap: 16 },
//   readingItem: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
//   resetBtn: { marginTop: 12, alignItems: "center", padding: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.cream },
//   resetBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth },
//   disclaimer: { flexDirection: "row", gap: 6, backgroundColor: Colors.amberPale, borderRadius: Radius.md, padding: 12, alignItems: "flex-start" },
//   disclaimerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1, lineHeight: 18 },
// });





import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NomogramChart } from "../components/NomogramChart";
import { getBhutaniZone } from "../constants/bhutaniZones";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
import { useAppStore } from "../store/appStore"; // Natively integrate global state parameters

export default function NomogramScreen() {
  const profile = useAppStore((s: any) => s.profile); // Pull down current infant metrics if initialized
  const { hours } = useLocalSearchParams<{ hours?: string | string[] }>();
  const routeHours = Array.isArray(hours) ? hours[0] : hours;
  const routeAgeHours = typeof routeHours === "string" ? routeHours.trim().replace(",", ".") : "";
  const hasRouteAge = /^\d+(?:\.\d+)?$/.test(routeAgeHours) && Number(routeAgeHours) >= 0;
  const [ageHours, setAgeHours] = useState(() => hasRouteAge ? routeAgeHours : "");
  const [tsb, setTsb]           = useState("");
  const [result, setResult]     = useState<ReturnType<typeof getBhutaniZone> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRouteAge) return;
    setAgeHours(routeAgeHours);
    setResult(null);
    setValidationError(null);
  }, [hasRouteAge, routeAgeHours]);

  const calculate = () => {
    setValidationError(null);

    // Sanitize string text against invalid numerical artifacts (e.g., trailing commas/spaces)
    const sanitizedAgeStr = ageHours.replace(/,/g, ".").trim();
    const sanitizedTsbStr = tsb.replace(/,/g, ".").trim();

    const age = parseFloat(sanitizedAgeStr);
    const bilirubin = parseFloat(sanitizedTsbStr);
    
    // 1. Structural Check
    if (isNaN(age) || isNaN(bilirubin)) {
      setValidationError("Please enter valid numeric values for both fields.");
      setResult(null);
      return;
    }

    // 2. Strict Boundary Validation matching clinical system lookups
    if (age < 12 || age > 120) {
      setValidationError("Bhutani Nomogram only supports an infant age between 12 and 120 hours.");
      setResult(null);
      return;
    }

    if (bilirubin <= 0 || bilirubin > 40) {
      setValidationError("Please enter a plausible TSB reading (between 0.1 and 40 mg/dL).");
      setResult(null);
      return;
    }

    setResult(getBhutaniZone(age, bilirubin));
  };

  const handleAutoFillAge = () => {
    if (profile?.age_hours != null) {
      setAgeHours(String(profile.age_hours));
      if (result) setResult(null);
      setValidationError(null);
    }
  };

  const reset = () => { 
    setAgeHours(""); 
    setTsb(""); 
    setResult(null); 
    setValidationError(null);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>Bhutani Nomogram</Text>
        <Text style={s.sub}>
          Enter baby's age and bilirubin level to determine risk zone.
          Based on Bhutani et al., Pediatrics 1999.
        </Text>

        {/* Global profile auto-fill helper banner */}
        {profile?.age_hours != null && String(profile.age_hours) !== ageHours && (
          <TouchableOpacity style={s.autoFillBanner} onPress={handleAutoFillAge} activeOpacity={0.7}>
            <Ionicons name="git-pull-request-outline" size={14} color={Colors.sage} />
            <Text style={s.autoFillText}>
              Click to auto-fill age ({profile.age_hours}h) from {profile.baby_name || "baby"}'s profile
            </Text>
          </TouchableOpacity>
        )}

        {/* Form Inputs Module Panel */}
        <View style={s.card}>
          {validationError && (
            <View style={s.errorAlert}>
              <Ionicons name="alert-circle" size={16} color={Colors.statusRed} />
              <Text style={s.errorAlertText}>{validationError}</Text>
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>Baby age (hours)</Text>
            <TextInput
              style={s.input}
              value={ageHours}
              onChangeText={(txt) => { 
                setAgeHours(txt); 
                if(result) setResult(null);
                if(validationError) setValidationError(null);
              }}
              keyboardType="numeric"
              placeholder="e.g. 48"
              placeholderTextColor={Colors.brownLight}
            />
            <Text style={s.hint}>Valid range: 12–120 hours</Text>
          </View>
          
          <View style={s.field}>
            <Text style={s.label}>Total serum bilirubin — TSB (mg/dL)</Text>
            <TextInput
              style={s.input}
              value={tsb}
              onChangeText={(txt) => { 
                setTsb(txt); 
                if(result) setResult(null);
                if(validationError) setValidationError(null);
              }}
              keyboardType="numeric"
              placeholder="e.g. 12.5"
              placeholderTextColor={Colors.brownLight}
            />
          </View>
          
          <TouchableOpacity
            style={[s.calcBtn, (!ageHours || !tsb) && { opacity: 0.5 }]}
            onPress={calculate}
            disabled={!ageHours || !tsb}
            activeOpacity={0.8}
          >
            <Ionicons name="analytics-outline" size={18} color="#fff" />
            <Text style={s.calcBtnText}>Plot on Nomogram</Text>
          </TouchableOpacity>
        </View>

        {/* Live Vector Chart Presentation */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Visual Triage Grid</Text>
          <NomogramChart
            plotAge={result ? parseFloat(ageHours.replace(/,/g, ".")) : undefined}
            plotTsb={result ? parseFloat(tsb.replace(/,/g, ".")) : undefined}
            zone={result?.zone}
          />
        </View>

        {/* Dynamic Calculation Triage Card Output */}
        {result && (
          <View style={[s.resultCard, { borderColor: result.color }]}>
            <View style={[s.resultBadge, { backgroundColor: result.color }]}>
              <Text style={[
                s.resultBadgeText, 
                { color: result.zone.includes("INTERMEDIATE") ? Colors.earth : "#fff" }
              ]}>
                {result.label}
              </Text>
            </View>
            
            {result.urgent && (
              <View style={s.urgentBanner}>
                <Ionicons name="warning" size={14} color={Colors.statusRed} />
                <Text style={s.urgentText}>Urgent clinical action required</Text>
              </View>
            )}
            
            <Text style={s.resultAction}>{result.action}</Text>
            
            <View style={s.readings}>
              <Text style={s.readingItem}>Age: <Text style={{ fontFamily: Fonts.semibold }}>{ageHours.trim()}h</Text></Text>
              <Text style={s.readingItem}>TSB: <Text style={{ fontFamily: Fonts.semibold }}>{tsb.trim()} mg/dL</Text></Text>
            </View>
            
            <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.6}>
              <Text style={s.resetBtnText}>Clear and run new reading</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Structural Clinical Disclaimer Info Block */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.brownLight} style={{ marginTop: 1 }} />
          <Text style={s.disclaimerText}>
            This tool supports clinical decision-making. It does not replace a clinician's expert assessment. Always verify against validated laboratory bilirubin markers.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 6 },
  sub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 16, lineHeight: 20 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, marginBottom: 14, ...Shadow.sm },
  cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 10 },
  field: { marginBottom: 14 },
  label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 6 },
  input: {
    backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: 12, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
  },
  hint: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, marginTop: 4 },
  
  autoFillBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.sagePale,
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 14,
  },
  autoFillText: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.sage, flex: 1 },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.rustPale,
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 14,
  },
  errorAlertText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.statusRed, flex: 1 },

  calcBtn: {
    backgroundColor: Colors.coral, borderRadius: Radius.lg, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...Shadow.md,
  },
  calcBtnText: { fontFamily: Fonts.semibold, fontSize: 15, color: "#fff" },
  resultCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, borderWidth: 2, marginBottom: 14, ...Shadow.sm },
  resultBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, alignSelf: "flex-start", marginBottom: 12 },
  resultBadgeText: { fontFamily: Fonts.bold, fontSize: 13 },
  urgentBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.rustPale, borderRadius: Radius.md, padding: 8, marginBottom: 10 },
  urgentText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.statusRed },
  resultAction: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, lineHeight: 22, marginBottom: 12 },
  readings: { flexDirection: "row", gap: 16 },
  readingItem: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
  resetBtn: { marginTop: 12, alignItems: "center", padding: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.cream },
  resetBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth },
  disclaimer: { flexDirection: "row", gap: 6, backgroundColor: Colors.amberPale, borderRadius: Radius.md, padding: 12, alignItems: "flex-start" },
  disclaimerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1, lineHeight: 18 },
});
