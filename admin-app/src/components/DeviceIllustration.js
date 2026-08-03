import React from "react";
import Svg, { Rect, Path, Circle, Line } from "react-native-svg";

const COLORS = {
  primary: "#1878B4",
  dark: "#0A0A0A",
  white: "#FFFFFF",
  tint: "#EAF4FB",
  muted: "#D1D9E0",
};

export default function DeviceIllustration({ width = 220, height = 160 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 160" fill="none">
      {/* ─── LAPTOP ─── */}
      {/* Screen body */}
      <Rect x="20" y="10" width="140" height="95" rx="8" fill={COLORS.dark} />
      {/* Screen bezel */}
      <Rect x="26" y="16" width="128" height="78" rx="4" fill={COLORS.tint} />
      {/* Dashboard UI bars */}
      <Rect x="34" y="26" width="50" height="6" rx="3" fill={COLORS.primary} opacity="0.9" />
      <Rect x="34" y="38" width="36" height="6" rx="3" fill={COLORS.muted} opacity="0.5" />
      <Rect x="34" y="50" width="44" height="6" rx="3" fill={COLORS.muted} opacity="0.5" />
      {/* Chart area */}
      <Rect x="92" y="26" width="56" height="44" rx="4" fill={COLORS.white} />
      <Line x1="98" y1="62" x2="98" y2="46" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" />
      <Line x1="108" y1="62" x2="108" y2="38" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" />
      <Line x1="118" y1="62" x2="118" y2="50" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" />
      <Line x1="128" y1="62" x2="128" y2="34" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" />
      <Line x1="138" y1="62" x2="138" y2="42" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" />
      {/* Sidebar dots */}
      <Circle cx="38" cy="68" r="3" fill={COLORS.primary} />
      <Circle cx="48" cy="68" r="3" fill={COLORS.muted} opacity="0.4" />
      <Circle cx="58" cy="68" r="3" fill={COLORS.muted} opacity="0.4" />
      {/* Bottom bar */}
      <Rect x="34" y="78" width="112" height="8" rx="4" fill={COLORS.muted} opacity="0.25" />
      {/* Laptop base / keyboard */}
      <Path d="M10 110 L28 105 L152 105 L170 110 Z" fill={COLORS.dark} />
      <Rect x="10" y="108" width="160" height="8" rx="2" fill="#1A1A1A" />
      {/* Keyboard hints */}
      <Rect x="30" y="110" width="20" height="3" rx="1" fill="#333" />
      <Rect x="55" y="110" width="20" height="3" rx="1" fill="#333" />
      <Rect x="80" y="110" width="20" height="3" rx="1" fill="#333" />
      <Rect x="105" y="110" width="20" height="3" rx="1" fill="#333" />
      <Rect x="130" y="110" width="20" height="3" rx="1" fill="#333" />

      {/* ─── PHONE (overlapping front) ─── */}
      <Rect x="130" y="40" width="68" height="120" rx="12" fill={COLORS.dark} />
      {/* Phone screen */}
      <Rect x="134" y="50" width="60" height="96" rx="8" fill={COLORS.tint} />
      {/* App header */}
      <Rect x="138" y="56" width="52" height="14" rx="4" fill={COLORS.primary} />
      <Rect x="142" y="59" width="24" height="4" rx="2" fill={COLORS.white} opacity="0.8" />
      {/* List items */}
      <Rect x="138" y="76" width="52" height="10" rx="3" fill={COLORS.white} />
      <Rect x="142" y="79" width="30" height="4" rx="2" fill={COLORS.muted} opacity="0.6" />
      <Rect x="138" y="90" width="52" height="10" rx="3" fill={COLORS.white} />
      <Rect x="142" y="93" width="26" height="4" rx="2" fill={COLORS.muted} opacity="0.6" />
      <Rect x="138" y="104" width="52" height="10" rx="3" fill={COLORS.white} />
      <Rect x="142" y="107" width="34" height="4" rx="2" fill={COLORS.muted} opacity="0.6" />
      <Rect x="138" y="118" width="52" height="10" rx="3" fill={COLORS.white} />
      <Rect x="142" y="121" width="20" height="4" rx="2" fill={COLORS.muted} opacity="0.6" />
      {/* Bottom nav bar */}
      <Rect x="138" y="134" width="12" height="6" rx="2" fill={COLORS.primary} />
      <Rect x="154" y="134" width="12" height="6" rx="2" fill={COLORS.muted} opacity="0.3" />
      <Rect x="170" y="134" width="12" height="6" rx="2" fill={COLORS.muted} opacity="0.3" />
      {/* Notch */}
      <Rect x="152" y="42" width="24" height="6" rx="3" fill={COLORS.dark} />
    </Svg>
  );
}
