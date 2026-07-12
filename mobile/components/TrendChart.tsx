// import React from "react";
// import { View, Text, StyleSheet, Dimensions } from "react-native";
// import { Svg, Line, Circle, Path, Text as SvgText } from "react-native-svg";
// import { Colors, Fonts } from "../constants/colors";

// const { width } = Dimensions.get("window");
// const W = width - 48;
// const H = 160;
// const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
// const CHART_W = W - PAD.left - PAD.right;
// const CHART_H = H - PAD.top - PAD.bottom;

// interface DataPoint {
//   date: string;
//   value: number;
//   label?: string;
// }

// interface Props {
//   data: DataPoint[];
//   title?: string;
//   unit?: string;
//   color?: string;
// }

// export function TrendChart({ data, title, unit = "", color = Colors.coral }: Props) {
//   if (!data || data.length < 2) {
//     return (
//       <View style={s.empty}>
//         <Text style={s.emptyText}>Not enough data to show a trend yet.</Text>
//       </View>
//     );
//   }

//   const values = data.map((d) => d.value);
//   const minV = Math.min(...values);
//   const maxV = Math.max(...values);
//   const range = maxV - minV || 1;

//   function xPos(i: number) {
//     return PAD.left + (i / (data.length - 1)) * CHART_W;
//   }
//   function yPos(v: number) {
//     return PAD.top + CHART_H - ((v - minV) / range) * CHART_H;
//   }

//   const pathD = data
//     .map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i)},${yPos(d.value)}`)
//     .join(" ");

//   return (
//     <View style={s.container}>
//       {title && <Text style={s.title}>{title}</Text>}
//       <Svg width={W} height={H}>
//         {/* Grid */}
//         {[0, 0.25, 0.5, 0.75, 1].map((t) => {
//           const y = PAD.top + t * CHART_H;
//           const v = maxV - t * range;
//           return (
//             <React.Fragment key={t}>
//               <Line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y} stroke="#eee" strokeWidth={1} />
//               <SvgText x={PAD.left - 4} y={y + 3} fontSize={8} fill={Colors.brownLight} textAnchor="end">
//                 {v.toFixed(1)}
//               </SvgText>
//             </React.Fragment>
//           );
//         })}

//         {/* Line */}
//         <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />

//         {/* Points */}
//         {data.map((d, i) => (
//           <Circle key={i} cx={xPos(i)} cy={yPos(d.value)} r={4} fill={color} />
//         ))}

//         {/* X labels — show first, middle, last */}
//         {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
//           <SvgText key={i} x={xPos(i)} y={H - 4} fontSize={8} fill={Colors.brownLight} textAnchor="middle">
//             {data[i].date}
//           </SvgText>
//         ))}
//       </Svg>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   container: { marginVertical: 4 },
//   title: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth, marginBottom: 4 },
//   empty: { padding: 20, alignItems: "center" },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
// });


// import React from "react";
// import { View, Text, StyleSheet, Dimensions } from "react-native";
// import { Svg, Line, Circle, Path, Text as SvgText } from "react-native-svg";
// import { Colors, Fonts } from "../constants/colors";

// const { width } = Dimensions.get("window");
// const W = width - 48;
// const H = 160;
// const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
// const CHART_W = W - PAD.left - PAD.right;
// const CHART_H = H - PAD.top - PAD.bottom;

// interface DataPoint {
//   date: string;
//   value: number;
//   label?: string;
// }

// interface Props {
//   data: DataPoint[];
//   title?: string;
//   unit?: string;
//   color?: string;
// }

// export function TrendChart({ data, title, unit = "", color = Colors.coral }: Props) {
//   if (!data || data.length < 2) {
//     return (
//       <View style={s.empty}>
//         <Text style={s.emptyText}>Not enough data to show a trend yet.</Text>
//       </View>
//     );
//   }

//   const values = data.map((d) => d.value);
//   const minV = Math.min(...values);
//   const maxV = Math.max(...values);
//   const range = maxV - minV || 1;

//   function xPos(i: number) {
//     return PAD.left + (i / (data.length - 1)) * CHART_W;
//   }
//   function yPos(v: number) {
//     return PAD.top + CHART_H - ((v - minV) / range) * CHART_H;
//   }

//   const pathD = data
//     .map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i)},${yPos(d.value)}`)
//     .join(" ");

//   // Deduplicate label indexes to prevent overlapping on tiny datasets (e.g. length = 2)
//   const labelIndices = Array.from(
//     new Set([0, Math.floor(data.length / 2), data.length - 1])
//   );

