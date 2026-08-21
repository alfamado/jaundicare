// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";

// const SECTIONS = {
//   warning: {
//     icon: "warning-outline" as const,
//     color: Colors.rust,
//     bg: Colors.rustPale,
//     title: "Warning Signs",
//     subtitle: "Seek help immediately if you notice any of these",
//     items: [
//       { title: "Extreme difficulty waking", body: "Baby cannot be roused for feeds or stays limp when picked up. This is a medical emergency." },
//       { title: "Yellowing in first 24 hours", body: "Any yellow tinge in the skin or eyes within the first day of life requires urgent hospital review." },
//       { title: "Yellowing spreading to palms and soles", body: "When jaundice reaches the palms and soles, bilirubin levels are dangerously high. Go to hospital now." },
//       { title: "Dark urine or pale/white stool", body: "Dark orange or brown urine, or white/clay-coloured stool, signals a serious liver or bile duct problem." },
//       { title: "Poor feeding combined with yellow skin", body: "A baby who is yellowing AND refusing to feed needs same-day clinical assessment." },
//       { title: "High-pitched or unusual cry", body: "A shrill, abnormal cry alongside jaundice may indicate bilirubin affecting the brain (acute bilirubin encephalopathy)." },
//     ],
//   },
//   feeding: {
//     icon: "nutrition-outline" as const,
//     color: Colors.sage,
//     bg: Colors.sagePale,
//     title: "Feeding Tips",
//     subtitle: "Frequent feeding is the single most effective home intervention",
//     items: [
//       { title: "Feed 8–12 times every 24 hours", body: "Frequent feeding stimulates bowel movements which carry bilirubin out of the body. Never skip a feed." },
//       { title: "Wake a sleepy baby to feed", body: "Jaundiced babies are often too sleepy to demand feeds. Unwrap the baby, stroke the cheek, or tickle the feet to rouse them." },
//       { title: "Watch for adequate output", body: "At least 3–4 soiled nappies per day in the first week confirms the baby is feeding well enough to clear bilirubin." },
//       { title: "Do not supplement with water", body: "Water does not help clear bilirubin and can reduce breast milk supply. Breast milk alone is the correct treatment." },
//       { title: "Ensure a good latch", body: "A shallow latch reduces how much milk the baby takes per feed. Ask a midwife or nurse to check positioning." },
//       { title: "Continue breastfeeding even if jaundiced", body: "Stopping breastfeeding is rarely necessary. Only a clinician can advise stopping, and only in specific circumstances." },
//     ],
//   },
//   education: {
//     icon: "book-outline" as const,
//     color: Colors.amber,
//     bg: Colors.amberPale,
//     title: "Education & Myths",
//     subtitle: "Common questions answered clearly",
//     items: [
//       { title: "Myth: Sunlight through a window treats jaundice", body: "Window glass filters out the UV wavelengths needed for phototherapy. Sunlight exposure without medical supervision can cause burns and heat stroke." },
//       { title: "Myth: Traditional herbs or herbal baths help", body: "There is no clinical evidence that herbal remedies reduce bilirubin. Some can cause harm to a newborn's immature liver." },
//       { title: "Fact: Most jaundice is normal", body: "Up to 60% of term newborns develop visible jaundice in the first week. Most cases resolve on their own with adequate feeding." },
//       { title: "Fact: Darker skin makes visual detection harder", body: "Yellowing is harder to see on darker skin. Always check the whites of the eyes and the gums as these show yellowing regardless of skin tone." },
//       { title: "Fact: Phototherapy is safe and effective", body: "Hospital phototherapy (blue light) is the proven treatment for significant jaundice. It is safe, painless, and works within 24–48 hours." },
//       { title: "Fact: Premature babies need closer monitoring", body: "Babies born before 38 weeks have less mature livers and a lower threshold for treatment. More frequent checks are essential." },
//     ],
//   },
// };

// type SectionKey = keyof typeof SECTIONS;

// export default function CareScreen() {
//   const [activeSection, setActiveSection] = useState<SectionKey>("warning");
//   const [search, setSearch] = useState("");
//   const [expanded, setExpanded] = useState<number | null>(null);

//   const section = SECTIONS[activeSection];
//   const filtered = section.items.filter(
//     (item) =>
//       search.length < 2 ||
//       item.title.toLowerCase().includes(search.toLowerCase()) ||
//       item.body.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <View style={s.header}>
//         <Text style={s.heading}>Care Guide</Text>
//         <TextInput
//           style={s.search}
//           value={search}
//           onChangeText={setSearch}
//           placeholder="Search..."
//           placeholderTextColor={Colors.brownLight}
//         />
//       </View>

//       {/* Section tabs */}
//       <View style={s.tabs}>
//         {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
//           const sec = SECTIONS[key];
//           const active = activeSection === key;
//           return (
//             <TouchableOpacity
//               key={key}
//               style={[s.tab, active && { borderBottomColor: sec.color, borderBottomWidth: 2 }]}
//               onPress={() => { setActiveSection(key); setExpanded(null); setSearch(""); }}
//             >
//               <Ionicons name={sec.icon} size={16} color={active ? sec.color : Colors.brownLight} />
//               <Text style={[s.tabText, active && { color: sec.color }]}>{sec.title}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <ScrollView style={s.scroll} contentContainerStyle={s.content}>
//         <View style={[s.sectionBanner, { backgroundColor: section.bg }]}>
//           <Ionicons name={section.icon} size={16} color={section.color} />
//           <Text style={[s.sectionSub, { color: section.color }]}>{section.subtitle}</Text>
//         </View>

