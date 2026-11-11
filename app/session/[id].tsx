import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Button, Card, ScoreRing } from '../../src/components/ui';
import { exerciseById } from '../../src/data/exercises';
import { sessionBalance, sessionReps, sessionScore, SetResult } from '../../src/data/sessions';
import { useWorkout } from '../../src/store/workout';
import { colors, radius, scoreColor, space, type } from '../../src/theme';

export default function SessionSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions } = useWorkout();
  const s = sessions.find((x) => x.id === id);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  if (!s)
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Text style={[type.h2, { marginBottom: space.lg }]}>Session not found</Text>
        <Button title="Back to Home" onPress={() => router.replace('/home')} />
      </Screen>
    );

  const score = sessionScore(s);
  const bal = sessionBalance(s);
  const avg = (k: 'rom' | 'tempo' | 'form') => Math.round(s.sets.reduce((a, b) => a + b[k], 0) / s.sets.length);
  // group sets by exercise, keeping order
  const groups: { ex: string; sets: SetResult[] }[] = [];
  s.sets.forEach((x) => {
    const g = groups.find((y) => y.ex === x.exercise);
    g ? g.sets.push(x) : groups.push({ ex: x.exercise, sets: [x] });
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={st.top}>
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={{ color: colors.text, fontSize: 22 }}>✕</Text>
        </Pressable>
        <Text style={type.small}>
          {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
          {s.demo ? ' · demo' : ''}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, paddingBottom: space.xxxl }}>
        <Text style={[type.label, { color: colors.orange }]}>Session complete</Text>
        <Text style={[type.h1, { marginTop: space.sm }]}>{s.title}</Text>

        <View style={st.hero}>
          <ScoreRing score={score} size={150} stroke={12} label="session" />
          <View style={{ flex: 1, gap: space.md }}>
            <Stat label="Duration" value={`${s.durationMin} min`} />
            <Stat label="Sets" value={String(s.sets.length)} />
            <Stat label="Reps" value={String(sessionReps(s))} />
          </View>
        </View>

        <View style={st.row}>
          {(['rom', 'tempo', 'form'] as const).map((k) => (
            <Card key={k} style={{ flex: 1, alignItems: 'center', padding: space.md }}>
              <Text style={[type.h2, { color: scoreColor(avg(k)) }]}>{avg(k)}</Text>
              <Text style={[type.label, { fontSize: 10 }]}>{k === 'rom' ? 'Range' : k === 'tempo' ? 'Tempo' : 'Form'}</Text>
            </Card>
          ))}
          <Card style={{ flex: 1, alignItems: 'center', padding: space.md }}>
            <Text style={type.h2}>
              <Text style={{ color: colors.left }}>{bal.left}</Text>
              <Text style={{ color: colors.textMute }}>/</Text>
              <Text style={{ color: colors.right }}>{bal.right}</Text>
            </Text>
            <Text style={[type.label, { fontSize: 10 }]}>L / R</Text>
          </Card>
        </View>

        <Text style={[type.h2, { marginTop: space.xl, marginBottom: space.md }]}>Exercises</Text>
        {groups.map((g) => (
          <Card key={g.ex} style={{ marginBottom: space.md }}>
            <Text style={type.h3}>{exerciseById(g.ex).name}</Text>
            {g.sets.map((x, k) => (
              <View key={k} style={st.setRow}>
                <Text style={[type.small, { width: 48 }]}>Set {k + 1}</Text>
                <Text style={[type.body, { width: 64 }]}>{x.reps} reps</Text>
                <View style={st.miniTrack}>
                  <View style={[st.miniFill, { width: `${x.score}%`, backgroundColor: scoreColor(x.score) }]} />
                </View>
                <Text style={[type.h3, { width: 34, textAlign: 'right', color: scoreColor(x.score) }]}>{x.score}</Text>
              </View>
            ))}
          </Card>
        ))}

        <Button title="Done" onPress={() => router.replace('/home')} style={{ marginTop: space.lg }} />
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={[type.label, { fontSize: 10 }]}>{label}</Text>
      <Text style={type.h2}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.md },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.xl, marginVertical: space.xl },
  row: { flexDirection: 'row', gap: space.sm },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md },
  miniTrack: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: radius.pill },
});
