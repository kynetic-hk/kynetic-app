import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Chip, Field, OptionCard, ProgressDots, Wordmark } from '../../src/components/ui';
import { getSensorSource, SENSOR_LAYOUT, SensorId, SensorInfo } from '../../src/sensors';
import { Experience, Goal, Profile, Side, useProfile } from '../../src/store/profile';
import { colors, radius, space, type } from '../../src/theme';

const STEPS = ['welcome', 'name', 'basics', 'experience', 'goals', 'injuries', 'pair', 'calibrate', 'done'] as const;
type Step = (typeof STEPS)[number];

const GOALS: { id: Goal; label: string }[] = [
  { id: 'fix_form', label: 'Perfect my form' },
  { id: 'build_muscle', label: 'Build muscle' },
  { id: 'get_stronger', label: 'Get stronger' },
  { id: 'fix_imbalances', label: 'Fix left/right imbalances' },
  { id: 'prevent_injury', label: 'Avoid injury' },
];
const AREAS = ['Shoulder', 'Elbow', 'Wrist', 'Lower back', 'Neck', 'Knee'];

export default function Onboarding() {
  const { save } = useProfile();
  const [i, setI] = useState(0);
  const step: Step = STEPS[i];

  // form state
  const [name, setName] = useState('');
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
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={st.top}>
          <Pressable onPress={back} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={st.back}>‹</Text>
          </Pressable>
          <ProgressDots step={i - 1} total={STEPS.length - 2} />
          <View style={{ width: 20 }} />
        </View>

        <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
          {step === 'name' && (
            <>
              <Title kicker="Let's set you up" title="What should we call you?" />
              <Field label="Your name" value={name} onChangeText={setName} placeholder="e.g. Alex" autoFocus autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => canContinue && next()} />
            </>
          )}

          {step === 'basics' && (
            <>
              <Title kicker={`Nice to meet you, ${first}`} title="A few basics" sub="Helps us scale your targets. You can skip any of these." />
              <View style={{ flexDirection: 'row', gap: space.md }}>
                <View style={{ flex: 1 }}>
                  <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="—" maxLength={3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="—" maxLength={3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="—" maxLength={5} />
                </View>
              </View>
              <Text style={[type.label, { marginBottom: space.sm, marginTop: space.sm }]}>Dominant arm</Text>
              <View style={{ flexDirection: 'row', gap: space.md }}>
                <View style={{ flex: 1 }}>
                  <OptionCard title="Left" selected={dominant === 'left'} onPress={() => setDominant('left')} />
                </View>
                <View style={{ flex: 1 }}>
                  <OptionCard title="Right" selected={dominant === 'right'} onPress={() => setDominant('right')} />
                </View>
              </View>
              <Text style={type.small}>We use this to compare your left and right side fairly.</Text>
            </>
          )}

          {step === 'experience' && (
            <>
              <Title kicker="Training" title="How long have you been lifting?" sub="This sets how strict your form feedback is." />
              <OptionCard title="Beginner" subtitle="Less than 6 months, still learning the moves" selected={experience === 'beginner'} onPress={() => setExperience('beginner')} />
              <OptionCard title="Intermediate" subtitle="6 months – 2 years, training regularly" selected={experience === 'intermediate'} onPress={() => setExperience('intermediate')} />
              <OptionCard title="Advanced" subtitle="2+ years, chasing the details" selected={experience === 'advanced'} onPress={() => setExperience('advanced')} />
            </>
          )}

          {step === 'goals' && (
            <>
              <Title kicker="Goals" title="What do you want from Kynetic?" sub="Pick as many as you like." />
              <View style={st.chips}>
                {GOALS.map((g) => (
                  <Chip key={g.id} label={g.label} selected={goals.includes(g.id)} onPress={() => setGoals((l) => toggle(l, g.id))} />
                ))}
              </View>
            </>
          )}

          {step === 'injuries' && (
            <>
              <Title kicker="Safety" title="Any areas to be careful with?" sub="Past or current injuries. We'll keep an eye on these." />
              <View style={st.chips}>
                {AREAS.map((a) => (
                  <Chip key={a} label={a} selected={injuries.includes(a)} onPress={() => setInjuries((l) => toggle(l, a))} />
                ))}
              </View>
              <Text style={[type.small, { marginTop: space.lg }]}>{injuries.length ? `Noted: ${injuries.join(', ')}` : 'None? Just continue.'}</Text>
            </>
          )}

          {step === 'pair' && <Pair paired={paired} setPaired={setPaired} />}

          {step === 'calibrate' && <Calibrate done={calibrated} onDone={() => setCalibrated(true)} />}

          {step === 'done' && (
            <View style={{ alignItems: 'flex-start', paddingTop: space.xxl }}>
              <View style={st.bigCheck}>
                <Text style={{ fontSize: 40, color: colors.bg, fontWeight: '900' }}>✓</Text>
              </View>
              <Title kicker="All set" title={`You're ready, ${first}.`} sub="Pick an exercise, start your set and Kynetic will coach your form rep by rep." />
            </View>
          )}
        </ScrollView>

        <View style={st.footer}>
          {step === 'done' ? (
            <Button title="Go to Home" onPress={finish} />
          ) : step === 'pair' || step === 'calibrate' ? (
            <>
              <Button
                title="Continue"
                onPress={next}
                disabled={step === 'pair' ? paired.length === 0 : !calibrated}
              />
              <Button title="Skip for now" variant="ghost" onPress={next} />
            </>
          ) : (
            <Button title="Continue" onPress={next} disabled={!canContinue} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.welcome}>
        <Wordmark size={20} />
        <View>
          <View style={st.glow} />
          <Text style={type.display}>
            Your personal{'\n'}trainer,{'\n'}
            <Text style={{ color: colors.orange }}>on your arm.</Text>
          </Text>
          <Text style={[type.body, { color: colors.textDim, marginTop: space.lg, maxWidth: 320 }]}>
            Real-time form tracking, rep scoring and left/right balance from sensors you wear.
          </Text>
        </View>
        <Button title="Get started" onPress={onStart} />
      </View>
    </SafeAreaView>
  );
}

function Pair({ paired, setPaired }: { paired: SensorId[]; setPaired: (p: SensorId[]) => void }) {
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

  return (
    <>
      <Title kicker="Sensors" title="Pair your Kynetic pods" sub="Turn on all pods and keep them close to your phone." />
      {phase === 'idle' && <Button title="Scan for pods" variant="secondary" onPress={scan} />}
      {phase === 'scanning' && (
        <View style={st.scanBox}>
          <ActivityIndicator color={colors.orange} />
          <Text style={[type.small, { marginTop: space.md }]}>Looking for pods…</Text>
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
                  <Text style={type.h3}>{s.label}</Text>
                  <Text style={type.small}>{s.placement}</Text>
                </View>
                {s.battery ? <Text style={type.small}>{s.battery}%</Text> : null}
              </View>
            );
          })}
          {phase === 'found' && <Button title={`Connect ${found.length} pods`} onPress={connect} style={{ marginTop: space.md }} />}
          {phase === 'connecting' && <ActivityIndicator color={colors.orange} style={{ marginTop: space.lg }} />}
        </>
      )}
    </>
  );
}

