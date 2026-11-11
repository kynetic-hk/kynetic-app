import { ExerciseId } from './exercises';

export interface SetResult {
  exercise: ExerciseId;
  reps: number;
  score: number; // 0–100 overall
  rom: number; // 0–100
  tempo: number; // 0–100
  form: number; // 0–100
  balance: { left: number; right: number }; // share of work, sums to 100
  durationSec?: number;
  repRom?: number[]; // % of target range per rep
  repTempo?: number[]; // seconds per rep
  repForm?: number[]; // 0–100 per rep
}

export interface Session {
  id: string;
  date: string; // ISO
  title: string;
  durationMin: number;
  sets: SetResult[];
  demo?: boolean;
}

export const sessionScore = (s: Session) => (s.sets.length ? Math.round(s.sets.reduce((a, b) => a + b.score, 0) / s.sets.length) : 0);

export const sessionBalance = (s: Session) => {
  if (!s.sets.length) return { left: 50, right: 50 };
  const l = s.sets.reduce((a, b) => a + b.balance.left, 0) / s.sets.length;
  return { left: Math.round(l), right: 100 - Math.round(l) };
};

export const sessionReps = (s: Session) => s.sets.reduce((a, b) => a + b.reps, 0);

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const reps = (n: number, base: number) => Array.from({ length: n }, (_, i) => Math.round(base + Math.sin(i * 1.7) * 6 - (i > n - 3 ? 8 : 0)));

/** Demo history shown until real sessions are recorded. */
export const DEMO_SESSIONS: Session[] = [
  {
    id: 'demo3',
    demo: true,
    date: daysAgo(1),
    title: 'Arm Day',
    durationMin: 42,
    sets: [
      { exercise: 'bicep_curl', reps: 10, score: 86, rom: 90, tempo: 78, form: 88, balance: { left: 47, right: 53 }, repRom: reps(10, 95) },
      { exercise: 'bicep_curl', reps: 9, score: 81, rom: 84, tempo: 80, form: 82, balance: { left: 46, right: 54 }, repRom: reps(9, 90) },
      { exercise: 'hammer_curl', reps: 10, score: 84, rom: 88, tempo: 76, form: 86, balance: { left: 48, right: 52 }, repRom: reps(10, 93) },
    ],
  },
  {
    id: 'demo2',
    demo: true,
    date: daysAgo(3),
    title: 'Shoulders',
    durationMin: 35,
    sets: [
      { exercise: 'lateral_raise', reps: 12, score: 72, rom: 70, tempo: 74, form: 72, balance: { left: 45, right: 55 }, repRom: reps(12, 80) },
      { exercise: 'lateral_raise', reps: 11, score: 75, rom: 76, tempo: 72, form: 76, balance: { left: 46, right: 54 }, repRom: reps(11, 84) },
    ],
  },
  {
    id: 'demo1',
    demo: true,
    date: daysAgo(6),
    title: 'Arm Day',
    durationMin: 38,
    sets: [
      { exercise: 'bicep_curl', reps: 10, score: 74, rom: 76, tempo: 70, form: 75, balance: { left: 44, right: 56 }, repRom: reps(10, 84) },
      { exercise: 'hammer_curl', reps: 8, score: 70, rom: 72, tempo: 68, form: 70, balance: { left: 45, right: 55 }, repRom: reps(8, 80) },
    ],
  },
  {
    id: 'demo0',
    demo: true,
    date: daysAgo(9),
    title: 'Arm Day',
    durationMin: 30,
    sets: [
      { exercise: 'bicep_curl', reps: 8, score: 66, rom: 68, tempo: 64, form: 66, balance: { left: 43, right: 57 }, repRom: reps(8, 76) },
    ],
  },
];
