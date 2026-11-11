import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type Muscle = 'biceps' | 'forearms' | 'delts' | 'triceps' | 'traps';

const MUSCLES_FOR: Record<string, Muscle[]> = {
  bicep_curl: ['biceps', 'forearms'],
  hammer_curl: ['biceps', 'forearms'],
  lateral_raise: ['delts', 'traps'],
  shoulder_press: ['delts', 'triceps'],
  tricep_pushdown: ['triceps'],
};

/**
 * Simple front-view upper-body diagram. Target muscles light up in orange;
 * `left` / `right` (0–1) scale how hard each side is working right now.
 */
export function BodyMap({
  exercise,
  left = 0.6,
  right = 0.6,
  width = 150,
}: {
  exercise: string;
  left?: number;
  right?: number;
  width?: number;
}) {
  const on = new Set(MUSCLES_FOR[exercise] ?? []);
  const h = width * 1.25;
  const base = 'rgba(255,251,245,0.10)';
  const fill = (m: Muscle, side: 'l' | 'r') => {
    if (!on.has(m)) return 'rgba(255,251,245,0.06)';
    const a = 0.25 + 0.75 * Math.max(0, Math.min(1, side === 'l' ? left : right));
    return `rgba(255,119,0,${a.toFixed(2)})`;
  };
  // Drawn on a 120×150 grid; viewer's left = person's right.
  return (
    <Svg width={width} height={h} viewBox="0 0 120 150">
      <G>
        {/* head + neck */}
        <Circle cx={60} cy={16} r={11} fill={base} />
        <Rect x={54} y={26} width={12} height={8} rx={3} fill={base} />
        {/* torso */}
        <Path d="M36 38 Q60 30 84 38 L80 92 Q60 100 40 92 Z" fill={base} />
        {/* traps */}
        <Path d="M46 34 Q54 30 58 34 L52 40 Z" fill={fill('traps', 'r')} />
        <Path d="M74 34 Q66 30 62 34 L68 40 Z" fill={fill('traps', 'l')} />
        {/* delts */}
        <Ellipse cx={33} cy={42} rx={9} ry={8} fill={fill('delts', 'r')} />
        <Ellipse cx={87} cy={42} rx={9} ry={8} fill={fill('delts', 'l')} />
        {/* upper arms (biceps front, triceps outline behind) */}
        <Rect x={22} y={48} width={14} height={34} rx={7} fill={fill('triceps', 'r')} />
        <Rect x={84} y={48} width={14} height={34} rx={7} fill={fill('triceps', 'l')} />
        <Ellipse cx={30} cy={64} rx={6} ry={13} fill={fill('biceps', 'r')} />
        <Ellipse cx={90} cy={64} rx={6} ry={13} fill={fill('biceps', 'l')} />
        {/* forearms */}
        <Rect x={20} y={84} width={12} height={32} rx={6} fill={fill('forearms', 'r')} />
        <Rect x={88} y={84} width={12} height={32} rx={6} fill={fill('forearms', 'l')} />
        {/* hands */}
        <Circle cx={26} cy={121} r={5} fill={base} />
        <Circle cx={94} cy={121} r={5} fill={base} />
        {/* hips */}
        <Path d="M42 94 Q60 102 78 94 L76 112 L44 112 Z" fill={base} />
        {/* sensor pods */}
        <Rect x={17} y={50} width={6} height={9} rx={2} fill={colors.teal} />
        <Rect x={97} y={50} width={6} height={9} rx={2} fill={colors.teal} />
        <Rect x={18} y={106} width={6} height={8} rx={2} fill={colors.teal} />
        <Rect x={96} y={106} width={6} height={8} rx={2} fill={colors.teal} />
        <Rect x={56} y={52} width={8} height={8} rx={2} fill={colors.teal} />
      </G>
    </Svg>
  );
}
