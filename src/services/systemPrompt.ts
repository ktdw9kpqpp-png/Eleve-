import type { DailyEntry, PhaseInfo, StreakState, UserProfile } from '@/types/domain';

type Language = 'tr' | 'en';

export type PromptContext = {
  profile: Partial<UserProfile>;
  phase: PhaseInfo | null;
  today: DailyEntry;
  streak: StreakState;
  waterGoal: number;
  language: Language;
};

const TR_PROMPT =
  "Sen Luna'sın. Kullanıcının kişisel AI asistanısın. Fitness, uyku, stres, hedefler, günlük yaşam konularında yardımcı olursun. Sıcak, kısa ve doğal konuşursun. Türkçe yanıt verirsin.";

const EN_PROMPT =
  "You are Luna, the user's personal AI assistant. You help with fitness, sleep, stress, goals, and daily life. You speak warmly, briefly, and naturally.";

/**
 * Minimal system prompt. Context (profile, cycle, today) is intentionally
 * NOT injected — conversation history carries enough state and keeps each
 * request small and fast.
 */
export function buildSystemPrompt(ctx: PromptContext): string {
  return ctx.language === 'en' ? EN_PROMPT : TR_PROMPT;
}