//         {filtered.map((item, i) => (
//           <TouchableOpacity
//             key={i}
//             style={s.card}
//             onPress={() => setExpanded(expanded === i ? null : i)}
//             activeOpacity={0.8}
//           >
//             <View style={s.cardHeader}>
//               <Text style={s.cardTitle}>{item.title}</Text>
//               <Ionicons
//                 name={expanded === i ? "chevron-up" : "chevron-down"}
//                 size={16}
//                 color={Colors.brownLight}
//               />
//             </View>
//             {expanded === i && <Text style={s.cardBody}>{item.body}</Text>}
//           </TouchableOpacity>
//         ))}

//         {filtered.length === 0 && (
//           <View style={s.empty}>
//             <Text style={s.emptyText}>No results for "{search}"</Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },
//   header: { padding: 16, paddingBottom: 8 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 10 },
//   search: {
//     backgroundColor: Colors.card, borderRadius: Radius.md, padding: 10,
//     fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
//     borderWidth: 1, borderColor: Colors.border,
//   },
//   tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.border },
//   tab: { flex: 1, alignItems: "center", paddingVertical: 10, gap: 4, flexDirection: "column" },
//   tabText: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.brownLight, textAlign: "center" },
//   scroll: { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   sectionBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: Radius.md, padding: 10, marginBottom: 14 },
//   sectionSub: { fontFamily: Fonts.medium, fontSize: 12, flex: 1, lineHeight: 18 },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 10, ...Shadow.sm },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, flex: 1, paddingRight: 8 },
//   cardBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, marginTop: 10, lineHeight: 21 },
//   empty: { alignItems: "center", padding: 40 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight },
// });


// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";

// const SECTIONS = {
//   warning: {
//     icon: "warning-outline" as const,
//     color: Colors.rust,
//     bg: Colors.rustPale,
//     title: "Warning Signs",
//     subtitle: "Seek help immediately if you notice any of these signs",
//     items: [
//       { id: "w1", title: "Extreme difficulty waking", body: "Baby cannot be roused for feeds or stays limp when picked up. This is a medical emergency." },
//       { id: "w2", title: "Yellowing in first 24 hours", body: "Any yellow tinge in the skin or eyes within the first day of life requires urgent hospital review." },
//       { id: "w3", title: "Yellowing spreading to palms and soles", body: "When jaundice reaches the palms and soles, bilirubin levels are dangerously high. Go to hospital now." },
//       { id: "w4", title: "Dark urine or pale/white stool", body: "Dark orange or brown urine, or white/clay-coloured stool, signals a serious liver or bile duct problem." },
//       { id: "w5", title: "Poor feeding combined with yellow skin", body: "A baby who is yellowing AND refusing to feed needs same-day clinical assessment." },
//       { id: "w6", title: "High-pitched or unusual cry", body: "A shrill, abnormal cry alongside jaundice may indicate bilirubin affecting the brain (acute bilirubin encephalopathy)." },
//     ],
//   },
//   feeding: {
//     icon: "nutrition-outline" as const,
//     color: Colors.sage,
//     bg: Colors.sagePale,
//     title: "Feeding Tips",
//     subtitle: "Frequent feeding is the single most effective home intervention",
//     items: [
//       { id: "f1", title: "Feed 8–12 times every 24 hours", body: "Frequent feeding stimulates bowel movements which carry bilirubin out of the body. Never skip a feed." },
//       { id: "f2", title: "Wake a sleepy baby to feed", body: "Jaundiced babies are often too sleepy to demand feeds. Unwrap the baby, stroke the cheek, or tickle the feet to rouse them." },
//       { id: "f3", title: "Watch for adequate output", body: "At least 3–4 soiled nappies per day in the first week confirms the baby is feeding well enough to clear bilirubin." },
//       { id: "f4", title: "Do not supplement with water", body: "Water does not help clear bilirubin and can reduce breast milk supply. Breast milk alone is the correct treatment." },
//       { id: "f5", title: "Ensure a good latch", body: "A shallow latch reduces how much milk the baby takes per feed. Ask a midwife or nurse to check positioning." },
//       { id: "f6", title: "Continue breastfeeding even if jaundiced", body: "Stopping breastfeeding is rarely necessary. Only a clinician can advise stopping, and only in specific circumstances." },
//     ],
//   },
//   education: {
//     icon: "book-outline" as const,
//     color: Colors.amber,
//     bg: Colors.amberPale,
//     title: "Education & Myths",
//     subtitle: "Common questions answered clearly with clinical evidence",
//     items: [
//       { id: "e1", title: "Myth: Sunlight through a window treats jaundice", body: "Window glass filters out the UV wavelengths needed for phototherapy. Sunlight exposure without medical supervision can cause burns and heat stroke." },
//       { id: "e2", title: "Myth: Traditional herbs or herbal baths help", body: "There is no clinical evidence that herbal remedies reduce bilirubin. Some can cause harm to a newborn's immature liver." },
//       { id: "e3", title: "Fact: Most jaundice is normal", body: "Up to 60% of term newborns develop visible jaundice in the first week. Most cases resolve on their own with adequate feeding." },
//       { id: "e4", title: "Fact: Darker skin makes visual detection harder", body: "Yellowing is harder to see on darker skin. Always check the whites of the eyes and the gums as these show yellowing regardless of skin tone." },
//       { id: "e5", title: "Fact: Phototherapy is safe and effective", body: "Hospital phototherapy (blue light) is the proven treatment for significant jaundice. It is safe, painless, and works within 24–48 hours." },
//       { id: "e6", title: "Fact: Premature babies need closer monitoring", body: "Babies born before 38 weeks have less mature livers and a lower threshold for treatment. More frequent checks are essential." },
//     ],
//   },
// };

// type SectionKey = keyof typeof SECTIONS;

