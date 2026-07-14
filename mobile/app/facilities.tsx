import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FacilityCard } from "../components/FacilityCard";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
import { LGA_DATA } from "../constants/lgaData";
import { useLocation } from "../hooks/useLocation";
import { facilityApi, type Facility } from "../services/api";
import { useTranslations } from "../hooks/useTranslations";

type Preference = "nearest" | "government" | "clinic";

const PREFERENCES: Array<{
  key: Preference;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  fallback: string;
}> = [
  { key: "nearest", icon: "navigate-outline", labelKey: "pref.nearest", fallback: "Nearest" },
  { key: "government", icon: "business-outline", labelKey: "pref.govt", fallback: "Government" },
  { key: "clinic", icon: "medkit-outline", labelKey: "pref.clinic", fallback: "Clinic / Private" },
];

const STATES = Object.keys(LGA_DATA).sort();

export default function FacilitiesScreen() {
  const { t } = useTranslations();
  const { location, requestLocation } = useLocation();
  const [preference, setPreference] = useState<Preference>("nearest");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showLgaPicker, setShowLgaPicker] = useState(false);

  const searchFacilities = useCallback(async (nextPreference = preference) => {
    const hasGps = location.latitude != null && location.longitude != null;
    if (!hasGps && !state) {
      setError("Enable location or select your state to find facilities.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const results = await facilityApi.recommend({
        lat: hasGps ? location.latitude ?? undefined : undefined,
        lon: hasGps ? location.longitude ?? undefined : undefined,
        state: hasGps ? undefined : state,
        lga: hasGps ? undefined : lga || undefined,
        // A facility finder must surface capable care sites even before a
        // screening result is available.
        triage_level: "SAME_DAY_CLINIC_REVIEW",
        preference: nextPreference,
      });
      setFacilities(results);
      if (results.length === 0) {
        setError("No matching facilities were found. Try another option or state.");
      }
    } catch {
      setFacilities([]);
      setError("We could not load facilities. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [lga, location.latitude, location.longitude, preference, state]);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (location.status === "granted") {
      void searchFacilities();
    }
  }, [location.status, location.latitude, location.longitude, searchFacilities]);

  const selectPreference = (nextPreference: Preference) => {
    setPreference(nextPreference);
    void searchFacilities(nextPreference);
  };

  const locationLabel = location.status === "granted"
    ? "Location enabled — showing nearby facilities"
    : location.status === "loading"
      ? "Getting your location…"
      : "Use location or select your state";

  const lgaOptions = state ? LGA_DATA[state] ?? [] : [];

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <FlatList
        data={facilities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FacilityCard facility={item} />}
        contentContainerStyle={s.content}
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <TouchableOpacity style={s.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
                <Ionicons name="arrow-back" size={21} color={Colors.earth} />
              </TouchableOpacity>
              <View style={s.headerText}>
                <Text style={s.title}>{t("result.facilities") === "result.facilities" ? "Nearby facilities" : t("result.facilities")}</Text>
                <Text style={s.subtitle}>Choose a care option, then get directions or call ahead.</Text>
              </View>
            </View>

            <View style={[s.locationCard, location.status === "granted" && s.locationCardGranted]}>
              <Ionicons
                name={location.status === "granted" ? "location" : "location-outline"}
                size={18}
                color={location.status === "granted" ? Colors.sage : Colors.brownLight}
              />
              <Text style={[s.locationText, location.status === "granted" && s.locationTextGranted]}>{locationLabel}</Text>
              {location.status !== "granted" && (
                <TouchableOpacity onPress={() => void requestLocation()} disabled={location.status === "loading"}>
                  <Text style={s.retryText}>{location.status === "loading" ? "Please wait" : "Try again"}</Text>
                </TouchableOpacity>
              )}
            </View>

            {location.status !== "granted" && (
              <View style={s.manualLocation}>
                <TouchableOpacity style={s.pickerButton} onPress={() => setShowStatePicker(true)}>
                  <Ionicons name="map-outline" size={16} color={Colors.coral} />
                  <Text style={s.pickerText}>{state || "Select your state"}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
                </TouchableOpacity>
                {state !== "" && (
                  <TouchableOpacity style={s.pickerButton} onPress={() => setShowLgaPicker(true)}>
                    <Ionicons name="location-outline" size={16} color={Colors.coral} />
                    <Text style={s.pickerText}>{lga || "Select LGA (optional)"}</Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.brownLight} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={s.sectionTitle}>Care preference</Text>
            <View style={s.preferenceRow}>
              {PREFERENCES.map((item) => {
                const active = preference === item.key;
                const label = t(item.labelKey);
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[s.preference, active && s.preferenceActive]}
                    onPress={() => selectPreference(item.key)}
                    disabled={loading}
                  >
                    <Ionicons name={item.icon} size={20} color={active ? Colors.coral : Colors.brownLight} />
                    <Text style={[s.preferenceText, active && s.preferenceTextActive]}>
                      {label === item.labelKey ? item.fallback : label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {location.status !== "granted" && state !== "" && (
              <TouchableOpacity style={s.searchButton} onPress={() => void searchFacilities()} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.searchButtonText}>Find facilities</Text>}
              </TouchableOpacity>
            )}

            {loading && <ActivityIndicator style={s.loader} color={Colors.coral} />}
            {error !== "" && <Text style={s.error}>{error}</Text>}
            {searched && !loading && facilities.length > 0 && <Text style={s.resultsLabel}>{facilities.length} facility options</Text>}
          </>
        }
        ListEmptyComponent={
          searched && !loading
            ? <Text style={s.emptyText}>No facility is available to show yet.</Text>
            : null
        }
      />

      <Modal visible={showStatePicker} transparent animationType="slide" onRequestClose={() => setShowStatePicker(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select your state</Text>
              <TouchableOpacity onPress={() => setShowStatePicker(false)}><Ionicons name="close" size={24} color={Colors.earth} /></TouchableOpacity>
            </View>
            <FlatList
              data={STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.modalItem}
                  onPress={() => { setState(item); setLga(""); setShowStatePicker(false); }}
                >
                  <Text style={s.modalItemText}>{item}</Text>
                  {state === item && <Ionicons name="checkmark" size={18} color={Colors.coral} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showLgaPicker} transparent animationType="slide" onRequestClose={() => setShowLgaPicker(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select your LGA</Text>
              <TouchableOpacity onPress={() => setShowLgaPicker(false)}><Ionicons name="close" size={24} color={Colors.earth} /></TouchableOpacity>
            </View>
            <FlatList
              data={lgaOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.modalItem} onPress={() => { setLga(item); setShowLgaPicker(false); }}>
                  <Text style={s.modalItemText}>{item}</Text>
                  {lga === item && <Ionicons name="checkmark" size={18} color={Colors.coral} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 36, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: Colors.card, marginRight: 10, ...Shadow.sm },
  headerText: { flex: 1 },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginTop: 3, lineHeight: 19 },
  locationCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.cream, borderRadius: Radius.md, padding: 12, marginBottom: 12 },
  locationCardGranted: { backgroundColor: Colors.sagePale },
  locationText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight, marginHorizontal: 8 },
  locationTextGranted: { color: Colors.sage },
  retryText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.coral },
  manualLocation: { gap: 8, marginBottom: 14 },
  pickerButton: { minHeight: 48, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.card, paddingHorizontal: 12 },
  pickerText: { flex: 1, fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginHorizontal: 8 },
  sectionTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, marginBottom: 8 },
  preferenceRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  preference: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", gap: 5, borderRadius: Radius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, padding: 6 },
  preferenceActive: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
  preferenceText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.brownLight, textAlign: "center" },
  preferenceTextActive: { color: Colors.coral },
  searchButton: { minHeight: 50, borderRadius: Radius.md, backgroundColor: Colors.coral, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  searchButtonText: { fontFamily: Fonts.semibold, fontSize: 14, color: "#fff" },
  loader: { marginVertical: 14 },
  error: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.rust, lineHeight: 19, marginBottom: 14 },
  resultsLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth, marginBottom: 10 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, textAlign: "center", marginTop: 20 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalBox: { maxHeight: "70%", backgroundColor: Colors.background, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  modalTitle: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
  modalItem: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 4 },
  modalItemText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth },
});
