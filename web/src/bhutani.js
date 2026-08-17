// Reference curves used by the mobile app. This is a clinical reference only,
// never a diagnosis or a substitute for a clinician's treatment decision.
const CURVE_95TH = [[12, 7.6], [18, 8.9], [24, 10], [30, 11], [36, 12.1], [42, 13.1], [48, 14], [54, 14.8], [60, 15.5], [72, 16.6], [84, 17.4], [96, 17.8], [108, 18], [120, 18.2]];
const CURVE_75TH = [[12, 5.8], [18, 7], [24, 8.1], [30, 9], [36, 9.9], [42, 10.7], [48, 11.5], [54, 12.1], [60, 12.7], [72, 13.7], [84, 14.3], [96, 14.7], [108, 14.9], [120, 15]];
const CURVE_40TH = [[12, 3.9], [18, 4.9], [24, 5.8], [30, 6.6], [36, 7.3], [42, 8], [48, 8.6], [54, 9.1], [60, 9.6], [72, 10.4], [84, 10.9], [96, 11.2], [108, 11.4], [120, 11.5]];

function interpolate(curve, hours) {
  if (hours <= curve[0][0]) return curve[0][1];
  if (hours >= curve.at(-1)[0]) return curve.at(-1)[1];
  for (let index = 0; index < curve.length - 1; index += 1) {
    const [x0, y0] = curve[index];
    const [x1, y1] = curve[index + 1];
    if (hours >= x0 && hours <= x1) return Math.round((y0 + ((hours - x0) / (x1 - x0)) * (y1 - y0)) * 100) / 100;
  }
  return curve.at(-1)[1];
}

export function assessBhutaniZone(ageHours, bilirubinMgDl) {
  const hours = Number(ageHours);
  const bilirubin = Number(bilirubinMgDl);
  if (!Number.isFinite(hours) || !Number.isFinite(bilirubin)) return null;
  if (hours < 12 || hours > 120) {
    return { zone: "Outside reference range", tone: "urgent", action: "This reference applies only from 12 to 120 hours. Discuss the result with a clinician promptly." };
  }
  const thresholds = { p95: interpolate(CURVE_95TH, hours), p75: interpolate(CURVE_75TH, hours), p40: interpolate(CURVE_40TH, hours) };
  if (bilirubin >= thresholds.p95) return { zone: "High risk", tone: "urgent", thresholds, action: "Immediate hospital referral and phototherapy assessment are needed. Do not delay." };
  if (bilirubin >= thresholds.p75) return { zone: "High-intermediate risk", tone: "same-day", thresholds, action: "Arrange same-day clinical review and a follow-up bilirubin check within 24 hours." };
  if (bilirubin >= thresholds.p40) return { zone: "Low-intermediate risk", tone: "same-day", thresholds, action: "Monitor closely and arrange a clinical recheck in 24 to 48 hours." };
  return { zone: "Low risk", tone: "monitor", thresholds, action: "Continue feeding and monitoring. A clinician should interpret this alongside the full clinical picture." };
}
