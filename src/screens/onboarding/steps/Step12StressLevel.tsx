import { useState } from 'react';
import { Segmented } from '@/components/Segmented';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import type { StepProps } from './types';

const OPTIONS = [
  { value: 'low' as const, label: 'Düşük' },
  { value: 'medium' as const, label: 'Orta' },
  { value: 'high' as const, label: 'Yüksek' },
];

export function Step12StressLevel({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [value, setValue] = useState<'low' | 'medium' | 'high' | null>(profile.stressLevel ?? null);

  const handleContinue = () => {
    if (!value) return;
    update({ stressLevel: value });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Stres seviyen?"
      subtitle="Bu haftaki ortalama."
      continueDisabled={!value}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <Segmented options={OPTIONS} value={value} onChange={setValue} />
      <Text variant="caption" color="textDim" style={{ marginTop: 20 }}>
        Stres yüksekse yoğunluğu azaltır, toparlanma eklerim.
      </Text>
    </StepLayout>
  );
}