// export default function CareScreen() {
//   const [activeSection, setActiveSection] = useState<SectionKey>("warning");
//   const [search, setSearch] = useState("");
//   // Track open panel via explicit item id instead of variable index numbers
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const section = SECTIONS[activeSection];
//   const filtered = section.items.filter(
//     (item) =>
//       search.trim().length < 2 ||
//       item.title.toLowerCase().includes(search.toLowerCase()) ||
//       item.body.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       <View style={s.header}>
//         <Text style={s.heading}>Care Guide</Text>
//         <View style={s.searchContainer}>
//           <TextInput
//             style={s.search}
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search care rules and guides..."
//             placeholderTextColor={Colors.brownLight}
//           />
//           {search.length > 0 && (
//             <TouchableOpacity 
//               style={s.clearButton} 
//               onPress={() => setSearch("")}
//               activeOpacity={0.7}
//             >
//               <Ionicons name="close-circle" size={18} color={Colors.brownLight} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Section tabs layout */}
//       <View style={s.tabs}>
//         {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
//           const sec = SECTIONS[key];
//           const active = activeSection === key;
//           return (
//             <TouchableOpacity
//               key={key}
//               style={[s.tab, active && { borderBottomColor: sec.color, borderBottomWidth: 2 }]}
//               onPress={() => { setActiveSection(key); setExpandedId(null); }}
//             >
//               <Ionicons name={sec.icon} size={16} color={active ? sec.color : Colors.brownLight} />
//               <Text style={[s.tabText, active && { color: sec.color }]}>{sec.title}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
//         <View style={[s.sectionBanner, { backgroundColor: section.bg }]}>
//           <Ionicons name={section.icon} size={16} color={section.color} />
//           <Text style={[s.sectionSub, { color: section.color }]}>{section.subtitle}</Text>
//         </View>

//         {filtered.map((item) => {
//           const isExpanded = expandedId === item.id;
//           return (
//             <TouchableOpacity
//               key={item.id}
//               style={s.card}
//               onPress={() => setExpandedId(isExpanded ? null : item.id)}
//               activeOpacity={0.8}
//             >
//               <View style={s.cardHeader}>
//                 <Text style={s.cardTitle}>{item.title}</Text>
//                 <Ionicons
//                   name={isExpanded ? "chevron-up" : "chevron-down"}
//                   size={16}
//                   color={Colors.brownLight}
//                 />
//               </View>
//               {isExpanded && <Text style={s.cardBody}>{item.body}</Text>}
//             </TouchableOpacity>
//           );
//         })}

//         {filtered.length === 0 && (
//           <View style={s.empty}>
//             <Ionicons name="search-outline" size={32} color={Colors.border} style={{ marginBottom: 8 }} />
//             <Text style={s.emptyText}>No results matching "{search}"</Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },
//   header: { padding: 16, paddingBottom: 8 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 10 },
//   searchContainer: { flexDirection: "row", alignItems: "center", position: "relative" },
//   search: {
//     flex: 1,
//     backgroundColor: Colors.card, 
//     borderRadius: Radius.md, 
//     padding: 10,
//     paddingRight: 36, // Create buffer space for clear icon positioning
//     fontFamily: Fonts.regular, 
//     fontSize: 14, 
//     color: Colors.earth,
//     borderWidth: 1, 
//     borderColor: Colors.border,
//   },
//   clearButton: { position: "absolute", right: 10, padding: 4 },
//   tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.border },
//   tab: { flex: 1, alignItems: "center", paddingVertical: 10, gap: 4, flexDirection: "column" },
//   tabText: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.brownLight, textAlign: "center" },
//   scroll: { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   sectionBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: Radius.md, padding: 10, marginBottom: 14 },
//   sectionSub: { fontFamily: Fonts.medium, fontSize: 12, flex: 1, lineHeight: 18 },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 10, ...Shadow.sm },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, flex: 1, paddingRight: 8 },
//   cardBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, marginTop: 10, lineHeight: 21 },
//   empty: { alignItems: "center", padding: 40 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight },
// });


// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../../constants/colors";
// import { ConsultChat } from "../../components/ConsultChat"; // Added Import

