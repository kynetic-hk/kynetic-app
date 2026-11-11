import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { setTip } from '../../src/analysis/reps';
import { Button, ScoreRing } from '../../src/components/ui';
import { exerciseById } from '../../src/data/exercises';
import { SetResult } from '../../src/data/sessions';
import { useWorkout } from '../../src/store/workout';
import { colors, radius, scoreColor, space, type } from '../../src/theme';

const SLIDE_MS = 4500;
const SLIDES = ['score', 'range', 'tempo', 'form', 'balance', 'next'] as const;

export default function Review() {
  const { lastSet, active, finishWorkout } = useWorkout();
  const [i, setI] = useState(0);
  const bar = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  const isLast = i === SLIDES.length - 1;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    bar.setValue(0);
    if (isLast) return;
    const anim = Animated.timing(bar, { toValue: 1, duration: SLIDE_MS, easing: Easing.linear, useNativeDriver: false });
    anim.start(({ finished }) => finished && setI((n) => Math.min(n + 1, SLIDES.length - 1)));
    return () => anim.stop();
  }, [i, isLast, bar, enter]);

  if (!lastSet) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Button title="Back to Home" onPress={() => router.replace('/home')} />
      </Screen>
    );
  }

  const s = lastSet.result;
  const ex = exerciseById(s.exercise);
  const setNo = active?.sets.filter((x) => x.exercise === s.exercise).length ?? 1;

  const finish = async () => {
    const id = await finishWorkout();
    router.replace(id ? `/session/${id}` : '/home');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      {/* story progress */}
      <View style={st.bars}>
        {SLIDES.map((_, k) => (
          <View key={k} style={st.barTrack}>
            <Animated.View
              style={[
                st.barFill,
                { width: k < i ? '100%' : k === i ? (isLast ? '100%' : bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })) : '0%' },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={st.head}>
        <Text style={type.small}>
          {ex.name} · Set {setNo}
        </Text>
        <RestTimer />
      </View>

      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            paddingHorizontal: space.xl,
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
          }}
        >
          {SLIDES[i] === 'score' && <ScoreSlide s={s} />}
          {SLIDES[i] === 'range' && <RangeSlide s={s} />}
          {SLIDES[i] === 'tempo' && <TempoSlide s={s} ideal={ex.idealTempo} />}
          {SLIDES[i] === 'form' && <FormSlide s={s} />}
          {SLIDES[i] === 'balance' && <BalanceSlide s={s} />}
          {SLIDES[i] === 'next' && <NextSlide s={s} />}
        </Animated.View>

        {/* tap zones (not on the last slide, which has buttons) */}
        {!isLast && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Pressable style={{ flex: 1 }} onPress={() => setI((n) => Math.max(0, n - 1))} accessibilityLabel="Previous" />
              <Pressable style={{ flex: 2 }} onPress={() => setI((n) => Math.min(SLIDES.length - 1, n + 1))} accessibilityLabel="Next" />
            </View>
          </View>
        )}
      </View>

      <View style={st.footer}>
        {isLast ? (
          <>
            <Button title={`Start set ${setNo + 1}`} onPress={() => router.replace({ pathname: '/workout/live', params: { exercise: s.exercise } })} />
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Button title="Change exercise" variant="secondary" style={{ flex: 1 }} onPress={() => router.replace('/workout/choose')} />
              <Button title="Finish" variant="secondary" style={{ flex: 1 }} onPress={finish} />
            </View>
          </>
        ) : (
          <Button title="Skip to next set" variant="ghost" onPress={() => setI(SLIDES.length - 1)} />
        )}
      </View>
    </Screen>
  );
}

function RestTimer() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={st.rest}>
      <Text style={[type.label, { fontSize: 10, color: colors.teal }]}>Rest</Text>
      <Text style={[type.h3, { fontVariant: ['tabular-nums'] }]}>
        {Math.floor(t / 60)}:{String(t % 60).padStart(2, '0')}
      </Text>
    </View>
  );
}

