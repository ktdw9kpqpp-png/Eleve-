import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import type { StepProps } from './types';

export function Step10Lifestyle({ profile, update, onContinue, onBack, step, totalSteps }: StepProps) {
  const [value, setValue] = useState<'sedentary' | 'active' | null>(profile.lifestyle ?? null);

  const handleContinue = () => {
    if (!value) return;
    update({ lifestyle: value });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Günlerin çoğu nasıl geçiyor?"
      continueDisabled={!value}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ gap: 12 }}>
        <Chip
          label="Masa başı · Çoğu zaman oturuyorum"
          selected={value === 'sedentary'}
          onPress={() => setValue('sedentary')}
        />
        <Chip
          label="Aktif · Ayaktayım, hareket halindeyim"
          selected={value === 'active'}
          onPress={() => setValue('active')}
        />
      </View>
    </StepLayout>
  );
}
