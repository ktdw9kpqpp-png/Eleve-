import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import type { StepProps } from './types';

const GOAL_OPTIONS = [
  { id: 'weight-loss', label: 'Kilo vermek' },
  { id: 'muscle', label: 'Kas kazanmak' },
  { id: 'energy', label: 'Daha fazla enerji' },
  { id: 'sleep', label: 'Daha iyi uyku' },
  { id: 'health', label: 'Genel sağlık' },
  { id: 'flexibility', label: 'Esneklik' },
  { id: 'mental', label: 'Mental sağlık' },
  { id: 'habit', label: 'Alışkanlık kurmak' },
] as const;

export function Step02Goals({ profile, update, onContinue, onBack, step, totalSteps }: StepProps) {
  const [selected, setSelected] = useState<string[]>(profile.goals ?? []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleContinue = () => {
    update({ goals: selected });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Hedeflerin neler?"
      subtitle="Birden fazla seçebilirsin."
      continueDisabled={selected.length === 0}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {GOAL_OPTIONS.map((g) => (
          <Chip
            key={g.id}
            label={g.label}
            selected={selected.includes(g.id)}
            onPress={() => toggle(g.id)}
          />
        ))}
      </View>
    </StepLayout>
  );
}
