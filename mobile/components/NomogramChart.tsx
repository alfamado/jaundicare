// import React from "react";
// import { View, Text, StyleSheet, Dimensions } from "react-native";
// import { Svg, Line, Path, Circle, Text as SvgText, Rect } from "react-native-svg";
// import { CURVE_95TH, CURVE_75TH, CURVE_40TH } from "../constants/bhutaniZones";
// import { Colors, Fonts } from "../constants/colors";

// const { width } = Dimensions.get("window");
// const W = width - 48;
// const H = 220;
// const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
// const CHART_W = W - PAD.left - PAD.right;
// const CHART_H = H - PAD.top - PAD.bottom;

// // Updated AGE_MIN to 12h to handle the early triage data allowed by our bhutaniZones math
// const AGE_MIN = 12, AGE_MAX = 120;
// const TSB_MIN = 0,  TSB_MAX = 22;

// function xScale(age: number) {
//   return PAD.left + ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * CHART_W;
// }
// function yScale(tsb: number) {
//   return PAD.top + CHART_H - ((tsb - TSB_MIN) / (TSB_MAX - TSB_MIN)) * CHART_H;
// }
// function curveToPath(curve: [number, number][]): string {
//   return curve
//     .filter(([age]) => age >= AGE_MIN && age <= AGE_MAX)
//     .map(([age, tsb], i) => `${i === 0 ? "M" : "L"}${xScale(age)},${yScale(tsb)}`)
//     .join(" ");
// }

// interface Props {
//   plotAge?: number;
//   plotTsb?: number;
//   zone?: string;
// }

// export function NomogramChart({ plotAge, plotTsb, zone }: Props) {
//   const hasPlot = plotAge != null && plotTsb != null;

//   const zoneColors: Record<string, string> = {
//     HIGH_RISK: Colors.statusRed,
//     HIGH_INTERMEDIATE: Colors.statusAmber,
//     LOW_INTERMEDIATE: "#F0C040", // Soft gold shade matches typical low-intermediate alerts
//     LOW_RISK: Colors.statusGreen,
//   };

//   const dotColor = zone ? zoneColors[zone] ?? Colors.coral : Colors.coral;

//   return (
//     <View style={s.container}>
//       <Svg width={W} height={H}>
//         {/* Background panel shading */}
//         <Rect x={PAD.left} y={PAD.top} width={CHART_W} height={CHART_H} fill="#edf4f0" />

//         {/* Horizontal grid lines (TSB levels) */}
//         {[3, 6, 9, 12, 15, 18, 21].map((tsb) => (
//           <Line key={tsb} x1={PAD.left} y1={yScale(tsb)} x2={PAD.left + CHART_W} y2={yScale(tsb)} stroke="#ccc" strokeWidth={0.5} strokeDasharray="3,3" />
//         ))}
        
//         {/* Vertical grid lines (Age benchmarks starting at 12 hours) */}
//         {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((age) => (
//           <Line key={age} x1={xScale(age)} y1={PAD.top} x2={xScale(age)} y2={PAD.top + CHART_H} stroke="#ccc" strokeWidth={0.5} strokeDasharray="3,3" />
//         ))}

//         {/* Percentile curves */}
//         <Path d={curveToPath(CURVE_40TH)} stroke="#F0C040" strokeWidth={2} fill="none" />
//         <Path d={curveToPath(CURVE_75TH)} stroke={Colors.statusAmber} strokeWidth={2} fill="none" />
//         <Path d={curveToPath(CURVE_95TH)} stroke={Colors.statusRed} strokeWidth={2} fill="none" />

//         {/* Dynamic plot coordinates for real-time triage positioning */}
//         <Line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CHART_H} stroke={Colors.earth} strokeWidth={1.5} />
//         <Line x1={PAD.left} y1={PAD.top + CHART_H} x2={PAD.left + CHART_W} y2={PAD.top + CHART_H} stroke={Colors.earth} strokeWidth={1.5} />

//         {/* X axis labels */}
//         {[12, 24, 48, 72, 96, 120].map((age) => (
//           <SvgText key={age} x={xScale(age)} y={H - 4} fontSize={9} fill={Colors.brownLight} textAnchor="middle">{age}h</SvgText>
//         ))}

