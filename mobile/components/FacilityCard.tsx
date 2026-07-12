// import React from "react";
// import {
//   View, Text, TouchableOpacity, Linking, StyleSheet,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
// import type { Facility } from "../services/api";

// interface Props {
//   facility: Facility;
// }

// function titleCase(str: string) {
//   return str.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
// }

// const typeColors: Record<string, { bg: string; text: string }> = {
//   tertiary:  { bg: "#fdecea", text: Colors.rust },
//   secondary: { bg: Colors.amberPale, text: Colors.amberDark },
//   primary:   { bg: Colors.sagePale, text: Colors.sage },
// };

// export function FacilityCard({ facility: f }: Props) {
//   const typeStyle = typeColors[f.type] ?? typeColors.primary;

//   const openMaps = () => {
//     if (!f.latitude || !f.longitude) return;
//     const url = `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
//     Linking.openURL(url);
//   };

//   const callPhone = () => {
//     if (!f.phone) return;
//     Linking.openURL(`tel:${f.phone}`);
//   };

//   const distanceText = f.distance_km != null
//     ? `${f.distance_km} km away`
//     : "📋 State lookup";

//   return (
//     <View style={s.card}>
//       <View style={s.header}>
//         <Text style={s.name} numberOfLines={2}>{f.name}</Text>
//         <View style={[s.typeBadge, { backgroundColor: typeStyle.bg }]}>
//           <Text style={[s.typeText, { color: typeStyle.text }]}>{titleCase(f.type)}</Text>
//         </View>
//       </View>

//       {f.fallback_note && (
//         <View style={s.fallbackBanner}>
//           <Ionicons name="information-circle-outline" size={13} color={Colors.amberDark} />
//           <Text style={s.fallbackText}>{f.fallback_note}</Text>
//         </View>
//       )}

//       <View style={s.metaRow}>
//         <Ionicons name="location-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{f.address}</Text>
//       </View>

//       <View style={s.metaRow}>
//         <Ionicons name="navigate-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{distanceText}</Text>
//       </View>

//       {f.phone && (
//         <View style={s.metaRow}>
//           <Ionicons name="call-outline" size={13} color={Colors.brownLight} />
//           <Text style={s.metaText}>{f.phone}</Text>
//         </View>
//       )}

//       {/* Services */}
//       <View style={s.services}>
//         {(f.services || []).map((svc) => (
//           <View key={svc} style={s.serviceChip}>
//             <Text style={s.serviceText}>{titleCase(svc)}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Actions */}
//       <View style={s.actions}>
//         {f.phone && (
//           <TouchableOpacity style={s.callBtn} onPress={callPhone}>
//             <Ionicons name="call" size={14} color="#fff" />
//             <Text style={s.callBtnText}>Call</Text>
//           </TouchableOpacity>
//         )}
//         {f.latitude && f.longitude && (
//           <TouchableOpacity style={s.mapBtn} onPress={openMaps}>
//             <Ionicons name="map-outline" size={14} color={Colors.coral} />
//             <Text style={s.mapBtnText}>Directions</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 14,
//     marginBottom: 10,
//     ...Shadow.sm,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 8,
//     gap: 8,
//   },
//   name: {
//     fontFamily: Fonts.semibold,
//     fontSize: 14,
//     color: Colors.earth,
//     flex: 1,
//   },
//   typeBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   typeText: { fontFamily: Fonts.medium, fontSize: 11 },

//   fallbackBanner: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     backgroundColor: Colors.amberPale,
//     borderRadius: Radius.sm,
//     padding: 8,
//     marginBottom: 8,
//   },
//   fallbackText: {
//     fontFamily: Fonts.regular,
//     fontSize: 11,
//     color: Colors.amberDark,
//     flex: 1,
//     lineHeight: 16,
//   },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     marginBottom: 4,
//   },
//   metaText: {
//     fontFamily: Fonts.regular,
//     fontSize: 12,
//     color: Colors.brownLight,
//     flex: 1,
//   },

