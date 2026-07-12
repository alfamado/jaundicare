// /**
//  * JaundiCare — Bhutani Nomogram Zones
//  * Source: Bhutani et al., Pediatrics 1999;103(1):6-14
//  * "Predictive ability of a predischarge hour-specific serum bilirubin
//  * for subsequent significant hyperbilirubinemia in healthy term and
//  * near-term newborns"
//  *
//  * Four risk zones defined by percentile curves:
//  * High Risk        > 95th percentile
//  * High-Intermediate  75th-95th percentile
//  * Low-Intermediate   40th-75th percentile
//  * Low Risk         < 40th percentile
//  *
//  * Values are Total Serum Bilirubin (TSB) in mg/dL at specific ages in hours.
//  * Linear interpolation is used between data points.
//  */

// import { Colors } from "./colors";

// export type BhutaniZone =
//   | "HIGH_RISK"
//   | "HIGH_INTERMEDIATE"
//   | "LOW_INTERMEDIATE"
//   | "LOW_RISK";

// export interface ZoneResult {
//   zone: BhutaniZone;
//   label: string;
//   color: string;
//   action: string;
//   urgent: boolean;
// }

// // ── Percentile curves from Bhutani 1999 Table 1 ──────────────────
// // Format: [ageHours, tsbMgDl]
// // Interpolate linearly between points for any given age

// export const CURVE_95TH: [number, number][] = [
//   [12, 7.6], [18, 8.9], [24, 10.0], [30, 11.0], [36, 12.1],
//   [42, 13.1], [48, 14.0], [54, 14.8], [60, 15.5], [72, 16.6],
//   [84, 17.4], [96, 17.8], [108, 18.0], [120, 18.2],
// ];

// export const CURVE_75TH: [number, number][] = [
//   [12, 5.8], [18, 7.0], [24, 8.1], [30, 9.0], [36, 9.9],
//   [42, 10.7], [48, 11.5], [54, 12.1], [60, 12.7], [72, 13.7],
//   [84, 14.3], [96, 14.7], [108, 14.9], [120, 15.0],
// ];

// export const CURVE_40TH: [number, number][] = [
//   [12, 3.9], [18, 4.9], [24, 5.8], [30, 6.6], [36, 7.3],
//   [42, 8.0], [48, 8.6], [54, 9.1], [60, 9.6], [72, 10.4],
//   [84, 10.9], [96, 11.2], [108, 11.4], [120, 11.5],
// ];

// // ── Linear interpolation helper ───────────────────────────────────
// function interpolate(curve: [number, number][], ageHours: number): number {
//   if (ageHours <= curve[0][0]) return curve[0][1];
//   if (ageHours >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];

//   for (let i = 0; i < curve.length - 1; i++) {
//     const [x0, y0] = curve[i];
//     const [x1, y1] = curve[i + 1];
//     if (ageHours >= x0 && ageHours <= x1) {
//       const t = (ageHours - x0) / (x1 - x0);
//       return y0 + t * (y1 - y0);
//     }
//   }
//   return curve[curve.length - 1][1];
// }

// // ── Main zone classifier ──────────────────────────────────────────
// export function getBhutaniZone(ageHours: number, tsbMgDl: number): ZoneResult {
//   // Nomogram curve boundaries are safely set to 12–120 hours of age
//   if (ageHours < 12 || ageHours > 120) {
//     return {
//       zone:   "HIGH_RISK",
//       label:  "Age Outside Nomogram Range",
//       color:  Colors.statusRed,
//       action: "Consult a clinician immediately — mathematical nomogram applies to 12–120 hours of age only.",
//       urgent: true,
//     };
//   }

//   const p95 = interpolate(CURVE_95TH, ageHours);
//   const p75 = interpolate(CURVE_75TH, ageHours);
//   const p40 = interpolate(CURVE_40TH, ageHours);