//         {/* Y axis labels */}
//         {[0, 5, 10, 15, 20].map((tsb) => (
//           <SvgText key={tsb} x={PAD.left - 4} y={yScale(tsb) + 3} fontSize={9} fill={Colors.brownLight} textAnchor="end">{tsb}</SvgText>
//         ))}

//         {/* Plot point indicators */}
//         {hasPlot && plotAge >= AGE_MIN && plotAge <= AGE_MAX && (
//           <>
//             <Line x1={xScale(plotAge)} y1={PAD.top} x2={xScale(plotAge)} y2={PAD.top + CHART_H} stroke={dotColor} strokeWidth={1} strokeDasharray="4,2" />
//             <Line x1={PAD.left} y1={yScale(plotTsb!)} x2={PAD.left + CHART_W} y2={yScale(plotTsb!)} stroke={dotColor} strokeWidth={1} strokeDasharray="4,2" />
//             <Circle cx={xScale(plotAge)} cy={yScale(plotTsb!)} r={6} fill={dotColor} />
//           </>
//         )}
//       </Svg>

//       {/* Chart Legend indicators */}
//       <View style={s.legend}>
//         {[
//           { color: Colors.statusRed,   label: ">95th  High Risk" },
//           { color: Colors.statusAmber, label: "75-95th  High-Int" },
//           { color: "#F0C040",          label: "40-75th  Low-Int" },
//           { color: Colors.statusGreen, label: "<40th  Low Risk" },
//         ].map((l) => (
//           <View key={l.label} style={s.legendItem}>
//             <View style={[s.legendDot, { backgroundColor: l.color }]} />
//             <Text style={s.legendText}>{l.label}</Text>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   container:  { marginVertical: 8 },
//   legend:     { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" },
//   legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
//   legendDot:  { width: 8, height: 8, borderRadius: 4 },
//   legendText: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight },
// });


import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Svg, Line, Path, Circle, Text as SvgText, Rect } from "react-native-svg";
import { CURVE_95TH, CURVE_75TH, CURVE_40TH } from "../constants/bhutaniZones";
import { Colors, Fonts } from "../constants/colors";

const H = 220;
const PAD = { top: 16, right: 16, bottom: 32, left: 40 };

const AGE_MIN = 12, AGE_MAX = 120;
const TSB_MIN = 0,  TSB_MAX = 22;

interface Props {
  plotAge?: number;
  plotTsb?: number;
  zone?: string;
}

