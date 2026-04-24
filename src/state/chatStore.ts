import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatMessage } from '@/types/domain';
import { ClaudeError, sendCoachMessage } from '@/services/claude';
import { buildSystemPrompt, type PromptContext } from '@/services/systemPrompt';
import { detectIntent } from '@/services/nlu';
import { zustandStorage } from './storage';
import { useDailyStore } from './dailyStore';

export type ChatStatus = 'idle' | 'sending' | 'error';

type BuildContext = () => Omit<PromptContext, never>;

type ChatState = {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  /** Called whenever a workout-changing intent is applied — UI can toast. */
  lastPlanNote: string | null;
  send: (text: string, buildContext: BuildContext) => Promise<void>;
  clear: () => void;
  dismissError: () => void;
  dismissPlanNote: () => void;
};

function id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      status: 'idle',
      error: null,
      lastPlanNote: null,

      send: async (text, buildContext) => {
        const trimmed = text.trim();
        if (!trimmed || get().status === 'sending') return;

        // 1. Run NLU on the user's message and apply any daily-plan effects.
        const intent = detectIntent(trimmed);
        const effect = useDailyStore.getState().applyIntent(intent);

        // 2. Append user message + optimistic status.
        const userMsg: ChatMessage = {
          id: id(),
          role: 'user',
          content: trimmed,
          createdAt: Date.now(),
        };
        set((s) => ({
          messages: [...s.messages, userMsg],
          status: 'sending',
          error: null,
          lastPlanNote: effect.applied && effect.note ? effect.note : s.lastPlanNote,
        }));

        // 3. Build the system prompt AFTER applying the intent so Luna sees
        //    the updated plan in her context.
        const ctx = buildContext();
        const systemPrompt = buildSystemPrompt(ctx);

        try {
          const res = await sendCoachMessage({
            systemPrompt,
            messages: [...get().messages],
          });
          const assistantMsg: ChatMessage = {
            id: id(),
            role: 'assistant',
            content: res.text.trim() || '…',
            createdAt: Date.now(),
          };
          set((s) => ({ messages: [...s.messages, assistantMsg], status: 'idle' }));
        } catch (err) {
          const message =
            err instanceof ClaudeError
              ? `Luna’ya ulaşılamadı (${err.status ?? 'network'}). API anahtarını .env’de kontrol et.`
              : err instanceof Error
                ? err.message
                : 'Bilinmeyen hata.';
          set({ status: 'error', error: message });
        }
      },

      clear: () => set({ messages: [], status: 'idle', error: null, lastPlanNote: null }),

      dismissError: () => set({ status: 'idle', error: null }),

      dismissPlanNote: () => set({ lastPlanNote: null }),
    }),
    {
      name: 'eleve.chat',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      // Persist only messages; transient status/error should reset on reload.
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
