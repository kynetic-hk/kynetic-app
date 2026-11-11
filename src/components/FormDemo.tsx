import { useEffect, useState } from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

/**
 * Looping side-view animation of correct form, drawn as a simple figure.
 * Curls bend the elbow with the upper arm fixed; lateral raise lifts the arm
 * out to shoulder height; press/pushdown move the forearm through range.
 */
export function FormDemo({ exercise, size = 160 }: { exercise: string; size?: number }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = Date.now();
    const loop = () => {
      setT(((Date.now() - t0) / 2800) % 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const k = (1 - Math.cos(t * Math.PI * 2)) / 2; // 0→1→0
  const rad = (d: number) => (d * Math.PI) / 180;

  // shoulder at (60, 46). Angles measured from straight down, clockwise toward front.
  const S = { x: 60, y: 46 };
  let upper = 0;
  let fore = 0;
  let front = true;
  if (exercise === 'lateral_raise') {
    upper = 10 + k * 78;
    fore = upper + 12;
    front = false; // front view
  } else if (exercise === 'shoulder_press') {
    upper = 100 + k * 70;
    fore = 180 - (1 - k) * 60 + k * 0;
    front = false;
  } else if (exercise === 'tricep_pushdown') {
    upper = 5;
    fore = 95 - k * 90;
  } else {
    upper = 4;
    fore = 10 + k * 125;
  }
  const L1 = 30;
  const L2 = 28;
  const E = { x: S.x + Math.sin(rad(upper)) * L1, y: S.y + Math.cos(rad(upper)) * L1 };
  const W = { x: E.x + Math.sin(rad(fore)) * L2, y: E.y + Math.cos(rad(fore)) * L2 };
  const E2 = { x: 120 - E.x, y: E.y };
  const W2 = { x: 120 - W.x, y: W.y };

  return (
    <Svg width={size} height={size} viewBox="0 0 120 130">
      {/* floor */}
      <Line x1={10} y1={124} x2={110} y2={124} stroke={colors.border} strokeWidth={2} />
      {/* body */}
      <Circle cx={60} cy={22} r={10} fill="rgba(255,251,245,0.85)" />
      <Path d={front ? 'M52 36 L68 36 L66 86 L54 86 Z' : 'M48 36 L72 36 L68 86 L52 86 Z'} fill="rgba(255,251,245,0.25)" />
      <Line x1={56} y1={86} x2={54} y2={122} stroke="rgba(255,251,245,0.4)" strokeWidth={6} strokeLinecap="round" />
      <Line x1={64} y1={86} x2={66} y2={122} stroke="rgba(255,251,245,0.4)" strokeWidth={6} strokeLinecap="round" />
      {!front && (
        <>
          <Line x1={120 - S.x} y1={S.y} x2={E2.x} y2={E2.y} stroke={colors.orange} strokeWidth={7} strokeLinecap="round" opacity={0.6} />
          <Line x1={E2.x} y1={E2.y} x2={W2.x} y2={W2.y} stroke={colors.orange} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          <Rect x={W2.x - 6} y={W2.y - 3} width={12} height={6} rx={2} fill={colors.text} />
        </>
      )}
      {/* working arm */}
      <Line x1={S.x} y1={S.y} x2={E.x} y2={E.y} stroke={colors.orange} strokeWidth={7} strokeLinecap="round" />
      <Line x1={E.x} y1={E.y} x2={W.x} y2={W.y} stroke={colors.orange} strokeWidth={6} strokeLinecap="round" />
      <Rect x={W.x - 6} y={W.y - 3} width={12} height={6} rx={2} fill={colors.text} />
      {/* pods */}
      <Circle cx={(S.x + E.x) / 2} cy={(S.y + E.y) / 2} r={3.5} fill={colors.teal} />
      <Circle cx={E.x + (W.x - E.x) * 0.75} cy={E.y + (W.y - E.y) * 0.75} r={3.5} fill={colors.teal} />
    </Svg>
  );
}
