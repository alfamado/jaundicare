// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

// interface Props {
//   babyName: string;
//   dayNumber: number;
//   dueDate: string;
//   isOverdue: boolean;
//   onDismiss: () => void;
// }

// export function ReminderCard({ babyName, dayNumber, dueDate, isOverdue, onDismiss }: Props) {
//   return (
//     <View style={[s.card, isOverdue && s.cardOverdue]}>
//       <View style={s.left}>
//         <View style={[s.iconWrap, { backgroundColor: isOverdue ? Colors.rustPale : Colors.amberPale }]}>
//           <Ionicons name="alarm-outline" size={18} color={isOverdue ? Colors.rust : Colors.amberDark} />
//         </View>
//       </View>
//       <View style={s.content}>
//         <Text style={s.title}>{babyName} — Day {dayNumber} Follow-up</Text>
//         <Text style={s.due}>{isOverdue ? "Overdue: " : "Due: "}{dueDate}</Text>
//       </View>
//       {/* Increased padding for an easier tap target on real mobile devices */}
//       <TouchableOpacity onPress={onDismiss} style={s.dismiss} activeOpacity={0.7}>
//         <Ionicons name="checkmark-circle-outline" size={22} color={Colors.sage} />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   card: { 
//     backgroundColor: Colors.card, 
//     borderRadius: Radius.lg, 
//     padding: 12, 
//     flexDirection: "row", 
//     alignItems: "center", 
//     gap: 10, 
//     marginBottom: 10, 
//     ...Shadow.sm, 
//     borderLeftWidth: 3, 
//     borderLeftColor: Colors.amber 
//   },
//   cardOverdue: { borderLeftColor: Colors.rust },
//   left: {},
//   iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
//   content: { flex: 1 },
//   title: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth },
//   due: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
//   dismiss: { 
//     padding: 10, // Generous target size makes it easy to click while active in the field
//     marginRight: -4, // Counteracts visual padding drift so layout remains perfectly square
//   },
// });



import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";

interface Props {
  babyName: string;
  dayNumber: number;
  dueDate: string;
  isOverdue: boolean;
  onDismiss: () => void;
}

export const ReminderCard = React.memo(
  function ReminderCard({ babyName, dayNumber, dueDate, isOverdue, onDismiss }: Props) {
    return (
      <View style={[s.card, isOverdue && s.cardOverdue]}>
        <View style={s.left}>
          <View style={[s.iconWrap, { backgroundColor: isOverdue ? Colors.rustPale : Colors.amberPale }]}>
            <Ionicons name="alarm-outline" size={18} color={isOverdue ? Colors.rust : Colors.amberDark} />
          </View>
        </View>
        
        <View style={s.content}>
          <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">
            {babyName} — Day {dayNumber} Follow-up
          </Text>
          <Text style={s.due} numberOfLines={1}>
            {isOverdue ? "Overdue: " : "Due: "}{dueDate}
          </Text>
        </View>

        {/* Leverage hitSlop parameter to enlarge target zone without shifting bounding boxes */}
        <TouchableOpacity 
          onPress={onDismiss} 
          style={s.dismiss} 
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={Colors.sage} />
        </TouchableOpacity>
      </View>
    );
  },
  // Explicitly prevent unnecessary layout invalidations across list renders
  (prev, next) =>
    prev.babyName === next.babyName &&
    prev.dayNumber === next.dayNumber &&
    prev.dueDate === next.dueDate &&
    prev.isOverdue === next.isOverdue
);

const s = StyleSheet.create({
  card: { 
    backgroundColor: Colors.card, 
    borderRadius: Radius.lg, 
    padding: 12, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10, 
    marginBottom: 10, 
    ...Shadow.sm, 
    borderLeftWidth: 3, 
    borderLeftColor: Colors.amber 
  },
  cardOverdue: { borderLeftColor: Colors.rust },
  left: {},
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, justifyContent: "center" },
  title: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth, lineHeight: 18 },
  due: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2, lineHeight: 16 },
  dismiss: { 
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
});