function Kicker({ children }: { children: string }) {
  return <Text style={[type.label, { color: colors.orange, marginBottom: space.sm }]}>{children}</Text>;
}

function Big({ children }: { children: React.ReactNode }) {
  return <Text style={st.big}>{children}</Text>;
}

const verdict = (x: number) => (x >= 90 ? 'Outstanding' : x >= 80 ? 'Strong set' : x >= 65 ? 'Solid work' : x >= 45 ? 'Room to improve' : 'Tough one');

function ScoreSlide({ s }: { s: SetResult }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n = Math.min(s.score, n + 3);
      setShown(n);
      if (n >= s.score) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [s.score]);
  return (
    <View style={st.slideCenter}>
      <Kicker>Your set score</Kicker>
      <ScoreRing score={shown} size={220} stroke={16} />
      <Text style={[type.h1, { marginTop: space.xl }]}>{verdict(s.score)}</Text>
      <Text style={[type.body, { color: colors.textDim, marginTop: space.sm }]}>
        {s.reps} reps · {s.durationSec ?? 0}s under tension
      </Text>
    </View>
  );
}

function RangeSlide({ s }: { s: SetResult }) {
  const reps = s.repRom ?? [];
  const short = reps.filter((r) => r < 85).length;
  return (
    <View style={st.slide}>
      <Kicker>Range of motion</Kicker>
      <Big>
        {short === 0 ? (
          <>Every rep, <Text style={{ color: colors.teal }}>full range.</Text></>
        ) : (
          <>
            <Text style={{ color: colors.orange }}>{short}</Text> {short === 1 ? 'rep was' : 'reps were'} cut short.
          </>
        )}
      </Big>
      <Bars values={reps} max={110} threshold={85} unit="%" />
      <Text style={type.small}>Bars below the line didn't reach the full range. Average {s.rom}/100.</Text>
    </View>
  );
}

function TempoSlide({ s, ideal }: { s: SetResult; ideal: [number, number] }) {
  const reps = s.repTempo ?? [];
  const fast = reps.filter((r) => r < ideal[0]).length;
  const avg = reps.length ? reps.reduce((a, b) => a + b, 0) / reps.length : 0;
  const maxT = Math.max(5, ...reps);
  return (
    <View style={st.slide}>
      <Kicker>Tempo</Kicker>
      <Big>
        {avg.toFixed(1)}s <Text style={{ color: colors.textDim, fontSize: 28 }}>per rep</Text>
      </Big>
      <View style={st.chart}>
        <View style={[st.band, { bottom: `${(ideal[0] / maxT) * 100}%`, height: `${((ideal[1] - ideal[0]) / maxT) * 100}%` }]}>
          <Text style={st.bandText}>Ideal</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flex: 1, gap: 6 }}>
          {reps.map((r, k) => {
            const ok = r >= ideal[0] && r <= ideal[1];
            return (
              <View key={k} style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                <View style={[st.dot, { bottom: `${(r / maxT) * 100}%`, backgroundColor: ok ? colors.teal : colors.orange }]} />
              </View>
            );
          })}
        </View>
      </View>
      <Text style={type.small}>{fast ? `${fast} ${fast === 1 ? 'rep was' : 'reps were'} rushed. Lower the weight for about 2 seconds.` : 'Nice control on every rep.'}</Text>
    </View>
  );
}

function FormSlide({ s }: { s: SetResult }) {
  const reps = s.repForm ?? [];
  const bad = reps.filter((r) => r < 75).length;
  return (
    <View style={st.slide}>
      <Kicker>Form</Kicker>
      <Big>
        <Text style={{ color: scoreColor(s.form) }}>{s.form}</Text>
        <Text style={{ color: colors.textDim, fontSize: 28 }}> / 100</Text>
      </Big>
      <Bars values={reps} max={100} threshold={75} />
      <Text style={type.small}>{bad ? `${bad} ${bad === 1 ? 'rep had' : 'reps had'} extra body movement. Keep everything but the working joint still.` : 'Rock solid. No swinging detected.'}</Text>
    </View>
  );
}