function Calibrate({ done, onDone }: { done: boolean; onDone: () => void }) {
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
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [running, count, onDone]);

  return (
    <>
      <Title kicker="Calibration" title="Stand in the neutral pose" sub="Stand tall, arms relaxed by your sides, palms facing forward. Hold still for 3 seconds." />
      <View style={st.poseBox}>
        <Text style={{ fontSize: 72 }}>🧍</Text>
        {running ? (
          <Text style={[type.display, { color: colors.orange, marginTop: space.md }]}>{count || 'Hold…'}</Text>
        ) : done ? (
          <Text style={[type.h2, { color: colors.good, marginTop: space.md }]}>Calibrated ✓</Text>
        ) : null}
      </View>
      {!running && !done && (
        <Button
          title="Start calibration"
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

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl, paddingVertical: space.md },
  back: { color: colors.text, fontSize: 34, lineHeight: 34, fontWeight: '300' },
  body: { paddingHorizontal: space.xl, paddingTop: space.xl, paddingBottom: space.xxl },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.md, gap: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  welcome: { flex: 1, padding: space.xl, justifyContent: 'space-between' },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.orange,
    opacity: 0.12,
    top: -60,
    left: -40,
  },
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
  poseBox: { alignItems: 'center', justifyContent: 'center', height: 260, borderRadius: radius.lg, backgroundColor: colors.surface, marginBottom: space.lg },
  bigCheck: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: space.xl },
});