//   services: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 6,
//     marginTop: 8,
//     marginBottom: 10,
//   },
//   serviceChip: {
//     backgroundColor: Colors.sagePale,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   serviceText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.sage },

//   actions: { flexDirection: "row", gap: 8 },
//   callBtn: {
//     flex: 1,
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   callBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
//   mapBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   mapBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.coral },
// });

// /**
//  * JaundiCare — FacilityCard component
//  * Displays a single recommended health facility.
//  * Shows inferred display type instead of raw OSM type tag.
//  */

// import React from "react";
// import {
//   View, Text, TouchableOpacity, Linking, StyleSheet,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
// import type { Facility } from "../services/api";

// interface Props {
//   facility: Facility;
// }

// function inferDisplayType(name: string, rawType: string): { label: string; bg: string; text: string } {
//   const n = name.toLowerCase();

//   if (
//     n.includes("federal") || n.includes("teaching hospital") ||
//     n.includes("university") || n.includes("national hospital") ||
//     n.includes("fmc") || n.includes("luth") || n.includes("oouth")
//   ) {
//     return { label: "Federal", bg: "#fdecea", text: Colors.rust };
//   }
//   if (
//     n.includes("general hospital") || n.includes("state hospital") ||
//     n.includes("state specialist") || n.includes("government")
//   ) {
//     return { label: "State", bg: Colors.amberPale, text: Colors.amberDark };
//   }
//   if (
//     n.includes("catholic") || n.includes("methodist") ||
//     n.includes("mission") || n.includes("missionary") ||
//     n.includes("redeemed") || n.includes("church") ||
//     n.includes("christian") || n.includes("baptist")
//   ) {
//     return { label: "Mission", bg: "#f0f4ff", text: "#4a6fa5" };
//   }
//   if (rawType === "tertiary") {
//     return { label: "Specialist", bg: Colors.sagePale, text: Colors.sage };
//   }
//   if (rawType === "secondary") {
//     return { label: "General", bg: Colors.cream, text: Colors.brownLight };
//   }
//   return { label: "Clinic", bg: Colors.cream, text: Colors.brownLight };
// }

// export function FacilityCard({ facility: f }: Props) {
//   const typeInfo = inferDisplayType(f.name, f.type);

//   const openMaps = () => {
//     if (!f.latitude || !f.longitude) return;
//     const url = `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
//     Linking.openURL(url);
//   };

//   const callPhone = () => {
//     if (!f.phone) return;
//     Linking.openURL(`tel:${f.phone}`);
//   };

//   const distanceText = f.distance_km != null
//     ? `${f.distance_km} km away`
//     : "Distance unknown";

//   function titleCase(str: string) {
//     return str.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
//   }

//   return (
//     <View style={s.card}>
//       <View style={s.header}>
//         <Text style={s.name} numberOfLines={2}>{f.name}</Text>
//         <View style={[s.typeBadge, { backgroundColor: typeInfo.bg }]}>
//           <Text style={[s.typeText, { color: typeInfo.text }]}>{typeInfo.label}</Text>
//         </View>
//       </View>

//       {f.fallback_note && (
//         <View style={s.fallbackBanner}>
//           <Ionicons name="information-circle-outline" size={13} color={Colors.amberDark} />
//           <Text style={s.fallbackText}>{f.fallback_note}</Text>
//         </View>
//       )}

//       <View style={s.metaRow}>
//         <Ionicons name="location-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{f.address}</Text>
//       </View>

//       <View style={s.metaRow}>
//         <Ionicons name="navigate-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{distanceText}</Text>
//       </View>

//       {f.phone && (
//         <View style={s.metaRow}>
//           <Ionicons name="call-outline" size={13} color={Colors.brownLight} />
//           <Text style={s.metaText}>{f.phone}</Text>
//         </View>
//       )}

