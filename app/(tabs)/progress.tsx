import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { Card, Chip } from '../../src/components/ui';
import { sessionBalance, sessionReps, sessionScore, Session } from '../../src/data/sessions';
import { useWorkout } from '../../src/store/workout';
import { colors, space, type } from '../../src/theme';

type Metric = 'score' | 'rom' | 'tempo' | 'form';
const LABEL: Record<Metric, string> = { score: 'Score', rom: 'Range', tempo: 'Tempo', form: 'Form' };

const value = (s: Session, m: Metric) =>
  m === 'score' ? sessionScore(s) : Math.round(s.sets.reduce((a, b) => a + b[m], 0) / Math.max(1, s.sets.length));

export default function Progress() {
  const { sessions } = useWorkout();
  const [metric, setMetric] = useState<Metric>('score');
  const chron = [...sessions].reverse();
  const vals = chron.map((s) => value(s, metric));
  const first = vals[0] ?? 0;
  const lastV = vals[vals.length - 1] ?? 0;
  const totalReps = sessions.reduce((a, s) => a + sessionReps(s), 0);
  const best = Math.max(0, ...sessions.map(sessionScore));

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: 120 }}>
        <Text style={type.h1}>Progress</Text>

        <View style={st.statsRow}>
          <Stat label="Sessions" value={sessions.length} />
          <Stat label="Total reps" value={totalReps} />
          <Stat label="Best score" value={best} />
        </View>

        <Card style={{ marginTop: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={type.label}>{LABEL[metric]} trend</Text>
              <Text style={[type.number, { marginTop: 4 }]}>{lastV}</Text>
            </View>
            <Text style={[type.h3, { color: lastV >= first ? colors.teal : colors.bad }]}>
              {lastV >= first ? '▲' : '▼'} {Math.abs(lastV - first)} since first
            </Text>
          </View>
          <LineChart values={vals} />
          <View style={st.chips}>
            {(Object.keys(LABEL) as Metric[]).map((m) => (
              <Chip key={m} label={LABEL[m]} selected={metric === m} onPress={() => setMetric(m)} />
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: space.md }}>
          <Text style={type.label}>Left / right balance</Text>
          <Text style={[type.small, { marginTop: 4, marginBottom: space.md }]}>Closer to the centre line is better.</Text>
          {chron.map((s) => {
            const b = sessionBalance(s);
            const off = b.left - 50; // negative = left weaker
            return (
              <View key={s.id} style={st.balRow}>
                <Text style={[type.small, { width: 56 }]}>{new Date(s.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</Text>
                <View style={st.balTrack}>
                  <View style={st.balCenter} />
                  <View
                    style={[
                      st.balFill,
                      off < 0 ? { right: '50%', width: `${Math.min(50, -off * 5)}%`, backgroundColor: colors.right } : { left: '50%', width: `${Math.min(50, off * 5)}%`, backgroundColor: colors.left },
                    ]}
                  />
                </View>
                <Text style={[type.small, { width: 52, textAlign: 'right' }]}>
                  {b.left}/{b.right}
                </Text>
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm, paddingHorizontal: 56 }}>
            <Text style={[type.label, { fontSize: 10, color: colors.right }]}>Right doing more</Text>
            <Text style={[type.label, { fontSize: 10, color: colors.left }]}>Left doing more</Text>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value: v }: { label: string; value: number }) {
  return (
    <Card style={{ flex: 1, padding: space.md }}>
      <Text style={[type.label, { fontSize: 10 }]}>{label}</Text>
      <Text style={[type.h1, { marginTop: 2 }]}>{v}</Text>
    </Card>
  );
}

function LineChart({ values }: { values: number[] }) {
  const [w, setW] = useState(300);
  const h = 150;
  const pad = 10;
  const lo = Math.max(0, Math.min(...values, 100) - 10);
  const hi = Math.min(100, Math.max(...values, 0) + 5);
  const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
  const y = (v: number) => pad + (1 - (v - lo) / Math.max(1, hi - lo)) * (h - pad * 2);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  const area = values.length ? `${d} L${x(values.length - 1)},${h} L${x(0)},${h} Z` : '';
  return (
    <View style={{ marginTop: space.lg }} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.orange} stopOpacity={0.35} />
            <Stop offset="1" stopColor={colors.orange} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <Line key={f} x1={0} x2={w} y1={h * f} y2={h * f} stroke={colors.border} strokeWidth={1} />
        ))}
        {area ? <Path d={area} fill="url(#area)" /> : null}
        <Path d={d} stroke={colors.orange} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {values.map((v, i) => (
          <Circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 6 : 4} fill={i === values.length - 1 ? colors.orange : colors.bg} stroke={colors.orange} strokeWidth={2} />
        ))}
      </Svg>
    </View>
  );
}

const st = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: space.sm, marginTop: space.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
  balRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  balTrack: { flex: 1, height: 12, borderRadius: 6, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  balCenter: { position: 'absolute', left: '50%', width: 2, marginLeft: -1, top: 0, bottom: 0, backgroundColor: colors.textDim, zIndex: 2 },
  balFill: { position: 'absolute', top: 0, bottom: 0, borderRadius: 6 },
});
