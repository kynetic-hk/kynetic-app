import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { ColorValue } from 'react-native';

type P = { color: ColorValue | string; size?: number };

// Simple line icons drawn in-house so the app has no icon-font dependency.
export const HomeIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Svg>
);
export const ChartIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);
export const BookIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" />
  </Svg>
);
export const UserIcon = ({ color, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color as string} strokeWidth={2} strokeLinecap="round">
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Svg>
);
export const PodIcon = ({ color, size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color as string} strokeWidth={2}>
    <Rect x={6} y={5} width={12} height={14} rx={3} />
    <Path d="M10 9h4" strokeLinecap="round" />
  </Svg>
);
export const PlayIcon = ({ color, size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color as string}>
    <Path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
  </Svg>
);