//       {/* Services */}
//       {f.services && f.services.length > 0 && (
//         <View style={s.services}>
//           {f.services.map((svc) => (
//             <View key={svc} style={s.serviceChip}>
//               <Text style={s.serviceText}>{titleCase(svc)}</Text>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Actions */}
//       <View style={s.actions}>
//         {f.phone && (
//           <TouchableOpacity style={s.callBtn} onPress={callPhone}>
//             <Ionicons name="call" size={14} color="#fff" />
//             <Text style={s.callBtnText}>Call</Text>
//           </TouchableOpacity>
//         )}
//         {f.latitude && f.longitude && (
//           <TouchableOpacity
//             style={[s.mapBtn, !f.phone && { flex: 1 }]}
//             onPress={openMaps}
//           >
//             <Ionicons name="map-outline" size={14} color={Colors.coral} />
//             <Text style={s.mapBtnText}>Directions</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 14,
//     marginBottom: 10,
//     ...Shadow.sm,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 8,
//     gap: 8,
//   },
//   name: {
//     fontFamily: Fonts.semibold,
//     fontSize: 14,
//     color: Colors.earth,
//     flex: 1,
//   },
//   typeBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   typeText: { fontFamily: Fonts.medium, fontSize: 11 },

//   fallbackBanner: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     backgroundColor: Colors.amberPale,
//     borderRadius: Radius.sm,
//     padding: 8,
//     marginBottom: 8,
//   },
//   fallbackText: {
//     fontFamily: Fonts.regular,
//     fontSize: 11,
//     color: Colors.amberDark,
//     flex: 1,
//     lineHeight: 16,
//   },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     marginBottom: 4,
//   },
//   metaText: {
//     fontFamily: Fonts.regular,
//     fontSize: 12,
//     color: Colors.brownLight,
//     flex: 1,
//   },

//   services: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 6,
//     marginTop: 8,
//     marginBottom: 10,
//   },
//   serviceChip: {
//     backgroundColor: Colors.sagePale,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   serviceText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.sage },

//   actions: { flexDirection: "row", gap: 8 },
//   callBtn: {
//     flex: 1,
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   callBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
//   mapBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   mapBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.coral },
// });



/**
 * JaundiCare — FacilityCard component
 * Displays a single recommended health facility.
 * Shows inferred display type instead of raw OSM type tag.
 */

// import React from "react";
// import {
//   View, Text, TouchableOpacity, Linking, StyleSheet,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
// import type { Facility } from "../services/api";

// interface Props {
//   facility: Facility;
// }

// function inferDisplayType(name: string, rawType: string): { label: string; bg: string; text: string } {
//   const n = name.toLowerCase();

//   if (
//     n.includes("federal") || n.includes("teaching hospital") ||
//     n.includes("university") || n.includes("national hospital") ||
//     n.includes("fmc") || n.includes("luth") || n.includes("oouth")
//   ) {
//     return { label: "Federal", bg: "#fdecea", text: Colors.rust };
//   }
//   if (
//     n.includes("general hospital") || n.includes("state hospital") ||
//     n.includes("state specialist") || n.includes("government")
//   ) {
//     return { label: "State", bg: Colors.amberPale, text: Colors.amberDark };
//   }
//   if (
//     n.includes("catholic") || n.includes("methodist") ||
//     n.includes("mission") || n.includes("missionary") ||
//     n.includes("redeemed") || n.includes("church") ||
//     n.includes("christian") || n.includes("baptist")
//   ) {
//     return { label: "Mission", bg: "#f0f4ff", text: "#4a6fa5" };
//   }
//   if (rawType === "tertiary") {
//     return { label: "Specialist", bg: Colors.sagePale, text: Colors.sage };
//   }
//   if (rawType === "secondary") {
//     return { label: "General", bg: Colors.cream, text: Colors.brownLight };
//   }
//   return { label: "Clinic", bg: Colors.cream, text: Colors.brownLight };
// }

// // Wrapped with React.memo to ensure it does not re-render unless its specific facility entry data parameters change
// export const FacilityCard = React.memo(function FacilityCard({ facility: f }: Props) {
//   const typeInfo = inferDisplayType(f.name, f.type);

//   const openMaps = () => {
//     if (!f.latitude || !f.longitude) return;
//     const url = `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
//     Linking.openURL(url);
//   };

