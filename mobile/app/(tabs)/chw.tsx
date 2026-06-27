/**
 * JaundiCare — CHW Screen
 * Community health worker caseload management.
 */

import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, CaseloadEntry } from "../../store/appStore";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";

function calcAgeHours(dob: string, tob: string): number | null {
  try {
    const birth = new Date(`${dob}T${tob}`);
    const diff  = Date.now() - birth.getTime();
    return Math.max(0, Math.floor(diff / 3600000));
  } catch { return null; }
}

export default function CHWScreen() {
  const { caseload, addCase, removeCase } = useAppStore();
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm] = useState({
    name: "", household: "", dob: "", tob: "", gestAge: "",
  });

  const saveCase = () => {
    if (!form.name.trim()) { Alert.alert("Please enter a baby name."); return; }
    if (!form.dob || !form.tob) { Alert.alert("Please enter date and time of birth."); return; }

    addCase({
      name:      form.name.trim(),
      household: form.household.trim() || undefined,
      dob:       form.dob,
      tob:       form.tob,
      gestAge:   form.gestAge ? parseInt(form.gestAge) : undefined,
    });

    setForm({ name: "", household: "", dob: "", tob: "", gestAge: "" });
    setShowForm(false);
  };

  const confirmRemove = (id: string, name: string) => {
    Alert.alert("Remove baby", `Remove ${name} from caseload?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeCase(id) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.heading}>CHW Mode</Text>
        <Text style={s.subheading}>
          Track multiple babies across different households. Screenings and follow-ups in one place.
        </Text>

        {/* Add button */}
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? "close" : "add"} size={18} color="#fff" />
          <Text style={s.addBtnText}>{showForm ? "Cancel" : "Add baby"}</Text>
        </TouchableOpacity>

        {/* Add form */}
        {showForm && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>New baby</Text>

            {[
              { label: "Baby name *",       key: "name",      placeholder: "e.g. Baby Adewale" },
              { label: "Parent / Household",key: "household", placeholder: "e.g. Adewale household" },
              { label: "Date of birth *",   key: "dob",       placeholder: "YYYY-MM-DD" },
              { label: "Time of birth *",   key: "tob",       placeholder: "HH:MM" },
              { label: "Gestational age",   key: "gestAge",   placeholder: "e.g. 38 (weeks)" },
            ].map((f) => (
              <View key={f.key} style={s.field}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput
                  style={s.input}
                  value={form[f.key as keyof typeof form]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.brownLight}
                  keyboardType={f.key === "gestAge" ? "numeric" : "default"}
                />
              </View>
            ))}

            <TouchableOpacity style={s.saveBtn} onPress={saveCase}>
              <Text style={s.saveBtnText}>Save to caseload</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Caseload list */}
        {caseload.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="people-outline" size={40} color={Colors.brownLight} />
            <Text style={s.emptyTitle}>No babies in caseload</Text>
            <Text style={s.emptyText}>Add a baby above to begin tracking.</Text>
          </View>
        ) : (
          caseload.map((baby) => {
            const ageHours = calcAgeHours(baby.dob, baby.tob);
            const ageDays  = ageHours != null ? Math.floor(ageHours / 24) : null;
            const ageStr   = ageDays != null
              ? ageDays > 0 ? `Day ${ageDays}` : `${ageHours}h old`
              : "Age unknown";

            const isOverdue    = ageDays != null && ageDays > 14;
            const followupDays = [1, 3, 7, 14];
            const nextFollowup = followupDays.find(d => ageDays != null && ageDays < d);

            return (
              <View key={baby.id} style={s.babyCard}>
                <View style={s.babyTop}>
                  <View style={s.babyInfo}>
                    <Text style={s.babyName}>{baby.name}</Text>
                    {baby.household && (
                      <Text style={s.babyHousehold}>{baby.household}</Text>
                    )}
                  </View>
                  <View style={[s.ageBadge, isOverdue && { backgroundColor: Colors.rustPale }]}>
                    <Text style={[s.ageText, isOverdue && { color: Colors.rust }]}>{ageStr}</Text>
                  </View>
                </View>

                <View style={s.followupRow}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.brownLight} />
                  <Text style={s.followupText}>
                    {nextFollowup != null
                      ? `Next follow-up: Day ${nextFollowup}`
                      : isOverdue
                      ? "Follow-up period complete"
                      : "Monitoring ongoing"}
                  </Text>
                  {baby.gestAge && (
                    <Text style={s.gestText}>{baby.gestAge}wk gestation</Text>
                  )}
                </View>

                <View style={s.babyActions}>
                  <TouchableOpacity
                    style={s.screenBtn}
                    onPress={() => router.push("/(tabs)/screening")}
                  >
                    <Text style={s.screenBtnText}>Screen this baby</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.removeBtn}
                    onPress={() => confirmRemove(baby.id, baby.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.rust} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Referral pathway */}
        <View style={s.referralCard}>
          <Text style={s.referralTitle}>Referral pathway</Text>
          <View style={s.referralFlow}>
            {["Mother / Home", "CHW / Midwife", "PHC", "Hospital"].map((step, i, arr) => (
              <React.Fragment key={step}>
                <View style={[s.referralStep, i === arr.length - 1 && s.referralStepHighlight]}>
                  <Text style={[s.referralStepText, i === arr.length - 1 && { color: Colors.coral }]}>
                    {step}
                  </Text>
                </View>
                {i < arr.length - 1 && (
                  <Ionicons name="chevron-forward" size={14} color={Colors.brownLight} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* CHW priority list */}
        <View style={s.priorityCard}>
          <Text style={s.priorityTitle}>What CHWs should prioritise</Text>
          {[
            "Jaundice in the first 24 hours",
            "Poor feeding with yellowing or unusual sleepiness",
            "Difficulty waking, floppiness, dark urine, or pale stool",
            "Darker skin babies where yellowing may be harder to detect",
          ].map((item, i) => (
            <View key={i} style={s.priorityRow}>
              <View style={s.priorityDot} />
              <Text style={s.priorityText}>{item}</Text>
            </View>
          ))}
        </View>
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

  addBtn: {
    backgroundColor: Colors.coral,
    borderRadius:    Radius.lg,
    padding:         13,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             6,
    marginBottom:    16,
    ...Shadow.md,
  },
  addBtnText: { fontFamily: Fonts.semibold, fontSize: 15, color: "#fff" },

  formCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         16,
    marginBottom:    16,
    ...Shadow.sm,
  },
  formTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 12 },
  field:     { marginBottom: 12 },
  label:     { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, marginBottom: 5 },
  input: {
    backgroundColor: Colors.cream,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.md,
    padding:         11,
    fontFamily:      Fonts.regular,
    fontSize:        14,
    color:           Colors.earth,
  },
  saveBtn: {
    backgroundColor: Colors.coral,
    borderRadius:    Radius.lg,
    padding:         13,
    alignItems:      "center",
    marginTop:       4,
  },
  saveBtnText: { fontFamily: Fonts.semibold, fontSize: 14, color: "#fff" },

  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyTitle: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.earth },
  emptyText:  { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight, textAlign: "center" },

  babyCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         14,
    marginBottom:    12,
    ...Shadow.sm,
  },
  babyTop: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   8,
  },
  babyInfo:      { flex: 1 },
  babyName:      { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
  babyHousehold: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
  ageBadge: {
    backgroundColor: Colors.sagePale,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:    Radius.full,
  },
  ageText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.sage },

  followupRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  followupText:{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1 },
  gestText:    { fontFamily: Fonts.medium, fontSize: 11, color: Colors.amber },

  babyActions: { flexDirection: "row", gap: 8 },
  screenBtn: {
    flex:            1,
    backgroundColor: Colors.coral,
    borderRadius:    Radius.md,
    paddingVertical: 9,
    alignItems:      "center",
  },
  screenBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
  removeBtn: {
    borderWidth:  1.5,
    borderColor:  Colors.rust,
    borderRadius: Radius.md,
    padding:      9,
    alignItems:   "center",
    justifyContent: "center",
  },

  referralCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         14,
    marginTop:       8,
    marginBottom:    12,
    ...Shadow.sm,
  },
  referralTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, marginBottom: 12 },
  referralFlow:  { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  referralStep: {
    backgroundColor: Colors.cream,
    borderRadius:    Radius.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  referralStepHighlight: { backgroundColor: Colors.coral + "18", borderWidth: 1, borderColor: Colors.coral },
  referralStepText:      { fontFamily: Fonts.medium, fontSize: 12, color: Colors.brownLight },

  priorityCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         14,
    ...Shadow.sm,
  },
  priorityTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, marginBottom: 10 },
  priorityRow:   { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "flex-start" },
  priorityDot:   { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.amber, marginTop: 7 },
  priorityText:  { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, flex: 1, lineHeight: 20 },
});
