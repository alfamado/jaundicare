import React, { useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileApi, screeningApi } from "../../services/api";
import { useAppStore } from "../../store/appStore";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
import { decisionConfig } from "../../constants/decisionMap";

export default function DashboardScreen() {
  const { setProfile, setHistory } = useAppStore();

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn:  profileApi.get,
  });

  const { data: history, refetch: refetchHistory, isRefetching } = useQuery({
    queryKey: ["history"],
    queryFn:  screeningApi.history,
  });

  useEffect(() => {
    if (profile) setProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (history) setHistory(history);
  }, [history]);

  const latest    = history?.[0];
  const dm        = latest ? decisionConfig(latest.final_decision) : null;
  const babyName  = profile?.exists ? profile.baby_name : null;
  const ageHours  = profile?.age_hours;

  const ageLabel = ageHours != null
    ? ageHours < 24
      ? `${ageHours}h old`
      : `${Math.floor(ageHours / 24)}d ${ageHours % 24}h old`
    : null;

  const onRefresh = () => {
    refetchProfile();
    refetchHistory();
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={Colors.coral} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.brandMark}>
              <Ionicons name="water" size={18} color={Colors.coral} />
            </View>
            <View>
              <Text style={s.brandName}>JaundiCare</Text>
              <Text style={s.brandSub}>Newborn jaundice support</Text>
            </View>
          </View>
        </View>

        {/* Baby profile card */}
        <TouchableOpacity style={s.profileCard} onPress={() => router.push("/(tabs)/profile")}>
          <View style={s.profileLeft}>
            <Text style={s.profileLabel}>Baby profile</Text>
            <Text style={s.profileName}>
              {babyName ?? "No profile saved yet"}
            </Text>
            {ageLabel && <Text style={s.profileAge}>{ageLabel}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.coral} />
        </TouchableOpacity>

        {/* Latest screening status */}
        {latest && dm ? (
          <View style={[s.statusCard, { borderLeftColor: dm.color }]}>
            <Text style={s.statusLabel}>Latest screening</Text>
            <View style={s.statusRow}>
              <Text style={s.statusIcon}>{dm.icon}</Text>
              <Text style={[s.statusText, { color: dm.color }]}>{dm.label}</Text>
            </View>
            <Text style={s.statusDate}>
              {new Date(latest.created_at).toLocaleDateString(undefined, {
                day: "numeric", month: "short", year: "numeric",
              })}
            </Text>
          </View>
        ) : (
          <View style={s.noScreeningCard}>
            <Text style={s.noScreeningText}>No screening yet</Text>
            <Text style={s.noScreeningSub}>Run a screening to see your baby's result here.</Text>
          </View>
        )}

        {/* Quick action buttons */}
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.push("/(tabs)/screening")}
        >
          <Ionicons name="scan" size={18} color="#fff" />
          <Text style={s.primaryBtnText}>Start baby check</Text>
        </TouchableOpacity>

        {/* Reference cards */}
        <Text style={s.sectionTitle}>Quick reference</Text>

        <View style={s.refCard}>
          <View style={s.refHeader}>
            <View style={[s.refIcon, { backgroundColor: Colors.amberPale }]}>
              <Ionicons name="eye-outline" size={16} color={Colors.amberDark} />
            </View>
            <Text style={s.refTitle}>How to check your baby</Text>
          </View>
          {[
            "Look at the whites of the eyes",
            "Check the gums",
            "Check the palms and soles",
            "Watch feeding and alertness closely",
          ].map((item, i) => (
            <View key={i} style={s.refRow}>
              <View style={s.refDot} />
              <Text style={s.refText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[s.refCard, s.warnCard]}>
          <View style={s.refHeader}>
            <View style={[s.refIcon, { backgroundColor: Colors.rustPale }]}>
              <Ionicons name="warning-outline" size={16} color={Colors.rust} />
            </View>
            <Text style={s.refTitle}>Warning signs — seek help now</Text>
          </View>
          {[
            "Difficulty waking for feeds",
            "Poor feeding",
            "Floppiness or unusual drowsiness",
            "Dark urine or pale stool",
          ].map((item, i) => (
            <View key={i} style={s.refRow}>
              <View style={[s.refDot, { backgroundColor: Colors.rust }]} />
              <Text style={s.refText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.brownLight} />
          <Text style={s.disclaimerText}>
            This tool supports screening. It does not replace a doctor, midwife, or bilirubin test.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  header:   { marginBottom: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark:{
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.earth,
    alignItems: "center", justifyContent: "center",
  },
  brandName: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.earth },
  brandSub:  { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight },

  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    ...Shadow.sm,
  },
  profileLeft:  { flex: 1 },
  profileLabel: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.brownLight, marginBottom: 2 },
  profileName:  { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.earth },
  profileAge:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginTop: 2 },

  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    ...Shadow.sm,
  },
  statusLabel: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.brownLight, marginBottom: 4 },
  statusRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  statusIcon:  { fontSize: 20 },
  statusText:  { fontFamily: Fonts.bold, fontSize: 15 },
  statusDate:  { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight },

  noScreeningCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    ...Shadow.sm,
  },
  noScreeningText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, marginBottom: 4 },
  noScreeningSub:  { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, textAlign: "center" },

  primaryBtn: {
    backgroundColor: Colors.coral,
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    ...Shadow.md,
  },
  primaryBtnText: { fontFamily: Fonts.semibold, fontSize: 15, color: "#fff" },

  sectionTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, marginBottom: 10 },

  refCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    ...Shadow.sm,
  },
  warnCard:  { borderLeftWidth: 3, borderLeftColor: Colors.rust },
  refHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  refIcon:   { width: 30, height: 30, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  refTitle:  { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, flex: 1 },
  refRow:    { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  refDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.amber, marginTop: 6 },
  refText:   { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, flex: 1, lineHeight: 20 },

  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 12,
    backgroundColor: Colors.amberPale,
    borderRadius: Radius.md,
    marginTop: 8,
  },
  disclaimerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1, lineHeight: 18 },
});
