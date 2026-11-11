import { ExerciseId } from './exercises';

export interface SetResult {
  exercise: ExerciseId;
  reps: number;
  score: number; // 0–100 overall
  rom: number; // 0–100
  tempo: number; // 0–100
  form: number; // 0–100
  balance: { left: number; right: number }; // share of work, sums to 100
}

export interface Session {
  id: string;
  date: string; // ISO
  title: string;
  durationMin: number;
  sets: SetResult[];
}

export const sessionScore = (s: Session) => Math.round(s.sets.reduce((a, b) => a + b.score, 0) / s.sets.length);

export const sessionBalance = (s: Session) => {
  const l = s.sets.reduce((a, b) => a + b.balance.left, 0) / s.sets.length;
  return { left: Math.round(l), right: Math.round(100 - l) };
};

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

/** Demo history shown until real sessions are recorded. */
export const DEMO_SESSIONS: Session[] = [
  {
    id: 's3',
    date: daysAgo(1),
    title: 'Arm Day',
    durationMin: 42,
    sets: [
      { exercise: 'bicep_curl', reps: 10, score: 86, rom: 90, tempo: 78, form: 88, balance: { left: 47, right: 53 } },
      { exercise: 'bicep_curl', reps: 9, score: 81, rom: 84, tempo: 80, form: 82, balance: { left: 46, right: 54 } },
      { exercise: 'hammer_curl', reps: 10, score: 84, rom: 88, tempo: 76, form: 86, balance: { left: 48, right: 52 } },
    ],
  },
  {
    id: 's2',
    date: daysAgo(3),
    title: 'Shoulders',
    durationMin: 35,
    sets: [
      { exercise: 'lateral_raise', reps: 12, score: 72, rom: 70, tempo: 74, form: 72, balance: { left: 45, right: 55 } },
      { exercise: 'lateral_raise', reps: 11, score: 75, rom: 76, tempo: 72, form: 76, balance: { left: 46, right: 54 } },
    ],
  },
  {
    id: 's1',
    date: daysAgo(6),
    title: 'Arm Day',
    durationMin: 38,
    sets: [
      { exercise: 'bicep_curl', reps: 10, score: 74, rom: 76, tempo: 70, form: 75, balance: { left: 44, right: 56 } },
      { exercise: 'hammer_curl', reps: 8, score: 70, rom: 72, tempo: 68, form: 70, balance: { left: 45, right: 55 } },
    ],
  },
];
