import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { BodyMap } from '../../src/components/BodyMap';
import { EXERCISES, Exercise } from '../../src/data/exercises';
import { getSensorSource } from '../../src/sensors';
import { useWorkout } from '../../src/store/workout';
import { colors, radius, space, type } from '../../src/theme';

export default function Choose() {
  const { active, startWorkout } = useWorkout();

  const pick = (e: Exercise) => {
    if (e.status === 'soon') return;
    startWorkout(e.id);
    getSensorSource().setExercise(e.id);
    router.replace({ pathname: '/workout/live', params: { exercise: e.id } });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={st.top}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={st.close}>✕</Text>
        </Pressable>
        {active?.sets.length ? <Text style={type.small}>{active.sets.length} sets done</Text> : null}
      </View>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.sm }}>
        <Text style={[type.label, { color: colors.orange }]}>{active?.sets.length ? 'Next exercise' : 'New workout'}</Text>
        <Text style={[type.h1, { marginTop: space.sm, marginBottom: space.xl }]}>What are we training?</Text>

        {EXERCISES.map((e) => {
          const soon = e.status === 'soon';
          return (
            <Pressable
              key={e.id}
              onPress={() => pick(e)}
              disabled={soon}
              accessibilityRole="button"
              accessibilityState={{ disabled: soon }}
              style={({ pressed }) => [st.card, soon && { opacity: 0.45 }, pressed && { transform: [{ scale: 0.99 }], borderColor: colors.orange }]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Text style={type.h2}>{e.name}</Text>
                  {e.status !== 'ready' ? (
                    <View style={[st.tag, soon ? st.tagSoon : st.tagBeta]}>
                      <Text style={[st.tagText, { color: soon ? colors.textDim : colors.teal }]}>{soon ? 'Soon' : 'Beta'}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[type.small, { marginTop: 4 }]}>{e.muscles.join(' · ')}</Text>
                <Text style={[type.label, { marginTop: space.md, fontSize: 10 }]}>Tracks {e.primaryLabel.toLowerCase()}</Text>
              </View>
              <BodyMap exercise={e.id} width={64} left={0.9} right={0.9} />
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.md },
  close: { color: colors.text, fontSize: 22, fontWeight: '400' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    paddingRight: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.md,
  },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1 },
  tagBeta: { borderColor: colors.teal },
  tagSoon: { borderColor: colors.grey },
  tagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
});
