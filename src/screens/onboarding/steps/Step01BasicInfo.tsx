import { useState } from 'react';
import { View } from 'react-native';
import { StepLayout } from '@/components/StepLayout';
import { TextField } from '@/components/TextField';
import type { StepProps } from './types';

export function Step01BasicInfo({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [name, setName] = useState(profile.name ?? '');
  const [age, setAge] = useState(profile.age ? String(profile.age) : '');
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '');
  const [weight, setWeight] = useState(profile.weight ? String(profile.weight) : '');

  const ageNum = Number(age);
  const heightNum = Number(height);
  const weightNum = Number(weight);
  const valid =
    name.trim().length > 0 &&
    ageNum > 0 &&
    ageNum < 120 &&
    heightNum > 60 &&
    heightNum < 260 &&
    weightNum > 20 &&
    weightNum < 300;

  const handleContinue = () => {
    update({ name: name.trim(), age: ageNum, height: heightNum, weight: weightNum });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Tanışalım"
      subtitle="Sana göre bir plan kurmak için birkaç temel bilgi."
      continueDisabled={!valid}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ gap: 16 }}>
        <TextField
          label="AD"
          value={name}
          onChangeText={setName}
          placeholder="Örn. Elif"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextField
          label="YAŞ"
          value={age}
          onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
          placeholder="28"
          keyboardType="number-pad"
          maxLength={3}
        />
        <TextField
          label="BOY (CM)"
          value={height}
          onChangeText={(v) => setHeight(v.replace(/[^0-9]/g, ''))}
          placeholder="168"
          keyboardType="number-pad"
          maxLength={3}
        />
        <TextField
          label="KILO (KG)"
          value={weight}
          onChangeText={(v) => setWeight(v.replace(/[^0-9.]/g, ''))}
          placeholder="62"
          keyboardType="decimal-pad"
          maxLength={5}
        />
      </View>
    </StepLayout>
  );
}
