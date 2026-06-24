// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors } from "../../constants/colors";

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown:     false,
//         tabBarStyle: {
//           backgroundColor: Colors.earth,
//           borderTopColor:  "rgba(255,255,255,0.08)",
//           paddingBottom:   4,
//           height:          60,
//         },
//         tabBarActiveTintColor:   Colors.coral,
//         tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
//         tabBarLabelStyle: {
//           fontSize:   10,
//           fontFamily: "Outfit_500Medium",
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Dashboard",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="grid-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="screening"
//         options={{
//           title: "Screening",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="scan-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="history"
//         options={{
//           title: "History",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="list-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="chw"
//         options={{
//           title: "CHW",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="people-outline" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }




// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Colors } from "../../constants/colors";

// export default function TabLayout() {
//   const insets = useSafeAreaInsets();

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown:     false,
//         tabBarStyle: {
//           backgroundColor: Colors.earth,
//           borderTopColor:  "rgba(255,255,255,0.08)",
//           paddingBottom:   insets.bottom > 0 ? insets.bottom : 8,
//           height:          60 + (insets.bottom > 0 ? insets.bottom : 8),
//         },
//         tabBarActiveTintColor:   Colors.coral,
//         tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
//         tabBarLabelStyle: {
//           fontSize:   10,
//           fontFamily: "Outfit_500Medium",
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Dashboard",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="grid-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="screening"
//         options={{
//           title: "Screening",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="scan-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="history"
//         options={{
//           title: "History",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="list-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="chw"
//         options={{
//           title: "CHW",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="people-outline" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { Colors } from "../../constants/colors";

export default function TabLayout() {
  // Android with gesture nav needs extra bottom padding
  // to clear the home indicator / navigation bar
  const extraBottom = Platform.OS === "android" ? 12 : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.earth,
          borderTopColor: "rgba(255,255,255,0.08)",
          paddingBottom: 6 + extraBottom,
          paddingTop: 6,
          height: 62 + extraBottom,
        },
        tabBarActiveTintColor: Colors.coral,
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Outfit_500Medium",
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="screening"
        options={{
          title: "Screening",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chw"
        options={{
          title: "CHW",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}