// const SECTIONS = {
//   warning: {
//     icon: "warning-outline" as const,
//     color: Colors.rust,
//     bg: Colors.rustPale,
//     title: "Warning Signs",
//     subtitle: "Seek help immediately if you notice any of these signs",
//     items: [
//       { id: "w1", title: "Extreme difficulty waking", body: "Baby cannot be roused for feeds or stays limp when picked up. This is a medical emergency." },
//       { id: "w2", title: "Yellowing in first 24 hours", body: "Any yellow tinge in the skin or eyes within the first day of life requires urgent hospital review." },
//       { id: "w3", title: "Yellowing spreading to palms and soles", body: "When jaundice reaches the palms and soles, bilirubin levels are dangerously high. Go to hospital now." },
//       { id: "w4", title: "Dark urine or pale/white stool", body: "Dark orange or brown urine, or white/clay-coloured stool, signals a serious liver or bile duct problem." },
//       { id: "w5", title: "Poor feeding combined with yellow skin", body: "A baby who is yellowing AND refusing to feed needs same-day clinical assessment." },
//       { id: "w6", title: "High-pitched or unusual cry", body: "A shrill, abnormal cry alongside jaundice may indicate bilirubin affecting the brain (acute bilirubin encephalopathy)." },
//     ],
//   },
//   feeding: {
//     icon: "nutrition-outline" as const,
//     color: Colors.sage,
//     bg: Colors.sagePale,
//     title: "Feeding Tips",
//     subtitle: "Frequent feeding is the single most effective home intervention",
//     items: [
//       { id: "f1", title: "Feed 8–12 times every 24 hours", body: "Frequent feeding stimulates bowel movements which carry bilirubin out of the body. Never skip a feed." },
//       { id: "f2", title: "Wake a sleepy baby to feed", body: "Jaundiced babies are often too sleepy to demand feeds. Unwrap the baby, stroke the cheek, or tickle the feet to rouse them." },
//       { id: "f3", title: "Watch for adequate output", body: "At least 3–4 soiled nappies per day in the first week confirms the baby is feeding well enough to clear bilirubin." },
//       { id: "f4", title: "Do not supplement with water", body: "Water does not help clear bilirubin and can reduce breast milk supply. Breast milk alone is the correct treatment." },
//       { id: "f5", title: "Ensure a good latch", body: "A shallow latch reduces how much milk the baby takes per feed. Ask a midwife or nurse to check positioning." },
//       { id: "f6", title: "Continue breastfeeding even if jaundiced", body: "Stopping breastfeeding is rarely necessary. Only a clinician can advise stopping, and only in specific circumstances." },
//     ],
//   },
//   education: {
//     icon: "book-outline" as const,
//     color: Colors.amber,
//     bg: Colors.amberPale,
//     title: "Education & Myths",
//     subtitle: "Common questions answered clearly with clinical evidence",
//     items: [
//       { id: "e1", title: "Myth: Sunlight through a window treats jaundice", body: "Window glass filters out the UV wavelengths needed for phototherapy. Sunlight exposure without medical supervision can cause burns and heat stroke." },
//       { id: "e2", title: "Myth: Traditional herbs or herbal baths help", body: "There is no clinical evidence that herbal remedies reduce bilirubin. Some can cause harm to a newborn's immature liver." },
//       { id: "e3", title: "Fact: Most jaundice is normal", body: "Up to 60% of term newborns develop visible jaundice in the first week. Most cases resolve on their own with adequate feeding." },
//       { id: "e4", title: "Fact: Darker skin makes visual detection harder", body: "Yellowing is harder to see on darker skin. Always check the whites of the eyes and the gums as these show yellowing regardless of skin tone." },
//       { id: "e5", title: "Fact: Phototherapy is safe and effective", body: "Hospital phototherapy (blue light) is the proven treatment for significant jaundice. It is safe, painless, and works within 24–48 hours." },
//       { id: "e6", title: "Fact: Premature babies need closer monitoring", body: "Babies born before 38 weeks have less mature livers and a lower threshold for treatment. More frequent checks are essential." },
//     ],
//   },
//   // New section structural payload for MamaBot integration mapping
//   ask_bot: {
//     icon: "chatbubble-ellipses-outline" as const,
//     color: Colors.coral,
//     bg: Colors.coral + "15",
//     title: "MamaBot AI",
//     subtitle: "Ask maternal healthcare questions",
//     items: [],
//   }
// };

// type SectionKey = keyof typeof SECTIONS;

// export default function CareScreen() {
//   const [activeSection, setActiveSection] = useState<SectionKey>("warning");
//   const [search, setSearch] = useState("");
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const section = SECTIONS[activeSection];
//   const filtered = section.items.filter(
//     (item) =>
//       search.trim().length < 2 ||
//       item.title.toLowerCase().includes(search.toLowerCase()) ||
//       item.body.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <SafeAreaView style={s.safe}>
//       {/* Search Header layout hidden only during active conversation configurations */}
//       {activeSection !== "ask_bot" && (
//         <View style={s.header}>
//           <Text style={s.heading}>Care Guide</Text>
//           <View style={s.searchContainer}>
//             <TextInput
//               style={s.search}
//               value={search}
//               onChangeText={setSearch}
//               placeholder="Search care rules and guides..."
//               placeholderTextColor={Colors.brownLight}
//             />
//             {search.length > 0 && (
//               <TouchableOpacity 
//                 style={s.clearButton} 
//                 onPress={() => setSearch("")}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="close-circle" size={18} color={Colors.brownLight} />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       )}

//       {/* Tabs Layout */}
//       <View style={s.tabs}>
//         {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
//           const sec = SECTIONS[key];
//           const active = activeSection === key;
//           return (
//             <TouchableOpacity
//               key={key}
//               style={[s.tab, active && { borderBottomColor: sec.color, borderBottomWidth: 2 }]}
//               onPress={() => { setActiveSection(key); setExpandedId(null); }}
//             >
//               <Ionicons name={sec.icon} size={16} color={active ? sec.color : Colors.brownLight} />
//               <Text style={[s.tabText, active && { color: sec.color }]}>{sec.title}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Conditional Interface Rendering */}
//       {activeSection === "ask_bot" ? (
//         <View style={{ flex: 1, marginTop: 4 }}>
//           <ConsultChat
//             endpoint="mamabot"
//             title="MamaBot Consultation"
//             subtitle="Ask questions about breastfeeding, jaundice warning signs, and newborn behaviors."
//             placeholder="Type your question here (e.g., is glucose water safe?)..."
//             accentColor={Colors.coral}
//             suggestedQuestions={[
//               "How often should I breastfeed my newborn baby?",
//               "My baby is still yellow on day 5, what should I do?",
//               "Is it safe to give glucose water to clear yellow skin?"
//             ]}
//           />
//         </View>
//       ) : (
//         <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
//           <View style={[s.sectionBanner, { backgroundColor: section.bg }]}>
//             <Ionicons name={section.icon} size={16} color={section.color} />
//             <Text style={[s.sectionSub, { color: section.color }]}>{section.subtitle}</Text>
//           </View>

//           {filtered.map((item) => {
//             const isExpanded = expandedId === item.id;
//             return (
//               <TouchableOpacity
//                 key={item.id}
//                 style={s.card}
//                 onPress={() => setExpandedId(isExpanded ? null : item.id)}
//                 activeOpacity={0.8}
//               >
//                 <View style={s.cardHeader}>
//                   <Text style={s.cardTitle}>{item.title}</Text>
//                   <Ionicons
//                     name={isExpanded ? "chevron-up" : "chevron-down"}
//                     size={16}
//                     color={Colors.brownLight}
//                   />
//                 </View>
//                 {isExpanded && <Text style={s.cardBody}>{item.body}</Text>}
//               </TouchableOpacity>
//             );
//           })}

