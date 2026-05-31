import type {
  CyclePhase,
  DailyEntry,
  PhaseInfo,
  TaskKind,
  UserProfile,
  Workout,
} from '@/types/domain';

export type SuggestionAction =
  | { kind: 'open-workout' }
  | { kind: 'add-water' }
  | { kind: 'open-luna' }
  | { kind: 'toggle-task'; task: TaskKind }
  | { kind: 'acknowledge' };

export type Suggestion = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  timeEstimate: string;
  action: SuggestionAction;
};

export type SuggestContext = {
  now: Date;
  profile: Partial<UserProfile>;
  phase: PhaseInfo | null;
  today: DailyEntry;
  waterGoal: number;
  workout: Workout | null;
};

type Scored = { score: number; suggestion: Suggestion };

/**
 * Returns up to 3 actionable suggestions for the current moment, ordered by
 * relevance. Reads the time of day, cycle phase + energy, today's progress,
 * the user's preferred workout window, and the day's selected workout. Output
 * is intentionally short (one verb + one why-line) and time-bounded so the
 * user knows whether they "have time for this".
 */
export function suggestNow(ctx: SuggestContext): Suggestion[] {
  const candidates: Scored[] = [];
  const hour = ctx.now.getHours();
  const phaseKind = ctx.phase?.phase ?? null;

  candidates.push(
    ...waterSuggestions(ctx, hour),
    ...workoutSuggestions(ctx, hour),
    ...phaseSuggestions(ctx, hour, phaseKind),
    ...studySuggestions(ctx, hour),
    ...windDownSuggestions(ctx, hour),
    ...lunaFallback(ctx),
  );

  // De-dup by id (a phase rule and a generic rule can both propose the same).
  const seen = new Set<string>();
  const deduped: Scored[] = [];
  for (const c of candidates) {
    if (seen.has(c.suggestion.id)) continue;
    seen.add(c.suggestion.id);
    deduped.push(c);
  }

  deduped.sort((a, b) => b.score - a.score);
  return deduped.slice(0, 3).map((c) => c.suggestion);
}

// ─── Water ───────────────────────────────────────────────────────────────────

function waterSuggestions(ctx: SuggestContext, hour: number): Scored[] {
  const out: Scored[] = [];

  // First-thing-in-the-morning hydration nudge.
  if (hour >= 5 && hour < 10 && ctx.today.waterCups === 0) {
    out.push({
      score: 78,
      suggestion: {
        id: 'morning-water',
        emoji: '🥛',
        title: 'Sabah suyu',
        description: 'Uyandıktan sonra bir bardak su metabolizmayı uyandırır.',
        timeEstimate: '1 dk',
        action: { kind: 'add-water' },
      },
    });
    return out;
  }

  // Catch-up reminder if you're behind the hour-of-day target.
  const expected = expectedWaterByHour(hour, ctx.waterGoal);
  const deficit = expected - ctx.today.waterCups;
  if (deficit >= 1 && ctx.today.waterCups < ctx.waterGoal) {
    out.push({
      score: 30 + Math.min(40, deficit * 12),
      suggestion: {
        id: 'water-catchup',
        emoji: '💧',
        title: 'Bir bardak su iç',
        description: `Şu saatte ${expected} bardak hedefliyorduk, ${ctx.today.waterCups} içmişsin.`,
        timeEstimate: '1 dk',
        action: { kind: 'add-water' },
      },
    });
  }

  return out;
}

function expectedWaterByHour(hour: number, goal: number): number {
  if (hour < 7) return 0;
  if (hour >= 22) return goal;
  // Linear ramp from 7:00 to 22:00.
  return Math.max(1, Math.floor(((hour - 7) / 15) * goal));
}

// ─── Workout ─────────────────────────────────────────────────────────────────

function workoutSuggestions(ctx: SuggestContext, hour: number): Scored[] {
  const out: Scored[] = [];
  const w = ctx.workout;
  if (!w) return out;
  if (ctx.today.tasks.workout) return out;

  const inWindow = isInPreferredWorkoutWindow(hour, ctx.profile.preferredWorkoutTime);
  if (inWindow) {
    out.push({
      score: 85,
      suggestion: {
        id: 'start-workout',
        emoji: '💪',
        title: 'Antrenmana başla',
        description: `${w.name} · ${w.duration} dk · ${intensityLabel(w.intensity)} yoğunluk`,
        timeEstimate: `${w.duration} dk`,
        action: { kind: 'open-workout' },
      },
    });
  } else if (hour >= 7 && hour < 22) {
    // Outside the user's preferred window but still during waking hours: peek-only nudge.
    out.push({
      score: 48,
      suggestion: {
        id: 'preview-workout',
        emoji: '👀',
        title: 'Bugünkü antrenmana göz at',
        description: `${w.name} · ${w.duration} dk hazır`,
        timeEstimate: '2 dk',
        action: { kind: 'open-workout' },
      },
    });
  }
  return out;
}

function isInPreferredWorkoutWindow(hour: number, pref: UserProfile['preferredWorkoutTime'] | undefined): boolean {
  if (!pref || pref === 'flexible') return hour >= 7 && hour < 21;
  if (pref === 'morning') return hour >= 6 && hour < 12;
  if (pref === 'midday') return hour >= 11 && hour < 15;
  if (pref === 'evening') return hour >= 17 && hour < 22;
  return true;
}