//   const callPhone = () => {
//     if (!f.phone) return;
//     Linking.openURL(`tel:${f.phone}`);
//   };

//   const distanceText = f.distance_km != null
//     ? `${f.distance_km} km away`
//     : "Distance unknown";

//   function titleCase(str: string) {
//     return str.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
//   }

//   return (
//     <View style={s.card}>
//       <View style={s.header}>
//         <Text style={s.name} numberOfLines={2}>{f.name}</Text>
//         <View style={[s.typeBadge, { backgroundColor: typeInfo.bg }]}>
//           <Text style={[s.typeText, { color: typeInfo.text }]}>{typeInfo.label}</Text>
//         </View>
//       </View>

//       {f.fallback_note && (
//         <View style={s.fallbackBanner}>
//           <Ionicons name="information-circle-outline" size={13} color={Colors.amberDark} />
//           <Text style={s.fallbackText}>{f.fallback_note}</Text>
//         </View>
//       )}

//       <View style={s.metaRow}>
//         <Ionicons name="location-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{f.address}</Text>
//       </View>

//       <View style={s.metaRow}>
//         <Ionicons name="navigate-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{distanceText}</Text>
//       </View>

//       {f.phone && (
//         <View style={s.metaRow}>
//           <Ionicons name="call-outline" size={13} color={Colors.brownLight} />
//           <Text style={s.metaText}>{f.phone}</Text>
//         </View>
//       )}

//       {/* Services */}
//       {f.services && f.services.length > 0 && (
//         <View style={s.services}>
//           {f.services.map((svc) => (
//             <View key={svc} style={s.serviceChip}>
//               <Text style={s.serviceText}>{titleCase(svc)}</Text>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Actions */}
//       <View style={s.actions}>
//         {f.phone && (
//           <TouchableOpacity style={s.callBtn} onPress={callPhone}>
//             <Ionicons name="call" size={14} color="#fff" />
//             <Text style={s.callBtnText}>Call</Text>
//           </TouchableOpacity>
//         )}
//         {f.latitude && f.longitude && (
//           <TouchableOpacity
//             style={[s.mapBtn, !f.phone && { flex: 1 }]}
//             onPress={openMaps}
//           >
//             <Ionicons name="map-outline" size={14} color={Colors.coral} />
//             <Text style={s.mapBtnText}>Directions</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// });

// const s = StyleSheet.create({
//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 14,
//     marginBottom: 10,
//     ...Shadow.sm,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 8,
//     gap: 8,
//   },
//   name: {
//     fontFamily: Fonts.semibold,
//     fontSize: 14,
//     color: Colors.earth,
//     flex: 1,
//   },
//   typeBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   typeText: { fontFamily: Fonts.medium, fontSize: 11 },

//   fallbackBanner: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     backgroundColor: Colors.amberPale,
//     borderRadius: Radius.sm,
//     padding: 8,
//     marginBottom: 8,
//   },
//   fallbackText: {
//     fontFamily: Fonts.regular,
//     fontSize: 11,
//     color: Colors.amberDark,
//     flex: 1,
//     lineHeight: 16,
//   },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     marginBottom: 4,
//   },
//   metaText: {
//     fontFamily: Fonts.regular,
//     fontSize: 12,
//     color: Colors.brownLight,
//     flex: 1,
//   },

//   services: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 6,
//     marginTop: 8,
//     marginBottom: 10,
//   },
//   serviceChip: {
//     backgroundColor: Colors.sagePale,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   serviceText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.sage },

//   actions: { flexDirection: "row", gap: 8 },
//   callBtn: {
//     flex: 1,
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   callBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
//   mapBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   mapBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.coral },
// });


// /**
//  * JaundiCare — FacilityCard component
//  * Displays a single recommended health facility.
//  * Shows inferred display type instead of raw OSM type tag.
//  */

// import React from "react";
// import {
//   View, Text, TouchableOpacity, Linking, StyleSheet, Platform
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
// import type { Facility } from "../services/api";

// interface Props {
//   facility: Facility;
// }

// function inferDisplayType(name: string, rawType: string): { label: string; bg: string; text: string } {
//   const n = name.toLowerCase();

