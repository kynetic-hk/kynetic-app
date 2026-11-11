import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PlayIcon, PodIcon } from '../../src/components/icons';
import { Card, ScoreRing } from '../../src/components/ui';
import { exerciseById } from '../../src/data/exercises';
import { Session, sessionBalance, sessionScore } from '../../src/data/sessions';
import { getSensorSource, SensorInfo } from '../../src/sensors';
import { useProfile } from '../../src/store/profile';
import { useWorkout } from '../../src/store/workout';
import { colors, radius, scoreColor, space, type } from '../../src/theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const dayLabel = (iso: string) => {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
};

export default function Home() {
  const { profile } = useProfile();
  const [sensors, setSensors] = useState<SensorInfo[]>([]);
  useEffect(() => getSensorSource().subscribe((e) => e.type === 'status' && setSensors(e.sensors)), []);

  const first = profile?.name.split(' ')[0] ?? '';
  const { sessions, realCount } = useWorkout();
  const last = sessions[0];
  const lastScore = sessionScore(last);
  const prevScore = sessions[1] ? sessionScore(sessions[1]) : lastScore;
  const delta = lastScore - prevScore;
  const bal = sessionBalance(last);
  const weaker = bal.left < bal.right ? 'left' : 'right';
  const gap = Math.abs(bal.left - bal.right);
  const connected = sensors.filter((s) => s.connected).length;

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={st.page}>
        {/* header */}
        <View style={st.header}>
          <View>
            <Text style={type.small}>{greeting()},</Text>
            <Text style={type.h1}>{first} 👋</Text>
          </View>
          <View style={[st.podPill, connected > 0 && { borderColor: colors.good }]}>
            <PodIcon color={connected > 0 ? colors.good : colors.textMute} size={16} />
            <Text style={[st.podText, connected > 0 && { color: colors.good }]}>{connected > 0 ? `${connected}/5` : 'Off'}</Text>
          </View>
        </View>

        {/* start workout */}
        <Pressable accessibilityRole="button" onPress={() => router.push('/workout/choose')} style={({ pressed }) => [st.start, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
          <View style={{ flex: 1 }}>
            <Text style={[type.label, { color: '#202020B3' }]}>Ready when you are</Text>
            <Text style={st.startTitle}>Start workout</Text>
            <Text style={{ color: '#202020B3', fontSize: 14, marginTop: 2 }}>Pick an exercise and get coached live</Text>
          </View>
          <View style={st.playBtn}>
            <PlayIcon color={colors.orange} size={22} />
          </View>
        </Pressable>

        {/* last session + balance */}
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[type.label, { alignSelf: 'flex-start' }]}>Last session</Text>
            <View style={{ marginVertical: space.md }}>
              <ScoreRing score={lastScore} size={104} label="score" />
            </View>
            <Text style={[type.small, { color: delta >= 0 ? colors.good : colors.bad, fontWeight: '700' }]}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} vs last time
            </Text>
          </Card>

          <Card style={{ flex: 1 }}>
            <Text style={type.label}>L / R balance</Text>
            <View style={st.balWrap}>
              <BalanceBar left={bal.left} right={bal.right} />
            </View>
            <Text style={type.small}>
              {gap <= 4 ? (
                <Text style={{ color: colors.good, fontWeight: '700' }}>Nicely balanced</Text>
              ) : (
                <>
                  Your <Text style={{ color: colors.orange, fontWeight: '700' }}>{weaker}</Text> side is doing {gap}% less work
                </>
              )}
            </Text>
          </Card>
        </View>

        {/* weekly strip */}
        <Card style={{ marginTop: space.md }}>
          <View style={st.rowBetween}>
            <Text style={type.label}>This week</Text>
            <Text style={type.small}>{sessions.length} sessions</Text>
          </View>
          <WeekStrip sessions={sessions} />
        </Card>

        {/* recent */}
        <Text style={[type.h2, { marginTop: space.xl, marginBottom: space.md }]}>Recent sessions</Text>
        {sessions.map((s) => (
          <SessionRow key={s.id} s={s} />
        ))}

        {realCount < 2 ? (
          <Text style={[type.small, { textAlign: 'center', marginTop: space.lg, color: colors.textMute }]}>Includes demo sessions until you've logged two workouts</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function BalanceBar({ left, right }: { left: number; right: number }) {
  return (
    <View>
      <View style={st.rowBetween}>
        <Text style={[type.number, { fontSize: 26, color: colors.left }]}>{left}</Text>
        <Text style={[type.number, { fontSize: 26 }]}>{right}</Text>
      </View>
      <View style={st.balTrack}>
        <View style={{ flex: left, backgroundColor: colors.left, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }} />
        <View style={{ width: 3, backgroundColor: colors.bg }} />
        <View style={{ flex: right, backgroundColor: colors.right, borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
      </View>
      <View style={[st.rowBetween, { marginTop: 4 }]}>
        <Text style={[type.label, { fontSize: 10 }]}>Left</Text>
        <Text style={[type.label, { fontSize: 10 }]}>Right</Text>
      </View>
    </View>
  );
}

function WeekStrip({ sessions }: { sessions: Session[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = (new Date().getDay() + 6) % 7; // Monday = 0
  const done = new Set(
    sessions
      .filter((s) => Date.now() - new Date(s.date).getTime() < 7 * 86400000)
      .map((s) => (new Date(s.date).getDay() + 6) % 7),
  );
  return (
    <View style={[st.rowBetween, { marginTop: space.md }]}>
      {days.map((d, i) => (
        <View key={i} style={{ alignItems: 'center', gap: 6 }}>
          <View style={[st.day, done.has(i) && st.dayDone, i === today && st.dayToday]}>
            {done.has(i) ? <Text style={{ color: colors.bg, fontWeight: '900' }}>✓</Text> : null}
          </View>
          <Text style={[type.label, { fontSize: 11 }, i === today && { color: colors.text }]}>{d}</Text>
        </View>
      ))}
    </View>
  );
}

function SessionRow({ s }: { s: Session }) {
  const score = sessionScore(s);
  const names = [...new Set(s.sets.map((x) => exerciseById(x.exercise).name))].join(' · ');
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/session/${s.id}`)} style={({ pressed }) => [st.sessionRow, pressed && { backgroundColor: colors.surfaceHigh }]}>
      <View style={[st.scoreBadge, { borderColor: scoreColor(score) }]}>
        <Text style={[type.h3, { color: scoreColor(score) }]}>{score}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h3}>{s.title}</Text>
        <Text style={type.small} numberOfLines={1}>
          {names}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={type.small}>{dayLabel(s.date)}</Text>
        <Text style={[type.small, { color: colors.textMute }]}>
          {s.sets.length} sets · {s.durationMin}m
        </Text>
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  page: { padding: space.xl, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xl },
  podPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  podText: { color: colors.textMute, fontWeight: '700', fontSize: 13 },
  start: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.xl,
    padding: space.xl,
    marginBottom: space.md,
  },
  startTitle: { fontSize: 28, fontWeight: '900', color: '#202020', letterSpacing: -0.6, marginTop: 2 },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#202020', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  balWrap: { flex: 1, justifyContent: 'center', marginVertical: space.md },
  balTrack: { flexDirection: 'row', height: 10, marginTop: space.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  day: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  dayDone: { backgroundColor: colors.orange },
  dayToday: { borderWidth: 2, borderColor: colors.text },
  sessionRow: {
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
  scoreBadge: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