//           {filtered.length === 0 && (
//             <View style={s.empty}>
//               <Ionicons name="search-outline" size={32} color={Colors.border} style={{ marginBottom: 8 }} />
//               <Text style={s.emptyText}>No results matching "{search}"</Text>
//             </View>
//           )}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },
//   header: { padding: 16, paddingBottom: 8 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 10 },
//   searchContainer: { flexDirection: "row", alignItems: "center", position: "relative" },
//   search: {
//     flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 10,
//     paddingRight: 36, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
//     borderWidth: 1, borderColor: Colors.border,
//   },
//   clearButton: { position: "absolute", right: 10, padding: 4 },
//   tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.border },
//   tab: { flex: 1, alignItems: "center", paddingVertical: 10, gap: 4, flexDirection: "column" },
//   tabText: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.brownLight, textAlign: "center" },
//   scroll: { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   sectionBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: Radius.md, padding: 10, marginBottom: 14 },
//   sectionSub: { fontFamily: Fonts.medium, fontSize: 12, flex: 1, lineHeight: 18 },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 10, ...Shadow.sm },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, flex: 1, paddingRight: 8 },
//   cardBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, marginTop: 10, lineHeight: 21 },
//   empty: { alignItems: "center", padding: 40 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight },
// });




// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
// import { ConsultChat } from "../components/ConsultChat";

// const SECTIONS = {
//   warning: {
//     icon: "warning-outline" as const,
//     color: Colors.rust,
//     bg: Colors.rustPale,
//     title: "Warning Signs",
//     subtitle: "Seek help immediately if you notice any of these signs",
//     items: [
//       { id: "w1", title: "Extreme difficulty waking", body: "Baby cannot be roused for feeds or stays limp when picked up. This is a medical emergency." },
//       { id: "w2", title: "Yellowing in first 24 hours", body: "Any yellow tinge in the skin or eyes within the first day of life requires urgent hospital review." },
//       { id: "w3", title: "Yellowing spreading to palms and soles", body: "When jaundice reaches the palms and soles, bilirubin levels are dangerously high. Go to hospital now." },
//       { id: "w4", title: "Dark urine or pale/white stool", body: "Dark orange or brown urine, or white/clay-coloured stool, signals a serious liver or bile duct problem." },
//       { id: "w5", title: "Poor feeding combined with yellow skin", body: "A baby who is yellowing AND refusing to feed needs same-day clinical assessment." },
//       { id: "w6", title: "High-pitched or unusual cry", body: "A shrill, abnormal cry alongside jaundice may indicate bilirubin affecting the brain (acute bilirubin encephalopathy)." },
//     ],
//   },
//   feeding: {
//     icon: "nutrition-outline" as const,
//     color: Colors.sage,
//     bg: Colors.sagePale,
//     title: "Feeding Tips",
//     subtitle: "Frequent feeding is the single most effective home intervention",
//     items: [
//       { id: "f1", title: "Feed 8–12 times every 24 hours", body: "Frequent feeding stimulates bowel movements which carry bilirubin out of the body. Never skip a feed." },
//       { id: "f2", title: "Wake a sleepy baby to feed", body: "Jaundiced babies are often too sleepy to demand feeds. Unwrap the baby, stroke the cheek, or tickle the feet to rouse them." },
//       { id: "f3", title: "Watch for adequate output", body: "At least 3–4 soiled nappies per day in the first week confirms the baby is feeding well enough to clear bilirubin." },
//       { id: "f4", title: "Do not supplement with water", body: "Water does not help clear bilirubin and can reduce breast milk supply. Breast milk alone is the correct treatment." },
//       { id: "f5", title: "Ensure a good latch", body: "A shallow latch reduces how much milk the baby takes per feed. Ask a midwife or nurse to check positioning." },
//       { id: "f6", title: "Continue breastfeeding even if jaundiced", body: "Stopping breastfeeding is rarely necessary. Only a clinician can advise stopping, and only in specific circumstances." },
//     ],
//   },
//   education: {
//     icon: "book-outline" as const,
//     color: Colors.amber,
//     bg: Colors.amberPale,
//     title: "Education & Myths",
//     subtitle: "Common questions answered clearly with clinical evidence",
//     items: [
//       { id: "e1", title: "Myth: Sunlight through a window treats jaundice", body: "Window glass filters out the UV wavelengths needed for phototherapy. Sunlight exposure without medical supervision can cause burns and heat stroke." },
//       { id: "e2", title: "Myth: Traditional herbs or herbal baths help", body: "There is no clinical evidence that herbal remedies reduce bilirubin. Some can cause harm to a newborn's immature liver." },
//       { id: "e3", title: "Fact: Most jaundice is normal", body: "Up to 60% of term newborns develop visible jaundice in the first week. Most cases resolve on their own with adequate feeding." },
//       { id: "e4", title: "Fact: Darker skin makes visual detection harder", body: "Yellowing is harder to see on darker skin. Always check the whites of the eyes and the gums as these show yellowing regardless of skin tone." },
//       { id: "e5", title: "Fact: Phototherapy is safe and effective", body: "Hospital phototherapy (blue light) is the proven treatment for significant jaundice. It is safe, painless, and works within 24–48 hours." },
//       { id: "e6", title: "Fact: Premature babies need closer monitoring", body: "Babies born before 38 weeks have less mature livers and a lower threshold for treatment. More frequent checks are essential." },
//     ],
//   },
//   ask_bot: {
//     icon: "chatbubble-ellipses-outline" as const,
//     color: Colors.coral,
//     bg: Colors.coral + "15",
//     title: "MamaBot AI",
//     subtitle: "Ask maternal healthcare questions",
//     items: [],
//   }
// };

// type SectionKey = keyof typeof SECTIONS;

