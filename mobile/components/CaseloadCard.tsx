// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// interface Props {
//   name: string;
//   household?: string;
//   ageHours: number | null;
//   dueToday: boolean;
//   overdue: boolean;
//   nextDay: number | null;
//   gestAge?: number;
//   onScreen: () => void;
//   onRemove: () => void;
// }

// export function CaseloadCard({ name, household, ageHours, dueToday, overdue, nextDay, gestAge, onScreen, onRemove }: Props) {
//   const ageDays = ageHours != null ? Math.floor(ageHours / 24) : null;
//   const ageStr  = ageDays != null ? (ageDays > 0 ? `Day ${ageDays}` : `${ageHours}h old`) : "Unknown";
//   const badgeBg = overdue ? Colors.rustPale : dueToday ? Colors.amberPale : Colors.sagePale;
//   const badgeColor = overdue ? Colors.rust : dueToday ? Colors.amberDark : Colors.sage;

//   return (
//     <View style={s.card}>
//       <View style={s.top}>
//         <View style={s.info}>
//           <Text style={s.name}>{name}</Text>
//           {household && <Text style={s.household}>{household}</Text>}
//           {gestAge && <Text style={s.gest}>{gestAge}wk gestation</Text>}
//         </View>
//         <View style={[s.badge, { backgroundColor: badgeBg }]}>
//           <Text style={[s.badgeText, { color: badgeColor }]}>{ageStr}</Text>
//         </View>
//       </View>
//       <View style={s.followup}>
//         <Ionicons name="calendar-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.followupText}>
//           {overdue ? "Follow-up period complete" : dueToday ? "Follow-up due TODAY" : nextDay ? `Next follow-up: Day ${nextDay}` : "Monitoring ongoing"}
//         </Text>
//       </View>
//       <View style={s.actions}>
//         <TouchableOpacity style={s.screenBtn} onPress={onScreen}>
//           <Text style={s.screenBtnText}>Screen this baby</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={s.removeBtn} onPress={onRemove}>
//           <Ionicons name="trash-outline" size={16} color={Colors.rust} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 12, ...Shadow.sm },
//   top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
//   info: { flex: 1 },
//   name: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   household: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
//   gest: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.amber, marginTop: 2 },
//   badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
//   badgeText: { fontFamily: Fonts.semibold, fontSize: 12 },
//   followup: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
//   followupText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1 },
//   actions: { flexDirection: "row", gap: 8 },
//   screenBtn: { flex: 1, backgroundColor: Colors.coral, borderRadius: Radius.md, paddingVertical: 9, alignItems: "center" },
//   screenBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
//   removeBtn: { borderWidth: 1.5, borderColor: Colors.rust, borderRadius: Radius.md, padding: 9, alignItems: "center", justifyContent: "center" },
// });


// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// interface Props {
//   name: string;
//   household?: string;
//   ageHours: number | null;
//   dueToday: boolean;
//   overdue: boolean;
//   nextDay: number | null;
//   gestAge?: number;
//   onScreen: () => void;
//   onRemove: () => void;
// }

// export function CaseloadCard({ name, household, ageHours, dueToday, overdue, nextDay, gestAge, onScreen, onRemove }: Props) {
//   const ageDays = ageHours != null ? Math.floor(ageHours / 24) : null;
//   const ageStr  = ageDays != null ? (ageDays > 0 ? `Day ${ageDays}` : `${ageHours}h old`) : "Unknown";
//   const badgeBg = overdue ? Colors.rustPale : dueToday ? Colors.amberPale : Colors.sagePale;
//   const badgeColor = overdue ? Colors.rust : dueToday ? Colors.amberDark : Colors.sage;

//   // Confirmation dialog prevents accidental case deletions during fast field taps
//   const handleRemovePress = () => {
//     Alert.alert(
//       "Remove Record",
//       `Are you sure you want to remove ${name} from your active caseload tracking list?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Remove", style: "destructive", onPress: onRemove }
//       ]
//     );
//   };

