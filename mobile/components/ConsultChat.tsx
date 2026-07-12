// /**
//  * JaundiCare — ConsultChat component
//  * Reusable chat UI for MamaBot and VaxAI consultations.
//  * Used inside care.tsx (MamaBot) and chw.tsx (VaxAI).
//  */

// import React, { useState, useRef } from "react";
// import {
//   View, Text, TextInput, TouchableOpacity,
//   ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
// import { API_BASE_URL } from "../services/api";

// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   text: string;
//   timestamp: string;
// }

// interface Props {
//   endpoint: "mamabot" | "vaxai";
//   title: string;
//   subtitle: string;
//   placeholder: string;
//   accentColor: string;
//   suggestedQuestions: string[];
// }

// export function ConsultChat({
//   endpoint, title, subtitle, placeholder, accentColor, suggestedQuestions,
// }: Props) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput]       = useState("");
//   const [loading, setLoading]   = useState(false);
//   const scrollRef = useRef<ScrollView>(null);

//   const send = async (text: string) => {
//     if (!text.trim() || loading) return;
//     setInput("");

//     const userMsg: Message = {
//       id:        Date.now().toString(),
//       role:      "user",
//       text:      text.trim(),
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setLoading(true);

//     setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

//     try {
//       const res = await fetch(`${API_BASE_URL}/consult/${endpoint}`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ message: text.trim() }),
//       });
//       const data = await res.json();

//       const assistantMsg: Message = {
//         id:        `${Date.now()}_ai`,
//         role:      "assistant",
//         text:      data.response ?? "No response received.",
//         timestamp: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, assistantMsg]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id:        `${Date.now()}_err`,
//           role:      "assistant",
//           text:      "Could not reach the assistant. Please check your connection and try again.",
//           timestamp: new Date().toISOString(),
//         },
//       ]);
//     } finally {
//       setLoading(false);
//       setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={s.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       {/* Header */}
//       <View style={[s.header, { borderLeftColor: accentColor }]}>
//         <Text style={s.title}>{title}</Text>
//         <Text style={s.subtitle}>{subtitle}</Text>
//       </View>

//       {/* Messages */}
//       <ScrollView
//         ref={scrollRef}
//         style={s.messages}
//         contentContainerStyle={s.messagesContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {messages.length === 0 && (
//           <>
//             <Text style={s.emptyText}>Ask a question to get started.</Text>
//             <View style={s.suggestions}>
//               {suggestedQuestions.map((q, i) => (
//                 <TouchableOpacity key={i} style={s.suggestionChip} onPress={() => send(q)}>
//                   <Text style={s.suggestionText}>{q}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </>
//         )}

//         {messages.map((msg) => (
//           <View
//             key={msg.id}
//             style={[s.bubble, msg.role === "user" ? s.bubbleUser : s.bubbleAI]}
//           >
//             {msg.role === "assistant" && (
//               <View style={[s.aiIcon, { backgroundColor: accentColor }]}>
//                 <Ionicons name="sparkles" size={10} color="#fff" />
//               </View>
//             )}
//             <Text style={[s.bubbleText, msg.role === "user" && s.bubbleTextUser]}>
//               {msg.text}
//             </Text>
//           </View>
//         ))}

//         {loading && (
//           <View style={[s.bubble, s.bubbleAI]}>
//             <ActivityIndicator size="small" color={accentColor} />
//             <Text style={[s.bubbleText, { color: Colors.brownLight, marginLeft: 8 }]}>
//               Thinking...
//             </Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Input */}
//       <View style={s.inputRow}>
//         <TextInput
//           style={s.input}
//           value={input}
//           onChangeText={setInput}
//           placeholder={placeholder}
//           placeholderTextColor={Colors.brownLight}
//           multiline
//           maxLength={500}
//         />
//         <TouchableOpacity
//           style={[s.sendBtn, { backgroundColor: accentColor }, (!input.trim() || loading) && { opacity: 0.5 }]}
//           onPress={() => send(input)}
//           disabled={!input.trim() || loading}
//         >
//           <Ionicons name="send" size={16} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <Text style={s.disclaimer}>
//         Powered by HelpMum AI. Not a substitute for professional medical advice.
//       </Text>
//     </KeyboardAvoidingView>
//   );
// }

