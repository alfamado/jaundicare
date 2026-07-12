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
        status:    "granted",
        message:   `Location set (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      });

    } catch (err) {
      if (!isMounted.current) return;
      setLocation({
        latitude:  null,
        longitude: null,
        status:    "error",
        message:   "Could not get location. Select your state manually.",
      });
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