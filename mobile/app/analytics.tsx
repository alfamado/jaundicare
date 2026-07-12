// import React from "react";
// import { View, Text, ScrollView, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppStore } from "../../store/appStore";
// import { useCaseload } from "../../hooks/useCaseload";
// import { useScreeningHistory } from "../../hooks/useScreening";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";

// const DECISION_LABELS: Record<string, { label: string; color: string }> = {
//   URGENT_HOSPITAL_REVIEW:              { label: "Urgent",      color: Colors.rust  },
//   SAME_DAY_CLINIC_REVIEW:              { label: "Same-day",    color: Colors.amber },
//   RECHECK_SOON_OR_CLINIC_IF_CONCERNED: { label: "Recheck",     color: "#F0C040"    },
//   MONITOR_AT_HOME:                     { label: "Monitor",     color: Colors.sage  },
// };

// export default function AnalyticsScreen() {
//   const { data: history = [] } = useScreeningHistory();
//   const { caseload, dueToday, overdue } = useCaseload();

//   const total = history.length;

//   const distribution = history.reduce<Record<string, number>>((acc, s) => {
//     const key = s.final_decision;
//     acc[key] = (acc[key] ?? 0) + 1;
//     return acc;
//   }, {});

//   const urgentCount = (distribution["URGENT_HOSPITAL_REVIEW"] ?? 0);
//   const sameDayCount = (distribution["SAME_DAY_CLINIC_REVIEW"] ?? 0);
//   const recheckCount = (distribution["RECHECK_SOON_OR_CLINIC_IF_CONCERNED"] ?? 0);
//   const monitorCount = (distribution["MONITOR_AT_HOME"] ?? 0);

//   const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: any }) => (
//     <View style={[s.statCard, { borderLeftColor: color }]}>
//       <Ionicons name={icon} size={20} color={color} />
//       <Text style={[s.statValue, { color }]}>{value}</Text>
//       <Text style={s.statLabel}>{label}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView contentContainerStyle={s.content}>
//         <Text style={s.heading}>Analytics</Text>
//         <Text style={s.sub}>Community screening summary for your caseload.</Text>

//         {/* Summary stats */}
//         <View style={s.statsGrid}>
//           <StatCard label="Total screenings" value={total}        color={Colors.coral}  icon="scan-outline" />
//           <StatCard label="Active cases"      value={caseload.length} color={Colors.amber} icon="people-outline" />
//           <StatCard label="Due today"         value={dueToday.length} color={Colors.sage}  icon="calendar-outline" />
//           <StatCard label="Overdue"           value={overdue.length}  color={Colors.rust}  icon="alert-circle-outline" />
//         </View>

//         {/* Triage distribution */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Triage Distribution</Text>
//           {total === 0 ? (
//             <Text style={s.emptyText}>No screenings recorded yet.</Text>
//           ) : (
//             [
//               { key: "URGENT_HOSPITAL_REVIEW",              count: urgentCount,   ...DECISION_LABELS["URGENT_HOSPITAL_REVIEW"] },
//               { key: "SAME_DAY_CLINIC_REVIEW",              count: sameDayCount,  ...DECISION_LABELS["SAME_DAY_CLINIC_REVIEW"] },
//               { key: "RECHECK_SOON_OR_CLINIC_IF_CONCERNED", count: recheckCount,  ...DECISION_LABELS["RECHECK_SOON_OR_CLINIC_IF_CONCERNED"] },
//               { key: "MONITOR_AT_HOME",                     count: monitorCount,  ...DECISION_LABELS["MONITOR_AT_HOME"] },
//             ].map((row) => (
//               <View key={row.key} style={s.distRow}>
//                 <View style={[s.distDot, { backgroundColor: row.color }]} />
//                 <Text style={s.distLabel}>{row.label}</Text>
//                 <View style={s.distBarWrap}>
//                   <View style={[s.distBar, { width: `${total > 0 ? (row.count / total) * 100 : 0}%`, backgroundColor: row.color }]} />
//                 </View>
//                 <Text style={s.distCount}>{row.count}</Text>
//               </View>
//             ))
//           )}
//         </View>