function intensityLabel(i: 'low' | 'medium' | 'high'): string {
  return i === 'low' ? 'düşük' : i === 'medium' ? 'orta' : 'yüksek';
}

// ─── Phase-specific ──────────────────────────────────────────────────────────

function phaseSuggestions(
  ctx: SuggestContext,
  hour: number,
  phase: CyclePhase | null,
): Scored[] {
  if (!phase) return [];
  const out: Scored[] = [];
  const workoutUndone = !ctx.today.tasks.workout;

  if (phase === 'menstrual' && hour >= 9 && hour < 20) {
    out.push({
      score: 62,
      suggestion: {
        id: 'menstrual-walk',
        emoji: '🚶‍♀️',
        title: '10 dakika yumuşak yürüyüş',
        description: 'Adet günlerinde hafif hareket gerginliği azaltır.',
        timeEstimate: '10 dk',
        action: { kind: 'acknowledge' },
      },
    });
  }

  if (phase === 'follicular' && hour >= 7 && hour < 12 && workoutUndone) {
    out.push({
      score: 60,
      suggestion: {
        id: 'follicular-momentum',
        emoji: '🌱',
        title: 'Yeni bir şey dene',
        description: 'Bu fazda yeni hareketleri öğrenmek en kolay zamandır.',
        timeEstimate: '20 dk',
        action: { kind: 'open-workout' },
      },
    });
  }

  if (phase === 'ovulation' && hour >= 8 && hour < 19 && workoutUndone) {
    out.push({
      score: 75,
      suggestion: {
        id: 'ovulation-peak',
        emoji: '⚡',
        title: 'Zorlayıcı bir antrenman',
        description: 'Tepe haftan — vücudun bugün en güçlü performansa hazır.',
        timeEstimate: `${ctx.workout?.duration ?? 30} dk`,
        action: { kind: 'open-workout' },
      },
    });
  }

  if (phase === 'luteal' && hour >= 14 && hour < 22) {
    out.push({
      score: 56,
      suggestion: {
        id: 'luteal-magnesium',
        emoji: '🍫',
        title: 'Bitter çikolata veya badem',
        description: 'Luteal fazda magnezyum krizleri yumuşatır.',
        timeEstimate: '2 dk',
        action: { kind: 'acknowledge' },
      },
    });
  }

  if (phase === 'luteal' && hour >= 18 && hour < 23) {
    out.push({
      score: 50,
      suggestion: {
        id: 'luteal-breath',
        emoji: '🌬️',
        title: '5 dakika kutu nefes',
        description: 'Luteal akşamlarında sinir sistemini yatıştırmak iyi gelir.',
        timeEstimate: '5 dk',
        action: { kind: 'acknowledge' },
      },
    });
  }

  return out;
}

// ─── Study / focus ───────────────────────────────────────────────────────────

function studySuggestions(ctx: SuggestContext, hour: number): Scored[] {
  if (ctx.today.tasks.study) return [];
  const morningSlot = hour >= 9 && hour < 12;
  const afternoonSlot = hour >= 14 && hour < 17;
  if (!morningSlot && !afternoonSlot) return [];
  return [
    {
      score: 46,
      suggestion: {
        id: 'deep-focus',
        emoji: '📚',
        title: '25 dakika derin çalışma',
        description: 'Pomodoro: tek görev, telefon başka odada.',
        timeEstimate: '25 dk',
        action: { kind: 'toggle-task', task: 'study' },
      },
    },
  ];
}

// ─── Wind-down ───────────────────────────────────────────────────────────────

function windDownSuggestions(ctx: SuggestContext, hour: number): Scored[] {
  const out: Scored[] = [];

  if (hour >= 21 && hour < 23) {
    out.push({
      score: 52,
      suggestion: {
        id: 'plan-tomorrow',
        emoji: '🌙',
        title: 'Yarın için 3 öncelik yaz',
        description: 'Akşamdan plan, sabahki kararsızlığı çözer.',
        timeEstimate: '3 dk',
        action: { kind: 'open-luna' },
      },
    });
  }

  if (hour >= 23 || hour < 5) {
    out.push({
      score: 90,
      suggestion: {
        id: 'sleep-now',
        emoji: '😴',
        title: 'Uyku zamanı',
        description: 'Telefonu uzaklaştır — yarınki enerjin için en önemli yatırım.',
        timeEstimate: '7 sa',
        action: { kind: 'acknowledge' },
      },
    });
  }

  return out;
}

// ─── Always-available Luna fallback ──────────────────────────────────────────

function lunaFallback(ctx: SuggestContext): Scored[] {
  const petName = ctx.profile.pet?.name ?? 'Luna';
  return [
    {
      score: 18,
      suggestion: {
        id: 'talk-luna',
        emoji: '💬',
        title: `${petName}'ya yaz`,
        description: 'Bugün nasıl hissediyorsun?',
        timeEstimate: '2 dk',
        action: { kind: 'open-luna' },
      },
    },
  ];
}
