import { useEffect, useRef, useState } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

/**
 * Kynetic's own cartoon avatar ("Kyn buddy"): big friendly head, flat shapes,
 * orange training tee. Users pick skin tone, hair style, hair colour and shirt.
 */
export interface AvatarLook {
  skin: number; // index into SKIN
  hair: number; // index into HAIR_STYLES
  hairColor: number; // index into HAIR_COLORS
  shirt: number; // index into SHIRTS
}

export const SKIN = ['#FCDCC4', '#F1C29E', '#D9A077', '#B07850', '#7C5236', '#4E3324'];
export const HAIR_COLORS = ['#1E1B1A', '#4A2E1F', '#8A5A35', '#D9B26F', '#B6452C', '#7E7E86'];
export const SHIRTS = ['#FF7700', '#30BABA', '#FFFBF5', '#2A2A2A'];
export const HAIR_STYLES = ['short', 'curly', 'long', 'bun', 'buzz', 'spiky'] as const;
export const DEFAULT_LOOK: AvatarLook = { skin: 1, hair: 0, hairColor: 0, shirt: 0 };

export type Pose = 'stand' | 'wave' | 'bicep_curl' | 'hammer_curl' | 'lateral_raise' | 'shoulder_press' | 'tricep_pushdown' | 'flex';

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

/** Animation clock: 0→1→0 over `period` ms. */
export function useLoop(period = 2600, enabled = true) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const t0 = Date.now();
    const tick = () => {
      const p = ((Date.now() - t0) % period) / period;
      setK((1 - Math.cos(p * Math.PI * 2)) / 2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [period, enabled]);
  return k;
}

/** Arm angles (degrees from hanging straight down, positive = outward) for a pose at progress k. */
function armAngles(pose: Pose, k: number) {
  switch (pose) {
    case 'bicep_curl':
    case 'hammer_curl':
      return { upper: 6, fore: 6 + k * 150 * -1 + 0, inward: true }; // forearm folds up toward shoulder
    case 'lateral_raise':
      return { upper: 12 + k * 76, fore: 22 + k * 76, inward: false };
    case 'shoulder_press':
      return { upper: 90 + k * 65, fore: 178 - k * 8, inward: false };
    case 'tricep_pushdown':
      return { upper: 6, fore: 6 - (1 - k) * 110, inward: true };
    case 'wave':
      return { upper: 150, fore: 165 + Math.sin(k * Math.PI * 2) * 18, inward: false, one: true };
    case 'flex':
      return { upper: 90, fore: 175, inward: false };
    default:
      return { upper: 8, fore: 8, inward: false };
  }
}