//   if (
//     n.includes("federal") || n.includes("teaching hospital") ||
//     n.includes("university") || n.includes("national hospital") ||
//     n.includes("fmc") || n.includes("luth") || n.includes("oouth")
//   ) {
//     return { label: "Federal", bg: "#fdecea", text: Colors.rust };
//   }
//   if (
//     n.includes("general hospital") || n.includes("state hospital") ||
//     n.includes("state specialist") || n.includes("government")
//   ) {
//     return { label: "State", bg: Colors.amberPale, text: Colors.amberDark };
//   }
//   if (
//     n.includes("catholic") || n.includes("methodist") ||
//     n.includes("mission") || n.includes("missionary") ||
//     n.includes("redeemed") || n.includes("church") ||
//     n.includes("christian") || n.includes("baptist")
//   ) {
//     return { label: "Mission", bg: "#f0f4ff", text: "#4a6fa5" };
//   }
//   if (rawType === "tertiary") {
//     return { label: "Specialist", bg: Colors.sagePale, text: Colors.sage };
//   }
//   if (rawType === "secondary") {
//     return { label: "General", bg: Colors.cream, text: Colors.brownLight };
//   }
//   return { label: "Clinic", bg: Colors.cream, text: Colors.brownLight };
// }

// export const FacilityCard = React.memo(function FacilityCard({ facility: f }: Props) {
//   const typeInfo = inferDisplayType(f.name, f.type);

//   const openMaps = () => {
//     if (!f.latitude || !f.longitude) return;
    
//     // Fixed: Rebuilt map url constructor to use standard cross-platform map routing
//     const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
//     const latLng = `${f.latitude},${f.longitude}`;
//     const label = encodeURIComponent(f.name);
    
//     const url = Platform.OS === "ios"
//       ? `${scheme}${label}@${latLng}`
//       : `${scheme}${latLng}(${label})`;

//     Linking.openURL(url).catch((err) => {
//       console.error("[FacilityCard] Failed to open external mapping client:", err);
//     });
//   };

//   const callPhone = () => {
//     if (!f.phone) return;
//     Linking.openURL(`tel:${f.phone.replace(/\s+/g, "")}`);
//   };

//   const distanceText = f.distance_km != null
//     ? `${f.distance_km} km away`
//     : "Distance unknown";

//   function titleCase(str: string) {
//     return str.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
//   }

//   return (
//     <View style={s.card}>
//       <View style={s.header}>
//         <Text style={s.name} numberOfLines={2}>{f.name}</Text>
//         <View style={[s.typeBadge, { backgroundColor: typeInfo.bg }]}>
//           <Text style={[s.typeText, { color: typeInfo.text }]}>{typeInfo.label}</Text>
//         </View>
//       </View>

//       {f.fallback_note && (
//         <View style={s.fallbackBanner}>
//           <Ionicons name="information-circle-outline" size={13} color={Colors.amberDark} />
//           <Text style={s.fallbackText}>{f.fallback_note}</Text>
//         </View>
//       )}

//       <View style={s.metaRow}>
//         <Ionicons name="location-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{f.address}</Text>
//       </View>

//       <View style={s.metaRow}>
//         <Ionicons name="navigate-outline" size={13} color={Colors.brownLight} />
//         <Text style={s.metaText}>{distanceText}</Text>
//       </View>

//       {f.phone && (
//         <View style={s.metaRow}>
//           <Ionicons name="call-outline" size={13} color={Colors.brownLight} />
//           <Text style={s.metaText}>{f.phone}</Text>
//         </View>
//       )}

