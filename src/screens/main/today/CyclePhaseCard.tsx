import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { PhaseInfo } from '@/types/domain';

type Props = {
  info: PhaseInfo;
};

export function CyclePhaseCard({ info }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const phaseColor = {
    menstrual: theme.colors.phaseMenstrual,
    follicular: theme.colors.phaseFollicular,
    ovulation: theme.colors.phaseOvulation,
    luteal: theme.colors.phaseLuteal,
  }[info.phase];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.bgElevated, borderRadius: theme.radius.xl },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: phaseColor }]} />
        <Text variant="overline" color="textMuted">
          {t(`cycle.phase.${info.phase}`)}
        </Text>
      </View>
      <Text variant="h1" style={{ marginTop: 8 }}>
        {info.dayInCycle}. gün
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 4 }}>
        {info.phaseLength} günlük fazın {info.dayInPhase}. günü
      </Text>
      <EnergyBar energy={info.energy} color={phaseColor} />
    </View>
  );
}

function EnergyBar({ energy, color }: { energy: number; color: string }) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(100, energy));
  return (
    <View style={{ marginTop: 20 }}>
      <View style={styles.energyRow}>
        <Text variant="overline" color="textMuted">
          ENERJİ
        </Text>
        <Text variant="bodyStrong">%{clamped}</Text>
      </View>
      <View
        style={[
          styles.barTrack,
          { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.pill },
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              borderRadius: theme.radius.pill,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barTrack: { height: 8, overflow: 'hidden' },
  barFill: { height: '100%' },
});
