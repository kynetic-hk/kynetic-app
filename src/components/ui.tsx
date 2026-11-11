import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius, scoreColor, space, type } from '../theme';

const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' && s.btnPrimary,
        variant === 'secondary' && s.btnSecondary,
        variant === 'ghost' && s.btnGhost,
        disabled && { opacity: 0.35 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        style,
      ]}
    >
      <Text style={[s.btnText, variant === 'primary' && { color: '#120800' }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[s.chip, selected && s.chipOn]}
    >
      <Text style={[s.chipText, selected && { color: colors.orange }]}>{label}</Text>
    </Pressable>
  );
}

export function OptionCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[s.option, selected && s.optionOn]}
    >
      <View style={{ flex: 1 }}>
        <Text style={type.h3}>{title}</Text>
        {subtitle ? <Text style={[type.small, { marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      <View style={[s.radio, selected && s.radioOn]}>{selected ? <View style={s.radioDot} /> : null}</View>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: space.lg }}>
      <Text style={[type.label, { marginBottom: space.sm }]}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMute} selectionColor={colors.orange} style={s.input} {...props} />
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.dot, i <= step && { backgroundColor: colors.orange }, i === step && { width: 22 }]} />
      ))}
    </View>
  );
}

/** Circular 0–100 score ring. */
export function ScoreRing({ score, size = 120, stroke = 10, label }: { score: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const col = scoreColor(score);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceHigh} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={col}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(c * score) / 100} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[type.number, { fontSize: size * 0.3 }]}>{score}</Text>
      {label ? <Text style={[type.label, { fontSize: 10, marginTop: -2 }]}>{label}</Text> : null}
    </View>
  );
}

/** Wordmark. Uses text until the logo SVG is added to assets. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <Text style={{ fontSize: size, fontWeight: '900', letterSpacing: size * 0.18, color: colors.text }}>
      KYNETIC<Text style={{ color: colors.orange }}>.</Text>
    </Text>
  );
}

const s = StyleSheet.create({
  btn: { height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  btnPrimary: { backgroundColor: colors.orange },
  btnSecondary: { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border },
  btnGhost: { backgroundColor: 'transparent' },
  btnText: { fontSize: 17, fontWeight: '700', color: colors.text },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.orange, backgroundColor: colors.orangeDim },
  chipText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: space.md,
  },
  optionOn: { borderColor: colors.orange, backgroundColor: colors.orangeDim },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textMute, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.orange },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange },
  input: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: space.lg,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceHigh },
});
