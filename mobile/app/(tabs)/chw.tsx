import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store/appStore";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";

const { width } = Dimensions.get("window");

type Role = "parent" | "health_worker";

const steps = [
  {
    icon:  "water" as const,
    color: Colors.coral,
    title: "Welcome to JaundiCare",
    body:  "JaundiCare helps parents and health workers detect newborn jaundice early using AI-assisted image screening, symptom triage, and referral support.",
    note:  "This is a screening support tool. It does not replace a doctor, midwife, or bilirubin test.",
  },
  {
    icon:  "people" as const,
    color: Colors.amber,
    title: "Who are you?",
    body:  "This helps us show the most relevant experience for you.",
  },
  {
    icon:  "checkmark-circle" as const,
    color: Colors.sage,
    title: "You are all set",
    body:  "Start by creating a baby profile so the app can track age automatically, then run your first screening.",
  },
];

export default function OnboardingScreen() {
  const [step, setStep]   = useState(0);
  const [role, setRole]   = useState<Role | null>(null);
  const finishOnboarding  = useAppStore((s) => s.finishOnboarding);

  const goNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const finish = () => {
    if (!role) return;
    finishOnboarding(role);
    router.replace(role === "health_worker" ? "/(tabs)/chw" : "/(tabs)/profile");
  };

  const current = steps[step];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Icon */}
        <View style={[s.iconWrap, { backgroundColor: current.color + "18", borderColor: current.color }]}>
          <Ionicons name={current.icon} size={36} color={current.color} />
        </View>

        {/* Text */}
        <Text style={s.title}>{current.title}</Text>
        <Text style={s.body}>{current.body}</Text>

        {/* Step 1 disclaimer */}
        {step === 0 && (
          <View style={s.note}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.brownLight} />
            <Text style={s.noteText}>{current.note}</Text>
          </View>
        )}

        {/* Step 2 role selection */}
        {step === 1 && (
          <View style={s.roleGrid}>
            {([
              {
                key:      "parent" as Role,
                icon:     "person-outline" as const,
                title:    "Parent or caregiver",
                subtitle: "I want to monitor my baby's health",
              },
              {
                key:      "health_worker" as Role,
                icon:     "medkit-outline" as const,
                title:    "Health worker or CHW",
                subtitle: "I support newborn care in the community",
              },
            ]).map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[s.roleCard, role === option.key && s.roleCardSelected]}
                onPress={() => { setRole(option.key); goNext(); }}
              >
                <Ionicons
                  name={option.icon}
                  size={28}
                  color={role === option.key ? Colors.coral : Colors.brownLight}
                />
                <Text style={[s.roleTitle, role === option.key && { color: Colors.coral }]}>
                  {option.title}
                </Text>
                <Text style={s.roleSub}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3 action list */}
        {step === 2 && (
          <View style={s.actionList}>
            {[
              role === "health_worker" ? "Open Community Care Mode" : "Create a baby profile",
              role === "health_worker" ? "Start an assisted screening" : "Run a screening",
              role === "health_worker" ? "Track follow-up reminders" : "View your result and next steps",
            ].map((action, i) => (
              <View key={i} style={s.actionRow}>
                <View style={s.actionNum}>
                  <Text style={s.actionNumText}>{i + 1}</Text>
                </View>
                <Text style={s.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Progress dots */}
        <View style={s.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[s.dot, step === i && s.dotActive]} />
          ))}
        </View>

        {/* CTA */}
        {step === 0 && (
          <TouchableOpacity style={s.primaryBtn} onPress={goNext}>
            <Text style={s.primaryBtnText}>Get started</Text>
          </TouchableOpacity>
        )}

        {step === 2 && role && (
          <TouchableOpacity style={s.primaryBtn} onPress={finish}>
            <Text style={s.primaryBtnText}>Open JaundiCare</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },

  iconWrap: {
    width: 88, height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  title: {
    fontFamily: Fonts.bold,
    fontSize:   24,
    color:      Colors.earth,
    textAlign:  "center",
    marginBottom: 12,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize:   15,
    color:      Colors.brownLight,
    textAlign:  "center",
    lineHeight: 24,
    marginBottom: 20,
    maxWidth:   320,
  },

  note: {
    flexDirection:   "row",
    gap:             8,
    backgroundColor: Colors.amberPale,
    borderRadius:    Radius.md,
    padding:         12,
    alignItems:      "flex-start",
    marginBottom:    20,
  },
  noteText: {
    fontFamily: Fonts.medium,
    fontSize:   13,
    color:      Colors.brownLight,
    flex:       1,
    lineHeight: 20,
  },

  roleGrid:     { width: "100%", gap: 12, marginBottom: 20 },
  roleCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         16,
    alignItems:      "center",
    borderWidth:     1.5,
    borderColor:     Colors.border,
    ...Shadow.sm,
  },
  roleCardSelected: { borderColor: Colors.coral, backgroundColor: "#fff5f2" },
  roleTitle: {
    fontFamily:   Fonts.semibold,
    fontSize:     15,
    color:        Colors.earth,
    marginTop:    10,
    marginBottom: 4,
    textAlign:    "center",
  },
  roleSub: {
    fontFamily: Fonts.regular,
    fontSize:   13,
    color:      Colors.brownLight,
    textAlign:  "center",
  },

  actionList:   { width: "100%", gap: 10, marginBottom: 24 },
  actionRow:    { flexDirection: "row", alignItems: "center", gap: 12 },
  actionNum: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: Colors.coral,
    alignItems:      "center",
    justifyContent:  "center",
  },
  actionNumText: { fontFamily: Fonts.bold, fontSize: 13, color: "#fff" },
  actionText:    { fontFamily: Fonts.medium, fontSize: 14, color: Colors.earth, flex: 1 },

  dots:    { flexDirection: "row", gap: 6, marginBottom: 28 },
  dot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
  dotActive:{ backgroundColor: Colors.coral, width: 20 },

  primaryBtn: {
    backgroundColor: Colors.coral,
    borderRadius:    Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 40,
    ...Shadow.md,
  },
  primaryBtnText: { fontFamily: Fonts.semibold, fontSize: 16, color: "#fff" },
});