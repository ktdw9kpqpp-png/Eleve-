import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { ThemeMode } from '@/theme';

export type Language = 'tr' | 'en';

type SettingsState = {
  themeMode: ThemeMode;
  language: Language | null;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      language: null,
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'eleve.settings',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    },
  ),
);
