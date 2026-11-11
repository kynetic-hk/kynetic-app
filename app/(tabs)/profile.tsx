import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Button, Card } from '../../src/components/ui';
import { useProfile } from '../../src/store/profile';
import { colors, space, type } from '../../src/theme';

const GOAL_LABEL: Record<string, string> = {
  fix_form: 'Perfect form',
  build_muscle: 'Build muscle',
  get_stronger: 'Get stronger',
  fix_imbalances: 'Fix imbalances',
  prevent_injury: 'Avoid injury',
};

export default function ProfileTab() {
  const { profile, reset } = useProfile();
  if (!profile) return null;

  const rows: [string, string][] = [
    ['Age', profile.age ? String(profile.age) : '—'],
    ['Height', profile.heightCm ? `${profile.heightCm} cm` : '—'],
    ['Weight', profile.weightKg ? `${profile.weightKg} kg` : '—'],
    ['Dominant arm', cap(profile.dominantArm)],
    ['Experience', cap(profile.experience)],
    ['Goals', profile.goals.map((g) => GOAL_LABEL[g]).join(', ') || '—'],
    ['Careful with', profile.injuries.join(', ') || 'Nothing noted'],
    ['Sensors', profile.pairedSensors.length ? `${profile.pairedSensors.length} paired` : 'Not paired'],
    ['Calibrated', profile.calibratedAt ? new Date(profile.calibratedAt).toLocaleDateString() : 'Not yet'],
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.xl }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.bg }}>{profile.name[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={type.h1}>{profile.name}</Text>
            <Text style={type.small}>Member since {new Date(profile.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <Card>
          {rows.map(([k, v], i) => (
            <View
              key={k}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: space.md,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: colors.border,
                gap: space.lg,
              }}
            >
              <Text style={type.small}>{k}</Text>
              <Text style={[type.body, { flexShrink: 1, textAlign: 'right' }]}>{v}</Text>
            </View>
          ))}
        </Card>

        <Button
          title="Reset & redo setup"
          variant="secondary"
          style={{ marginTop: space.xl }}
          onPress={async () => {
            await reset();
            router.replace('/onboarding');
          }}
        />
        <Text style={[type.small, { textAlign: 'center', marginTop: space.sm, color: colors.textMute }]}>Handy for demos — clears your profile on this device.</Text>
      </ScrollView>
    </Screen>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