//   if (tsbMgDl >= p95) {
//     return {
//       zone:   "HIGH_RISK",
//       label:  "High Risk",
//       color:  Colors.statusRed,
//       action: "Immediate referral to hospital. Do not delay phototherapy assessment.",
//       urgent: true,
//     };
//   }
//   if (tsbMgDl >= p75) {
//     return {
//       zone:   "HIGH_INTERMEDIATE",
//       label:  "High-Intermediate Risk",
//       color:  Colors.statusAmber,
//       action: "Same-day clinical review required. Arrange follow-up bilirubin check within 24 hours.",
//       urgent: false,
//     };
//   }
//   if (tsbMgDl >= p40) {
//     return {
//       zone:   "LOW_INTERMEDIATE",
//       label:  "Low-Intermediate Risk",
//       color:  Colors.statusAmber,
//       action: "Monitor closely. Recheck bilirubin in 24–48 hours. Ensure adequate feeding.",
//       urgent: false,
//     };
//   }
//   return {
//     zone:   "LOW_RISK",
//     label:  "Low Risk",
//     color:  Colors.statusGreen,
//     action: "Continue monitoring at home. Encourage breastfeeding 8–12 times per day.",
//     urgent: false,
//   };
// }

// // ── Utility: get threshold values at a given age ──────────────────
// export function getThresholdsAtAge(ageHours: number) {
//   return {
//     p95: interpolate(CURVE_95TH, ageHours),
//     p75: interpolate(CURVE_75TH, ageHours),
//     p40: interpolate(CURVE_40TH, ageHours),
//   };
// }



// /**
//  * JaundiCare — Bhutani Nomogram Zones
//  * Source: Bhutani et al., Pediatrics 1999;103(1):6-14
//  *
//  * Four risk zones defined by percentile curves:
//  * High Risk         > 95th percentile
//  * High-Intermediate  75th-95th percentile
//  * Low-Intermediate   40th-75th percentile
//  * Low Risk          < 40th percentile
//  */

// import { Colors } from "./colors";

// export type BhutaniZone =
//   | "HIGH_RISK"
//   | "HIGH_INTERMEDIATE"
//   | "LOW_INTERMEDIATE"
//   | "LOW_RISK"
//   | "OUT_OF_BOUNDS";

// export interface ZoneResult {
//   zone: BhutaniZone;
//   labelKey: string;     // Translation identifier key string
//   actionKey: string;    // Translation identifier key string
//   color: string;
//   urgent: boolean;
//   thresholds: {
//     p95: number;
//     p75: number;
//     p40: number;
//   };
// }

// export const CURVE_95TH: [number, number][] = [
//   [12, 7.6], [18, 8.9], [24, 10.0], [30, 11.0], [36, 12.1],
//   [42, 13.1], [48, 14.0], [54, 14.8], [60, 15.5], [72, 16.6],
//   [84, 17.4], [96, 17.8], [108, 18.0], [120, 18.2],
// ];

// export const CURVE_75TH: [number, number][] = [
//   [12, 5.8], [18, 7.0], [24, 8.1], [30, 9.0], [36, 9.9],
//   [42, 10.7], [48, 11.5], [54, 12.1], [60, 12.7], [72, 13.7],
//   [84, 14.3], [96, 14.7], [108, 14.9], [120, 15.0],
// ];

// export const CURVE_40TH: [number, number][] = [
//   [12, 3.9], [18, 4.9], [24, 5.8], [30, 6.6], [36, 7.3],
//   [42, 8.0], [48, 8.6], [54, 9.1], [60, 9.6], [72, 10.4],
//   [84, 10.9], [96, 11.2], [108, 11.4], [120, 11.5],
// ];

// function interpolate(curve: [number, number][], ageHours: number): number {
//   if (ageHours <= curve[0][0]) return curve[0][1];
//   if (ageHours >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];

