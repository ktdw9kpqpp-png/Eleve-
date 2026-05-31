import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import type { StepProps } from './types';

export function Step06WeeklyFrequency({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [value, setValue] = useState<number>(profile.weeklyFrequency ?? 0);

  const handleContinue = () => {
    if (!value) return;
    update({ weeklyFrequency: value });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Haftada kaç gün?"
      subtitle="Gerçekçi ol — sürdürebileceğin bir sayı."
      continueDisabled={!value}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <Chip key={n} label={`${n} gün`} selected={value === n} onPress={() => setValue(n)} />
        ))}
      </View>
      <Text variant="caption" color="textDim" style={{ marginTop: 20 }}>
        Zamanla ayarlayacağım — ilk hedef istikrar, adet değil.
      </Text>
    </StepLayout>
  );
}