//   return (
//     <View style={s.container}>
//       {title && <Text style={s.title}>{title}</Text>}
//       <Svg width={W} height={H}>
//         {/* Horizontal grid guide lines */}
//         {[0, 0.25, 0.5, 0.75, 1].map((t) => {
//           const y = PAD.top + t * CHART_H;
//           const v = maxV - t * range;
//           return (
//             <React.Fragment key={t}>
//               <Line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y} stroke="#eee" strokeWidth={1} />
//               <SvgText x={PAD.left - 4} y={y + 3} fontSize={8} fill={Colors.brownLight} textAnchor="end">
//                 {v.toFixed(1)}{unit}
//               </SvgText>
//             </React.Fragment>
//           );
//         })}

//         {/* Continuous SVG Trend Path line */}
//         <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />

//         {/* Plotted individual data matrix points */}
//         {data.map((d, i) => (
//           <Circle key={i} cx={xPos(i)} cy={yPos(d.value)} r={4} fill={color} />
//         ))}

//         {/* X labels — safely filters duplicate indices */}
//         {labelIndices.map((i) => (
//           <SvgText key={i} x={xPos(i)} y={H - 4} fontSize={8} fill={Colors.brownLight} textAnchor="middle">
//             {data[i].date}
//           </SvgText>
//         ))}
//       </Svg>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   container: { marginVertical: 4 },
//   title:     { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth, marginBottom: 4 },
//   empty:     { padding: 20, alignItems: "center" },
//   emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
// });







import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Svg, Line, Circle, Path, Text as SvgText } from "react-native-svg";
import { Colors, Fonts } from "../constants/colors";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface Props {
  data: DataPoint[];
  title?: string;
  unit?: string;
  color?: string;
}

const H = 160;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
const CHART_H = H - PAD.top - PAD.bottom;

export function TrendChart({ data, title, unit = "", color = Colors.coral }: Props) {
  // Pull dimensions dynamically inside the render chain to handle rotations and split-screens safely
  const { width } = useWindowDimensions();
  
  // Calculate specific chart dimensions relative to the runtime device grid footprint
  const W = width - 48;
  const CHART_W = W - PAD.left - PAD.right;

  // Process core metrics within deep layout hooks to completely avoid parsing cycles on secondary state updates
  const chartSpecs = useMemo(() => {
    if (!data || data.length < 2) return null;

    // Production Safe Guard: Cap render density to preserve operational memory targets
    const processedData = data.length > 15 ? data.slice(-15) : data;

    const values = processedData.map((d) => d.value);
    let minV = Math.min(...values);
    let maxV = Math.max(...values);
    
    // Smooth Axis Correction: Ensures flat unchanging data sits perfectly balanced in the middle
    if (minV === maxV) {
      minV -= 1;
      maxV += 1;
    }
    
    const range = maxV - minV;

    const xPos = (i: number) => PAD.left + (i / (processedData.length - 1)) * CHART_W;
    const yPos = (v: number) => PAD.top + CHART_H - ((v - minV) / range) * CHART_H;

    const pathD = processedData
      .map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i)},${yPos(d.value)}`)
      .join(" ");

    // Smart Label Traversal: Ensures strict left, middle, right alignment targets without overlapping layout zones
    const labelIndices = [0, Math.floor(processedData.length / 2), processedData.length - 1].filter(
      (v, i, a) => a.indexOf(v) === i
    );

    return { processedData, minV, maxV, range, xPos, yPos, pathD, labelIndices };
  }, [data, CHART_W]);

  if (!chartSpecs) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>Not enough data to show a trend yet.</Text>
      </View>
    );
  }

  const { processedData, minV, maxV, range, xPos, yPos, pathD, labelIndices } = chartSpecs;

  // Static constant grid tiers
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={s.container}>
      {title && <Text style={s.title}>{title}</Text>}
      <Svg width={W} height={H}>
        {/* Horizontal grid guide lines */}
        {gridTicks.map((t) => {
          const y = PAD.top + t * CHART_H;
          const v = maxV - t * range;
          return (
            <React.Fragment key={t}>
              <Line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y} stroke="#eee" strokeWidth={1} />
              <SvgText x={PAD.left - 6} y={y + 3} fontSize={8} fill={Colors.brownLight} textAnchor="end">
                {v.toFixed(1)}{unit}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Continuous SVG Trend Path line */}
        <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />

        {/* Plotted individual data matrix points */}
        {processedData.map((d, i) => (
          <Circle key={i} cx={xPos(i)} cy={yPos(d.value)} r={4} fill={color} />
        ))}

        {/* X labels — safely filters duplicate indices */}
        {labelIndices.map((i) => (
          <SvgText key={i} x={xPos(i)} y={H - 4} fontSize={8} fill={Colors.brownLight} textAnchor="middle">
            {processedData[i].date}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginVertical: 8 },
  title:     { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.earth, marginBottom: 6 },
  empty:     { padding: 24, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.brownLight },
});