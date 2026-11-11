import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Rep } from '../analysis/reps';
import { exerciseById, ExerciseId } from '../data/exercises';
import { DEMO_SESSIONS, Session, SetResult } from '../data/sessions';

const KEY = 'kynetic.sessions.v1';

interface Active {
  id: string;
  startedAt: number;
  sets: SetResult[];
  exercise: ExerciseId;
}

interface Ctx {
  /** Saved sessions, newest first. Demo sessions fill in until there are 2 real ones. */
  sessions: Session[];
  realCount: number;
  active: Active | null;
  lastSet: { result: SetResult; reps: Rep[] } | null;
  startWorkout: (exercise: ExerciseId) => void;
  setExercise: (exercise: ExerciseId) => void;
  addSet: (result: SetResult, reps: Rep[]) => void;
  finishWorkout: () => Promise<string | null>;
  clearHistory: () => Promise<void>;
}

const WorkoutContext = createContext<Ctx | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Session[]>([]);
  const [active, setActive] = useState<Active | null>(null);
  const [lastSet, setLastSet] = useState<Ctx['lastSet']>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setSaved(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const persist = useCallback(async (list: Session[]) => {
    setSaved(list);
    await AsyncStorage.setItem(KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const startWorkout = useCallback((exercise: ExerciseId) => {
    setActive((a) => a ?? { id: `s${Date.now()}`, startedAt: Date.now(), sets: [], exercise });
    setActive((a) => (a ? { ...a, exercise } : a));
  }, []);

  const setExercise = useCallback((exercise: ExerciseId) => setActive((a) => (a ? { ...a, exercise } : a)), []);

  const addSet = useCallback((result: SetResult, reps: Rep[]) => {
    setLastSet({ result, reps });
    setActive((a) => (a ? { ...a, sets: [...a.sets, result] } : a));
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!active || !active.sets.length) {
      setActive(null);
      return null;
    }
    const names = [...new Set(active.sets.map((s) => exerciseById(s.exercise).muscles[0]))];
    const title = names.some((n) => n.includes('delt')) && names.length === 1 ? 'Shoulders' : names.length > 1 ? 'Upper Body' : 'Arm Day';
    const session: Session = {
      id: active.id,
      date: new Date(active.startedAt).toISOString(),
      title,
      durationMin: Math.max(1, Math.round((Date.now() - active.startedAt) / 60000)),
      sets: active.sets,
    };
    await persist([session, ...saved]);
    setActive(null);
    return session.id;
  }, [active, saved, persist]);

  const clearHistory = useCallback(() => persist([]), [persist]);

  const sessions = useMemo(() => (saved.length >= 2 ? saved : [...saved, ...DEMO_SESSIONS]), [saved]);

  return (
    <WorkoutContext.Provider value={{ sessions, realCount: saved.length, active, lastSet, startWorkout, setExercise, addSet, finishWorkout, clearHistory }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used inside WorkoutProvider');
  return ctx;
}
