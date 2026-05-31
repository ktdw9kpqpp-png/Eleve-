import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { StepLayout } from '@/components/StepLayout';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { computePhase, toIsoDate } from '@/utils/cycle';
import type { StepProps } from './types';

export function Step07Cycle({ profile, update, onContinue, onBack, step, totalSteps }: StepProps) {
  const [daysAgoText, setDaysAgoText] = useState<string>(() => {
    const stored = profile.cycle?.lastPeriodStart;
    if (!stored) return '';
    const MS = 24 * 60 * 60 * 1000;
    const [y, m, d] = stored.split('-').map(Number);
    if (!y || !m || !d) return '';
    const delta = Math.floor(
      (new Date().setHours(0, 0, 0, 0) - new Date(y, m - 1, d).getTime()) / MS,
    );
    return delta >= 0 ? String(delta) : '';
  });
  const [cycleDaysText, setCycleDaysText] = useState<string>(
    profile.cycle?.averageCycleDays ? String(profile.cycle.averageCycleDays) : '28',
  );

  const daysAgo = Number(daysAgoText);
  const cycleDays = Number(cycleDaysText);
  const valid = daysAgoText !== '' && daysAgo >= 0 && daysAgo <= 45 && cycleDays >= 21 && cycleDays <= 40;

  const preview = useMemo(() => {
    if (!valid) return null;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const iso = toIsoDate(d);
    return computePhase({ lastPeriodStart: iso, averageCycleDays: cycleDays });
  }, [valid, daysAgo, cycleDays]);

  const phaseLabel = preview
    ? { menstrual: 'Adet', follicular: 'Foliküler', ovulation: 'Ovülasyon', luteal: 'Luteal' }[preview.phase]
    : null;

  const handleContinue = () => {
    if (!valid) return;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    update({
      cycle: {
        lastPeriodStart: toIsoDate(d),
        averageCycleDays: cycleDays,
      },
    });
    onContinue();
  };

  return (
    <StepLayout
      step={step}
      totalSteps={totalSteps}
      title="Döngün nasıl?"
      subtitle="Antrenman ve beslenmeni faza göre ayarlarım."
      continueDisabled={!valid}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={{ gap: 16 }}>
        <TextField
          label="SON ADETİN NE ZAMAN BAŞLADI?"
          helper="Kaç gün önce başladı (bugün = 0)"
          value={daysAgoText}
          onChangeText={(v) => setDaysAgoText(v.replace(/[^0-9]/g, ''))}
          placeholder="7"
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextField
          label="ORTALAMA DÖNGÜ (GÜN)"
          helper="21–40 arası"
          value={cycleDaysText}
          onChangeText={(v) => setCycleDaysText(v.replace(/[^0-9]/g, ''))}
          placeholder="28"
          keyboardType="number-pad"
          maxLength={2}
        />
        {preview && phaseLabel ? (
          <Text variant="caption" color="accent" style={{ marginTop: 8 }}>
            Bugün: {phaseLabel} fazı · {preview.dayInCycle}. gün · enerji %{preview.energy}
          </Text>
        ) : null}
      </View>
    </StepLayout>
  );
}
