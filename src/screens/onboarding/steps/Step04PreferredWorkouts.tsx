import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import type { WorkoutType } from '@/types/domain';
import type { StepProps } from './types';

const OPTIONS: { value: WorkoutType; label: string }[] = [
  { value: 'pilates', label: 'Pilates' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'strength', label: 'Ağırlık' },
  { value: 'swim', label: 'Yüzme' },
  { value: 'run', label: 'Koşu' },
  { value: 'dance', label: 'Dans' },
  { value: 'walk', label: 'Yürüyüş' },
  { value: 'restorative', label: 'Restoratif' },
];

export function Step04PreferredWorkouts({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [order, setOrder] = useState<WorkoutType[]>(profile.preferredWorkouts ?? []);

  const toggle = (v: WorkoutType) => {
    setOrder((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleContinue = () => {
    update({ preferredWorkouts: order });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Sevdiğin antrenmanlar?"
      subtitle="Sırayla dokun — ilk dokunduğun öncelikli olur."
      continueDisabled={order.length === 0}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {OPTIONS.map((o) => {
          const idx = order.indexOf(o.value);
          return (
            <Chip
              key={o.value}
              label={o.label}
              selected={idx >= 0}
              badge={idx >= 0 ? idx + 1 : undefined}
              onPress={() => toggle(o.value)}
            />
          );
        })}
      </View>
      <Text variant="caption" color="textDim" style={{ marginTop: 20 }}>
        Seçimine göre günlük antrenman önerileri oluşturacağım.
      </Text>
    </StepLayout>
  );
}
