// /**
//  * JaundiCare — useLocation hook
//  * Wraps expo-location to get GPS coordinates.
//  * Falls back gracefully when permission denied.
//  */

// import { useState, useCallback } from "react";
// import * as Location from "expo-location";

// interface LocationState {
//   latitude:  number | null;
//   longitude: number | null;
//   status:    "idle" | "loading" | "granted" | "denied" | "error";
//   message:   string;
// }

// export function useLocation() {
//   const [location, setLocation] = useState<LocationState>({
//     latitude:  null,
//     longitude: null,
//     status:    "idle",
//     message:   "Location not yet set.",
//   });

//   const requestLocation = useCallback(async () => {
//     setLocation(prev => ({ ...prev, status: "loading", message: "Getting location..." }));

//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();

//       if (status !== "granted") {
//         setLocation(prev => ({
//           ...prev,
//           status:  "denied",
//           message: "Location permission denied. Select your state manually.",
//         }));
//         return;
//       }

//       // High accuracy — uses GPS on device, much better than browser geolocation
//       const pos = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });

//       const lat = pos.coords.latitude;
//       const lon = pos.coords.longitude;

//       setLocation({
//         latitude:  lat,
//         longitude: lon,
//         status:    "granted",
//         message:   `Location set (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
//       });

//     } catch (err) {
//       setLocation(prev => ({
//         ...prev,
//         status:  "error",
//         message: "Could not get location. Select your state manually.",
//       }));
//     }
//   }, []);

//   const clearLocation = useCallback(() => {
//     setLocation({
//       latitude:  null,
//       longitude: null,
//       status:    "idle",
//       message:   "Location not yet set.",
//     });
//   }, []);

//   return { location, requestLocation, clearLocation };
// }






/**
 * JaundiCare — useLocation hook (Production-Hardened)
 * Wraps expo-location to get GPS coordinates with strict memory guards and timeouts.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import * as Location from "expo-location";
import { LGA_DATA } from "../constants/lgaData";

interface LocationState {
  latitude:  number | null;
  longitude: number | null;
  state: string | null;
  lga: string | null;
  status:    "idle" | "loading" | "granted" | "denied" | "error";
  message:   string;
}

type AdministrativeArea = Pick<LocationState, "state" | "lga">;

const normaliseAreaName = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

function matchNigerianState(candidates: Array<string | null | undefined>): string | null {
  const aliases: Record<string, string> = {
    abuja: "FCT",
    fct: "FCT",
    federalcapitalterritory: "FCT",
    federalcapitalterritoryabuja: "FCT",
  };

  for (const candidate of candidates) {
    const normalised = normaliseAreaName(candidate);
    if (!normalised) continue;

    if (aliases[normalised]) return aliases[normalised];

    const matched = Object.keys(LGA_DATA).find(
      (knownState) => normaliseAreaName(knownState) === normalised,
    );
    if (matched) return matched;
  }

  return null;
}

function matchLga(
  state: string,
  candidates: Array<string | null | undefined>,
): string | null {
  const knownLgas = LGA_DATA[state] ?? [];
  for (const candidate of candidates) {
    const normalised = normaliseAreaName(candidate);
    if (!normalised) continue;

    const matched = knownLgas.find(
      (knownLga) => normaliseAreaName(knownLga) === normalised,
    );
    if (matched) return matched;
  }

  return null;
}

async function resolveAdministrativeArea(
  latitude: number,
  longitude: number,
): Promise<AdministrativeArea> {
  const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (!address) return { state: null, lga: null };

  const state = matchNigerianState([
    address.region,
    address.subregion,
    address.city,
  ]);
  const lga = state
    ? matchLga(state, [address.district, address.subregion, address.city])
    : null;

  return { state, lga };
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude:  null,
    longitude: null,
    state:     null,
    lga:       null,
    status:    "idle",
    message:   "Location not yet set.",
  });

  // ── Production Win: Memory safety thread tracker ──────────────────────────
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const requestLocation = useCallback(async () => {
    if (!isMounted.current) return;
    setLocation(prev => ({ ...prev, status: "loading", message: "Getting location..." }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!isMounted.current) return;

      if (status !== "granted") {
        setLocation({
          latitude:  null,
          longitude: null,
          state:     null,
          lga:       null,
          status:    "denied",
          message:   "Location permission denied. Select your state manually.",
        });
        return;
      }

      // ── Production Scaling Win: Safe execution race to prevent infinite lockups ──
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, 
      });

      // A standard 10-second rejection timer to keep mobile UI loops responsive
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Location request timed out")), 10000)
      );

      // Race the hardware sensor against our explicit threshold
      const pos = await Promise.race([locationPromise, timeoutPromise]);

      if (!isMounted.current) return;

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setLocation({
        latitude:  lat,
        longitude: lon,
        state:     null,
        lga:       null,
        status:    "granted",
        message:   "Location set. Finding your State and LGA...",
      });

      // This runs on the device after permission is granted. It lets the
      // screening retain planning-level State/LGA without sending a precise
      // GPS point to a separate reverse-geocoding service.
      try {
        const area = await resolveAdministrativeArea(lat, lon);
        if (!isMounted.current) return;

        setLocation((current) => {
          // Do not overwrite a newer location request or a cleared location.
          if (current.latitude !== lat || current.longitude !== lon) return current;

          const areaLabel = [area.lga, area.state].filter(Boolean).join(", ");
          return {
            ...current,
            ...area,
            message: areaLabel
              ? `Location set in ${areaLabel}. Confirm it below before screening.`
              : "Location set. Confirm your State and LGA below before screening.",
          };
        });
      } catch {
        // GPS is still useful for nearby facilities even when the device
        // cannot resolve an administrative area. The manual picker remains
        // available for the user to provide State/LGA.
        if (!isMounted.current) return;
        setLocation((current) => (
          current.latitude === lat && current.longitude === lon
            ? {
                ...current,
                message: "Location set. Confirm your State and LGA below before screening.",
              }
            : current
        ));
      }

    } catch (err) {
      if (!isMounted.current) return;
      setLocation({
        latitude:  null,
        longitude: null,
        state:     null,
        lga:       null,
        status:    "error",
        message:   "Could not get location. Select your state manually.",
      });
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation({
      latitude:  null,
      longitude: null,
      state:     null,
      lga:       null,
      status:    "idle",
      message:   "Location not yet set.",
    });
  }, []);

  return { location, requestLocation, clearLocation };
}