function BalanceSlide({ s }: { s: SetResult }) {
  const gap = Math.abs(s.balance.left - s.balance.right);
  const weak = s.balance.left < s.balance.right ? 'left' : 'right';
  return (
    <View style={st.slide}>
      <Kicker>Left vs right</Kicker>
      <Big>{gap <= 3 ? <Text style={{ color: colors.teal }}>Perfectly even.</Text> : <>Your <Text style={{ color: colors.orange }}>{weak}</Text> side did {gap}% less.</>}</Big>
      <View style={st.balRow}>
        <View style={{ flex: s.balance.left, alignItems: 'flex-start' }}>
          <Text style={[st.balNum, { color: colors.left }]}>{s.balance.left}%</Text>
          <View style={[st.balBar, { backgroundColor: colors.left }]} />
          <Text style={type.label}>Left</Text>
        </View>
        <View style={{ flex: s.balance.right, alignItems: 'flex-end' }}>
          <Text style={[st.balNum, { color: colors.right }]}>{s.balance.right}%</Text>
          <View style={[st.balBar, { backgroundColor: colors.right }]} />
          <Text style={type.label}>Right</Text>
        </View>
      </View>
      <Text style={type.small}>Share of the total work done by each arm.</Text>
    </View>
  );
}

function NextSlide({ s }: { s: SetResult }) {
  return (
    <View style={st.slide}>
      <Kicker>Coach's tip</Kicker>
      <Big>{setTip(s)}</Big>
      <View style={st.summaryRow}>
        {[
          ['Score', s.score],
          ['Range', s.rom],
          ['Tempo', s.tempo],
          ['Form', s.form],
        ].map(([k, v]) => (
          <View key={k} style={st.summaryCell}>
            <Text style={[type.h2, { color: scoreColor(v as number) }]}>{v}</Text>
            <Text style={[type.label, { fontSize: 10 }]}>{k}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Bars({ values, max, threshold, unit = '' }: { values: number[]; max: number; threshold: number; unit?: string }) {
  return (
    <View style={st.chart}>
      <View style={[st.threshold, { bottom: `${(threshold / max) * 100}%` }]} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', flex: 1, gap: 6 }}>
        {values.map((v, k) => (
          <View key={k} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <Text style={st.barLabel}>
              {v}
              {unit}
            </Text>
            <View style={{ width: '100%', height: `${(Math.min(v, max) / max) * 88}%`, borderRadius: 6, backgroundColor: v >= threshold ? colors.teal : colors.orange }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  bars: { flexDirection: 'row', gap: 4, paddingHorizontal: space.lg, paddingTop: space.sm },
  barTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,251,245,0.2)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.text },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.md },
  rest: { alignItems: 'flex-end' },
  slide: { flex: 1, justifyContent: 'center', gap: space.lg },
  slideCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  big: { fontSize: 38, fontWeight: '900', color: colors.text, letterSpacing: -1, lineHeight: 44 },
  chart: { height: 220, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: space.md, paddingTop: space.xl },
  threshold: { position: 'absolute', left: space.md, right: space.md, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,251,245,0.35)' },
  barLabel: { fontSize: 9, color: colors.textDim, marginBottom: 3, fontWeight: '700' },
  band: { position: 'absolute', left: space.md, right: space.md, backgroundColor: 'rgba(48,186,186,0.15)', borderRadius: 6, justifyContent: 'center', paddingLeft: 6 },
  bandText: { color: colors.teal, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  dot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, marginBottom: -7 },
  balRow: { flexDirection: 'row', gap: 4, marginVertical: space.lg },
  balNum: { fontSize: 44, fontWeight: '900' },
  balBar: { height: 14, width: '100%', borderRadius: 7, marginVertical: space.sm },
  summaryRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  summaryCell: { flex: 1, alignItems: 'center', padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.md, gap: space.sm },
});
