import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { UserProfile } from '@/types/domain';

type UserState = {
  onboarded: boolean;
  profile: Partial<UserProfile>;
  setOnboarded: (v: boolean) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboarded: false,
      profile: {},
      setOnboarded: (onboarded) => set({ onboarded }),
      updateProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),
      reset: () => set({ onboarded: false, profile: {} }),
    }),
    {
      name: 'eleve.user',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    },
  ),
);
