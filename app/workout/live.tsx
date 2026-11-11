import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Cue, Rep, RepCounter, summariseSet } from '../../src/analysis/reps';
import { BodyMap } from '../../src/components/BodyMap';
import { Button } from '../../src/components/ui';
import { exerciseById } from '../../src/data/exercises';
import { useI18n } from '../../src/i18n';
import { getSensorSource } from '../../src/sensors';
import { useProfile } from '../../src/store/profile';
import { useWorkout } from '../../src/store/workout';
import { colors, radius, scoreColor, space, type } from '../../src/theme';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function Live() {
  const { exercise: exParam } = useLocalSearchParams<{ exercise?: string }>();
  const { profile } = useProfile();
  const { t } = useI18n();
  const { active, addSet, startWorkout } = useWorkout();
  const ex = exerciseById(exParam ?? active?.exercise ?? 'bicep_curl');
  const setNo = (active?.sets.filter((s) => s.exercise === ex.id).length ?? 0) + 1;

  const counter = useMemo(() => new RepCounter(ex, profile?.experience), [ex, profile?.experience]);
  const [count, setCount] = useState(3); // pre-set countdown
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [prog, setProg] = useState({ left: 0, right: 0 });
  const [reps, setReps] = useState<Rep[]>([]);
  const [cue, setCue] = useState<Cue>({ key: 'live.position', tone: 'good' });
  const startRef = useRef(0);

  const pop = useRef(new Animated.Value(0)).current;
  const cueAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) startWorkout(ex.id);
  }, [active, ex.id, startWorkout]);

  // 3-2-1 countdown, then start streaming
  useEffect(() => {
    if (running) return;
    if (count === 0) {
      const src = getSensorSource();
      src.setExercise(ex.id);
      src.startSet();
      startRef.current = Date.now();
      setRunning(true);
      setCue({ key: 'live.go', tone: 'good' });
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [count, running, ex.id]);

  // live stream
  useEffect(() => {
    if (!running) return;
    const unsub = getSensorSource().subscribe((e) => {
      if (e.type !== 'sample') return;
      setProg(counter.progress(e.sample));
      const rep = counter.feed(e.sample);
      if (rep) {
        setReps([...counter.reps]);
        setCue(rep.cue);
        pop.setValue(0);
        Animated.timing(pop, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        cueAnim.setValue(0.85);
        Animated.spring(cueAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
      }
    });
    const tick = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 250);
    return () => {
      unsub();
      clearInterval(tick);
    };
  }, [running, counter, pop, cueAnim]);

  const end = () => {
    const result = summariseSet(ex, counter.reps, elapsed);
    if (!counter.reps.length) {
      router.replace('/workout/choose');
      return;
    }
    addSet(result, counter.reps);
    router.replace('/workout/review');
  };

  // streak of good reps
  let streak = 0;
  for (let i = reps.length - 1; i >= 0 && reps[i].cue.tone === 'good'; i--) streak++;
  const last = reps[reps.length - 1];
  const cueColor = cue.tone === 'good' ? colors.teal : cue.tone === 'warn' ? colors.warn : colors.bad;

  return (
    <Screen edges={['top', 'bottom']} intensity={1.35}>
      {/* header */}
      <View style={st.header}>
        <Pressable onPress={end} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('live.end')}>
          <Text style={st.close}>✕</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={type.h3}>{t(`ex.${ex.id}.name`)}</Text>
          <Text style={type.small}>{t('live.set', { n: setNo })}</Text>
        </View>
        <View style={st.timer}>
          <View style={[st.liveDot, running && { backgroundColor: colors.bad }]} />
          <Text style={[type.small, { color: colors.text, fontVariant: ['tabular-nums'] }]}>{fmt(elapsed)}</Text>
        </View>
      </View>

      {!running ? (
        <View style={st.center}>
          <Text style={[type.label, { marginBottom: space.lg }]}>{t('live.getReady')}</Text>
          <Text style={st.countdown}>{count}</Text>
          <Text style={[type.small, { marginTop: space.lg, textAlign: 'center', maxWidth: 260 }]}>{t(`ex.${ex.id}.c1`)}</Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: space.xl }}>
          {/* cue */}
          <Animated.View style={[st.cue, { borderColor: cueColor, transform: [{ scale: cueAnim }] }]}>
            <View style={[st.cueDot, { backgroundColor: cueColor }]} />
            <Text style={[type.h3, { flex: 1 }]}>{t(cue.key, { side: cue.side ? t(cue.side === 'left' ? 'common.left' : 'common.right') : '' })}</Text>
          </Animated.View>

          {/* main: gauges + rep counter */}
          <View style={st.main}>
            <Gauge label={t('common.left')} value={prog.left} color={colors.left} top={t('live.top')} />
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={type.label}>{t('live.reps')}</Text>
              <View>
                <Text style={st.repCount}>{reps.length}</Text>
                <Animated.Text
                  style={[
                    st.plusOne,
                    {
                      opacity: pop.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                      transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }],
                    },
                  ]}
                >
                  +1
                </Animated.Text>
              </View>
              {streak >= 2 ? <Text style={st.streak}>{t('live.streak', { n: streak })}</Text> : <Text style={[st.streak, { color: 'transparent' }]}>.</Text>}
              <BodyMap exercise={ex.id} left={prog.left} right={prog.right} width={120} />
            </View>
            <Gauge label={t('common.right')} value={prog.right} color={colors.right} top={t('live.top')} />
          </View>

          {/* last rep metrics */}
          <View style={st.metrics}>
            <Metric label={t('live.range')} value={last ? `${Math.round(Math.min(last.rom.left, last.rom.right))}%` : '—'} score={last?.romScore} />
            <Metric label={t('live.tempo')} value={last ? `${last.duration.toFixed(1)}s` : '—'} score={last?.tempoScore} />
            <Metric label={t('live.form')} value={last ? `${Math.round(last.formScore)}` : '—'} score={last?.formScore} />
          </View>

          {/* rep timeline */}
          <View style={st.timeline}>
            {Array.from({ length: Math.max(10, reps.length) }).map((_, i) => {
              const r = reps[i];
              const s = r ? (r.romScore + r.formScore + r.tempoScore) / 3 : 0;
              return <View key={i} style={[st.tick, r && { backgroundColor: scoreColor(s), height: 10 + (s / 100) * 18 }]} />;
            })}
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: space.xl, paddingBottom: space.md }}>
        <Button title={t(running ? 'live.end' : 'live.skipCountdown')} variant={running ? 'primary' : 'secondary'} onPress={running ? end : () => setCount(0)} />
      </View>
    </Screen>
  );
}

