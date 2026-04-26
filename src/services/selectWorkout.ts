import type {
  CyclePhase,
  DailyEntry,
  FitnessLevel,
  Intensity,
  Location,
  PhaseInfo,
  UserProfile,
  Workout,
  WorkoutType,
} from '@/types/domain';
import { WORKOUTS } from '@/data/workouts';

export type SelectInput = {
  profile: Partial<UserProfile>;
  phase: PhaseInfo | null;
  today: DailyEntry;
};

/**
 * Pick today's workout from the catalog. Layered as:
 *   1. Hard filters (location, level cap, health-condition exclusions, phase compatibility)
 *   2. If a Luna override pinned a type/intensity for today, narrow to those
 *   3. Score by preferred-sport priority, phase fit, intensity vs energy
 *   4. Fall back gracefully if filters leave nothing — use restorative.
 *
 * Spec references: §6.2 (planning rules), §7.1 (phase windows), §8 (catalog).
 */
export function selectWorkout(input: SelectInput): Workout {
  const { profile, phase, today } = input;
  const hasOverride = today.plannedWorkoutType !== null;

  // Hard filters relax for explicit Luna overrides — when the user has been
  // told "do restorative because you're tired", we honour that even if it's
  // outside the usual gym/phase fit.
  const candidates = WORKOUTS.filter((w) =>
    passesHardFilters(w, profile, phase, today, hasOverride),
  );

  const overrideFiltered = applyOverride(candidates, today);
  const pool = overrideFiltered.length > 0 ? overrideFiltered : candidates;

  if (pool.length === 0) {
    return findFallback(today);
  }

  let best = pool[0]!;
  let bestScore = -Infinity;
  for (const w of pool) {
    const score = scoreWorkout(w, profile, phase, today);
    if (score > bestScore) {
      bestScore = score;
      best = w;
    }
  }
  return best;
}

function passesHardFilters(
  w: Workout,
  profile: Partial<UserProfile>,
  phase: PhaseInfo | null,
  today: DailyEntry,
  relaxForOverride: boolean,
): boolean {
  // Location filter rules (in order):
  //   1. alwaysAvailable workouts (restorative, yin yoga, walking) are
  //      universal recovery — they bypass the location filter unconditionally.
  //   2. If Luna pinned today.plannedLocation, that's the truth.
  //   3. Otherwise use the profile default — UNLESS a Luna override is active,
  //      in which case we relax the location too (a "tired" override might
  //      shift you from gym to home naturally).
  if (!w.alwaysAvailable) {
    const desiredLocation =
      today.plannedLocation ??
      (relaxForOverride ? null : profile.workoutLocation ?? null);
    if (desiredLocation && !w.location.includes(desiredLocation)) return false;
  }

  // Level cap: never push someone above their declared level.
  const userLevel = profile.fitnessLevel ?? 'beginner';
  if (levelRank(w.level) > levelRank(userLevel)) return false;

  // Phase compatibility — only filter when we know the phase and there's no override.
  if (phase && !relaxForOverride && !w.phase.includes(phase.phase)) return false;

  // Health-condition exclusions are always enforced.
  if (!isSafeForConditions(w, profile.healthConditions ?? [])) return false;

  return true;
}

function applyOverride(pool: Workout[], today: DailyEntry): Workout[] {
  let filtered = pool;
  if (today.plannedWorkoutType) {
    filtered = filtered.filter((w) => w.type === today.plannedWorkoutType);
  }
  if (today.plannedIntensity) {
    const intensityMatches = filtered.filter((w) => w.intensity === today.plannedIntensity);
    if (intensityMatches.length > 0) filtered = intensityMatches;
  }
  return filtered;
}

function scoreWorkout(
  w: Workout,
  profile: Partial<UserProfile>,
  phase: PhaseInfo | null,
  today: DailyEntry,
): number {
  let score = 0;

  // Preferred-sport priority. First preference is highest.
  const prefs = profile.preferredWorkouts ?? [];
  const prefIdx = prefs.indexOf(w.type);
  if (prefIdx >= 0) {
    score += 100 - prefIdx * 15;
  }

  // Phase fit — listing phases in the workout adds weight; perfect match adds more.
  if (phase) {
    if (w.phase.includes(phase.phase)) score += 30;
    score += phaseIntensityBonus(w.intensity, phase);
  }

  // Level fit — exact match preferred over a notch lower.
  const level = profile.fitnessLevel ?? 'beginner';
  if (w.level === level) score += 15;

  // Override nudge: if Luna pinned this type today, give it a boost so a good
  // pick from the override pool can still beat a generic phase match.
  if (today.plannedWorkoutType && w.type === today.plannedWorkoutType) score += 40;
  if (today.plannedIntensity && w.intensity === today.plannedIntensity) score += 20;

  return score;
}

function phaseIntensityBonus(intensity: Intensity, phase: PhaseInfo): number {
  // Energy targets per spec §7.1: menstrual ~30, follicular ~70, ovulation ~100, luteal ~55.
  // Reward intensity choices that align with the phase's energy band.
  const energy = phase.energy;
  const bands: Record<Intensity, [number, number]> = {
    low: [0, 50],
    medium: [40, 80],
    high: [70, 100],
  };
  const [lo, hi] = bands[intensity];
  if (energy >= lo && energy <= hi) return 20;
  // Soft penalty when far from the band, scaled by distance.
  const distance = energy < lo ? lo - energy : energy - hi;
  return -Math.min(20, Math.floor(distance / 5));
}

function isSafeForConditions(w: Workout, conditions: string[]): boolean {
  if (conditions.length === 0) return true;
  const lower = conditions.map((c) => c.toLowerCase());

  // Upper-body issues: avoid heavy push/pull strength, intense HIIT.
  const hasUpper = lower.some((c) => /omuz|sırt|sirt|boyun|dirsek|bilek/.test(c));
  if (hasUpper && (w.id === 'strength_full_body' || w.id === 'hiit_advanced')) return false;

  // Lower-body / knee / ankle issues: avoid running and high-impact HIIT.
  const hasLowerJoint = lower.some((c) => /diz|ayak bileği|ayak bilegi|kalça|kalca/.test(c));
  if (hasLowerJoint && (w.type === 'run' || w.id === 'hiit_advanced' || w.id === 'hiit_intermediate')) {
    return false;
  }

  // Lower-back issues: avoid heavy deadlifts and twisting power yoga.
  const hasLowerBack = lower.some((c) => /\bbel\b|alt sırt|alt sirt|disk|fıtık|fitik/.test(c));
  if (hasLowerBack && (w.id === 'strength_full_body' || w.id === 'hiit_advanced')) return false;

  return true;
}

function levelRank(l: FitnessLevel): number {
  return l === 'beginner' ? 1 : l === 'intermediate' ? 2 : 3;
}

function findFallback(today: DailyEntry): Workout {
  // Prefer the override type if it exists in catalog at all, else restorative.
  if (today.plannedWorkoutType) {
    const sameType = WORKOUTS.find((w) => w.type === today.plannedWorkoutType);
    if (sameType) return sameType;
  }
  return WORKOUTS.find((w) => w.id === 'restorative') ?? WORKOUTS[0]!;
}

export const __test__ = {
  passesHardFilters,
  scoreWorkout,
  isSafeForConditions,
};

export type { CyclePhase, Location, WorkoutType, Workout };