// export default function CareScreen() {
//   const [activeSection, setActiveSection] = useState<SectionKey>("warning");
//   const [search, setSearch] = useState("");
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const section = SECTIONS[activeSection];
//   const filtered = section.items.filter(
//     (item) =>
//       search.trim().length < 2 ||
//       item.title.toLowerCase().includes(search.toLowerCase()) ||
//       item.body.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
//       {activeSection !== "ask_bot" && (
//         <View style={s.header}>
//           <Text style={s.heading}>Care Guide</Text>
//           <View style={s.searchContainer}>
//             <TextInput
//               style={s.search}
//               value={search}
//               onChangeText={setSearch}
//               placeholder="Search care rules and guides..."
//               placeholderTextColor={Colors.brownLight}
//             />
//             {search.length > 0 && (
//               <TouchableOpacity style={s.clearButton} onPress={() => setSearch("")}>
//                 <Ionicons name="close-circle" size={18} color={Colors.brownLight} />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       )}

//       {/* Tab Menu Header layout */}
//       <View style={s.tabs}>
//         {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
//           const sec = SECTIONS[key];
//           const active = activeSection === key;
//           return (
//             <TouchableOpacity
//               key={key}
//               style={[s.tab, active && { borderBottomColor: sec.color, borderBottomWidth: 2 }]}
//               onPress={() => { setActiveSection(key); setExpandedId(null); }}
//             >
//               <Ionicons name={sec.icon} size={16} color={active ? sec.color : Colors.brownLight} />
//               <Text style={[s.tabText, active && { color: sec.color }]}>{sec.title}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Content Switcher */}
//       {activeSection === "ask_bot" ? (
//         <View style={s.chatWrapper}>
//           <ConsultChat
//             endpoint="mamabot"
//             title="MamaBot Consultation"
//             subtitle="Ask questions about breastfeeding, jaundice warning signs, and newborn behaviors."
//             placeholder="Type your question here..."
//             accentColor={Colors.coral}
//             suggestedQuestions={[
//               "How often should I breastfeed my newborn baby?",
//               "My baby is still yellow on day 5, what should I do?",
//               "Is it safe to give glucose water to clear yellow skin?"
//             ]}
//           />
//         </View>
//       ) : (
//         <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
//           <View style={[s.sectionBanner, { backgroundColor: section.bg }]}>
//             <Ionicons name={section.icon} size={16} color={section.color} />
//             <Text style={[s.sectionSub, { color: section.color }]}>{section.subtitle}</Text>
//           </View>

//           {filtered.map((item) => {
//             const isExpanded = expandedId === item.id;
//             return (
//               <TouchableOpacity
//                 key={item.id}
//                 style={s.card}
//                 onPress={() => setExpandedId(isExpanded ? null : item.id)}
//                 activeOpacity={0.8}
//               >
//                 <View style={s.cardHeader}>
//                   <Text style={s.cardTitle}>{item.title}</Text>
//                   <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.brownLight} />
//                 </View>
//                 {isExpanded && <Text style={s.cardBody}>{item.body}</Text>}
//               </TouchableOpacity>
//             );
//           })}

//           {filtered.length === 0 && (
//             <View style={s.empty}>
//               <Ionicons name="search-outline" size={32} color={Colors.border} style={{ marginBottom: 8 }} />
//               <Text style={s.emptyText}>No results matching "{search}"</Text>
//             </View>
//           )}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },
//   header: { padding: 16, paddingBottom: 8 },
//   heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 10 },
//   searchContainer: { flexDirection: "row", alignItems: "center", position: "relative" },
//   search: {
//     flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 10,
//     paddingRight: 36, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
//     borderWidth: 1, borderColor: Colors.border,
//   },
//   clearButton: { position: "absolute", right: 10, padding: 4 },
//   tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card },
//   tab: { flex: 1, alignItems: "center", paddingVertical: 10, gap: 4 },
//   tabText: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.brownLight, textAlign: "center" },
//   scroll: { flex: 1 },
//   content: { padding: 16, paddingBottom: 40 },
//   chatWrapper: { flex: 1, paddingBottom: 60 }, // Generous bottom offset padding for active native bottom tabs layout structures
//   sectionBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: Radius.md, padding: 10, marginBottom: 14 },
//   sectionSub: { fontFamily: Fonts.medium, fontSize: 12, flex: 1, lineHeight: 18 },
//   card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 10, ...Shadow.sm },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   cardTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, flex: 1, paddingRight: 8 },
//   cardBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, marginTop: 10, lineHeight: 21 },
//   empty: { alignItems: "center", padding: 40 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight },
// });



/**
 * JaundiCare — Comprehensive Care Guide & Clinical AI Panel
 * Optimizes structural view toggles to guarantee state preservation during multi-tab 
 * navigation loops and secures text input fields during high-density viewport changes.
 */

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
import { ConsultChat } from "../components/ConsultChat";
import { useTranslations } from "../hooks/useTranslations";

