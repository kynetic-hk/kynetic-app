import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { en, StringKey } from './en';
import { zhHans } from './zhHans';
import { zhHK } from './zhHK';

export type Lang = 'en' | 'zh-Hans' | 'zh-HK';
export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'zh-Hans', label: '普通话 (简体)', short: '普' },
  { id: 'zh-HK', label: '粵語 (繁體)', short: '粵' },
];

const DICTS: Record<Lang, Partial<Record<StringKey, string>>> = { en, 'zh-Hans': zhHans, 'zh-HK': zhHK };
const KEY = 'kynetic.lang.v1';

export type TFn = (key: StringKey | string, vars?: Record<string, string | number>) => string;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFn;
  locale: string; // for dates
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => v && DICTS[v as Lang] && setLangState(v as Lang))
      .catch(() => {});
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  }, []);

  const t = useCallback<TFn>(
    (key, vars) => {
      let s = (DICTS[lang] as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    },
    [lang],
  );

  const locale = lang === 'en' ? 'en-GB' : lang === 'zh-Hans' ? 'zh-CN' : 'zh-HK';
  return <I18nContext.Provider value={{ lang, setLang, t, locale }}>{children}</I18nContext.Provider>;
}

/** Session titles are stored in English; translate known ones. */
export const sessionTitle = (title: string, t: TFn) => t(`title.${title}`);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
