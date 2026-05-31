import type { UserProfile } from '@/types/domain';

export type StepProps = {
  profile: Partial<UserProfile>;
  update: (patch: Partial<UserProfile>) => void;
  onContinue: () => void;
  onBack?: () => void;
  step: number;
  totalSteps: number;
};