//       {/* Services */}
//       {f.services && f.services.length > 0 && (
//         <View style={s.services}>
//           {/* Fixed: Combined string token with list iteration indexes to guarantee layout key safety */}
//           {f.services.map((svc, index) => (
//             <View key={`${svc}-${index}`} style={s.serviceChip}>
//               <Text style={s.serviceText}>{titleCase(svc)}</Text>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Actions */}
//       <View style={s.actions}>
//         {f.phone && (
//           <TouchableOpacity style={s.callBtn} onPress={callPhone}>
//             <Ionicons name="call" size={14} color="#fff" />
//             <Text style={s.callBtnText}>Call</Text>
//           </TouchableOpacity>
//         )}
//         {f.latitude && f.longitude && (
//           <TouchableOpacity
//             style={[s.mapBtn, !f.phone && { flex: 1 }]}
//             onPress={openMaps}
//           >
//             <Ionicons name="map-outline" size={14} color={Colors.coral} />
//             <Text style={s.mapBtnText}>Directions</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// });

// const s = StyleSheet.create({
//   card: {
//     backgroundColor: Colors.card,
//     borderRadius: Radius.lg,
//     padding: 14,
//     marginBottom: 10,
//     ...Shadow.sm,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 8,
//     gap: 8,
//   },
//   name: {
//     fontFamily: Fonts.semibold,
//     fontSize: 14,
//     color: Colors.earth,
//     flex: 1,
//   },
//   typeBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   typeText: { fontFamily: Fonts.medium, fontSize: 11 },

//   fallbackBanner: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     backgroundColor: Colors.amberPale,
//     borderRadius: Radius.sm,
//     padding: 8,
//     marginBottom: 8,
//   },
//   fallbackText: {
//     fontFamily: Fonts.regular,
//     fontSize: 11,
//     color: Colors.amberDark,
//     flex: 1,
//     lineHeight: 16,
//   },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 6,
//     marginBottom: 4,
//   },
//   metaText: {
//     fontFamily: Fonts.regular,
//     fontSize: 12,
//     color: Colors.brownLight,
//     flex: 1,
//   },

//   services: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 6,
//     marginTop: 8,
//     marginBottom: 10,
//   },
//   serviceChip: {
//     backgroundColor: Colors.sagePale,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: Radius.full,
//   },
//   serviceText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.sage },

//   actions: { flexDirection: "row", gap: 8 },
//   callBtn: {
//     flex: 1,
//     backgroundColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   callBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
//   mapBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: Colors.coral,
//     borderRadius: Radius.md,
//     paddingVertical: 9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },
//   mapBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.coral },
// });

/**
 * JaundiCare — FacilityCard component
 * Displays a single recommended health facility.
 * Shows inferred display type instead of raw OSM type tag.
 */

