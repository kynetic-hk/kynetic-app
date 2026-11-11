import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

/**
 * Slow-moving glow background: soft orange and teal light blobs drifting over
 * the charcoal base, with a faint motion-line grid. Sits behind every screen.
 * `intensity` lets the live-set screen run a bit hotter.
 */
export function MotionBackground({ intensity = 1 }: { intensity?: number }) {
  const { width, height } = useWindowDimensions();
  const size = Math.max(width, height) * 0.9;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, overflow: 'hidden' }]}>
      <Blob color={colors.orange} size={size} opacity={0.34 * intensity} from={{ x: -0.45, y: -0.25 }} to={{ x: 0.1, y: 0.05 }} duration={14000} w={width} h={height} />
      <Blob color={colors.teal} size={size * 0.85} opacity={0.22 * intensity} from={{ x: 0.55, y: 0.55 }} to={{ x: 0.15, y: 0.3 }} duration={17000} w={width} h={height} />
      <Blob color={colors.orange} size={size * 0.6} opacity={0.16 * intensity} from={{ x: 0.6, y: -0.2 }} to={{ x: 0.35, y: 0.15 }} duration={11000} w={width} h={height} />
      <Streaks w={width} h={height} />
      {/* darken towards the bottom so content stays readable */}
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <RadialGradient id="vig" cx="50%" cy="40%" rx="75%" ry="70%">
            <Stop offset="0.55" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="1" stopColor="#101010" stopOpacity={0.85} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#vig)" />
      </Svg>
    </View>
  );
}

function Blob({
  color,
  size,
  opacity,
  from,
  to,
  duration,
  w,
  h,
}: {
  color: string;
  size: number;
  opacity: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  duration: number;
  w: number;
  h: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);

  const id = useRef(`g${Math.random().toString(36).slice(2, 8)}`).current;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        opacity,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [from.x * w, to.x * w] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [from.y * h, to.y * h] }) },
          { scale: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 0.95] }) },
        ],
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="0.45" stopColor={color} stopOpacity={0.45} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

/** Thin diagonal motion lines sliding slowly — a nod to movement tracking. */
function Streaks({ w, h }: { w: number; h: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  const gap = 46;
  const n = Math.ceil((w + h) / gap) + 2;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: -gap,
        top: 0,
        opacity: 0.06,
        transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, gap] }) }],
      }}
    >
      <Svg width={w + gap * 2} height={h}>
        {Array.from({ length: n }).map((_, i) => (
          <Line key={i} x1={i * gap - h} y1={h} x2={i * gap} y2={0} stroke={colors.text} strokeWidth={1} />
        ))}
      </Svg>
    </Animated.View>
  );
}