//         {/* Active follow-ups */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Active Follow-ups</Text>
//           {dueToday.length === 0 && overdue.length === 0 ? (
//             <Text style={s.emptyText}>No follow-ups pending.</Text>
//           ) : (
//             <>
//               {dueToday.map((c) => (
//                 <View key={c.id} style={s.followupRow}>
//                   <View style={[s.followupDot, { backgroundColor: Colors.amber }]} />
//                   <Text style={s.followupName}>{c.name}</Text>
//                   <Text style={s.followupStatus}>Due today</Text>
//                 </View>
//               ))}
//               {overdue.map((c) => (
//                 <View key={c.id} style={s.followupRow}>
//                   <View style={[s.followupDot, { backgroundColor: Colors.rust }]} />
//                   <Text style={s.followupName}>{c.name}</Text>
//                   <Text style={[s.followupStatus, { color: Colors.rust }]}>Overdue</Text>
//                 </View>
//               ))}
//             </>
//           )}
//         </View>

//         <View style={s.disclaimer}>
//           <Ionicons name="information-circle-outline" size={14} color={Colors.brownLight} />
//           <Text style={s.disclaimerText}>
//             Data shown reflects screenings recorded in this app only. It is not a complete epidemiological record.
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
//   sub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 16 },
//   statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
//   statCard: {
//     backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14,
//     width: "47%", borderLeftWidth: 3, alignItems: "center", gap: 4, ...Shadow.sm,
//   },
//   statValue: { fontFamily: Fonts.bold, fontSize: 26 },
//   statLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, marginBottom: 14, ...Shadow.sm },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 12 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
//   distRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
//   distDot: { width: 8, height: 8, borderRadius: 4 },
//   distLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.earth, width: 70 },
//   distBarWrap: { flex: 1, height: 8, backgroundColor: Colors.cream, borderRadius: 4, overflow: "hidden" },
//   distBar: { height: 8, borderRadius: 4 },
//   distCount: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.earth, width: 24, textAlign: "right" },
//   followupRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
//   followupDot: { width: 8, height: 8, borderRadius: 4 },
//   followupName: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, flex: 1 },
//   followupStatus: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.amber },
//   disclaimer: { flexDirection: "row", gap: 6, backgroundColor: Colors.amberPale, borderRadius: Radius.md, padding: 12, alignItems: "flex-start" },
//   disclaimerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1, lineHeight: 18 },
// });


// import React from "react";
// import { View, Text, ScrollView, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useCaseload } from "../hooks/useCaseload";
// import { useHistory } from "../hooks/useHistory";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// const DECISION_LABELS: Record<string, { label: string; color: string }> = {
//   URGENT:   { label: "Urgent",   color: Colors.rust  },
//   SAMEDAY:  { label: "Same-day", color: Colors.amber },
//   RECHECK:  { label: "Recheck",  color: "#F0C040"    },
//   MONITOR:  { label: "Monitor",  color: Colors.sage  },
// };

// export default function AnalyticsScreen() {
//   // Pulling directly from your unified useHistory hook to ensure offline states count
//   const { history = [], totalCount: total } = useHistory();
//   const { caseload, dueToday, overdue } = useCaseload();

//   // Reducer checks server codes and local offline fallback tokens safely
//   const distribution = history.reduce<Record<string, number>>((acc, s) => {
//     const rawKey = s.triage_level?.toUpperCase() || "";
    
//     if (rawKey.includes("HOSPITAL") || rawKey === "RED") {
//       acc["URGENT"] = (acc["URGENT"] ?? 0) + 1;
//     } else if (rawKey.includes("CLINIC_REVIEW") || rawKey === "AMBER") {
//       acc["SAMEDAY"] = (acc["SAMEDAY"] ?? 0) + 1;
//     } else if (rawKey.includes("RECHECK")) {
//       acc["RECHECK"] = (acc["RECHECK"] ?? 0) + 1;
//     } else {
//       acc["MONITOR"] = (acc["MONITOR"] ?? 0) + 1;
//     }
//     return acc;
//   }, {});

