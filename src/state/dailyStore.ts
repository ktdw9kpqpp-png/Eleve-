import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DailyEntry, StreakState, TaskKind } from '@/types/domain';
import { todayIso, yesterdayIso } from '@/utils/cycle';
import { zustandStorage } from './storage';

export const WATER_GOAL_CUPS = 8;

type DailyState = {
  entries: Record<string, DailyEntry>;
  streak: StreakState;
  waterGoal: number;
  getToday: () => DailyEntry;
  toggleTask: (kind: TaskKind) => void;
  addWater: (cups?: number) => void;
  resetWater: () => void;
  _bumpStreakIfNeeded: () => void;
};

function emptyEntry(date: string): DailyEntry {
  return {
    date,
    tasks: { workout: false, nutrition: false, study: false },
    waterCups: 0,
  };
}

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      entries: {},
      streak: { current: 0, lastActiveDate: null },
      waterGoal: WATER_GOAL_CUPS,

      getToday: () => {
        const today = todayIso();
        const existing = get().entries[today];
        if (existing) return existing;
        const fresh = emptyEntry(today);
        set((s) => ({ entries: { ...s.entries, [today]: fresh } }));
        return fresh;
      },

      toggleTask: (kind) => {
        const today = todayIso();
        set((s) => {
          const current = s.entries[today] ?? emptyEntry(today);
          const next: DailyEntry = {
            ...current,
            tasks: { ...current.tasks, [kind]: !current.tasks[kind] },
          };
          return { entries: { ...s.entries, [today]: next } };
        });
        get()._bumpStreakIfNeeded();
      },

      addWater: (cups = 1) => {
        const today = todayIso();
        set((s) => {
          const current = s.entries[today] ?? emptyEntry(today);
          const next: DailyEntry = {
            ...current,
            waterCups: Math.max(0, current.waterCups + cups),
          };
          return { entries: { ...s.entries, [today]: next } };
        });
      },

      resetWater: () => {
        const today = todayIso();
        set((s) => {
          const current = s.entries[today] ?? emptyEntry(today);
          return { entries: { ...s.entries, [today]: { ...current, waterCups: 0 } } };
        });
      },

      _bumpStreakIfNeeded: () => {
        const today = todayIso();
        const entry = get().entries[today];
        if (!entry) return;
        const anyComplete =
          entry.tasks.workout || entry.tasks.nutrition || entry.tasks.study;
        if (!anyComplete) return;

        const { current, lastActiveDate } = get().streak;
        if (lastActiveDate === today) return;
        const yesterday = yesterdayIso(today);
        const nextCount = lastActiveDate === yesterday ? current + 1 : 1;
        set({ streak: { current: nextCount, lastActiveDate: today } });
      },
    }),
    {
      name: 'eleve.daily',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    },
  ),
);
