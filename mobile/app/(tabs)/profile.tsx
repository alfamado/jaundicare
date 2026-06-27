/**
 * JaundiCare — Profile Screen
 * Create or update the baby profile.
 */

import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { profileApi } from "../../services/api";
import { useAppStore } from "../../store/appStore";
import { useNotifications } from "../../hooks/useNotifications";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const setProfile  = useAppStore((s) => s.setProfile);
  const { scheduleFollowUpReminders } = useNotifications();

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: profileApi.get });

  const [form, setForm] = useState({
    baby_name:             "",
    parent_name:           "",
    date_of_birth:         "",
    time_of_birth:         "",
    sex:                   "",
    gestational_age_weeks: "",
  });

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile?.exists) {
      setForm({
        baby_name:             profile.baby_name             ?? "",
        parent_name:           profile.parent_name           ?? "",
        date_of_birth:         profile.date_of_birth         ?? "",
        time_of_birth:         profile.time_of_birth         ?? "",
        sex:                   profile.sex                   ?? "",
        gestational_age_weeks: profile.gestational_age_weeks?.toString() ?? "",
      });
    }
  }, [profile]);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: () => profileApi.save({
      baby_name:             form.baby_name.trim(),
      parent_name:           form.parent_name.trim() || undefined,
      date_of_birth:         form.date_of_birth,
      time_of_birth:         form.time_of_birth,
      sex:                   form.sex || undefined,
      gestational_age_weeks: form.gestational_age_weeks
        ? parseInt(form.gestational_age_weeks) : undefined,
    }),
    onSuccess: async (saved) => {
      setProfile(saved);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await scheduleFollowUpReminders(saved);
      Alert.alert("Saved", "Baby profile saved successfully.");
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.message ?? "Could not save profile.");
    },
  });

  const field = (
    label: string,
    key: keyof typeof form,
    options: {
      placeholder?: string;
      keyboardType?: "default" | "numeric";
      maxLength?: number;
    } = {}
  ) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={form[key]}
        onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
        placeholder={options.placeholder ?? ""}
        placeholderTextColor={Colors.brownLight}
        keyboardType={options.keyboardType ?? "default"}
        maxLength={options.maxLength}
      />
    </View>
  );

  const ageHours = profile?.age_hours;
  const ageDays  = ageHours != null ? Math.floor(ageHours / 24) : null;
  const ageLabel = ageHours != null
    ? ageDays! > 0 ? `${ageDays}d ${ageHours % 24}h old` : `${ageHours}h old`
    : null;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.heading}>Baby Profile</Text>
        <Text style={s.subheading}>
          Save your baby's details once. The app will calculate age automatically for each screening.
        </Text>

        {/* Current age display */}
        {ageLabel && (
          <View style={s.ageBadge}>
            <Ionicons name="time-outline" size={16} color={Colors.sage} />
            <Text style={s.ageText}>Current age: {ageLabel}</Text>
          </View>
        )}

        <View style={s.card}>
          {field("Baby name *",  "baby_name",    { placeholder: "e.g. Baby Adewale" })}
          {field("Parent name",  "parent_name",  { placeholder: "e.g. Fatima Adewale" })}

          {/* Date of birth */}
          <View style={s.field}>
            <Text style={s.label}>Date of birth *</Text>
            <TextInput
              style={s.input}
              value={form.date_of_birth}
              onChangeText={(v) => setForm((f) => ({ ...f, date_of_birth: v }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.brownLight}
              maxLength={10}
            />
            <Text style={s.helper}>Format: 2025-06-01</Text>
          </View>

          {/* Time of birth */}
          <View style={s.field}>
            <Text style={s.label}>Time of birth *</Text>
            <TextInput
              style={s.input}
              value={form.time_of_birth}
              onChangeText={(v) => setForm((f) => ({ ...f, time_of_birth: v }))}
              placeholder="HH:MM (24-hour)"
              placeholderTextColor={Colors.brownLight}
              maxLength={5}
            />
            <Text style={s.helper}>Format: 14:30</Text>
          </View>

          {/* Sex */}
          <View style={s.field}>
            <Text style={s.label}>Sex</Text>
            <View style={s.sexRow}>
              {["male", "female"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[s.sexBtn, form.sex === opt && s.sexBtnSelected]}
                  onPress={() => setForm((f) => ({ ...f, sex: opt }))}
                >
                  <Text style={[s.sexBtnText, form.sex === opt && s.sexBtnTextSelected]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {field("Gestational age (weeks)", "gestational_age_weeks", {
            placeholder: "e.g. 38",
            keyboardType: "numeric",
            maxLength: 2,
          })}
          <Text style={[s.helper, { marginTop: -8, marginBottom: 8 }]}>
            Enter if baby was preterm. Affects jaundice risk thresholds.
          </Text>

          <TouchableOpacity
            style={[s.saveBtn, isPending && { opacity: 0.6 }]}
            onPress={() => saveProfile()}
            disabled={isPending}
          >
            {isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveBtnText}>Save profile</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Saved profile display */}
        {profile?.exists && (
          <View style={s.savedCard}>
            <Text style={s.savedTitle}>Saved profile</Text>
            {[
              ["Baby name",         profile.baby_name],
              ["Parent name",       profile.parent_name],
              ["Date of birth",     profile.date_of_birth],
              ["Time of birth",     profile.time_of_birth],
              ["Sex",               profile.sex],
              ["Gestational age",   profile.gestational_age_weeks ? `${profile.gestational_age_weeks} weeks` : null],
              ["Age in hours",      ageLabel],
            ].map(([label, value]) =>
              value ? (
                <View key={label as string} style={s.savedRow}>
                  <Text style={s.savedLabel}>{label}</Text>
                  <Text style={s.savedValue}>{value}</Text>
                </View>
              ) : null
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  heading:    { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 6 },
  subheading: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight, marginBottom: 16, lineHeight: 22 },

  ageBadge: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             8,
    backgroundColor: Colors.sagePale,
    borderRadius:    Radius.md,
    padding:         10,
    marginBottom:    16,
  },
  ageText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.sage },

  card: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         16,
    marginBottom:    16,
    ...Shadow.sm,
  },
  field:  { marginBottom: 14 },
  label:  { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 6 },
  input: {
    backgroundColor: Colors.cream,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.md,
    padding:         12,
    fontFamily:      Fonts.regular,
    fontSize:        14,
    color:           Colors.earth,
  },
  helper: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, marginTop: 4 },

  sexRow:            { flexDirection: "row", gap: 10 },
  sexBtn: {
    flex:            1,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    Radius.md,
    padding:         10,
    alignItems:      "center",
  },
  sexBtnSelected:     { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
  sexBtnText:         { fontFamily: Fonts.medium, fontSize: 14, color: Colors.brownLight },
  sexBtnTextSelected: { color: Colors.coral },

  saveBtn: {
    backgroundColor: Colors.coral,
    borderRadius:    Radius.lg,
    padding:         14,
    alignItems:      "center",
    marginTop:       8,
    ...Shadow.md,
  },
  saveBtnText: { fontFamily: Fonts.semibold, fontSize: 15, color: "#fff" },

  savedCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         16,
    ...Shadow.sm,
  },
  savedTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 12 },
  savedRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  savedLabel: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.brownLight },
  savedValue: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth },
});
