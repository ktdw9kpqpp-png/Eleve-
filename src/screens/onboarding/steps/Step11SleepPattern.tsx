import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import type { StepProps } from './types';

export function Step11SleepPattern({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [value, setValue] = useState<'regular' | 'irregular' | null>(profile.sleepPattern ?? null);

  const handleContinue = () => {
    if (!value) return;
    update({ sleepPattern: value });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Uyku düzenin?"
      continueDisabled={!value}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ gap: 12 }}>
        <Chip
          label="Düzenli · Her gün benzer saat"
          selected={value === 'regular'}
          onPress={() => setValue('regular')}
        />
        <Chip
          label="Düzensiz · Değişken"
          selected={value === 'irregular'}
          onPress={() => setValue('irregular')}
        />
      </View>
      <Text variant="caption" color="textDim" style={{ marginTop: 20 }}>
        Az uyuduğun günlerde antrenmanı otomatik hafifleteceğim (spec §6.2).
      </Text>
    </StepLayout>
  );
}
