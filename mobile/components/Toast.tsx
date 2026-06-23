import React, { useState, useCallback, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { Colors, Fonts, Radius } from "../constants/colors";

export function useToast() {
  const [message, setMessage] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;
  const timer   = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    timer.current = setTimeout(() => setMessage(""), 3000);
  }, [opacity]);

  const ToastComponent = (
    <Animated.View style={[s.toast, { opacity }]} pointerEvents="none">
      <Text style={s.text}>{message}</Text>
    </Animated.View>
  );

  return { showToast, ToastComponent };
}

const s = StyleSheet.create({
  toast: {
    position:        "absolute",
    bottom:          90,
    left:            20,
    right:           20,
    backgroundColor: Colors.earth,
    borderRadius:    Radius.lg,
    padding:         14,
    zIndex:          999,
    shadowColor:     "#000",
    shadowOpacity:   0.25,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       8,
  },
  text: {
    fontFamily: Fonts.medium,
    fontSize:   13,
    color:      "#fff",
    textAlign:  "center",
  },
});
