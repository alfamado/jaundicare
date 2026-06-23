/**
 * JaundiCare — useLocation hook
 * Wraps expo-location to get GPS coordinates.
 * Falls back gracefully when permission denied.
 */

import { useState, useCallback } from "react";
import * as Location from "expo-location";

interface LocationState {
  latitude:  number | null;
  longitude: number | null;
  status:    "idle" | "loading" | "granted" | "denied" | "error";
  message:   string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude:  null,
    longitude: null,
    status:    "idle",
    message:   "Location not yet set.",
  });

  const requestLocation = useCallback(async () => {
    setLocation(prev => ({ ...prev, status: "loading", message: "Getting location..." }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocation(prev => ({
          ...prev,
          status:  "denied",
          message: "Location permission denied. Select your state manually.",
        }));
        return;
      }

      // High accuracy — uses GPS on device, much better than browser geolocation
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setLocation({
        latitude:  lat,
        longitude: lon,
        status:    "granted",
        message:   `Location set (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      });

    } catch (err) {
      setLocation(prev => ({
        ...prev,
        status:  "error",
        message: "Could not get location. Select your state manually.",
      }));
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation({
      latitude:  null,
      longitude: null,
      status:    "idle",
      message:   "Location not yet set.",
    });
  }, []);

  return { location, requestLocation, clearLocation };
}