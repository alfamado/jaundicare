// import React, { useState, useCallback, useRef } from "react";
// import { Animated, Text, StyleSheet } from "react-native";
// import { Colors, Fonts, Radius } from "../constants/colors";

// export function useToast() {
//   const [message, setMessage] = useState("");
//   const opacity = useRef(new Animated.Value(0)).current;
//   const timer   = useRef<ReturnType<typeof setTimeout>>();

//   const showToast = useCallback((msg: string) => {
//     setMessage(msg);
//     if (timer.current) clearTimeout(timer.current);

//     Animated.sequence([
//       Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
//       Animated.delay(2600),
//       Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
//     ]).start();

//     timer.current = setTimeout(() => setMessage(""), 3000);
//   }, [opacity]);

//   const ToastComponent = (
//     <Animated.View style={[s.toast, { opacity }]} pointerEvents="none">
//       <Text style={s.text}>{message}</Text>
//     </Animated.View>
//   );

//   return { showToast, ToastComponent };
// }

// const s = StyleSheet.create({
//   toast: {
//     position:        "absolute",
//     bottom:          90,
//     left:            20,
//     right:           20,
//     backgroundColor: Colors.earth,
//     borderRadius:    Radius.lg,
//     padding:         14,
//     zIndex:          999,
//     shadowColor:     "#000",
//     shadowOpacity:   0.25,
//     shadowRadius:    8,
//     shadowOffset:    { width: 0, height: 4 },
//     elevation:       8,
//   },
//   text: {
//     fontFamily: Fonts.medium,
//     fontSize:   13,
//     color:      "#fff",
//     textAlign:  "center",
//   },
// });





// import React, { useState, useCallback, useRef } from "react";
// import { Animated, Text, StyleSheet } from "react-native";
// import { Colors, Fonts, Radius } from "../constants/colors";

// export function useToast() {
//   const [message, setMessage] = useState("");
//   const opacity = useRef(new Animated.Value(0)).current;
//   const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   // Track active animation reference securely to prevent overlapping crashes
//   const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);

//   const showToast = useCallback((msg: string) => {
//     // 1. Reset text frame content instantly
//     setMessage(msg);

//     // 2. Clear any pending unmount timers
//     if (timer.current) {
//       clearTimeout(timer.current);
//       timer.current = null;
//     }

//     // 3. Halt any ongoing fade timelines safely before restarting the engine
//     if (activeAnimation.current) {
//       activeAnimation.current.stop();
//     }

//     // 4. Construct and safe-keep the new animation sequence
//     const anim = Animated.sequence([
//       Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
//       Animated.delay(2600),
//       Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
//     ]);

//     activeAnimation.current = anim;
//     anim.start(() => {
//       activeAnimation.current = null;
//     });

//     // 5. Cleanly unmount store state values after completion
//     timer.current = setTimeout(() => {
//       setMessage("");
//     }, 3000);
//   }, [opacity]);

//   // Securely unmount the layout tree element if no active alert string is active
//   const ToastComponent = message ? (
//     <Animated.View style={[s.toast, { opacity }]} pointerEvents="none">
//       <Text style={s.text}>{message}</Text>
//     </Animated.View>
//   ) : null;

//   return { showToast, ToastComponent };
// }

// const s = StyleSheet.create({
//   toast: {
//     position:        "absolute",
//     bottom:          90,
//     left:            20,
//     right:           20,
//     backgroundColor: Colors.earth,
//     borderRadius:    Radius.lg,
//     padding:         14,
//     zIndex:          999,
//     shadowColor:     "#000",
//     shadowOpacity:   0.25,
//     shadowRadius:    8,
//     shadowOffset:    { width: 0, height: 4 },
//     elevation:       8,
//   },
//   text: {
//     fontFamily: Fonts.medium,
//     fontSize:   13,
//     color:      "#fff",
//     textAlign:  "center",
//   },
// });




