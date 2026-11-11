import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { BodyMap } from '../../src/components/BodyMap';
import { FormDemo } from '../../src/components/FormDemo';
import { Button } from '../../src/components/ui';
import { EXERCISES } from '../../src/data/exercises';
import { getSensorSource } from '../../src/sensors';
import { useWorkout } from '../../src/store/workout';
import { colors, radius, space, type } from '../../src/theme';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

export default function Library() {
  const [open, setOpen] = useState<string | null>(EXERCISES[0].id);
  const { startWorkout } = useWorkout();

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: 120 }}>
        <Text style={type.h1}>Library</Text>
        <Text style={[type.small, { marginTop: space.xs, marginBottom: space.xl }]}>How to do each exercise properly, and what Kynetic watches for.</Text>

        {EXERCISES.map((e) => {
          const isOpen = open === e.id;
          return (
            <View key={e.id} style={[st.card, isOpen && { borderColor: 'rgba(255,119,0,0.5)' }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  setOpen(isOpen ? null : e.id);
                }}
                style={st.head}
              >
                <View style={{ flex: 1 }}>
                  <Text style={type.h2}>{e.name}</Text>
                  <Text style={type.small}>{e.muscles.join(' · ')}</Text>
                </View>
                {e.status === 'soon' ? <Text style={[type.label, { fontSize: 10 }]}>Tracking soon</Text> : null}
                <Text style={{ color: colors.textDim, fontSize: 18, marginLeft: space.sm }}>{isOpen ? '−' : '+'}</Text>
              </Pressable>

              {isOpen && (
                <View>
                  <View style={st.visuals}>
                    <View style={st.visualBox}>
                      <FormDemo exercise={e.id} size={140} />
                      <Text style={[type.label, { fontSize: 10 }]}>Correct form</Text>
                    </View>
                    <View style={st.visualBox}>
                      <BodyMap exercise={e.id} width={104} left={0.95} right={0.95} />
                      <Text style={[type.label, { fontSize: 10, marginTop: space.sm }]}>Muscles worked</Text>
                    </View>
                  </View>

                  <Text style={[type.label, { color: colors.teal, marginTop: space.lg, marginBottom: space.sm }]}>How to</Text>
                  {e.cues.map((c, i) => (
                    <View key={c} style={st.listRow}>
                      <Text style={st.num}>{i + 1}</Text>
                      <Text style={[type.body, { flex: 1 }]}>{c}</Text>
                    </View>
                  ))}

                  <Text style={[type.label, { color: colors.orange, marginTop: space.lg, marginBottom: space.sm }]}>Kynetic flags</Text>
                  {e.mistakes.map((m) => (
                    <View key={m} style={st.listRow}>
                      <Text style={[st.num, { color: colors.orange }]}>!</Text>
                      <Text style={[type.body, { flex: 1, color: colors.textDim }]}>{m}</Text>
                    </View>
                  ))}

                  {e.status !== 'soon' && (
                    <Button
                      title={`Train ${e.short.toLowerCase()} now`}
                      style={{ marginTop: space.lg }}
                      onPress={() => {
                        startWorkout(e.id);
                        getSensorSource().setExercise(e.id);
                        router.push({ pathname: '/workout/live', params: { exercise: e.id } });
                      }}
                    />
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, marginBottom: space.md },
  head: { flexDirection: 'row', alignItems: 'center' },
  visuals: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  visualBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.md, borderRadius: radius.md, backgroundColor: 'rgba(0,0,0,0.25)' },
  listRow: { flexDirection: 'row', gap: space.md, marginBottom: space.sm, alignItems: 'flex-start' },
  num: { width: 20, color: colors.teal, fontWeight: '900', fontSize: 15, lineHeight: 22 },
});
