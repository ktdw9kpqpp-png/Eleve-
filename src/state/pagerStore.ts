import { create } from 'zustand';

export const PAGER_KEYS = ['today', 'luna', 'workout', 'calendar', 'progress', 'body'] as const;
export type PagerKey = (typeof PAGER_KEYS)[number];

type PagerState = {
  /** One-shot scroll target. Set by callers; the pager consumes it. */
  pendingTarget: PagerKey | null;
  goTo: (key: PagerKey) => void;
  consume: () => void;
};

export const usePagerStore = create<PagerState>()((set) => ({
  pendingTarget: null,
  goTo: (key) => set({ pendingTarget: key }),
  consume: () => set({ pendingTarget: null }),
}));
