import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import type { UserProfile } from '@/types/domain';
import type { StepProps } from './types';

type Time = UserProfile['preferredWorkoutTime'];

const OPTIONS: { value: Time; label: string }[] = [
  { value: 'morning', label: 'Sabah' },
  { value: 'midday', label: 'Öğlen' },
  { value: 'evening', label: 'Akşam' },
  { value: 'flexible', label: 'Esnek' },
];

export function Step13WorkoutTime({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [value, setValue] = useState<Time | null>(profile.preferredWorkoutTime ?? null);

  const handleContinue = () => {
    if (!value) return;
    update({ preferredWorkoutTime: value });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Antrenman için en iyi saatin?"
      continueDisabled={!value}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {OPTIONS.map((o) => (
          <Chip key={o.value} label={o.label} selected={value === o.value} onPress={() => setValue(o.value)} />
        ))}
      </View>
    </StepLayout>
  );
}