//   for (let i = 0; i < curve.length - 1; i++) {
//     const [x0, y0] = curve[i];
//     const [x1, y1] = curve[i + 1];
//     if (ageHours >= x0 && ageHours <= x1) {
//       const t = (ageHours - x0) / (x1 - x0);
//       // Hardened precision control: Round floating point outputs to 2 decimal spots
//       return Math.round((y0 + t * (y1 - y0)) * 100) / 100;
//     }
//   }
//   return curve[curve.length - 1][1];
// }

// export function getBhutaniZone(ageHours: number, tsbMgDl: number): ZoneResult {
//   const p95 = interpolate(CURVE_95TH, ageHours);
//   const p75 = interpolate(CURVE_75TH, ageHours);
//   const p40 = interpolate(CURVE_40TH, ageHours);

//   // Clear Structural Separation: Range exceptions return their own matching layout identifiers
//   if (ageHours < 12 || ageHours > 120) {
//     return {
//       zone: "OUT_OF_BOUNDS",
//       labelKey: "bhutani.out_of_bounds_label",
//       actionKey: "bhutani.out_of_bounds_action",
//       color: Colors.statusRed,
//       urgent: true,
//       thresholds: { p95, p75, p40 },
//     };
//   }

//   // Float Alignment Buffer: Standardize input values prior to parsing logic boundaries
//   const normalizedTsb = Math.round(tsbMgDl * 100) / 100;

//   if (normalizedTsb >= p95) {
//     return {
//       zone: "HIGH_RISK",
//       labelKey: "bhutani.high_risk_label",
//       actionKey: "bhutani.high_risk_action",
//       color: Colors.statusRed,
//       urgent: true,
//       thresholds: { p95, p75, p40 },
//     };
//   }
//   if (normalizedTsb >= p75) {
//     return {
//       zone: "HIGH_INTERMEDIATE",
//       labelKey: "bhutani.high_int_label",
//       actionKey: "bhutani.high_int_action",
//       color: Colors.statusAmber,
//       urgent: false,
//       thresholds: { p95, p75, p40 },
//     };
//   }
//   if (normalizedTsb >= p40) {
//     return {
//       zone: "LOW_INTERMEDIATE",
//       labelKey: "bhutani.low_int_label",
//       actionKey: "bhutani.low_int_action",
//       color: Colors.statusAmber,
//       urgent: false,
//       thresholds: { p95, p75, p40 },
//     };
//   }
//   return {
//     zone: "LOW_RISK",
//     labelKey: "bhutani.low_risk_label",
//     actionKey: "bhutani.low_risk_action",
//     color: Colors.statusGreen,
//     urgent: false,
//     thresholds: { p95, p75, p40 },
//   };
// }

// export function getThresholdsAtAge(ageHours: number) {
//   return {
//     p95: interpolate(CURVE_95TH, ageHours),
//     p75: interpolate(CURVE_75TH, ageHours),
//     p40: interpolate(CURVE_40TH, ageHours),
//   };
// }

/**
 * JaundiCare — Bhutani Nomogram Zones
 * Source: Bhutani et al., Pediatrics 1999;103(1):6-14
 *
 * Four risk zones defined by percentile curves:
 * High Risk         > 95th percentile
 * High-Intermediate  75th-95th percentile
 * Low-Intermediate   40th-75th percentile
 * Low Risk          < 40th percentile
 */


import { Colors } from "./colors";

export type BhutaniZone =
  | "HIGH_RISK"
  | "HIGH_INTERMEDIATE"
  | "LOW_INTERMEDIATE"
  | "LOW_RISK"
  | "OUT_OF_BOUNDS";

// ── Kept strictly identical to your UI model requirements ──────────────────
export interface ZoneResult {
  zone: BhutaniZone;
  label: string;
  color: string;
  action: string;
  urgent: boolean;
}

export const CURVE_95TH: [number, number][] = [
  [12, 7.6], [18, 8.9], [24, 10.0], [30, 11.0], [36, 12.1],
  [42, 13.1], [48, 14.0], [54, 14.8], [60, 15.5], [72, 16.6],
  [84, 17.4], [96, 17.8], [108, 18.0], [120, 18.2],
];

