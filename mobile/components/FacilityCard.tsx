import React from "react";
import {
  View, Text, TouchableOpacity, Linking, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadow } from "../constants/colors";
import type { Facility } from "../services/api";

interface Props {
  facility: Facility;
}

function titleCase(str: string) {
  return str.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const typeColors: Record<string, { bg: string; text: string }> = {
  tertiary:  { bg: "#fdecea", text: Colors.rust },
  secondary: { bg: Colors.amberPale, text: Colors.amberDark },
  primary:   { bg: Colors.sagePale, text: Colors.sage },
};

export function FacilityCard({ facility: f }: Props) {
  const typeStyle = typeColors[f.type] ?? typeColors.primary;

  const openMaps = () => {
    if (!f.latitude || !f.longitude) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
    Linking.openURL(url);
  };

  const callPhone = () => {
    if (!f.phone) return;
    Linking.openURL(`tel:${f.phone}`);
  };

  const distanceText = f.distance_km != null
    ? `${f.distance_km} km away`
    : "📋 State lookup";

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.name} numberOfLines={2}>{f.name}</Text>
        <View style={[s.typeBadge, { backgroundColor: typeStyle.bg }]}>
          <Text style={[s.typeText, { color: typeStyle.text }]}>{titleCase(f.type)}</Text>
        </View>
      </View>

      {f.fallback_note && (
        <View style={s.fallbackBanner}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.amberDark} />
          <Text style={s.fallbackText}>{f.fallback_note}</Text>
        </View>
      )}

      <View style={s.metaRow}>
        <Ionicons name="location-outline" size={13} color={Colors.brownLight} />
        <Text style={s.metaText}>{f.address}</Text>
      </View>

      <View style={s.metaRow}>
        <Ionicons name="navigate-outline" size={13} color={Colors.brownLight} />
        <Text style={s.metaText}>{distanceText}</Text>
      </View>

      {f.phone && (
        <View style={s.metaRow}>
          <Ionicons name="call-outline" size={13} color={Colors.brownLight} />
          <Text style={s.metaText}>{f.phone}</Text>
        </View>
      )}

      {/* Services */}
      <View style={s.services}>
        {(f.services || []).map((svc) => (
          <View key={svc} style={s.serviceChip}>
            <Text style={s.serviceText}>{titleCase(svc)}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={s.actions}>
        {f.phone && (
          <TouchableOpacity style={s.callBtn} onPress={callPhone}>
            <Ionicons name="call" size={14} color="#fff" />
            <Text style={s.callBtnText}>Call</Text>
          </TouchableOpacity>
        )}
        {f.latitude && f.longitude && (
          <TouchableOpacity style={s.mapBtn} onPress={openMaps}>
            <Ionicons name="map-outline" size={14} color={Colors.coral} />
            <Text style={s.mapBtnText}>Directions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
  },
  typeText: { fontFamily: Fonts.medium, fontSize: 11 },

  fallbackBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
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
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.brownLight,
    flex: 1,
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

  actions: { flexDirection: "row", gap: 8 },
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
