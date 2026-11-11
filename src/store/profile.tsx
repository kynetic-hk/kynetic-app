import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AvatarLook } from '../components/Avatar';

export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'build_muscle' | 'fix_form' | 'prevent_injury' | 'fix_imbalances' | 'get_stronger';
export type Side = 'left' | 'right';

export interface Profile {
  name: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  dominantArm: Side;
  experience: Experience;
  goals: Goal[];
  injuries: string[]; // body area ids, e.g. 'shoulder', 'lower_back'
  avatar?: AvatarLook;
  injuryNotes?: string;
  pairedSensors: string[]; // sensor ids, e.g. 'L_FOREARM'
  calibratedAt?: string; // ISO date
  createdAt: string;
}

const KEY = 'kynetic.profile.v1';

interface Ctx {
  profile: Profile | null;
  loading: boolean;
  save: (p: Profile) => Promise<void>;
  update: (patch: Partial<Profile>) => Promise<void>;
  reset: () => Promise<void>;
}

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => setProfile(raw ? (JSON.parse(raw) as Profile) : null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (p: Profile) => {
    setProfile(p);
    // Storage can be unavailable (private mode, sandboxed previews): keep working in memory.
    await AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
  }, []);

  const update = useCallback(
    async (patch: Partial<Profile>) => {
      if (!profile) return;
      await save({ ...profile, ...patch });
    },
    [profile, save],
  );

  const reset = useCallback(async () => {
    setProfile(null);
    await AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  return <ProfileContext.Provider value={{ profile, loading, save, update, reset }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