// const s = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   header: {
//     padding: 16, borderLeftWidth: 3,
//     marginHorizontal: 16, marginTop: 8, marginBottom: 4,
//   },
//   title:    { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   subtitle: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
//   messages: { flex: 1, paddingHorizontal: 16 },
//   messagesContent: { paddingVertical: 12, gap: 10 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, textAlign: "center", marginBottom: 16 },
//   suggestions: { gap: 8 },
//   suggestionChip: {
//     backgroundColor: Colors.card, borderRadius: Radius.lg,
//     padding: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
//   },
//   suggestionText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth },
//   bubble: {
//     maxWidth: "85%", borderRadius: Radius.lg, padding: 12,
//     flexDirection: "row", alignItems: "flex-start", gap: 6,
//   },
//   bubbleUser: { backgroundColor: Colors.coral, alignSelf: "flex-end" },
//   bubbleAI:   { backgroundColor: Colors.card, alignSelf: "flex-start", ...Shadow.sm },
//   bubbleText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth, flex: 1, lineHeight: 21 },
//   bubbleTextUser: { color: "#fff" },
//   aiIcon: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 1 },
//   inputRow: {
//     flexDirection: "row", gap: 8, padding: 12,
//     borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background,
//   },
//   input: {
//     flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg,
//     padding: 10, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
//     borderWidth: 1, borderColor: Colors.border, maxHeight: 100,
//   },
//   sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
//   disclaimer: {
//     fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight,
//     textAlign: "center", paddingBottom: 8,
//   },
// });



// /**
//  * JaundiCare — ConsultChat component
//  * Reusable chat UI for MamaBot and VaxAI consultations.
//  * Used inside care.tsx (MamaBot) and chw.tsx (VaxAI).
//  */

// import React, { useState, useRef } from "react";
// import {
//   View, Text, TextInput, TouchableOpacity,
//   ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
// import { API_BASE_URL } from "../services/api";

// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   text: string;
//   timestamp: string;
// }

// interface Props {
//   endpoint: "mamabot" | "vaxai";
//   title: string;
//   subtitle: string;
//   placeholder: string;
//   accentColor: string;
//   suggestedQuestions: string[];
// }

// export function ConsultChat({
//   endpoint, title, subtitle, placeholder, accentColor, suggestedQuestions,
// }: Props) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput]       = useState("");
//   const [loading, setLoading]   = useState(false);
//   const scrollRef = useRef<ScrollView>(null);

//   const send = async (text: string) => {
//     if (!text.trim() || loading) return;
//     setInput("");

//     const userMsg: Message = {
//       id:        Date.now().toString(),
//       role:      "user",
//       text:      text.trim(),
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setLoading(true);

//     setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

//     try {
//       const res = await fetch(`${API_BASE_URL}/consult/${endpoint}`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ message: text.trim() }),
//       });
//       const data = await res.json();

//       const assistantMsg: Message = {
//         id:        `${Date.now()}_ai`,
//         role:      "assistant",
//         text:      data.response ?? "No response received.",
//         timestamp: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, assistantMsg]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id:        `${Date.now()}_err`,
//           role:      "assistant",
//           text:      "Could not reach the assistant. Please check your connection and try again.",
//           timestamp: new Date().toISOString(),
//         },
//       ]);
//     } finally {
//       setLoading(false);
//       setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={s.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Accounts cleanly for Expo header offsets
//     >
//       {/* Header */}
//       <View style={[s.header, { borderLeftColor: accentColor }]}>
//         <Text style={s.title}>{title}</Text>
//         <Text style={s.subtitle}>{subtitle}</Text>
//       </View>

//       {/* Messages */}
//       <ScrollView
//         ref={scrollRef}
//         style={s.messages}
//         contentContainerStyle={s.messagesContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {messages.length === 0 && (
//           <>
//             <Text style={s.emptyText}>Ask a question to get started.</Text>
//             <View style={s.suggestions}>
//               {suggestedQuestions.map((q, i) => (
//                 <TouchableOpacity key={i} style={s.suggestionChip} onPress={() => send(q)}>
//                   <Text style={s.suggestionText}>{q}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </>
//         )}