import React, { useMemo } from "react";
import {
  View, Text, TouchableOpacity, Linking, StyleSheet, Platform, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
import type { Facility } from "../services/api";

interface Props {
  facility: Facility;
}

// Pure functions extracted out of the render loop to eliminate micro-allocations
function inferDisplayType(name: string, rawType: string): { label: string; bg: string; text: string } {
  const n = name.toLowerCase();

  if (
    n.includes("federal") || n.includes("teaching hospital") ||
    n.includes("university") || n.includes("national hospital") ||
    n.includes("fmc") || n.includes("luth") || n.includes("oouth")
  ) {
    return { label: "Federal", bg: "#fdecea", text: Colors.rust };
  }
  if (
    n.includes("general hospital") || n.includes("state hospital") ||
    n.includes("state specialist") || n.includes("government")
  ) {
    return { label: "State", bg: Colors.amberPale, text: Colors.amberDark };
  }
  if (
    n.includes("catholic") || n.includes("methodist") ||
    n.includes("mission") || n.includes("missionary") ||
    n.includes("redeemed") || n.includes("church") ||
    n.includes("christian") || n.includes("baptist")
  ) {
    return { label: "Mission", bg: "#f0f4ff", text: "#4a6fa5" };
  }
  if (rawType === "tertiary") {
    return { label: "Specialist", bg: Colors.sagePale, text: Colors.sage };
  }
  if (rawType === "secondary") {
    return { label: "General", bg: Colors.cream, text: Colors.brownLight };
  }
  return { label: "Clinic", bg: Colors.cream, text: Colors.brownLight };
}

function titleCase(str: string) {
  return str.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export const FacilityCard = React.memo(function FacilityCard({ facility: f }: Props) {
  // Memoize static runtime allocations derived from properties
  const typeInfo = useMemo(() => inferDisplayType(f.name, f.type), [f.name, f.type]);
  const distanceText = f.distance_km != null ? `${f.distance_km} km away` : "Distance unknown";

  const openMaps = async () => {
    if (!f.latitude || !f.longitude) return;
    
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${f.latitude},${f.longitude}`;
    const label = encodeURIComponent(f.name);
    
    const url = Platform.OS === "ios"
      ? `${scheme}${label}@${latLng}`
      : `${scheme}${latLng}(${label})`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Map Error", "No compatible map application found on this device.");
      }
    } catch (err) {
      console.error("[FacilityCard] Failed to open external mapping client:", err);
    }
  };

  const callPhone = async () => {
    if (!f.phone) return;
    const cleanPhone = `tel:${f.phone.replace(/\s+/g, "")}`;
    
    try {
      const supported = await Linking.canOpenURL(cleanPhone);
      if (supported) {
        await Linking.openURL(cleanPhone);
      } else {
        Alert.alert("Dialer Error", "This device does not support direct phone calling functions.");
      }
    } catch (err) {
      console.error("[FacilityCard] Call intent failure:", err);
    }
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.name} numberOfLines={2}>{f.name}</Text>
        <View style={[s.typeBadge, { backgroundColor: typeInfo.bg }]}>
          <Text style={[s.typeText, { color: typeInfo.text }]}>{typeInfo.label}</Text>
        </View>
      </View>

      {f.fallback_note && (
        <View style={s.fallbackBanner}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.amberDark} style={s.iconSpacer} />
          <Text style={s.fallbackText}>{f.fallback_note}</Text>
        </View>
      )}

      <View style={s.metaRow}>
        <Ionicons name="location-outline" size={13} color={Colors.brownLight} style={s.iconSpacer} />
        <Text style={s.metaText} numberOfLines={2} ellipsizeMode="tail">{f.address}</Text>
      </View>

      <View style={s.metaRow}>
        <Ionicons name="navigate-outline" size={13} color={Colors.brownLight} style={s.iconSpacer} />
        <Text style={s.metaText}>{distanceText}</Text>
      </View>

      {f.phone && (
        <View style={s.metaRow}>
          <Ionicons name="call-outline" size={13} color={Colors.brownLight} style={s.iconSpacer} />
          <Text style={s.metaText}>{f.phone}</Text>
        </View>
      )}

      {/* Services */}
      {f.services && f.services.length > 0 && (
        <View style={s.services}>
          {f.services.map((svc, index) => (
            <View key={`${svc}-${index}`} style={s.serviceChip}>
              <Text style={s.serviceText}>{titleCase(svc)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={s.actions}>
        {f.phone && (
          <TouchableOpacity style={s.callBtn} onPress={callPhone} activeOpacity={0.8}>
            <Ionicons name="call" size={14} color="#fff" />
            <Text style={s.callBtnText}>Call</Text>
          </TouchableOpacity>
        )}
        {f.latitude && f.longitude && (
          <TouchableOpacity
            style={[s.mapBtn, !f.phone && { flex: 1 }]}
            onPress={openMaps}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={14} color={Colors.coral} />
            <Text style={s.mapBtnText}>Directions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    ...Shadow.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  name: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    color: Colors.earth,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: "flex-start",
  },
  typeText: { fontFamily: Fonts.medium, fontSize: 11 },

  fallbackBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.amberPale,
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: 8,
  },
  fallbackText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.amberDark,
    flex: 1,
    lineHeight: 16,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  iconSpacer: {
    marginRight: 6,
    marginTop: 2,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.brownLight,
    flex: 1,
    lineHeight: 16,
  },

  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  serviceChip: {
    backgroundColor: Colors.sagePale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  serviceText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.sage },

  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  callBtn: {
    flex: 1,
    backgroundColor: Colors.coral,
    borderRadius: Radius.md,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  callBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: "#fff" },
  mapBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.coral,
    borderRadius: Radius.md,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  mapBtnText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.coral },
});