// import React, { useState, useCallback, useRef, useEffect } from "react";
// import { Animated, Text, StyleSheet } from "react-native";
// import { Colors, Fonts, Radius } from "../constants/colors";

// export function useToast() {
//   const [message, setMessage] = useState("");
//   const opacity = useRef(new Animated.Value(0)).current;
//   const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);

//   // Structural safety: Ensure all asynchronous timers clear out if parent screen unmounts mid-alert
//   useEffect(() => {
//     return () => {
//       if (timer.current) clearTimeout(timer.current);
//       if (activeAnimation.current) activeAnimation.current.stop();
//     };
//   }, []);

//   const showToast = useCallback((msg: string) => {
//     // 1. Clear any active unmount timers instantly
//     if (timer.current) {
//       clearTimeout(timer.current);
//       timer.current = null;
//     }

//     // 2. Halt running animation sequences smoothly
//     if (activeAnimation.current) {
//       activeAnimation.current.stop();
//     }

//     // 3. Mount text message 
//     setMessage(msg);

//     // 4. Construct fluid, hardware-accelerated composite sequence
//     const anim = Animated.sequence([
//       Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
//       Animated.delay(2600),
//       Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
//     ]);

//     activeAnimation.current = anim;
    
//     anim.start(({ finished }) => {
//       // Avoid wiping alternative queues if this sequence was aborted manually
//       if (finished) {
//         setMessage("");
//         activeAnimation.current = null;
//       }
//     });
//   }, [opacity]);

//   // Render check: Keeping layout unmounted when idle to lower GPU composition layers
//   const ToastComponent = message ? (
//     <Animated.View style={[s.toast, { opacity }]} pointerEvents="none">
//       <Text style={s.text} numberOfLines={3} ellipsizeMode="tail">
//         {message}
//       </Text>
//     </Animated.View>
//   ) : null;

//   return { showToast, ToastComponent };
// }

// const s = StyleSheet.create({
//   toast: {
//     position:        "absolute",
//     bottom:          90,
//     left:            20,
//     right:           20,
//     backgroundColor: Colors.earth,
//     borderRadius:    Radius.lg,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     zIndex:          9999, // Maximize visibility ceiling
//     shadowColor:     "#000",
//     shadowOpacity:   0.24,
//     shadowRadius:    6,
//     shadowOffset:    { width: 0, height: 3 },
//     elevation:       10,   // Ensure explicit overlay status across Android depth targets
//   },
//   text: {
//     fontFamily: Fonts.medium,
//     fontSize:   13,
//     color:      "#fff",
//     textAlign:  "center",
//     lineHeight: 18,
//   },
// });


/**
 * JaundiCare — useScreeningHistory Hook (Production-Hardened)
 * High-throughput state engine managing diagnostic histories across local persistent 
 * storage cells and cloud analytical processing routes.
 */

// import { useQuery } from "@tanstack/react-query";
// import { screeningApi } from "../services/api";
// import { useAppStore } from "../store/appStore";

// export function useScreeningHistory() {
//   const setHistory   = useAppStore((s) => s.setHistory);
//   const localHistory = useAppStore((s) => s.history);

//   const query = useQuery({
//     queryKey: ["history"],
//     queryFn: async () => {
//       const data = await screeningApi.history();
//       if (data) {
//         // Atomic transaction boundary: Sync to local store safely without UI lag
//         setHistory(data);
//       }
//       return data;
//     },
//     staleTime: 1000 * 60 * 5,        // Consider fresh for 5 mins
//     gcTime:    1000 * 60 * 60 * 24,   // Cache survives offline up to 24h
//     retry:     2,
//   });

//   return {
//     // ── Production Scaling Win: Safe local-first prioritization ──
//     // Ensures that locally injected offline screening objects remain visible in the UI
//     // while TanStack coordinates cloud reconciliations in the background.
//     history:   localHistory.length > 0 ? localHistory : (query.data ?? []),
//     isLoading: query.isLoading,
//     // Bulletproof network status flag matching React Query internal pause structures
//     isOffline: query.isPaused || (query.isError && localHistory.length > 0),
//     refetch:   query.refetch,
//   };
// }



