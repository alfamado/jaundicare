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

// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { Platform } from "react-native";
// import { Colors } from "../../constants/colors";

// export default function TabLayout() {
//   // Android with gesture nav needs extra bottom padding
//   // to clear the home indicator / navigation bar
//   const extraBottom = Platform.OS === "android" ? 12 : 0;

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: Colors.earth,
//           borderTopColor: "rgba(255,255,255,0.08)",
//           paddingBottom: 6 + extraBottom,
//           paddingTop: 6,
//           height: 62 + extraBottom,
//         },
//         tabBarActiveTintColor: Colors.coral,
//         tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
//         tabBarLabelStyle: {
//           fontSize: 10,
//           fontFamily: "Outfit_500Medium",
//           marginBottom: 2,
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
// import { Platform } from "react-native";
// import { Colors } from "../../constants/colors";

// export default function TabLayout() {
//   // Android with gesture nav needs extra bottom padding
//   // to clear the home indicator / navigation bar
//   const extraBottom = Platform.OS === "android" ? 12 : 0;

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: Colors.earth,
//           borderTopColor: "rgba(255,255,255,0.08)",
//           paddingBottom: 6 + extraBottom,
//           paddingTop: 6,
//           height: 62 + extraBottom,
//         },
//         tabBarActiveTintColor: Colors.coral,
//         tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
//         tabBarLabelStyle: {
//           fontSize: 10,
//           fontFamily: "Outfit_500Medium",
//           marginBottom: 2,
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
// import { Colors } from "../../constants/colors";

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: Colors.earth,
//           borderTopColor: "rgba(255,255,255,0.08)",
//           paddingBottom: 18,
//           paddingTop: 8,
//           height: 72,
//         },
//         tabBarActiveTintColor: Colors.coral,
//         tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
//         tabBarLabelStyle: {
//           fontSize: 10,
//           fontFamily: "Outfit_500Medium",
//           marginBottom: 2,
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
// import { Platform, useWindowDimensions } from "react-native";
// import { Colors } from "../../constants/colors";

// function useNavBarHeight() {
//   const { width, height } = useWindowDimensions();
//   const ratio = height / width;
  
//   if (Platform.OS !== "android") return 0;
  
//   if (ratio > 2.1) return 24;
//   // Standard Android phones
//   if (ratio > 1.8) return 16;
//   return 8;
// }

// export default function TabLayout() {
//   const navBarHeight = useNavBarHeight();

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: Colors.earth,
//           borderTopColor: "rgba(255,255,255,0.08)",
//           paddingBottom: 8 + navBarHeight,
//           paddingTop: 8,
//           height: 60 + navBarHeight,
//         },
//         tabBarActiveTintColor: Colors.coral,
//         tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
//         tabBarLabelStyle: {
//           fontSize: 10,
//           fontFamily: "Outfit_500Medium",
//           marginBottom: 2,
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


/**
 * JaundiCare — Bottom Tab Layout Configuration (Production Ready)
 * Sets up safe cross-platform bottom navigation heights, locks down specific font stylings,
 * and handles role-based hiding properties to isolate parent paths from clinical CHW dashboards.
 */

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, useWindowDimensions } from "react-native";
import { Colors } from "../../constants/colors";
import { useAppStore } from "../../store/appStore"; // Import your global application store

function useNavBarHeight() {
  const { width, height } = useWindowDimensions();
  const ratio = height / width;
  
  if (Platform.OS !== "android") return 0;
  
  if (ratio > 2.1) return 24;
  // Standard Android devices
  if (ratio > 1.8) return 16;
  return 8;
}

export default function TabLayout() {
  const navBarHeight = useNavBarHeight();
  
  // Safely extract the onboarded role state to evaluate feature accessibility
  // If your store structures the role variable under a different name (like userRole), swap it here
  const role = useAppStore((s) => s.role); 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.earth || "#1E1B18",
          borderTopColor: "rgba(255,255,255,0.08)",
          paddingBottom: Platform.OS === "ios" ? 24 : 8 + navBarHeight,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 78 : 60 + navBarHeight,
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
          // Hides the tab completely from the visual bar if the user is signed in as a parent
          href: role === "health_worker" ? "/chw" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}