/** Vertical range-of-motion gauge with a target zone at the top. */
function Gauge({ label, value, color, top }: { label: string; value: number; color: string; top: string }) {
  const H = 280;
  const inZone = value >= 0.9;
  const fill = Math.min(1.1, value) / 1.1;
  return (
    <View style={{ alignItems: 'center', width: 54 }}>
      <View style={[st.gauge, { height: H }]}>
        <View style={[st.zone, { height: H * (0.2 / 1.1) }, inZone && { backgroundColor: 'rgba(48,186,186,0.35)', borderColor: colors.teal }]}>
          <Text style={[st.zoneText, inZone && { color: colors.teal }]}>{top}</Text>
        </View>
        <View style={[st.fill, { height: H * fill, backgroundColor: color }]} />
      </View>
      <Text style={[type.label, { marginTop: space.sm, color }]}>{label}</Text>
    </View>
  );
}

function Metric({ label, value, score }: { label: string; value: string; score?: number }) {
  return (
    <View style={st.metric}>
      <Text style={[type.label, { fontSize: 10 }]}>{label}</Text>
      <Text style={[type.h2, { color: score === undefined ? colors.textDim : scoreColor(score), marginTop: 2 }]}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl, paddingVertical: space.md },
  close: { color: colors.text, fontSize: 22, width: 60 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 60, justifyContent: 'flex-end' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.grey },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  countdown: { fontSize: 140, fontWeight: '900', color: colors.orange, lineHeight: 150 },
  cue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    marginTop: space.sm,
  },
  cueDot: { width: 10, height: 10, borderRadius: 5 },
  main: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: space.lg, flex: 1 },
  repCount: { fontSize: 96, fontWeight: '900', color: colors.text, lineHeight: 100, fontVariant: ['tabular-nums'], textAlign: 'center' },
  plusOne: { position: 'absolute', right: -34, top: 10, fontSize: 28, fontWeight: '900', color: colors.teal },
  streak: { color: colors.orange, fontWeight: '800', fontSize: 14, marginBottom: space.sm },
  gauge: { width: 40, borderRadius: 20, backgroundColor: colors.surfaceHigh, overflow: 'hidden', justifyContent: 'flex-end', borderWidth: 1, borderColor: colors.border },
  zone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,251,245,0.25)',
    borderStyle: 'dashed',
    zIndex: 2,
  },
  zoneText: { fontSize: 9, fontWeight: '900', color: colors.textMute, letterSpacing: 1 },
  fill: { width: '100%', borderRadius: 20, opacity: 0.95 },
  metrics: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  metric: { flex: 1, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  timeline: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 34, marginTop: space.md, marginBottom: space.md, justifyContent: 'center' },
  tick: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceHigh },
});