// /**
//  * JaundiCare — useToast Hook
//  * Provides consistent global notification alerts across clinical context flows.
//  */

// import { useCallback } from 'react';
// import { Alert, ToastAndroid, Platform } from 'react-native';

// export type ToastType = 'success' | 'error' | 'info' | 'warning';

// export function useToast() {
//   const showToast = useCallback((message: string, type: ToastType = 'info') => {
//     console.log(`[Toast] (${type.toUpperCase()}): ${message}`);

//     if (Platform.OS === 'android') {
//       // Clean native Android transient popups
//       ToastAndroid.showWithGravity(
//         `${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`,
//         ToastAndroid.SHORT,
//         ToastAndroid.BOTTOM
//       );
//     } else {
//       // Fallback fallback for clear iOS alert systems
//       const titles: Record<ToastType, string> = {
//         success: 'Success',
//         error: 'Error',
//         info: 'Notice',
//         warning: 'Warning'
//       };
//       Alert.alert(titles[type], message, [{ text: 'OK' }]);
//     }
//   }, []);

//   return { show: showToast };
// }


// /**
//  * JaundiCare — useToast Hook & Component
//  * Production-ready custom UI toast notification system with built-in timing gates.
//  */

// import React, { useState, useCallback, useRef } from 'react';
// import { StyleSheet, Text, Animated, View, Platform, StatusBar } from 'react-native';

// export type ToastType = 'success' | 'error' | 'info' | 'warning';

// interface ToastState {
//   message: string;
//   type: ToastType;
//   visible: boolean;
// }

// export function useToast() {
//   const [toast, setToast] = useState<ToastState>({
//     message: '',
//     type: 'info',
//     visible: false,
//   });

//   const opacity = useRef(new Animated.Value(0)).current;
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const showToast = useCallback((message: string, type: ToastType = 'info') => {
//     // Clear any active running timeouts to prevent overlapping cleanup routines
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);

//     setToast({ message, type, visible: true });

//     // Smoothly fade-in notification window overlay
//     Animated.timing(opacity, {
//       toValue: 1,
//       duration: 250,
//       useNativeDriver: true,
//     }).start();

//     // Automatically transition layout state out after 3.5 seconds
//     timeoutRef.current = setTimeout(() => {
//       Animated.timing(opacity, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: true,
//       }).start(() => {
//         setToast((prev) => ({ ...prev, visible: false }));
//       });
//     }, 3500);
//   }, [opacity]);

//   // The inline layout component your views embed within their structural trees
//   const ToastComponent = useCallback(() => {
//     if (!toast.visible) return null;

//     const emojiMap: Record<ToastType, string> = {
//       success: '✅',
//       error: '❌',
//       info: 'ℹ️',
//       warning: '⚠️',
//     };

//     const styleMap = {
//       success: styles.success,
//       error: styles.error,
//       info: styles.info,
//       warning: styles.warning,
//     };

//     return (
//       <Animated.View style={[styles.container, styleMap[toast.type], { opacity }]}>
//         <View style={styles.content}>
//           <Text style={styles.emoji}>{emojiMap[toast.type]}</Text>
//           <Text style={styles.text} numberOfLines={3}>
//             {toast.message}
//           </Text>
//         </View>
//       </Animated.View>
//     );
//   }, [toast, opacity]);

//   return { showToast, ToastComponent };
// }

// // ── Production Theme Layout Design Sheets ────────────────────────────────────
// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     // Position cleanly underneath modern dynamic islands or status notch blocks
//     top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 0) + 16,
//     left: 16,
//     right: 16,
//     borderRadius: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     zIndex: 9999,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.15,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   content: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   emoji: {
//     fontSize: 18,
//     marginRight: 12,
//   },
//   text: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 1,
//     lineHeight: 18,
//   },
//   // Darker, high-contrast accessible clinical design tokens
//   success: { backgroundColor: '#10B981' },
//   error:   { backgroundColor: '#EF4444' },
//   info:    { backgroundColor: '#3B82F6' },
//   warning: { backgroundColor: '#F59E0B' },
// });

// /**
//  * JaundiCare — useToast Hook & Component
//  * Production-ready custom UI toast notification system with built-in timing gates.
//  */

// import React, { useState, useCallback, useRef } from 'react';
// import { StyleSheet, Text, Animated, View, Platform, StatusBar } from 'react-native';

// export type ToastType = 'success' | 'error' | 'info' | 'warning';

// interface ToastState {
//   message: string;
//   type: ToastType;
//   visible: boolean;
// }

// export function useToast() {
//   const [toast, setToast] = useState<ToastState>({
//     message: '',
//     type: 'info',
//     visible: false,
//   });

//   const opacity = useRef(new Animated.Value(0)).current;
  
//   // Production Win: Use standard ReturnType to remain platform-agnostic across environments
//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const showToast = useCallback((message: string, type: ToastType = 'info') => {
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);