//         {messages.map((msg) => {
//           const isAI = msg.role === "assistant";
//           return (
//             <View
//               key={msg.id}
//               style={[
//                 s.bubble, 
//                 isAI ? s.bubbleAI : s.bubbleUser,
//                 // Fixed: Only apply row layout if the message belongs to the AI assistant
//                 isAI ? { flexDirection: "row" } : { flexDirection: "column" }
//               ]}
//             >
//               {isAI && (
//                 <View style={[s.aiIcon, { backgroundColor: accentColor }]}>
//                   <Ionicons name="sparkles" size={10} color="#fff" />
//                 </View>
//               )}
//               <Text style={[s.bubbleText, !isAI && s.bubbleTextUser]}>
//                 {msg.text}
//               </Text>
//             </View>
//           );
//         })}

//         {loading && (
//           <View style={[s.bubble, s.bubbleAI, { flexDirection: "row" }]}>
//             <ActivityIndicator size="small" color={accentColor} />
//             <Text style={[s.bubbleText, { color: Colors.brownLight, marginLeft: 8 }]}>
//               Thinking...
//             </Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Input */}
//       <View style={s.inputRow}>
//         <TextInput
//           style={s.input}
//           value={input}
//           onChangeText={setInput}
//           placeholder={placeholder}
//           placeholderTextColor={Colors.brownLight}
//           multiline
//           maxLength={500}
//         />
//         <TouchableOpacity
//           style={[s.sendBtn, { backgroundColor: accentColor }, (!input.trim() || loading) && { opacity: 0.5 }]}
//           onPress={() => send(input)}
//           disabled={!input.trim() || loading}
//         >
//           <Ionicons name="send" size={16} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <Text style={s.disclaimer}>
//         Powered by HelpMum AI. Not a substitute for professional medical advice.
//       </Text>
//     </KeyboardAvoidingView>
//   );
// }

// const s = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   header: {
//     padding: 16, borderLeftWidth: 3,
//     marginHorizontal: 16, marginTop: 8, marginBottom: 4,
//   },
//   title:    { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
//   subtitle: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
//   messages: { flex: 1, paddingHorizontal: 16 },
//   messagesContent: { paddingVertical: 12, gap: 10 },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, textAlign: "center", marginBottom: 16 },
//   suggestions: { gap: 8 },
//   suggestionChip: {
//     backgroundColor: Colors.card, borderRadius: Radius.lg,
//     padding: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
//   },
//   suggestionText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth },
//   bubble: {
//     maxWidth: "85%", borderRadius: Radius.lg, padding: 12,
//     alignItems: "flex-start", gap: 6,
//   },
//   bubbleUser: { backgroundColor: Colors.coral, alignSelf: "flex-end" },
//   bubbleAI:   { backgroundColor: Colors.card, alignSelf: "flex-start", ...Shadow.sm },
//   bubbleText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth, flex: 1, lineHeight: 21 },
//   bubbleTextUser: { color: "#fff" },
//   aiIcon: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 1 },
//   inputRow: {
//     flexDirection: "row", gap: 8, padding: 12,
//     borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background,
//   },
//   input: {
//     flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg,
//     padding: 10, fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
//     borderWidth: 1, borderColor: Colors.border, maxHeight: 100,
//   },
//   sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
//   disclaimer: {
//     fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight,
//     textAlign: "center", paddingBottom: 8,
//   },
// });




/**
 * JaundiCare — ConsultChat component
 * Reusable chat UI for MamaBot and VaxAI consultations.
 * Used inside care.tsx (MamaBot) and chw.tsx (VaxAI).
 */

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
import { API_BASE_URL } from "../services/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface Props {
  endpoint: "mamabot" | "vaxai";
  title: string;
  subtitle: string;
  placeholder: string;
  accentColor: string;
  suggestedQuestions: string[];
}