export function Avatar({
  look = DEFAULT_LOOK,
  pose = 'stand',
  k = 0,
  size = 160,
  headOnly = false,
  pods = false,
}: {
  look?: AvatarLook;
  pose?: Pose;
  k?: number;
  size?: number;
  headOnly?: boolean;
  pods?: boolean;
}) {
  const skin = SKIN[look.skin] ?? SKIN[1];
  const hairC = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0];
  const shirt = SHIRTS[look.shirt] ?? SHIRTS[0];
  const style = HAIR_STYLES[look.hair] ?? 'short';
  const skinDark = shade(skin, -0.12);
  const shirtDark = shade(shirt, -0.14);
  // unique per instance: duplicate SVG gradient ids break rendering when the same look appears twice
  const uid = useRef(Math.random().toString(36).slice(2, 9)).current;

  const head = (
    <G>
      {/* back hair (long / bun) */}
      {style === 'long' && <Path d="M28 44 Q26 86 40 96 L80 96 Q94 86 92 44 Z" fill={hairC} />}
      {style === 'bun' && <Circle cx={60} cy={10} r={11} fill={hairC} />}
      {/* ears */}
      <Ellipse cx={30} cy={50} rx={6} ry={8} fill={skinDark} />
      <Ellipse cx={90} cy={50} rx={6} ry={8} fill={skinDark} />
      {/* face */}
      <Ellipse cx={60} cy={48} rx={30} ry={32} fill={`url(#face${uid})`} />
      {/* hair front */}
      {style === 'short' && <Path d="M30 44 Q30 14 60 14 Q90 14 90 44 Q84 30 70 28 Q56 34 38 32 Q32 36 30 44 Z" fill={hairC} />}
      {style === 'curly' && (
        <G fill={hairC}>
          {[34, 44, 54, 64, 74, 84].map((x, i) => (
            <Circle key={i} cx={x} cy={i % 2 ? 20 : 24} r={10} />
          ))}
          <Circle cx={30} cy={34} r={8} />
          <Circle cx={90} cy={34} r={8} />
        </G>
      )}
      {style === 'long' && <Path d="M29 46 Q28 14 60 14 Q92 14 91 46 Q86 28 60 26 Q36 28 29 46 Z" fill={hairC} />}
      {style === 'bun' && <Path d="M30 42 Q32 16 60 16 Q88 16 90 42 Q80 28 60 27 Q40 28 30 42 Z" fill={hairC} />}
      {style === 'buzz' && <Path d="M31 40 Q33 17 60 17 Q87 17 89 40 Q80 28 60 26 Q40 28 31 40 Z" fill={hairC} opacity={0.75} />}
      {style === 'spiky' && <Path d="M30 42 L32 22 L40 28 L44 12 L52 24 L60 8 L66 24 L76 12 L78 28 L88 22 L90 42 Q80 30 60 30 Q40 30 30 42 Z" fill={hairC} />}
      {/* eyes */}
      <Ellipse cx={48} cy={50} rx={5} ry={6} fill="#FFFFFF" />
      <Ellipse cx={72} cy={50} rx={5} ry={6} fill="#FFFFFF" />
      <Circle cx={49} cy={51} r={3.2} fill="#1E1B1A" />
      <Circle cx={73} cy={51} r={3.2} fill="#1E1B1A" />
      <Circle cx={50} cy={49.5} r={1.1} fill="#FFFFFF" />
      <Circle cx={74} cy={49.5} r={1.1} fill="#FFFFFF" />
      {/* brows */}
      <Path d="M42 41 Q48 38 54 41" stroke={hairC} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <Path d="M66 41 Q72 38 78 41" stroke={hairC} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      {/* cheeks + smile */}
      <Ellipse cx={41} cy={62} rx={5} ry={3} fill="#FF7A59" opacity={0.28} />
      <Ellipse cx={79} cy={62} rx={5} ry={3} fill="#FF7A59" opacity={0.28} />
      <Path d="M50 63 Q60 72 70 63 Q60 67 50 63 Z" fill="#7A2E1F" stroke="#7A2E1F" strokeWidth={2} strokeLinejoin="round" />
    </G>
  );

  const defs = (
    <Defs>
      <LinearGradient id={`face${uid}`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={shade(skin, 0.04)} />
        <Stop offset="1" stopColor={skinDark} />
      </LinearGradient>
      <LinearGradient id={`shirt${uid}`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={shirt} />
        <Stop offset="1" stopColor={shirtDark} />
      </LinearGradient>
    </Defs>
  );

  if (headOnly)
    return (
      <Svg width={size} height={size} viewBox="22 4 76 84">
        {defs}
        {head}
      </Svg>
    );

  // full body: 120 × 200 canvas, head scaled down onto it
  const a = armAngles(pose, k);
  const rad = (d: number) => (d * Math.PI) / 180;
  const L1 = 30;
  const L2 = 27;
  // person's right arm is on viewer's left (x decreasing outward)
  const arm = (side: 1 | -1, active: boolean) => {
    const sx = 60 + side * 24;
    const sy = 102;
    const up = active ? a.upper : 8;
    let fo = active ? a.fore : 8;
    // curls/pushdowns fold the forearm toward the body midline in front view
    const foldIn = active && a.inward;
    const ex = sx + side * Math.sin(rad(up)) * L1;
    const ey = sy + Math.cos(rad(up)) * L1;
    let wx: number;
    let wy: number;
    if (foldIn) {
      const bend = Math.max(0, Math.min(150, -(fo - up)));
      wx = ex - side * Math.sin(rad(bend)) * L2 * 0.35;
      wy = ey + Math.cos(rad(bend)) * L2;
    } else {
      wx = ex + side * Math.sin(rad(fo)) * L2;
      wy = ey + Math.cos(rad(fo)) * L2;
    }
    const holding = pose !== 'stand' && pose !== 'wave' && pose !== 'flex';
    return (
      <G key={side}>
        {/* sleeve + upper arm */}
        <Path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={skin} strokeWidth={13} strokeLinecap="round" />
        <Path d={`M${sx} ${sy} L${sx + (ex - sx) * 0.42} ${sy + (ey - sy) * 0.42}`} stroke={`url(#shirt${uid})`} strokeWidth={16} strokeLinecap="round" />
        {/* forearm */}
        <Path d={`M${ex} ${ey} L${wx} ${wy}`} stroke={skinDark} strokeWidth={11} strokeLinecap="round" />
        <Circle cx={wx} cy={wy} r={6.5} fill={skin} />
        {holding && (
          <G>
            <Rect x={wx - 11} y={wy - 2.5} width={22} height={5} rx={2} fill="#9A9AA2" />
            <Rect x={wx - 15} y={wy - 7} width={6} height={14} rx={2} fill="#3A3A40" />
            <Rect x={wx + 9} y={wy - 7} width={6} height={14} rx={2} fill="#3A3A40" />
          </G>
        )}
        {pods && (
          <G>
            <Rect x={(sx + ex) / 2 - 4 + side * 6} y={(sy + ey) / 2 - 5} width={8} height={10} rx={2.5} fill={colors.teal} stroke="#202020" strokeWidth={1} />
            <Rect x={ex + (wx - ex) * 0.7 - 4} y={ey + (wy - ey) * 0.7 - 4} width={8} height={8} rx={2.5} fill={colors.teal} stroke="#202020" strokeWidth={1} />
          </G>
        )}
      </G>
    );
  };

  const one = 'one' in a && a.one;
  return (
    <Svg width={size} height={size * (200 / 120)} viewBox="0 0 120 200">
      {defs}
      {/* shadow */}
      <Ellipse cx={60} cy={194} rx={34} ry={5} fill="#000" opacity={0.25} />
      {/* legs */}
      <Rect x={44} y={150} width={14} height={40} rx={7} fill="#3A3A40" />
      <Rect x={62} y={150} width={14} height={40} rx={7} fill="#3A3A40" />
      <Ellipse cx={50} cy={190} rx={10} ry={5} fill="#FFFBF5" />
      <Ellipse cx={70} cy={190} rx={10} ry={5} fill="#FFFBF5" />
      {/* shorts */}
      <Path d="M40 140 L80 140 L82 162 L62 162 L60 152 L58 162 L38 162 Z" fill="#2A2A30" />
      {/* torso */}
      <Path d="M36 104 Q36 94 48 92 L72 92 Q84 94 84 104 L82 146 Q60 152 38 146 Z" fill={`url(#shirt${uid})`} />
      <Circle cx={60} cy={116} r={3} fill={look.shirt === 0 ? '#202020' : colors.orange} />
      {pods && <Rect x={55} y={100} width={10} height={9} rx={2.5} fill={colors.teal} stroke="#202020" strokeWidth={1} />}
      {/* neck */}
      <Rect x={53} y={80} width={14} height={14} rx={5} fill={skinDark} />
      {/* arms */}
      {arm(-1, !one)}
      {arm(1, true)}
      {/* head */}
      <G transform="translate(18 4) scale(0.7)">{head}</G>
    </Svg>
  );
}

/** Self-animating avatar demo for an exercise. */
export function AvatarDemo({ look, exercise, size = 140 }: { look?: AvatarLook; exercise: string; size?: number }) {
  const k = useLoop(exercise === 'lateral_raise' ? 2800 : 2400);
  return <Avatar look={look} pose={exercise as Pose} k={k} size={size} pods />;
}