//   const urgentCount  = distribution["URGENT"]  ?? 0;
//   const sameDayCount = distribution["SAMEDAY"] ?? 0;
//   const recheckCount = distribution["RECHECK"] ?? 0;
//   const monitorCount = distribution["MONITOR"] ?? 0;

//   const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: any }) => (
//     <View style={[s.statCard, { borderLeftColor: color }]}>
//       <Ionicons name={icon} size={20} color={color} />
//       <Text style={[s.statValue, { color }]}>{value}</Text>
//       <Text style={s.statLabel}>{label}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
//         <Text style={s.heading}>Analytics</Text>
//         <Text style={s.sub}>Community screening summary for your caseload.</Text>

//         {/* Dynamic Summary Layout Grid */}
//         <View style={s.statsGrid}>
//           <StatCard label="Total screenings" value={total}          color={Colors.coral}  icon="scan-outline" />
//           <StatCard label="Active cases"      value={caseload.length} color={Colors.amber} icon="people-outline" />
//           <StatCard label="Due today"         value={dueToday.length} color={Colors.sage}  icon="calendar-outline" />
//           <StatCard label="Overdue"           value={overdue.length}  color={Colors.rust}  icon="alert-circle-outline" />
//         </View>

//         {/* Dynamic Triage Distribution Module */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Triage Distribution</Text>
//           {total === 0 ? (
//             <Text style={s.emptyText}>No screenings recorded yet.</Text>
//           ) : (
//             [
//               { key: "URGENT",  count: urgentCount,  ...DECISION_LABELS["URGENT"]  },
//               { key: "SAMEDAY", count: sameDayCount, ...DECISION_LABELS["SAMEDAY"] },
//               { key: "RECHECK", count: recheckCount, ...DECISION_LABELS["RECHECK"] },
//               { key: "MONITOR", count: monitorCount, ...DECISION_LABELS["MONITOR"] },
//             ].map((row) => (
//               <View key={row.key} style={s.distRow}>
//                 <View style={[s.distDot, { backgroundColor: row.color }]} />
//                 <Text style={s.distLabel}>{row.label}</Text>
//                 <View style={s.distBarWrap}>
//                   <View style={[s.distBar, { width: `${total > 0 ? (row.count / total) * 100 : 0}%`, backgroundColor: row.color }]} />
//                 </View>
//                 <Text style={s.distCount}>{row.count}</Text>
//               </View>
//             ))
//           )}
//         </View>

//         {/* Active Follow-ups List Layout Panel */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Active Follow-ups</Text>
//           {dueToday.length === 0 && overdue.length === 0 ? (
//             <Text style={s.emptyText}>No follow-ups pending.</Text>
//           ) : (
//             <>
//               {dueToday.map((c) => (
//                 <View key={c.id} style={s.followupRow}>
//                   <View style={[s.followupDot, { backgroundColor: Colors.amber }]} />
//                   <Text style={s.followupName}>{c.name}</Text>
//                   <Text style={s.followupStatus}>Due today</Text>
//                 </View>
//               ))}
//               {overdue.map((c) => (
//                 <View key={c.id} style={s.followupRow}>
//                   <View style={[s.followupDot, { backgroundColor: Colors.rust }]} />
//                   <Text style={s.followupName}>{c.name}</Text>
//                   <Text style={[s.followupStatus, { color: Colors.rust }]}>Overdue</Text>
//                 </View>
//               ))}
//             </>
//           )}
//         </View>

