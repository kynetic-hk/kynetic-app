import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Avatar, AvatarLook, DEFAULT_LOOK } from '../../src/components/Avatar';
import { AvatarBuilder } from '../../src/components/AvatarBuilder';
import { LanguagePicker } from '../../src/components/LanguagePicker';
import { Screen } from '../../src/components/Screen';
import { Button, Card } from '../../src/components/ui';
import { useI18n } from '../../src/i18n';
import { useProfile } from '../../src/store/profile';
import { colors, space, type } from '../../src/theme';

/** Older profiles stored area names like "Lower back"; map them to ids. */
const areaId = (a: string) => a.toLowerCase().replace(/\s+/g, '_');

export default function ProfileTab() {
  const { profile, reset, update } = useProfile();
  const { t, locale } = useI18n();
  const [editing, setEditing] = useState(false);
  const [look, setLook] = useState<AvatarLook>(profile?.avatar ?? DEFAULT_LOOK);
  if (!profile) return null;

  const date = (iso: string) => new Date(iso).toLocaleDateString(locale);
  const rows: [string, string][] = [
    [t('prof.age'), profile.age ? String(profile.age) : '—'],
    [t('prof.height'), profile.heightCm ? `${profile.heightCm} cm` : '—'],
    [t('prof.weight'), profile.weightKg ? `${profile.weightKg} kg` : '—'],
    [t('prof.dominant'), t(profile.dominantArm === 'left' ? 'common.left' : 'common.right')],
    [t('prof.exp'), t(`exp.${profile.experience}`)],
    [t('prof.goals'), profile.goals.map((g) => t(`goal.${g}`)).join(', ') || '—'],
    [t('prof.careful'), profile.injuries.map((a) => t(`area.${areaId(a)}`)).join(', ') || t('prof.nothing')],
    [t('prof.sensors'), profile.pairedSensors.length ? t('prof.nPaired', { n: profile.pairedSensors.length }) : t('prof.notPaired')],
    [t('prof.calibrated'), profile.calibratedAt ? date(profile.calibratedAt) : t('prof.notYet')],
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.lg }}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              backgroundColor: colors.surfaceHigh,
              borderWidth: 2,
              borderColor: colors.orange,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Avatar look={profile.avatar ?? DEFAULT_LOOK} headOnly size={66} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h1}>{profile.name}</Text>
            <Text style={type.small}>{t('prof.since', { d: date(profile.createdAt) })}</Text>
          </View>
        </View>

        {editing ? (
          <Card style={{ marginBottom: space.lg }}>
            <AvatarBuilder look={look} onChange={setLook} />
            <Button
              title={t('prof.saveAvatar')}
              style={{ marginTop: space.lg }}
              onPress={async () => {
                await update({ avatar: look });
                setEditing(false);
              }}
            />
          </Card>
        ) : (
          <Button title={t('prof.editAvatar')} variant="secondary" style={{ marginBottom: space.lg }} onPress={() => setEditing(true)} />
        )}

        <Text style={[type.label, { marginBottom: space.sm }]}>{t('lang.title')}</Text>
        <View style={{ marginBottom: space.lg }}>
          <LanguagePicker full />
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
          title={t('prof.reset')}
          variant="secondary"
          style={{ marginTop: space.xl }}
          onPress={async () => {
            await reset();
            router.replace('/onboarding');
          }}
        />
        <Text style={[type.small, { textAlign: 'center', marginTop: space.sm, color: colors.textMute }]}>{t('prof.resetNote')}</Text>
      </ScrollView>
    </Screen>
  );
}