const SECTIONS = {
  warning: {
    icon: "warning-outline" as const,
    color: Colors.rust,
    bg: Colors.rustPale,
    title: "Warning Signs",
    subtitle: "Seek help immediately if you notice any of these signs",
    items: [
      { id: "w1", title: "Extreme difficulty waking", body: "Baby cannot be roused for feeds or stays limp when picked up. This is a medical emergency." },
      { id: "w2", title: "Yellowing in first 24 hours", body: "Any yellow tinge in the skin or eyes within the first day of life requires urgent hospital review." },
      { id: "w3", title: "Yellowing spreading to palms and soles", body: "When jaundice reaches the palms and soles, bilirubin levels are dangerously high. Go to hospital now." },
      { id: "w4", title: "Dark urine or pale/white stool", body: "Dark orange or brown urine, or white/clay-coloured stool, signals a serious liver or bile duct problem." },
      { id: "w5", title: "Poor feeding combined with yellow skin", body: "A baby who is yellowing AND refusing to feed needs same-day clinical assessment." },
      { id: "w6", title: "High-pitched or unusual cry", body: "A shrill, abnormal cry alongside jaundice may indicate bilirubin affecting the brain (acute bilirubin encephalopathy)." },
    ],
  },
  feeding: {
    icon: "nutrition-outline" as const,
    color: Colors.sage,
    bg: Colors.sagePale,
    title: "Feeding Tips",
    subtitle: "Frequent feeding is the single most effective home intervention",
    items: [
      { id: "f1", title: "Feed 8–12 times every 24 hours", body: "Frequent feeding stimulates bowel movements which carry bilirubin out of the body. Never skip a feed." },
      { id: "f2", title: "Wake a sleepy baby to feed", body: "Jaundiced babies are often too sleepy to demand feeds. Unwrap the baby, stroke the cheek, or tickle the feet to rouse them." },
      { id: "f3", title: "Watch for adequate output", body: "At least 3–4 soiled nappies per day in the first week confirms the baby is feeding well enough to clear bilirubin." },
      { id: "f4", title: "Do not supplement with water", body: "Water does not help clear bilirubin and can reduce breast milk supply. Breast milk alone is the correct treatment." },
      { id: "f5", title: "Ensure a good latch", body: "A shallow latch reduces how much milk the baby takes per feed. Ask a midwife or nurse to check positioning." },
      { id: "f6", title: "Continue breastfeeding even if jaundiced", body: "Stopping breastfeeding is rarely necessary. Only a clinician can advise stopping, and only in specific circumstances." },
    ],
  },
  education: {
    icon: "book-outline" as const,
    color: Colors.amber,
    bg: Colors.amberPale,
    title: "Education & Myths",
    subtitle: "Common questions answered clearly with clinical evidence",
    items: [
      { id: "e1", title: "Myth: Sunlight through a window treats jaundice", body: "Window glass filters out the UV wavelengths needed for phototherapy. Sunlight exposure without medical supervision can cause burns and heat stroke." },
      { id: "e2", title: "Myth: Traditional herbs or herbal baths help", body: "There is no clinical evidence that herbal remedies reduce bilirubin. Some can cause harm to a newborn's immature liver." },
      { id: "e3", title: "Fact: Most jaundice is normal", body: "Up to 60% of term newborns develop visible jaundice in the first week. Most cases resolve on their own with adequate feeding." },
      { id: "e4", title: "Fact: Darker skin makes visual detection harder", body: "Yellowing is harder to see on darker skin. Always check the whites of the eyes and the gums as these show yellowing regardless of skin tone." },
      { id: "e5", title: "Fact: Phototherapy is safe and effective", body: "Hospital phototherapy (blue light) is the proven treatment for significant jaundice. It is safe, painless, and works within 24–48 hours." },
      { id: "e6", title: "Fact: Premature babies need closer monitoring", body: "Babies born before 38 weeks have less mature livers and a lower threshold for treatment. More frequent checks are essential." },
    ],
  },
  ask_bot: {
    icon: "chatbubble-ellipses-outline" as const,
    color: Colors.coral,
    bg: Colors.coral + "15",
    title: "Care Guide",
    subtitle: "Ask maternal healthcare questions",
    items: [],
  }
};

type SectionKey = keyof typeof SECTIONS;
type AssistantKey = "newborn-care" | "immunisation-ng";

