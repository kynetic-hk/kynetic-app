import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, AvatarLook, DEFAULT_LOOK, useLoop } from '../../src/components/Avatar';
import { AvatarBuilder } from '../../src/components/AvatarBuilder';
import { LanguagePicker } from '../../src/components/LanguagePicker';
import { Screen } from '../../src/components/Screen';
import { Button, Chip, Field, OptionCard, ProgressDots, Wordmark } from '../../src/components/ui';
import { useI18n } from '../../src/i18n';
import { getSensorSource, SENSOR_LAYOUT, SensorId, SensorInfo } from '../../src/sensors';
import { Experience, Goal, Profile, Side, useProfile } from '../../src/store/profile';
import { colors, radius, space, type } from '../../src/theme';

const STEPS = ['welcome', 'name', 'avatar', 'basics', 'experience', 'goals', 'injuries', 'pair', 'calibrate', 'done'] as const;
type Step = (typeof STEPS)[number];

const GOALS: Goal[] = ['fix_form', 'build_muscle', 'get_stronger', 'fix_imbalances', 'prevent_injury'];
export const AREAS = ['shoulder', 'elbow', 'wrist', 'lower_back', 'neck', 'knee'];

export default function Onboarding() {
  const { save } = useProfile();
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const step: Step = STEPS[i];

  const [name, setName] = useState('');
  const [look, setLook] = useState<AvatarLook>(DEFAULT_LOOK);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [dominant, setDominant] = useState<Side>('right');
  const [experience, setExperience] = useState<Experience | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [paired, setPaired] = useState<SensorId[]>([]);
  const [calibrated, setCalibrated] = useState(false);

  const next = () => setI((n) => Math.min(n + 1, STEPS.length - 1));
  const back = () => setI((n) => Math.max(n - 1, 0));
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 'name':
        return name.trim().length > 0;
      case 'experience':
        return !!experience;
      case 'goals':
        return goals.length > 0;
      default:
        return true;
    }
  }, [step, name, experience, goals]);

  const finish = async () => {
    const p: Profile = {
      name: name.trim(),
      avatar: look,
      age: num(age),
      heightCm: num(height),
      weightKg: num(weight),
      dominantArm: dominant,
      experience: experience ?? 'beginner',
      goals,
      injuries,
      pairedSensors: paired,
      calibratedAt: calibrated ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };
    await save(p);
    router.replace('/home');
  };

  if (step === 'welcome') return <Welcome onStart={next} />;

  const first = name.trim().split(' ')[0];

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={st.top}>
          <Pressable onPress={back} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.back')}>
            <Text style={st.back}>‹</Text>
          </Pressable>
          <ProgressDots step={i - 1} total={STEPS.length - 2} />
          <View style={{ width: 20 }} />
        </View>

        <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
          {step === 'name' && (
            <>
              <Title kicker={t('onb.name.kicker')} title={t('onb.name.title')} />
              <Field
                label={t('onb.name.field')}
                value={name}
                onChangeText={setName}
                placeholder={t('onb.name.placeholder')}
                autoFocus
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => canContinue && next()}
              />
            </>
          )}

          {step === 'avatar' && (
            <>
              <Title kicker={t('onb.avatar.kicker')} title={t('onb.avatar.title')} sub={t('onb.avatar.sub')} />
              <AvatarBuilder look={look} onChange={setLook} />
            </>
          )}

          {step === 'basics' && (
            <>
              <Title kicker={t('onb.basics.kicker', { name: first })} title={t('onb.basics.title')} sub={t('onb.basics.sub')} />
              <View style={{ flexDirection: 'row', gap: space.md }}>
                <View style={{ flex: 1 }}>
                  <Field label={t('onb.basics.age')} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="—" maxLength={3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={t('onb.basics.height')} value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="—" maxLength={3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={t('onb.basics.weight')} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="—" maxLength={5} />
                </View>
              </View>
              <Text style={[type.label, { marginBottom: space.sm, marginTop: space.sm }]}>{t('onb.basics.dominant')}</Text>
              <View style={{ flexDirection: 'row', gap: space.md }}>
                <View style={{ flex: 1 }}>
                  <OptionCard title={t('common.left')} selected={dominant === 'left'} onPress={() => setDominant('left')} />
                </View>
                <View style={{ flex: 1 }}>
                  <OptionCard title={t('common.right')} selected={dominant === 'right'} onPress={() => setDominant('right')} />
                </View>
              </View>
              <Text style={type.small}>{t('onb.basics.dominantNote')}</Text>
            </>
          )}

          {step === 'experience' && (
            <>
              <Title kicker={t('onb.exp.kicker')} title={t('onb.exp.title')} sub={t('onb.exp.sub')} />
              {(['beginner', 'intermediate', 'advanced'] as Experience[]).map((x) => (
                <OptionCard key={x} title={t(`exp.${x}`)} subtitle={t(`onb.exp.${x}Sub`)} selected={experience === x} onPress={() => setExperience(x)} />
              ))}
            </>
          )}

          {step === 'goals' && (
            <>
              <Title kicker={t('onb.goals.kicker')} title={t('onb.goals.title')} sub={t('onb.goals.sub')} />
              <View style={st.chips}>
                {GOALS.map((g) => (
                  <Chip key={g} label={t(`goal.${g}`)} selected={goals.includes(g)} onPress={() => setGoals((l) => toggle(l, g))} />
                ))}
              </View>
            </>
          )}

          {step === 'injuries' && (
            <>
              <Title kicker={t('onb.inj.kicker')} title={t('onb.inj.title')} sub={t('onb.inj.sub')} />
              <View style={st.chips}>
                {AREAS.map((a) => (
                  <Chip key={a} label={t(`area.${a}`)} selected={injuries.includes(a)} onPress={() => setInjuries((l) => toggle(l, a))} />
                ))}
              </View>
              <Text style={[type.small, { marginTop: space.lg }]}>
                {injuries.length ? t('onb.inj.noted', { list: injuries.map((a) => t(`area.${a}`)).join(', ') }) : t('onb.inj.none')}
              </Text>
            </>
          )}

          {step === 'pair' && <Pair paired={paired} setPaired={setPaired} />}

          {step === 'calibrate' && <Calibrate look={look} done={calibrated} onDone={() => setCalibrated(true)} />}

          {step === 'done' && <Done look={look} name={first} />}
        </ScrollView>

        <View style={st.footer}>
          {step === 'done' ? (
            <Button title={t('onb.done.go')} onPress={finish} />
          ) : step === 'pair' || step === 'calibrate' ? (
            <>
              <Button title={t('common.continue')} onPress={next} disabled={step === 'pair' ? paired.length === 0 : !calibrated} />
              <Button title={t('common.skip')} variant="ghost" onPress={next} />
            </>
          ) : (
            <Button title={t('common.continue')} onPress={next} disabled={!canContinue} />
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
};

function Title({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <View style={{ marginBottom: space.xl }}>
      {kicker ? <Text style={[type.label, { color: colors.orange, marginBottom: space.sm }]}>{kicker}</Text> : null}
      <Text style={type.h1}>{title}</Text>
      {sub ? <Text style={[type.small, { marginTop: space.sm, fontSize: 15 }]}>{sub}</Text> : null}
    </View>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  const k = useLoop(1600);
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={st.welcome}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Wordmark size={20} />
          <LanguagePicker />
        </View>
        <View>
          <View style={{ alignItems: 'flex-end', marginBottom: space.sm }}>
            <Avatar pose="wave" k={k} size={100} look={{ ...DEFAULT_LOOK, hair: 5 }} />
          </View>
          <Text style={type.display}>
            {t('welcome.hero1')}
            {'\n'}
            {t('welcome.hero2')}
            {'\n'}
            <Text style={{ color: colors.orange }}>{t('welcome.hero3')}</Text>
          </Text>
          <Text style={[type.body, { color: colors.textDim, marginTop: space.lg, maxWidth: 320 }]}>{t('welcome.sub')}</Text>
        </View>
        <Button title={t('welcome.start')} onPress={onStart} />
      </View>
    </Screen>
  );
}

function Pair({ paired, setPaired }: { paired: SensorId[]; setPaired: (p: SensorId[]) => void }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'found' | 'connecting' | 'connected'>(paired.length ? 'connected' : 'idle');
  const [found, setFound] = useState<SensorInfo[]>([]);

  const scan = async () => {
    setPhase('scanning');
    const res = await getSensorSource().scan();
    setFound(res);
    setPhase('found');
  };
  const connect = async () => {
    setPhase('connecting');
    const ids = found.map((f) => f.id);
    await getSensorSource().connect(ids);
    setPaired(ids);
    setPhase('connected');
  };
  const place = (id: SensorId) => t(id === 'HUB' ? 'place.HUB' : id.endsWith('UPPER') ? 'place.UPPER' : 'place.FOREARM');

  return (
    <>
      <Title kicker={t('onb.pair.kicker')} title={t('onb.pair.title')} sub={t('onb.pair.sub')} />
      {phase === 'idle' && <Button title={t('onb.pair.scan')} variant="secondary" onPress={scan} />}
      {phase === 'scanning' && (
        <View style={st.scanBox}>
          <ActivityIndicator color={colors.orange} />
          <Text style={[type.small, { marginTop: space.md }]}>{t('onb.pair.looking')}</Text>
        </View>
      )}
      {(phase === 'found' || phase === 'connecting' || phase === 'connected') && (
        <>
          {(found.length ? found : SENSOR_LAYOUT.map((s) => ({ ...s, battery: 0, connected: true }))).map((s) => {
            const ok = phase === 'connected' || paired.includes(s.id);
            return (
              <View key={s.id} style={st.podRow}>
                <View style={[st.podDot, ok && { backgroundColor: colors.good }]} />
                <View style={{ flex: 1 }}>
                  <Text style={type.h3}>{t(`sensor.${s.id}`)}</Text>
                  <Text style={type.small}>{place(s.id)}</Text>
                </View>
                {s.battery ? <Text style={type.small}>{s.battery}%</Text> : null}
              </View>
            );
          })}
          {phase === 'found' && <Button title={t('onb.pair.connect', { n: found.length })} onPress={connect} style={{ marginTop: space.md }} />}
          {phase === 'connecting' && <ActivityIndicator color={colors.orange} style={{ marginTop: space.lg }} />}
        </>
      )}
    </>
  );
}

function Calibrate({ look, done, onDone }: { look: AvatarLook; done: boolean; onDone: () => void }) {
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!running) return;
    if (count === 0) {
      getSensorSource()
        .calibrate()
        .catch(() => {})
        .finally(() => {
          setRunning(false);
          onDone();
        });
      return;
    }
    const tm = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(tm);
  }, [running, count, onDone]);

  return (
    <>
      <Title kicker={t('onb.cal.kicker')} title={t('onb.cal.title')} sub={t('onb.cal.sub')} />
      <View style={st.poseBox}>
        <Avatar look={look} pose="stand" size={110} pods />
        <View style={st.poseStatus}>
          {running ? (
            <Text style={[type.display, { color: colors.orange }]}>{count || t('onb.cal.hold')}</Text>
          ) : done ? (
            <Text style={[type.h2, { color: colors.good }]}>{t('onb.cal.done')}</Text>
          ) : null}
        </View>
      </View>
      {!running && !done && (
        <Button
          title={t('onb.cal.start')}
          variant="secondary"
          onPress={() => {
            setCount(3);
            setRunning(true);
          }}
        />
      )}
    </>
  );
}

function Done({ look, name }: { look: AvatarLook; name: string }) {
  const { t } = useI18n();
  const k = useLoop(1400);
  return (
    <View style={{ alignItems: 'center', paddingTop: space.lg }}>
      <Avatar look={look} pose="flex" k={k} size={130} />
      <View style={{ alignSelf: 'stretch', marginTop: space.xl }}>
        <Title kicker={t('onb.done.kicker')} title={t('onb.done.title', { name })} sub={t('onb.done.sub')} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl, paddingVertical: space.md },
  back: { color: colors.text, fontSize: 34, lineHeight: 34, fontWeight: '300' },
  body: { paddingHorizontal: space.xl, paddingTop: space.xl, paddingBottom: space.xxl },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.md, gap: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  welcome: { flex: 1, padding: space.xl, justifyContent: 'space-between' },
  scanBox: { alignItems: 'center', padding: space.xxl, borderRadius: radius.lg, backgroundColor: colors.surface },
  podRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  podDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.textMute },
  poseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    paddingVertical: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: space.lg,
  },
  poseStatus: { minWidth: 110, alignItems: 'center' },
});
