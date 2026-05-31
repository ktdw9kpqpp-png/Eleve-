import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import type { Location } from '@/types/domain';
import type { StepProps } from './types';

const OPTIONS: { value: Location; label: string }[] = [
  { value: 'home', label: 'Ev' },
  { value: 'gym', label: 'Salon' },
  { value: 'studio', label: 'Stüdyo' },
  { value: 'outdoor', label: 'Açık hava' },
  { value: 'pool', label: 'Havuz' },
];

export function Step05Location({ profile, update, onContinue, onBack, step, totalSteps }: StepProps) {
  const [value, setValue] = useState<Location | null>(profile.workoutLocation ?? null);

  const handleContinue = () => {
    if (!value) return;
    update({ workoutLocation: value });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Nerede antrenman yapıyorsun?"
      subtitle="Genelde hangi ortamdasın?"
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
