import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { BodyMap } from '../../src/components/BodyMap';
import { AvatarDemo, DEFAULT_LOOK } from '../../src/components/Avatar';
import { Button } from '../../src/components/ui';
import { EXERCISES } from '../../src/data/exercises';
import { useI18n } from '../../src/i18n';
import { getSensorSource } from '../../src/sensors';
import { useProfile } from '../../src/store/profile';
import { useWorkout } from '../../src/store/workout';
import { colors, radius, space, type } from '../../src/theme';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

export default function Library() {
  const [open, setOpen] = useState<string | null>(EXERCISES[0].id);
  const { startWorkout } = useWorkout();
  const { t } = useI18n();
  const { profile } = useProfile();

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: 120 }}>
        <Text style={type.h1}>{t('lib.title')}</Text>
        <Text style={[type.small, { marginTop: space.xs, marginBottom: space.xl }]}>{t('lib.sub')}</Text>

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
                  <Text style={type.h2}>{t(`ex.${e.id}.name`)}</Text>
                  <Text style={type.small}>{e.muscles.map((m) => t(`muscle.${m}`)).join(' · ')}</Text>
                </View>
                {e.status === 'soon' ? <Text style={[type.label, { fontSize: 10 }]}>{t('lib.soon')}</Text> : null}
                <Text style={{ color: colors.textDim, fontSize: 18, marginLeft: space.sm }}>{isOpen ? '−' : '+'}</Text>
              </Pressable>

              {isOpen && (
                <View>
                  <View style={st.visuals}>
                    <View style={st.visualBox}>
                      <AvatarDemo look={profile?.avatar ?? DEFAULT_LOOK} exercise={e.id} size={104} />
                      <Text style={[type.label, { fontSize: 10, marginTop: space.sm }]}>{t('lib.correct')}</Text>
                    </View>
                    <View style={st.visualBox}>
                      <BodyMap exercise={e.id} width={104} left={0.95} right={0.95} />
                      <Text style={[type.label, { fontSize: 10, marginTop: space.sm }]}>{t('lib.muscles')}</Text>
                    </View>
                  </View>

                  <Text style={[type.label, { color: colors.teal, marginTop: space.lg, marginBottom: space.sm }]}>{t('lib.howTo')}</Text>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={st.listRow}>
                      <Text style={st.num}>{i}</Text>
                      <Text style={[type.body, { flex: 1 }]}>{t(`ex.${e.id}.c${i}`)}</Text>
                    </View>
                  ))}

                  <Text style={[type.label, { color: colors.orange, marginTop: space.lg, marginBottom: space.sm }]}>{t('lib.flags')}</Text>
                  {[1, 2, 3].map((i) => (
                    <View key={i} style={st.listRow}>
                      <Text style={[st.num, { color: colors.orange }]}>!</Text>
                      <Text style={[type.body, { flex: 1, color: colors.textDim }]}>{t(`ex.${e.id}.m${i}`)}</Text>
                    </View>
                  ))}

                  {e.status !== 'soon' && (
                    <Button
                      title={t('lib.train', { x: t(`ex.${e.id}.short`) })}
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
