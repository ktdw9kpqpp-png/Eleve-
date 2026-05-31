import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import type { StepProps } from './types';

const SUGGESTED = [
  'Bel ağrısı',
  'Diz ağrısı',
  'Omuz ağrısı',
  'Hipertansiyon',
  'Diyabet',
  'Tiroid',
  'Astım',
  'Disk fıtığı',
];

export function Step08HealthConditions({
  profile,
  update,
  onContinue,
  onBack,
  step,
  totalSteps,
}: StepProps) {
  const [selected, setSelected] = useState<string[]>(profile.healthConditions ?? []);
  const [none, setNone] = useState<boolean>(
    profile.healthConditions !== undefined && profile.healthConditions.length === 0,
  );

  const toggle = (id: string) => {
    setNone(false);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleNone = () => {
    setNone(true);
    setSelected([]);
  };

  const handleContinue = () => {
    update({ healthConditions: selected });
    onContinue();
  };

  const canContinue = none || selected.length > 0;

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Dikkat etmem gereken bir şey var mı?"
      subtitle="Ağrı, yaralanma veya sağlık durumu. Antrenmanı buna göre ayarlarım."
      continueDisabled={!canContinue}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Chip label="Hiçbiri" selected={none} onPress={handleNone} />
        {SUGGESTED.map((s) => (
          <Chip key={s} label={s} selected={selected.includes(s)} onPress={() => toggle(s)} />
        ))}
      </View>
      <Text variant="caption" color="textDim" style={{ marginTop: 20 }}>
        Sağlık tavsiyesi veremem — ciddi durumlar için doktora danışmanı öneririm.
      </Text>
    </StepLayout>
  );
}
