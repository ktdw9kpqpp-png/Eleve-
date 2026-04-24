import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import { TextField } from '@/components/TextField';
import type { DietaryPreference } from '@/types/domain';
import type { StepProps } from './types';

const DIETARY: { value: DietaryPreference; label: string }[] = [
  { value: 'none', label: 'Özel bir tercih yok' },
  { value: 'vegetarian', label: 'Vejetaryen' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Glutensiz' },
];

export function Step09Dietary({ profile, update, onContinue, onBack, step, totalSteps }: StepProps) {
  const [dietary, setDietary] = useState<DietaryPreference[]>(profile.dietary ?? []);
  const [allergiesText, setAllergiesText] = useState<string>(
    (profile.allergies ?? []).join(', '),
  );
  const [dislikedText, setDislikedText] = useState<string>(
    (profile.dislikedFoods ?? []).join(', '),
  );

  const toggle = (v: DietaryPreference) => {
    setDietary((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const parseList = (s: string) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

  const handleContinue = () => {
    update({
      dietary,
      allergies: parseList(allergiesText),
      dislikedFoods: parseList(dislikedText),
    });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Beslenme"
      subtitle="Alerjiler ve tercihler — menülere uygulayacağım."
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ gap: 20 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {DIETARY.map((d) => (
            <Chip
              key={d.value}
              label={d.label}
              selected={dietary.includes(d.value)}
              onPress={() => toggle(d.value)}
            />
          ))}
        </View>
        <TextField
          label="ALERJİLER"
          helper="Virgülle ayır. Örn: fındık, süt, deniz ürünleri"
          value={allergiesText}
          onChangeText={setAllergiesText}
          placeholder="Alerjin yoksa boş bırak"
          autoCapitalize="none"
        />
        <TextField
          label="SEVMEDİKLERİN"
          helper="Virgülle ayır. Örn: mantar, karnabahar"
          value={dislikedText}
          onChangeText={setDislikedText}
          placeholder="Menüden çıkaracağım yiyecekler"
          autoCapitalize="none"
        />
      </View>
    </StepLayout>
  );
}