export function NomogramChart({ plotAge, plotTsb, zone }: Props) {
  // Pull responsive dimensions inside render loop to support rotation and split-views
  const { width } = useWindowDimensions();
  const W = width - 48;
  const CHART_W = W - PAD.left - PAD.right;
  const CHART_H = H - PAD.top - PAD.bottom;

  // Linear scale mapping helper closures bound to current responsive frame layout
  const xScale = (age: number) => {
    return PAD.left + ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * CHART_W;
  };

  const yScale = (tsb: number) => {
    return PAD.top + CHART_H - ((tsb - TSB_MIN) / (TSB_MAX - TSB_MIN)) * CHART_H;
  };

  const curveToPath = (curve: [number, number][]): string => {
    return curve
      .filter(([age]) => age >= AGE_MIN && age <= AGE_MAX)
      .map(([age, tsb], i) => `${i === 0 ? "M" : "L"}${xScale(age)},${yScale(tsb)}`)
      .join(" ");
  };

  // Cache SVG path strings to maximize performance during input changes
  const cachedPaths = useMemo(() => {
    return {
      curve40: curveToPath(CURVE_40TH),
      curve75: curveToPath(CURVE_75TH),
      curve95: curveToPath(CURVE_95TH),
    };
  }, [CHART_W, CHART_H]); // Recalculate if responsive device scale resets

  const zoneColors: Record<string, string> = {
    HIGH_RISK: Colors.statusRed,
    HIGH_INTERMEDIATE: Colors.statusAmber,
    LOW_INTERMEDIATE: "#F0C040", 
    LOW_RISK: Colors.statusGreen,
  };

  const dotColor = zone ? zoneColors[zone] ?? Colors.coral : Colors.coral;

  // Rigid clamp parameters ensuring crosshair visual metrics do not bleed outside chart panel
  const safePlotAge = plotAge != null ? Math.max(AGE_MIN, Math.min(plotAge, AGE_MAX)) : null;
  const safePlotTsb = plotTsb != null ? Math.max(TSB_MIN, Math.min(plotTsb, TSB_MAX)) : null;
  const showPlot = safePlotAge != null && safePlotTsb != null;

  return (
    <View style={s.container}>
      <Svg width={W} height={H}>
        {/* Background panel shading */}
        <Rect x={PAD.left} y={PAD.top} width={CHART_W} height={CHART_H} fill="#edf4f0" />

        {/* Horizontal grid lines (TSB levels) */}
        {[3, 6, 9, 12, 15, 18, 21].map((tsb) => (
          <Line key={tsb} x1={PAD.left} y1={yScale(tsb)} x2={PAD.left + CHART_W} y2={yScale(tsb)} stroke="#ccc" strokeWidth={0.5} strokeDasharray="3,3" />
        ))}
        
        {/* Vertical grid lines (Age benchmarks starting at 12 hours) */}
        {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((age) => (
          <Line key={age} x1={xScale(age)} y1={PAD.top} x2={xScale(age)} y2={PAD.top + CHART_H} stroke="#ccc" strokeWidth={0.5} strokeDasharray="3,3" />
        ))}

        {/* Cached percentile curves */}
        <Path d={cachedPaths.curve40} stroke="#F0C040" strokeWidth={2} fill="none" />
        <Path d={cachedPaths.curve75} stroke={Colors.statusAmber} strokeWidth={2} fill="none" />
        <Path d={cachedPaths.curve95} stroke={Colors.statusRed} strokeWidth={2} fill="none" />

        {/* Axis Bounds */}
        <Line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CHART_H} stroke={Colors.earth} strokeWidth={1.5} />
        <Line x1={PAD.left} y1={PAD.top + CHART_H} x2={PAD.left + CHART_W} y2={PAD.top + CHART_H} stroke={Colors.earth} strokeWidth={1.5} />

        {/* X axis labels */}
        {[12, 24, 48, 72, 96, 120].map((age) => (
          <SvgText key={age} x={xScale(age)} y={H - 4} fontSize={9} fill={Colors.brownLight} textAnchor="middle">{age}h</SvgText>
        ))}

        {/* Y axis labels */}
        {[0, 5, 10, 15, 20].map((tsb) => (
          <SvgText key={tsb} x={PAD.left - 4} y={yScale(tsb) + 3} fontSize={9} fill={Colors.brownLight} textAnchor="end">{tsb}</SvgText>
        ))}

        {/* Clamped range crosshair indicators */}
        {showPlot && (
          <>
            <Line x1={xScale(safePlotAge)} y1={PAD.top} x2={xScale(safePlotAge)} y2={PAD.top + CHART_H} stroke={dotColor} strokeWidth={1} strokeDasharray="4,2" />
            <Line x1={PAD.left} y1={yScale(safePlotTsb)} x2={PAD.left + CHART_W} y2={yScale(safePlotTsb)} stroke={dotColor} strokeWidth={1} strokeDasharray="4,2" />
            <Circle cx={xScale(safePlotAge)} cy={yScale(safePlotTsb)} r={6} fill={dotColor} />
          </>
        )}
      </Svg>

      {/* Chart Legend indicators */}
      <View style={s.legend}>
        {[
          { color: Colors.statusRed,   label: ">95th  High Risk" },
          { color: Colors.statusAmber, label: "75-95th  High-Int" },
          { color: "#F0C040",          label: "40-75th  Low-Int" },
          { color: Colors.statusGreen, label: "<40th  Low Risk" },
        ].map((l) => (
          <View key={l.label} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: l.color }]} />
            <Text style={s.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { marginVertical: 8 },
  legend:     { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.brownLight },
});