//   return (
//     <View style={s.card}>
//       <View style={s.top}>
//         <View style={s.info}>
//           <Text style={s.name}>{name}</Text>
//           {household && <Text style={s.household}>{household}</Text>}
//           {gestAge && <Text style={s.gest}>{gestAge}wk gestation</Text>}
//         </View>
//         <View style={[s.badge, { backgroundColor: badgeBg }]}>
//           <Text style={[s.badgeText, { color: badgeColor }]}>{ageStr}</Text>
//         </View>
//       </View>
//       <View style={s.followup}>
//         <Ionicons name="calendar-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.followupText}>
//           {/* Changed 'period complete' to a clear call-to-action alerting the worker to a delay */}
//           {overdue ? "Follow-up OVERDUE" : dueToday ? "Follow-up due TODAY" : nextDay ? `Next follow-up: Day ${nextDay}` : "Monitoring ongoing"}
//         </Text>
//       </View>
//       <View style={s.actions}>
//         <TouchableOpacity style={s.screenBtn} onPress={onScreen} activeOpacity={0.8}>
//           <Text style={s.screenBtnText}>Screen this baby</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={s.removeBtn} onPress={handleRemovePress} activeOpacity={0.7}>
//           <Ionicons name="trash-outline" size={16} color={Colors.rust} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 12, ...Shadow.sm },
//   top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
//   info: { flex: 1 },
//   name: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
//   household: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
//   gest: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.amber, marginTop: 2 },
//   badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
//   badgeText: { fontFamily: Fonts.semibold, fontSize: 12 },
//   followup: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
//   followupText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1 },
//   actions: { flexDirection: "row", gap: 8 },
//   screenBtn: { flex: 1, backgroundColor: Colors.coral, borderRadius: Radius.md, paddingVertical: 9, alignItems: "center" },
//   screenBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
//   removeBtn: { borderWidth: 1.5, borderColor: Colors.rust, borderRadius: Radius.md, padding: 9, alignItems: "center", justifyContent: "center" },
// });


import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

interface Props {
  name: string;
  household?: string;
  ageHours: number | null;
  dueToday: boolean;
  overdue: boolean;
  nextDay: number | null;
  gestAge?: number;
  onScreen: () => void;
  onRemove: () => void;
}

// Wrapped with React.memo to prevent layout paint degradation inside scroll queues
export const CaseloadCard = React.memo(
  function CaseloadCard({ 
    name, household, ageHours, dueToday, overdue, nextDay, gestAge, onScreen, onRemove 
  }: Props) {
    const ageDays = ageHours != null ? Math.floor(ageHours / 24) : null;
    const ageStr  = ageDays != null ? (ageDays > 0 ? `Day ${ageDays}` : `${ageHours}h old`) : "Unknown";
    
    // Fallback configurations for fallback UI properties
    const badgeBg = overdue ? Colors.rustPale : dueToday ? Colors.amberPale : Colors.sagePale;
    const badgeColor = overdue ? Colors.rust : dueToday ? Colors.amberDark : Colors.sage;

    // Confirmation dialog prevents accidental case deletions during fast field taps
    const handleRemovePress = () => {
      Alert.alert(
        "Remove Record",
        `Are you sure you want to remove ${name} from your active caseload tracking list?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: onRemove }
        ]
      );
    };

    return (
      <View style={s.card}>
        <View style={s.top}>
          <View style={s.info}>
            <Text style={s.name} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>
            {household && (
              <Text style={s.household} numberOfLines={1} ellipsizeMode="tail">
                {household}
              </Text>
            )}
            {gestAge && <Text style={s.gest}>{gestAge}wk gestation</Text>}
          </View>
          <View style={[s.badge, { backgroundColor: badgeBg }]}>
            <Text style={[s.badgeText, { color: badgeColor }]} numberOfLines={1}>
              {ageStr}
            </Text>
          </View>
        </View>

        <View style={s.followup}>
          <Ionicons name="calendar-outline" size={13} color={Colors.brownLight} />
          <Text style={s.followupText} numberOfLines={1} ellipsizeMode="tail">
            {overdue ? "Follow-up OVERDUE" : dueToday ? "Follow-up due TODAY" : nextDay ? `Next follow-up: Day ${nextDay}` : "Monitoring ongoing"}
          </Text>
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={s.screenBtn} onPress={onScreen} activeOpacity={0.8}>
            <Text style={s.screenBtnText}>Screen this baby</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.removeBtn} onPress={handleRemovePress} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color={Colors.rust} />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  // Deep comparison criteria ensuring structural safety hooks trigger re-evaluations
  (prev, next) => 
    prev.name === next.name &&
    prev.household === next.household &&
    prev.ageHours === next.ageHours &&
    prev.dueToday === next.dueToday &&
    prev.overdue === next.overdue &&
    prev.nextDay === next.nextDay &&
    prev.gestAge === next.gestAge
);

const s = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 12, ...Shadow.sm },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  info: { flex: 1 },
  name: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.earth },
  household: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
  gest: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.amber, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, minWidth: 60, alignItems: "center" },
  badgeText: { fontFamily: Fonts.semibold, fontSize: 12 },
  followup: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  followupText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  screenBtn: { flex: 1, backgroundColor: Colors.coral, borderRadius: Radius.md, paddingVertical: 9, alignItems: "center" },
  screenBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
  removeBtn: { borderWidth: 1.5, borderColor: Colors.rust, borderRadius: Radius.md, padding: 9, alignItems: "center", justifyContent: "center" },
});