//         <View style={s.disclaimer}>
//           <Ionicons name="information-circle-outline" size={14} color={Colors.brownLight} />
//           <Text style={s.disclaimerText}>
//             Data shown reflects screenings recorded in this app only. It is not a complete epidemiological record.
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
//   sub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 16 },
//   statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
//   statCard: {
//     backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14,
//     flexGrow: 1, flexBasis: "45%", borderLeftWidth: 3, alignItems: "center", gap: 4, ...Shadow.sm,
//   },
//   statValue: { fontFamily: Fonts.bold, fontSize: 26 },
//   statLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, marginBottom: 14, ...Shadow.sm },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 12 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
//   distRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
//   distDot: { width: 8, height: 8, borderRadius: 4 },
//   distLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.earth, width: 70 },
//   distBarWrap: { flex: 1, height: 8, backgroundColor: Colors.cream, borderRadius: 4, overflow: "hidden" },
//   distBar: { height: 8, borderRadius: 4 },
//   distCount: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.earth, width: 24, textAlign: "right" },
//   followupRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
//   followupDot: { width: 8, height: 8, borderRadius: 4 },
//   followupName: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, flex: 1 },
//   followupStatus: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.amber },
//   disclaimer: { flexDirection: "row", gap: 6, backgroundColor: Colors.amberPale, borderRadius: Radius.md, padding: 12, alignItems: "flex-start" },
//   disclaimerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1, lineHeight: 18 },
// });