export const CURVE_75TH: [number, number][] = [
  [12, 5.8], [18, 7.0], [24, 8.1], [30, 9.0], [36, 9.9],
  [42, 10.7], [48, 11.5], [54, 12.1], [60, 12.7], [72, 13.7],
  [84, 14.3], [96, 14.7], [108, 14.9], [120, 15.0],
];

export const CURVE_40TH: [number, number][] = [
  [12, 3.9], [18, 4.9], [24, 5.8], [30, 6.6], [36, 7.3],
  [42, 8.0], [48, 8.6], [54, 9.1], [60, 9.6], [72, 10.4],
  [84, 10.9], [96, 11.2], [108, 11.4], [120, 11.5],
];

function interpolate(curve: [number, number][], ageHours: number): number {
  if (ageHours <= curve[0][0]) return curve[0][1];
  if (ageHours >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];

  for (let i = 0; i < curve.length - 1; i++) {
    const [x0, y0] = curve[i];
    const [x1, y1] = curve[i + 1];
    if (ageHours >= x0 && ageHours <= x1) {
      const t = (ageHours - x0) / (x1 - x0);
      // Prevent JavaScript floating point inaccuracy precision drift
      return Math.round((y0 + t * (y1 - y0)) * 100) / 100;
    }
  }
  return curve[curve.length - 1][1];
}

// ── Main zone classifier with safe optional translation hook ──────────────────
export function getBhutaniZone(ageHours: number, tsbMgDl: number, t?: (key: string) => string): ZoneResult {
  const translate = (key: string, fallback: string) => (t ? t(key) : fallback);

  // Range Boundary Guard
  if (ageHours < 12 || ageHours > 120) {
    return {
      zone:   "HIGH_RISK",
      label:  translate("screening.age_hours", "Age Outside Nomogram Range"),
      color:  Colors.statusRed,
      action: translate("parent.message.urgent", "Consult a clinician immediately — mathematical nomogram applies to 12–120 hours of age only."),
      urgent: true,
    };
  }

  const p95 = interpolate(CURVE_95TH, ageHours);
  const p75 = interpolate(CURVE_75TH, ageHours);
  const p40 = interpolate(CURVE_40TH, ageHours);

  const normalizedTsb = Math.round(tsbMgDl * 100) / 100;

  if (normalizedTsb >= p95) {
    return {
      zone:   "HIGH_RISK",
      label:  translate("status.urgent", "High Risk"),
      color:  Colors.statusRed,
      action: translate("urgent_parent", "Immediate referral to hospital. Do not delay phototherapy assessment."),
      urgent: true,
    };
  }
  if (normalizedTsb >= p75) {
    return {
      zone:   "HIGH_INTERMEDIATE",
      label:  translate("status.same_day", "High-Intermediate Risk"),
      color:  Colors.statusAmber,
      action: translate("same_day_parent", "Same-day clinical review required. Arrange follow-up bilirubin check within 24 hours."),
      urgent: false,
    };
  }
  if (normalizedTsb >= p40) {
    return {
      zone:   "LOW_INTERMEDIATE",
      label:  translate("status.same_day", "Low-Intermediate Risk"),
      color:  Colors.statusAmber,
      action: translate("recheck_parent", "Monitor closely. Recheck bilirubin in 24–48 hours. Ensure adequate feeding."),
      urgent: false,
    };
  }
  return {
    zone:   "LOW_RISK",
    label:  translate("status.monitor", "Low Risk"),
    color:  Colors.statusGreen,
    action: translate("monitor_parent", "Continue monitoring at home. Encourage breastfeeding 8–12 times per day."),
    urgent: false,
  };
}

export function getThresholdsAtAge(ageHours: number) {
  return {
    p95: interpolate(CURVE_95TH, ageHours),
    p75: interpolate(CURVE_75TH, ageHours),
    p40: interpolate(CURVE_40TH, ageHours),
  };
}