//     setToast({ message, type, visible: true });

//     Animated.timing(opacity, {
//       toValue: 1,
//       duration: 250,
//       useNativeDriver: true,
//     }).start();

//     timeoutRef.current = setTimeout(() => {
//       Animated.timing(opacity, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: true,
//       }).start(() => {
//         setToast((prev) => ({ ...prev, visible: false }));
//       });
//     }, 3500);
//   }, [opacity]);

//   const ToastComponent = useCallback(() => {
//     if (!toast.visible) return null;

//     const emojiMap: Record<ToastType, string> = {
//       success: '✅',
//       error: '❌',
//       info: 'ℹ️',
//       warning: '⚠️',
//     };

//     const styleMap = {
//       success: styles.success,
//       error: styles.error,
//       info: styles.info,
//       warning: styles.warning,
//     };

//     return (
//       <Animated.View style={[styles.container, styleMap[toast.type], { opacity }]}>
//         <View style={styles.content}>
//           <Text style={styles.emoji}>{emojiMap[toast.type]}</Text>
//           <Text style={styles.text} numberOfLines={3}>
//             {toast.message}
//           </Text>
//         </View>
//       </Animated.View>
//     );
//   }, [toast, opacity]);

//   return { showToast, ToastComponent };
// }

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 0) + 16,
//     left: 16,
//     right: 16,
//     borderRadius: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     zIndex: 9999,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.15,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   content: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   emoji: {
//     fontSize: 18,
//     marginRight: 12,
//   },
//   text: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 1,
//     lineHeight: 18,
//   },
//   success: { backgroundColor: '#10B981' },
//   error:   { backgroundColor: '#EF4444' },
//   info:    { backgroundColor: '#3B82F6' },
//   warning: { backgroundColor: '#F59E0B' },
// });






/**
 * JaundiCare — useToast Hook & Component
 * Production-ready custom UI toast notification system with built-in timing gates.
 */

import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, Animated, View, Platform, StatusBar } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToast({ message, type, visible: true });

    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      });
    }, 3500);
  }, [opacity]);

  // FIX: Evaluate this immediately as JSX / null instead of returning a nested function
  const emojiMap: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const styleMap = {
    success: styles.success,
    error: styles.error,
    info: styles.info,
    warning: styles.warning,
  };

  const ToastComponent = toast.visible ? (
    <Animated.View style={[styles.container, styleMap[toast.type], { opacity }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{emojiMap[toast.type]}</Text>
        <Text style={styles.text} numberOfLines={3}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  ) : null;

  return { showToast, ToastComponent };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 0) + 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  success: { backgroundColor: '#10B981' },
  error:   { backgroundColor: '#EF4444' },
  info:    { backgroundColor: '#3B82F6' },
  warning: { backgroundColor: '#F59E0B' },
});