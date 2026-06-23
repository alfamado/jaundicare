import React from "react";
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { screeningApi } from "../../services/api";
import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
import { decisionConfig } from "../../constants/decisionMap";

export default function HistoryScreen() {
  const { data: history, isRefetching, refetch } = useQuery({
    queryKey: ["history"],
    queryFn:  screeningApi.history,
  });

  const items = history ?? [];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.coral} />
        }
      >
        <Text style={s.heading}>Screening History</Text>
        <Text style={s.subheading}>Pull down to refresh. Tap a card to see details.</Text>

        {items.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="document-outline" size={40} color={Colors.brownLight} />
            <Text style={s.emptyTitle}>No screenings yet</Text>
            <Text style={s.emptyText}>Run your first screening to see history here.</Text>
          </View>
        ) : (
          items.map((item, index) => {
            const dm      = decisionConfig(item.final_decision);
            const isFirst = index === 0;

            const raw  = item.image_confidence;
            const pct  = raw != null
              ? (raw > 1 ? raw.toFixed(1) : (raw * 100).toFixed(1))
              : null;

            const ageHours = item.baby_age_hours;
            const ageDays  = ageHours != null ? Math.floor(ageHours / 24) : null;
            const ageStr   = ageDays != null
              ? ageDays > 0 ? `${ageDays}d ${ageHours! % 24}h old` : `${ageHours}h old`
              : null;

            let dateStr = "", timeStr = "";
            if (item.created_at) {
              const d = new Date(item.created_at);
              dateStr = d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
              timeStr = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
            }

            return (
              <View key={item.screening_id} style={[s.card, isFirst && s.cardLatest]}>
                <View style={s.cardTop}>
                  <View style={[s.badge, { backgroundColor: dm.color + "18", borderColor: dm.color }]}>
                    <Text style={s.badgeIcon}>{dm.icon}</Text>
                    <Text style={[s.badgeText, { color: dm.color }]}>{dm.label}</Text>
                  </View>
                  {isFirst && (
                    <View style={s.latestTag}>
                      <Text style={s.latestTagText}>Latest</Text>
                    </View>
                  )}
                </View>

                <View style={s.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.brownLight} />
                  <Text style={s.metaText}>{dateStr}</Text>
                  <Ionicons name="time-outline" size={12} color={Colors.brownLight} style={{ marginLeft: 8 }} />
                  <Text style={s.metaText}>{timeStr}</Text>
                </View>

                {ageStr && (
                  <View style={s.metaRow}>
                    <Ionicons name="person-outline" size={12} color={Colors.brownLight} />
                    <Text style={s.metaText}>{ageStr}</Text>
                  </View>
                )}

                {(item.image_prediction || pct) && (
                  <View style={s.predRow}>
                    {item.image_prediction && (
                      <Text style={s.predLabel}>
                        {item.image_prediction.charAt(0).toUpperCase() + item.image_prediction.slice(1)}
                      </Text>
                    )}
                    {pct && <Text style={s.predConf}>{pct}% confidence</Text>}
                  </View>
                )}

                <Text style={s.reason} numberOfLines={2}>{item.final_decision_reason}</Text>
              </View>
            );
          })
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
  subheading: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 16 },

  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.earth },
  emptyText:  { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight, textAlign: "center" },

  card: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         14,
    marginBottom:    12,
    ...Shadow.sm,
  },
  cardLatest: { borderWidth: 1.5, borderColor: Colors.coral },

  cardTop: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   8,
  },
  badge: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            6,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderRadius:   Radius.full,
    borderWidth:    1,
  },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontFamily: Fonts.semibold, fontSize: 12 },

  latestTag: {
    backgroundColor: Colors.coral,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:   Radius.full,
  },
  latestTagText: { fontFamily: Fonts.medium, fontSize: 11, color: "#fff" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  metaText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight },

  predRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, marginBottom: 4 },
  predLabel: {
    fontFamily: Fonts.medium,
    fontSize:   12,
    color:      Colors.earth,
    backgroundColor: Colors.cream,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius: Radius.full,
  },
  predConf: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight },

  reason: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, marginTop: 4, lineHeight: 20 },
});