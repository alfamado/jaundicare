import React, { useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
  Switch, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store/appStore";
import { screeningApi, type ScreeningResult } from "../../services/api";
import { useLocation } from "../../hooks/useLocation";
import { ResultCard } from "../../components/ResultCard";
import { useToast } from "../../components/Toast";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
import { LGA_DATA } from "../../constants/lgaData";

const SKIN_TONES = [
  { key: "very_light",  color: "#f8d5b4", label: "Very light" },
  { key: "light",       color: "#e8b98a", label: "Light"      },
  { key: "medium",      color: "#c68642", label: "Medium"     },
  { key: "medium_dark", color: "#8d5524", label: "Med dark"   },
  { key: "dark",        color: "#4a2912", label: "Dark"       },
];

const STATES = Object.keys(LGA_DATA).sort();

export default function ScreeningScreen() {
  const profile       = useAppStore((s) => s.profile);
  const setLastResult = useAppStore((s) => s.setLastScreening);
  const storeFollowUp = useAppStore((s) => s.storeFollowUpData);

  const { location, requestLocation } = useLocation();
  const { showToast, ToastComponent }  = useToast();

  const [imageUri,      setImageUri]      = useState<string | null>(null);
  const [skinTone,      setSkinTone]      = useState<string | null>(null);
  const [feeding,       setFeeding]       = useState<"good" | "poor">("good");
  const [state,         setState]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState<ScreeningResult | null>(null);

  // Boolean symptom flags
  const [symptoms, setSymptoms] = useState({
    difficult_to_wake:           false,
    floppy_or_unusually_drowsy:  false,
    jaundice_first_24h:          false,
    jaundice_spreading:          false,
    yellow_eyes:                 false,
    yellow_gums:                 false,
    yellow_palms_or_soles:       false,
    dark_urine:                  false,
    pale_stool:                  false,
    darker_skin_tone:            false,
  });

  const toggle = (key: keyof typeof symptoms) =>
    setSymptoms((p) => ({ ...p, [key]: !p[key] }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera permission needed",
        "Please allow camera access in your device settings to take a photo.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert("Choose photo", "Take a new photo or pick from gallery", [
      {
        text: "Camera",
        onPress: async () => {
          const res = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
            aspect: [1, 1],
          });
          if (!res.canceled) setImageUri(res.assets[0].uri);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
            aspect: [1, 1],
          });
          if (!res.canceled) setImageUri(res.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const submit = async () => {
    if (!imageUri) {
      showToast("Please take or select a photo first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const ageHours = profile?.age_hours ?? undefined;

      const data = await screeningApi.analyze({
        imageUri,
        age_hours:                   ageHours,
        feeding,
        difficult_to_wake:           symptoms.difficult_to_wake,
        floppy_or_unusually_drowsy:  symptoms.floppy_or_unusually_drowsy,
        jaundice_first_24h:          symptoms.jaundice_first_24h,
        jaundice_spreading:          symptoms.jaundice_spreading,
        yellow_eyes:                 symptoms.yellow_eyes,
        yellow_gums:                 symptoms.yellow_gums,
        yellow_palms_or_soles:       symptoms.yellow_palms_or_soles,
        dark_urine:                  symptoms.dark_urine,
        pale_stool:                  symptoms.pale_stool,
        darker_skin_tone:            symptoms.darker_skin_tone,
        skin_tone_category:          skinTone ?? undefined,
        user_latitude:               location.latitude  ?? undefined,
        user_longitude:              location.longitude ?? undefined,
        user_state:                  state || undefined,
        ui_language:                 "en",
      });

      setResult(data);
      setLastResult(data);
      storeFollowUp(data.final_decision);
    } catch (err: any) {
      showToast(err?.response?.data?.detail ?? err?.message ?? "Screening failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setResult(null);
    setSkinTone(null);
    setFeeding("good");
    setState("");
    setSymptoms({
      difficult_to_wake: false, floppy_or_unusually_drowsy: false,
      jaundice_first_24h: false, jaundice_spreading: false,
      yellow_eyes: false, yellow_gums: false, yellow_palms_or_soles: false,
      dark_urine: false, pale_stool: false, darker_skin_tone: false,
    });
  };

  const SymptomsToggle = ({
    label, field, urgent = false,
  }: { label: string; field: keyof typeof symptoms; urgent?: boolean }) => (
    <View style={[s.symptomRow, urgent && s.symptomRowUrgent]}>
      <Text style={s.symptomLabel}>{label}</Text>
      <Switch
        value={symptoms[field]}
        onValueChange={() => toggle(field)}
        trackColor={{ false: Colors.border, true: urgent ? Colors.rust : Colors.coral }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.heading}>Baby Screening</Text>

        {result ? (
          // Result view
          <>
            <ResultCard
              result={result}
              babyName={profile?.baby_name}
              gestationalAgeWeeks={profile?.gestational_age_weeks}
            />
            <TouchableOpacity style={s.resetBtn} onPress={reset}>
              <Ionicons name="refresh-outline" size={16} color={Colors.brownLight} />
              <Text style={s.resetBtnText}>New screening</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Form view
          <>
            {/* Camera section */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Baby photo</Text>
              <Text style={s.cardSub}>
                Use natural light. Focus on the face, eyes, gums, and palms.
              </Text>

              <TouchableOpacity style={s.cameraBtn} onPress={pickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
                ) : (
                  <View style={s.cameraPlaceholder}>
                    <Ionicons name="camera-outline" size={36} color={Colors.brownLight} />
                    <Text style={s.cameraPlaceholderText}>Take photo or choose from gallery</Text>
                  </View>
                )}
              </TouchableOpacity>

              {imageUri && (
                <TouchableOpacity style={s.retakeBtn} onPress={pickImage}>
                  <Ionicons name="camera-reverse-outline" size={15} color={Colors.coral} />
                  <Text style={s.retakeBtnText}>Retake photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Baby age */}
            {profile?.age_hours != null && (
              <View style={s.ageBanner}>
                <Ionicons name="person-outline" size={14} color={Colors.sage} />
                <Text style={s.ageBannerText}>
                  Age auto-filled from profile: {profile.age_hours} hours
                </Text>
              </View>
            )}

            {/* Location */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Location</Text>

              {/* State selector */}
              <Text style={s.label}>State</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                <View style={s.stateRow}>
                  {STATES.slice(0, 10).map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[s.stateChip, state === st && s.stateChipSelected]}
                      onPress={() => setState(st)}
                    >
                      <Text style={[s.stateChipText, state === st && s.stateChipTextSelected]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={s.stateChip}
                    onPress={() =>
                      Alert.alert(
                        "Select state",
                        "Choose your state",
                        STATES.map((st) => ({
                          text:    st,
                          onPress: () => setState(st),
                        }))
                      )
                    }
                  >
                    <Text style={s.stateChipText}>More…</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* GPS button */}
              <TouchableOpacity
                style={[s.gpsBtn, location.status === "granted" && s.gpsBtnGranted]}
                onPress={requestLocation}
              >
                <Ionicons
                  name={location.status === "granted" ? "location" : "location-outline"}
                  size={16}
                  color={location.status === "granted" ? Colors.sage : Colors.coral}
                />
                <Text style={[s.gpsBtnText, location.status === "granted" && { color: Colors.sage }]}>
                  {location.status === "loading" ? "Getting location..." : location.message}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Skin tone */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Baby's skin tone</Text>
              <Text style={s.cardSub}>Helps adjust detection sensitivity for darker skin.</Text>
              <View style={s.skinRow}>
                {SKIN_TONES.map((tone) => (
                  <TouchableOpacity
                    key={tone.key}
                    style={[s.skinChip, skinTone === tone.key && s.skinChipSelected]}
                    onPress={() => {
                      setSkinTone(tone.key);
                      if (["medium_dark", "dark"].includes(tone.key)) {
                        setSymptoms(p => ({ ...p, darker_skin_tone: true }));
                      }
                    }}
                  >
                    <View style={[s.skinSwatch, { backgroundColor: tone.color }]} />
                    <Text style={s.skinLabel}>{tone.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Feeding */}
            <View style={s.card}>
              <Text style={s.cardTitle}>How is the baby feeding?</Text>
              <View style={s.feedingRow}>
                {(["good", "poor"] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.feedingBtn, feeding === opt && (opt === "good" ? s.feedingGood : s.feedingPoor)]}
                    onPress={() => setFeeding(opt)}
                  >
                    <Ionicons
                      name={opt === "good" ? "checkmark-circle-outline" : "warning-outline"}
                      size={22}
                      color={feeding === opt ? "#fff" : Colors.brownLight}
                    />
                    <Text style={[s.feedingBtnText, feeding === opt && { color: "#fff" }]}>
                      {opt === "good" ? "Good — feeding normally" : "Poor — struggling to feed"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptoms */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Signs to check</Text>

              <View style={s.signsGroup}>
                <View style={[s.signsHeader, { backgroundColor: Colors.rustPale }]}>
                  <Ionicons name="warning-outline" size={13} color={Colors.rust} />
                  <Text style={[s.signsHeaderText, { color: Colors.rust }]}>
                    Urgent signs — seek help immediately if present
                  </Text>
                </View>
                <SymptomsToggle label="Difficult to wake for feeds" field="difficult_to_wake"   urgent />
                <SymptomsToggle label="Floppy or unusually drowsy"  field="floppy_or_unusually_drowsy" urgent />
                <SymptomsToggle label="Yellowing in first 24 hours" field="jaundice_first_24h" urgent />
                <SymptomsToggle label="Dark urine"                  field="dark_urine"         urgent />
                <SymptomsToggle label="Pale stool"                  field="pale_stool"         urgent />
              </View>

              <View style={s.signsGroup}>
                <View style={[s.signsHeader, { backgroundColor: Colors.amberPale }]}>
                  <Ionicons name="eye-outline" size={13} color={Colors.amberDark} />
                  <Text style={[s.signsHeaderText, { color: Colors.amberDark }]}>
                    Watch closely — report to health worker
                  </Text>
                </View>
                <SymptomsToggle label="Yellow in whites of eyes"      field="yellow_eyes" />
                <SymptomsToggle label="Yellow tinge in the gums"       field="yellow_gums" />
                <SymptomsToggle label="Yellow palms or soles"          field="yellow_palms_or_soles" />
                <SymptomsToggle label="Yellowing appears to be spreading" field="jaundice_spreading" />
              </View>

              <View style={s.signsGroup}>
                <View style={[s.signsHeader, { backgroundColor: Colors.cream }]}>
                  <Ionicons name="information-circle-outline" size={13} color={Colors.brownLight} />
                  <Text style={[s.signsHeaderText, { color: Colors.brownLight }]}>
                    Additional context
                  </Text>
                </View>
                <SymptomsToggle label="Darker skin baby" field="darker_skin_tone" />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, (loading || !imageUri) && { opacity: 0.6 }]}
              onPress={submit}
              disabled={loading || !imageUri}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Ionicons name="scan-outline" size={18} color="#fff" />
                    <Text style={s.submitBtnText}>Analyze screening</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      {ToastComponent}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 16 },

  card: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         16,
    marginBottom:    14,
    ...Shadow.sm,
  },
  cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 4 },
  cardSub:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 12 },

  cameraBtn: {
    borderWidth:  1.5,
    borderColor:  Colors.border,
    borderStyle:  "dashed",
    borderRadius: Radius.lg,
    overflow:     "hidden",
    minHeight:    180,
    alignItems:   "center",
    justifyContent: "center",
  },
  preview: { width: "100%", height: 220 },
  cameraPlaceholder: { alignItems: "center", gap: 10, padding: 30 },
  cameraPlaceholderText: {
    fontFamily: Fonts.medium,
    fontSize:   14,
    color:      Colors.brownLight,
    textAlign:  "center",
  },
  retakeBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            6,
    marginTop:      10,
  },
  retakeBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral },

  ageBanner: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             6,
    backgroundColor: Colors.sagePale,
    borderRadius:    Radius.md,
    padding:         10,
    marginBottom:    14,
  },
  ageBannerText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.sage },

  label: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 8 },

  stateRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:      Radius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
    backgroundColor:   Colors.cream,
  },
  stateChipSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
  stateChipText:         { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },
  stateChipTextSelected: { color: Colors.coral },

  gpsBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            8,
    borderWidth:    1.5,
    borderColor:    Colors.coral,
    borderRadius:   Radius.md,
    padding:        11,
  },
  gpsBtnGranted: { borderColor: Colors.sage, backgroundColor: Colors.sagePale },
  gpsBtnText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.coral, flex: 1 },

  skinRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  skinChip: {
    alignItems:   "center",
    gap:          4,
    padding:      6,
    borderRadius: Radius.md,
    borderWidth:  1.5,
    borderColor:  "transparent",
    width:        58,
  },
  skinChipSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
  skinSwatch:       { width: 30, height: 30, borderRadius: 15 },
  skinLabel:        { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight, textAlign: "center" },

  feedingRow: { gap: 10 },
  feedingBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            10,
    borderWidth:    1.5,
    borderColor:    Colors.border,
    borderRadius:   Radius.md,
    padding:        12,
  },
  feedingGood:    { backgroundColor: Colors.sage,  borderColor: Colors.sage },
  feedingPoor:    { backgroundColor: Colors.rust,  borderColor: Colors.rust },
  feedingBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight, flex: 1 },

  signsGroup: { marginBottom: 14 },
  signsHeader: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             6,
    borderRadius:    Radius.md,
    padding:         8,
    marginBottom:    8,
  },
  signsHeaderText: { fontFamily: Fonts.medium, fontSize: 12, flex: 1 },

  symptomRow: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  symptomRowUrgent: { backgroundColor: "#fff9f9", marginHorizontal: -4, paddingHorizontal: 4 },
  symptomLabel:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.earth, flex: 1, paddingRight: 12 },

  submitBtn: {
    backgroundColor: Colors.coral,
    borderRadius:    Radius.lg,
    padding:         15,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             8,
    marginTop:       4,
    ...Shadow.md,
  },
  submitBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },

  resetBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            6,
    marginTop:      16,
    padding:        12,
  },
  resetBtnText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },
});
