import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import type { FitnessLevel } from '@/types/domain';
import type { StepProps } from './types';

const OPTIONS: { value: FitnessLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Başlangıç', desc: 'Yeni başlıyorum' },
  { value: 'intermediate', label: 'Orta', desc: 'Düzenli antrenman yapıyorum' },
  { value: 'advanced', label: 'İleri', desc: 'Tecrübeliyim' },
];

export function Step03FitnessLevel({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [value, setValue] = useState<FitnessLevel | null>(profile.fitnessLevel ?? null);

  const handleContinue = () => {
    if (!value) return;
    update({ fitnessLevel: value });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Fitness seviyen?"
      continueDisabled={!value}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ gap: 12 }}>
        {OPTIONS.map((o) => (
          <Chip
            key={o.value}
            label={`${o.label} · ${o.desc}`}
            selected={value === o.value}
            onPress={() => setValue(o.value)}
          />
        ))}
      </View>
      <Text variant="caption" color="textDim" style={{ marginTop: 24 }}>
        Seviyen antrenman yoğunluğunu ve ilerleme hızını belirler.
      </Text>
    </StepLayout>
  );
}