export default function CareScreen() {
  const { t } = useTranslations();
  const [activeSection, setActiveSection] = useState<SectionKey>("warning");
  const [activeAssistant, setActiveAssistant] = useState<AssistantKey>("newborn-care");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sections = {
    warning: {
      icon: "warning-outline" as const,
      color: Colors.rust,
      bg: Colors.rustPale,
      title: t("dashboard.warning_signs"),
      subtitle: t("parent.message.same_day"),
      items: [
        { id: "w1", title: t("edu.urgent.1"), body: t("next.urgent.3") },
        { id: "w2", title: t("edu.urgent.2"), body: t("next.urgent.3") },
        { id: "w3", title: t("edu.urgent.3"), body: t("next.same_day.1") },
        { id: "w4", title: t("edu.urgent.4"), body: t("next.urgent.3") },
        { id: "w5", title: t("edu.urgent.5"), body: t("next.urgent.3") },
      ],
    },
    feeding: {
      icon: "nutrition-outline" as const,
      color: Colors.sage,
      bg: Colors.sagePale,
      title: t("care.feeding.title"),
      subtitle: t("care.feeding.body"),
      items: [
        { id: "f1", title: t("care.feeding.1"), body: t("care.feeding.body") },
        { id: "f2", title: t("care.feeding.2"), body: t("next.same_day.2") },
        { id: "f3", title: t("care.feeding.3"), body: t("next.same_day.1") },
      ],
    },
    education: {
      icon: "book-outline" as const,
      color: Colors.amber,
      bg: Colors.amberPale,
      title: t("education.title"),
      subtitle: t("edu.what_is.body"),
      items: [
        { id: "e1", title: t("edu.what_is.title"), body: t("edu.what_is.body") },
        { id: "e2", title: t("edu.dark_skin.title"), body: t("edu.dark_skin.body") },
        { id: "e3", title: t("edu.what_to_do.title"), body: t("edu.what_to_do.4") },
        { id: "e4", title: t("edu.what_not_to_do.title"), body: t("edu.what_not_to_do.3") },
      ],
    },
    ask_bot: {
      icon: "chatbubble-ellipses-outline" as const,
      color: Colors.coral,
      bg: Colors.coral + "15",
      title: "Care Guide",
      subtitle: t("app.support"),
      items: [],
    },
  };

  const isChatActive = activeSection === "ask_bot";
  const section = sections[activeSection === "ask_bot" ? "warning" : activeSection];
  const chatConfig = activeAssistant === "newborn-care"
    ? {
        endpoint: "newborn-care" as const,
        title: "JaundiCare Care Guide",
        subtitle: "Ask about breastfeeding, jaundice warning signs, and newborn care.",
        placeholder: "Type your newborn-care question...",
        accentColor: Colors.coral,
        suggestedQuestions: [
          "How often should I breastfeed my newborn baby?",
          "My baby is still yellow on day 5, what should I do?",
          "Is it safe to give glucose water to clear yellow skin?",
        ],
      }
    : {
        endpoint: "immunisation-ng" as const,
        title: "JaundiCare Immunisation Guide",
        subtitle: "Ask about newborn immunisation visits and vaccine schedules.",
        placeholder: "Type your immunisation question...",
        accentColor: Colors.sage,
        suggestedQuestions: [
          "What vaccines are due for a baby at birth in Nigeria?",
          "What immunisations does a 6-week-old infant require?",
          "When should I take the immunisation card to the clinic?",
        ],
      };
  
  const filtered = section.items.filter(
    (item) =>
      search.trim().length < 2 ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* Persist header area seamlessly without breaking vertical height variables */}
      {!isChatActive && (
        <View style={s.header}>
          <Text style={s.heading}>{t("care.title")}</Text>
          <View style={s.searchContainer}>
            <TextInput
              style={s.search}
              value={search}
              onChangeText={setSearch}
              placeholder="Search care rules and guides..."
              placeholderTextColor={Colors.brownLight}
            />
            {search.length > 0 && (
              <TouchableOpacity style={s.clearButton} onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={Colors.brownLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Main Switcher Tab Bar */}
      <View style={s.tabs}>
        {(Object.keys(sections) as SectionKey[]).map((key) => {
          const sec = sections[key];
          const active = activeSection === key;
          return (
            <TouchableOpacity
              key={key}
              style={[s.tab, active && { borderBottomColor: sec.color, borderBottomWidth: 2 }]}
              onPress={() => { setActiveSection(key); setExpandedId(null); }}
            >
              <Ionicons name={sec.icon} size={16} color={active ? sec.color : Colors.brownLight} />
              <Text style={[s.tabText, active && { color: sec.color }]}>{sec.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content Rendering Zone */}
      <View style={s.viewportStack}>
        {/* Chat Layer Container */}
        <View style={[s.layerContainer, isChatActive ? s.visibleLayer : s.hiddenLayer]}>
          <View style={s.assistantPicker}>
            <TouchableOpacity
              style={[s.assistantButton, activeAssistant === "newborn-care" && s.assistantButtonActive]}
              onPress={() => setActiveAssistant("newborn-care")}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={15} color={activeAssistant === "newborn-care" ? Colors.coral : Colors.brownLight} />
              <Text style={[s.assistantButtonText, activeAssistant === "newborn-care" && { color: Colors.coral }]}>Care Guide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.assistantButton, activeAssistant === "immunisation-ng" && s.assistantButtonActive]}
              onPress={() => setActiveAssistant("immunisation-ng")}
            >
              <Ionicons name="shield-checkmark-outline" size={15} color={activeAssistant === "immunisation-ng" ? Colors.sage : Colors.brownLight} />
              <Text style={[s.assistantButtonText, activeAssistant === "immunisation-ng" && { color: Colors.sage }]}>Immunisation Guide</Text>
            </TouchableOpacity>
          </View>
          <ConsultChat
            key={chatConfig.endpoint}
            {...chatConfig}
          />
        </View>

        {/* Informational Document Layer Container */}
        <View style={[s.layerContainer, !isChatActive ? s.visibleLayer : s.hiddenLayer]}>
          <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <View style={[s.sectionBanner, { backgroundColor: section.bg }]}>
              <Ionicons name={section.icon} size={16} color={section.color} />
              <Text style={[s.sectionSub, { color: section.color }]}>{section.subtitle}</Text>
            </View>

            {filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={s.card}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  activeOpacity={0.8}
                >
                  <View style={s.cardHeader}>
                    <Text style={s.cardTitle}>{item.title}</Text>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.brownLight} />
                  </View>
                  {isExpanded && <Text style={s.cardBody}>{item.body}</Text>}
                </TouchableOpacity>
              );
            })}

            {filtered.length === 0 && (
              <View style={s.empty}>
                <Ionicons name="search-outline" size={32} color={Colors.border} style={{ marginBottom: 8 }} />
                <Text style={s.emptyText}>No results matching "{search}"</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, paddingBottom: 8 },
  heading: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.earth, marginBottom: 10 },
  searchContainer: { flexDirection: "row", alignItems: "center", position: "relative" },
  search: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 10,
    paddingRight: 36, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
    borderWidth: 1, borderColor: Colors.border,
  },
  clearButton: { position: "absolute", right: 10, padding: 4 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, gap: 4 },
  tabText: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.brownLight, textAlign: "center" },
  viewportStack: { flex: 1, position: "relative" },
  
  // Layer Layout Rules preserve the chat state in the background
  layerContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  visibleLayer: { display: "flex", opacity: 1, zIndex: 1 },
  hiddenLayer: { display: "none", opacity: 0, zIndex: -1 },
  assistantPicker: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 10, backgroundColor: Colors.background },
  assistantButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.card },
  assistantButtonActive: { borderColor: Colors.coral, backgroundColor: Colors.cream },
  assistantButtonText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.brownLight },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: Radius.md, padding: 10, marginBottom: 14 },
  sectionSub: { fontFamily: Fonts.medium, fontSize: 12, flex: 1, lineHeight: 18 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 14, marginBottom: 10, ...Shadow.sm },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.earth, flex: 1, paddingRight: 8 },
  cardBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brown, marginTop: 10, lineHeight: 21 },
  empty: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.brownLight },
});