export function ConsultChat({
  endpoint, title, subtitle, placeholder, accentColor, suggestedQuestions,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || loading) return;
    
    setInput("");

    const userMsg: Message = {
      id:        `user_${Date.now()}`,
      role:      "user",
      text:      trimmedText,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update message state array
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Structural execution timeout for network protection (15 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_BASE_URL}/consult/${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: trimmedText }),
        signal:  controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Server responded with error status");
      
      const data = await res.json();

      const assistantMsg: Message = {
        id:        `ai_${Date.now()}`,
        role:      "assistant",
        text:      data.response ?? "No response received from triage node.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = err.name === "AbortError";
      setMessages((prev) => [
        ...prev,
        {
          id:        `err_${Date.now()}`,
          role:      "assistant",
          text:      isTimeout 
            ? "Request timed out. Please verify connectivity or switch to offline mode and try again."
            : "Could not reach the assistant. Please check your network context and try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // High performance list renderer closure
  const renderItem = useCallback(({ item }: { item: Message }) => {
    const isAI = item.role === "assistant";
    return (
      <View
        style={[
          s.bubble, 
          isAI ? s.bubbleAI : s.bubbleUser,
          isAI ? { flexDirection: "row" } : { flexDirection: "column" }
        ]}
      >
        {isAI && (
          <View style={[s.aiIcon, { backgroundColor: accentColor }]}>
            <Ionicons name="sparkles" size={10} color="#fff" />
          </View>
        )}
        <Text style={[s.bubbleText, !isAI && s.bubbleTextUser]} selectable>
          {item.text}
        </Text>
      </View>
    );
  }, [accentColor]);

  // Handle header list layout abstraction
  const renderHeader = useMemo(() => (
    <View style={[s.header, { borderLeftColor: accentColor }]}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
    </View>
  ), [title, subtitle, accentColor]);

  // Handle baseline dynamic suggestions
  const renderFooter = useMemo(() => {
    if (messages.length > 0) return null;
    return (
      <View style={s.emptyContainer}>
        <Text style={s.emptyText}>Ask a question to get started.</Text>
        <View style={s.suggestions}>
          {suggestedQuestions.map((q, i) => (
            <TouchableOpacity key={i} style={s.suggestionChip} onPress={() => send(q)}>
              <Text style={s.suggestionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [messages.length, suggestedQuestions]);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {renderHeader}

      {/* Lazily evaluated context queue list container */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={
          <>
            {renderFooter}
            {loading && (
              <View style={[s.bubble, s.bubbleAI, s.loadingBubble, { flexDirection: "row" }]}>
                <ActivityIndicator size="small" color={accentColor} />
                <Text style={[s.bubbleText, { color: Colors.brownLight, marginLeft: 8 }]}>
                  Thinking...
                </Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={s.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => messages.length > 0 && listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => messages.length > 0 && listRef.current?.scrollToEnd({ animated: true })}
        removeClippedSubviews={Platform.OS === "android"} // Memory optimization barrier
      />

      {/* Input Module Bar */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.brownLight}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[s.sendBtn, { backgroundColor: accentColor }, (!input.trim() || loading) && { opacity: 0.5 }]}
          onPress={() => send(input)}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={s.disclaimer}>
        Powered by HelpMum AI. Not a substitute for professional medical advice.
      </Text>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 16, borderLeftWidth: 3,
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
  },
  title:    { fontFamily: Fonts.bold, fontSize: 17, color: Colors.earth },
  subtitle: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.brownLight, marginTop: 2 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 10, flexGrow: 1 },
  emptyContainer: { paddingVertical: 8 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight, textAlign: "center", marginBottom: 16 },
  suggestions: { gap: 8 },
  suggestionChip: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  suggestionText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.earth },
  bubble: {
    maxWidth: "85%", borderRadius: Radius.lg, padding: 12,
    alignItems: "flex-start", gap: 6,
  },
  bubbleUser: { backgroundColor: Colors.coral, alignSelf: "flex-end" },
  bubbleAI:   { backgroundColor: Colors.card, alignSelf: "flex-start", ...Shadow.sm },
  loadingBubble: { alignSelf: "flex-start", marginTop: 4 },
  bubbleText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth, flex: 1, lineHeight: 21 },
  bubbleTextUser: { color: "#fff" },
  aiIcon: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 1 },
  inputRow: {
    flexDirection: "row", gap: 8, padding: 12,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background,
    alignItems: "flex-end"
  },
  input: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: 10, paddingTop: 10, paddingBottom: 10,
    fontFamily: Fonts.regular, fontSize: 14, color: Colors.earth,
    borderWidth: 1, borderColor: Colors.border, maxHeight: 100,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 1 },
  disclaimer: {
    fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight,
    textAlign: "center", paddingBottom: 8, backgroundColor: Colors.background,
  },
});