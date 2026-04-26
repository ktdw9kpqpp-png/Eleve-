import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DailyEntry, StreakState, TaskKind } from '@/types/domain';
import type { BodyPart, Intent } from '@/services/nlu';
import { todayIso, yesterdayIso } from '@/utils/cycle';
import { zustandStorage } from './storage';

export const WATER_GOAL_CUPS = 8;

export type IntentEffect = {
  applied: boolean;
  note?: string;
};

type DailyState = {
  entries: Record<string, DailyEntry>;
  streak: StreakState;
  waterGoal: number;
  getToday: () => DailyEntry;
  toggleTask: (kind: TaskKind) => void;
  addWater: (cups?: number) => void;
  resetWater: () => void;
  /** Apply a detected intent to today's entry. Returns whether state changed. */
  applyIntent: (intent: Intent) => IntentEffect;
  clearPlan: () => void;
  /** Pin a workout for today; clears exercise progress when the id changes. */
  setSelectedWorkout: (id: string, totalExercises: number) => void;
  /** Toggle an exercise; auto-completes the workout task when all are done. */
  toggleExercise: (index: number, totalExercises: number) => void;
  _bumpStreakIfNeeded: () => void;
};

function emptyEntry(date: string): DailyEntry {
  return {
    date,
    tasks: { workout: false, nutrition: false, study: false },
    waterCups: 0,
    plannedWorkoutType: null,
    plannedIntensity: null,
    plannedLocation: null,
    planNote: null,
    selectedWorkoutId: null,
    exerciseProgress: {},
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

      applyIntent: (intent) => {
        const today = todayIso();
        const current = get().entries[today] ?? emptyEntry(today);
        const patch = intentToPatch(intent);
        if (!patch) return { applied: false };
        // If the override changes the planned type or location, invalidate the
        // current pick so the Workout screen re-runs selection.
        const invalidates =
          (patch.plannedWorkoutType !== undefined &&
            patch.plannedWorkoutType !== current.plannedWorkoutType) ||
          (patch.plannedLocation !== undefined &&
            patch.plannedLocation !== current.plannedLocation);
        const next: DailyEntry = {
          ...current,
          ...patch,
          ...(invalidates ? { selectedWorkoutId: null, exerciseProgress: {} } : {}),
        };
        set((s) => ({ entries: { ...s.entries, [today]: next } }));
        return { applied: true, note: patch.planNote ?? undefined };
      },

      setSelectedWorkout: (id, totalExercises) => {
        const today = todayIso();
        set((s) => {
          const current = s.entries[today] ?? emptyEntry(today);
          if (current.selectedWorkoutId === id) return s;
          const next: DailyEntry = {
            ...current,
            selectedWorkoutId: id,
            exerciseProgress: {},
          };
          return { entries: { ...s.entries, [today]: next } };
        });
        void totalExercises; // accepted for symmetry; reset clears all
      },

      toggleExercise: (index, totalExercises) => {
        const today = todayIso();
        set((s) => {
          const current = s.entries[today] ?? emptyEntry(today);
          const wasDone = current.exerciseProgress[index] === true;
          const nextProgress = { ...current.exerciseProgress, [index]: !wasDone };
          const allDone =
            totalExercises > 0 &&
            Array.from({ length: totalExercises }, (_, i) => nextProgress[i] === true).every(Boolean);
          const next: DailyEntry = {
            ...current,
            exerciseProgress: nextProgress,
            tasks: allDone ? { ...current.tasks, workout: true } : current.tasks,
          };
          return { entries: { ...s.entries, [today]: next } };
        });
        // Bump the streak if the auto-complete just flipped the workout task.
        get()._bumpStreakIfNeeded();
      },

      clearPlan: () => {
        const today = todayIso();
        set((s) => {
          const current = s.entries[today] ?? emptyEntry(today);
          return {
            entries: {
              ...s.entries,
              [today]: {
                ...current,
                plannedWorkoutType: null,
                plannedIntensity: null,
                plannedLocation: null,
                planNote: null,
              },
            },
          };
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

type EntryPatch = Partial<
  Pick<DailyEntry, 'plannedWorkoutType' | 'plannedIntensity' | 'plannedLocation' | 'planNote'>
>;

/**
 * Map a detected intent to a DailyEntry patch. Only workout-affecting intents
 * produce a patch; informational intents (questions, cravings) return null so
 * the UI can still react but the daily plan is untouched.
 */
function intentToPatch(intent: Intent): EntryPatch | null {
  switch (intent.kind) {
    case 'focus':
      return {
        plannedWorkoutType: intent.type,
        plannedIntensity: null,
        planNote: `${intent.type} üzerine odaklanma`,
      };
    case 'tired':
      return {
        plannedWorkoutType: 'restorative',
        plannedIntensity: 'low',
        planNote: intent.scope === 'week' ? 'Bu hafta toparlanma önceliği' : 'Bugün toparlanma',
      };
    case 'injury': {
      const safeType = injurySafeWorkout(intent.bodyPart);
      return {
        plannedWorkoutType: safeType,
        plannedIntensity: 'low',
        planNote: `${intent.bodyPart} koruma — ${safeType}`,
      };
    }
    case 'location_change':
      return {
        plannedLocation: intent.location,
        planNote: `Lokasyon: ${intent.location}`,
      };
    case 'reschedule':
    case 'missed_session':
    case 'overate':
    case 'sweet_craving':
    case 'question_cycle':
    case 'question_workout':
    case 'none':
      return null;
  }
}

function injurySafeWorkout(part: BodyPart) {
  switch (part) {
    case 'shoulder':
    case 'back':
    case 'neck':
    case 'elbow':
    case 'wrist':
      // Upper-body issues → lower-body / low-impact cardio.
      return 'walk' as const;
    case 'knee':
    case 'ankle':
    case 'hip':
      // Lower-body joint issues → water-based if possible, else restorative.
      return 'swim' as const;
    case 'lower-back':
      return 'restorative' as const;
    default:
      return 'restorative' as const;
  }
}