/**
 * JaundiCare — Scalable Case Analytics Panel
 * Normalizes triage state logs across localized fallback layers and 
 * provides protective data-rendering boundaries for performance optimization.
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCaseload } from "../hooks/useCaseload";
import { useHistory } from "../hooks/useHistory";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

const DECISION_LABELS: Record<string, { label: string; color: string }> = {
  URGENT:   { label: "Urgent",   color: Colors.rust  },
  SAMEDAY:  { label: "Same-day", color: Colors.amber },
  RECHECK:  { label: "Recheck",  color: "#F0C040"    },
  MONITOR:  { label: "Monitor",  color: Colors.sage  },
};

export default function AnalyticsScreen() {
  const { history = [], totalCount: total } = useHistory();
  const { caseload, dueToday, overdue } = useCaseload();

  // Robust triage distribution normalizer
  const distribution = React.useMemo(() => {
    return history.reduce<Record<string, number>>((acc, s) => {
      const rawKey = (s.triage_level || "").toUpperCase().trim();
      
      // Catches formal server logs alongside localized baseline tokens safely
      if (
        rawKey.includes("HOSPITAL") || 
        rawKey.includes("ILE IWOSAN") || 
        rawKey.includes("HOSPITU") || 
        rawKey === "RED"
      ) {
        acc["URGENT"] = (acc["URGENT"] ?? 0) + 1;
      } else if (
        rawKey.includes("CLINIC_REVIEW") || 
        rawKey.includes("SUGBON") || 
        rawKey === "AMBER"
      ) {
        acc["SAMEDAY"] = (acc["SAMEDAY"] ?? 0) + 1;
      } else if (rawKey.includes("RECHECK")) {
        acc["RECHECK"] = (acc["RECHECK"] ?? 0) + 1;
      } else {
        acc["MONITOR"] = (acc["MONITOR"] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [history]);

  const urgentCount  = distribution["URGENT"]  ?? 0;
  const sameDayCount = distribution["SAMEDAY"] ?? 0;
  const recheckCount = distribution["RECHECK"] ?? 0;
  const monitorCount = distribution["MONITOR"] ?? 0;

  const totalFollowupsCount = dueToday.length + overdue.length;

  const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: any }) => (
    <View style={[s.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>Analytics</Text>
        <Text style={s.sub}>Community screening summary for your caseload.</Text>

        <View style={s.statsGrid}>
          <StatCard label="Total screenings" value={total}          color={Colors.coral}  icon="scan-outline" />
          <StatCard label="Active cases"      value={caseload.length} color={Colors.amber} icon="people-outline" />
          <StatCard label="Due today"         value={dueToday.length} color={Colors.sage}  icon="calendar-outline" />
          <StatCard label="Overdue"           value={overdue.length}  color={Colors.rust}  icon="alert-circle-outline" />
        </View>

        {/* Triage Distribution Module */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Triage Distribution</Text>
          {total === 0 ? (
            <Text style={s.emptyText}>No screenings recorded yet.</Text>
          ) : (
            [
              { key: "URGENT",  count: urgentCount,  ...DECISION_LABELS["URGENT"]  },
              { key: "SAMEDAY", count: sameDayCount, ...DECISION_LABELS["SAMEDAY"] },
              { key: "RECHECK", count: recheckCount, ...DECISION_LABELS["RECHECK"] },
              { key: "MONITOR", count: monitorCount, ...DECISION_LABELS["MONITOR"] },
            ].map((row) => {
              const percentage = total > 0 ? (row.count / total) * 100 : 0;
              return (
                <View key={row.key} style={s.distRow}>
                  <View style={[s.distDot, { backgroundColor: row.color }]} />
                  <Text style={s.distLabel}>{row.label}</Text>
                  <View style={s.distBarWrap}>
                    <View style={[s.distBar, { width: `${percentage}%`, backgroundColor: row.color }]} />
                  </View>
                  <Text style={s.distCount}>{row.count}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Active Follow-ups List Layout Panel */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Active Follow-ups</Text>
          {totalFollowupsCount === 0 ? (
            <Text style={s.emptyText}>No follow-ups pending.</Text>
          ) : (
            <>
              {/* Slice constraints protect layout pass overhead from heavy logs */}
              {dueToday.slice(0, 5).map((c) => (
                <View key={`due_${c.id}`} style={s.followupRow}>
                  <View style={[s.followupDot, { backgroundColor: Colors.amber }]} />
                  <Text style={s.followupName} numberOfLines={1}>{c.name}</Text>
                  <Text style={s.followupStatus}>Due today</Text>
                </View>
              ))}
              {overdue.slice(0, 5).map((c) => (
                <View key={`overdue_${c.id}`} style={s.followupRow}>
                  <View style={[s.followupDot, { backgroundColor: Colors.rust }]} />
                  <Text style={s.followupName} numberOfLines={1}>{c.name}</Text>
                  <Text style={[s.followupStatus, { color: Colors.rust }]}>Overdue</Text>
                </View>
              ))}
              
              {totalFollowupsCount > 5 && (
                <Text style={s.limitNotice}>
                  Showing first 5 items. Check your Caseload list tab to view all remaining follow-ups.
                </Text>
              )}
            </>
          )}
        </View>

        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.brownLight} />
          <Text style={s.disclaimerText}>
            Data shown reflects screenings recorded in this app only. It is not a complete epidemiological record.
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
  sub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, marginBottom: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14,
    flexGrow: 1, flexBasis: "45%", borderLeftWidth: 3, alignItems: "center", gap: 4, ...Shadow.sm,
  },
  statValue: { fontFamily: Fonts.bold, fontSize: 26 },
  statLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center" },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16, marginBottom: 14, ...Shadow.sm },
  cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth, marginBottom: 12 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
  distRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  distDot: { width: 8, height: 8, borderRadius: 4 },
  distLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.earth, width: 70 },
  distBarWrap: { flex: 1, height: 8, backgroundColor: Colors.cream, borderRadius: 4, overflow: "hidden" },
  distBar: { height: 8, borderRadius: 4 },
  distCount: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.earth, width: 24, textAlign: "right" },
  followupRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  followupDot: { width: 8, height: 8, borderRadius: 4 },
  followupName: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth, flex: 1 },
  followupStatus: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.amber },
  limitNotice: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.brownLight, textAlign: "center", marginTop: 10, fontStyle: "italic" },
  disclaimer: { flexDirection: "row", gap: 6, backgroundColor: Colors.amberPale, borderRadius: Radius.md, padding: 12, alignItems: "flex-start" },
  disclaimerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1, lineHeight: 18 },
});