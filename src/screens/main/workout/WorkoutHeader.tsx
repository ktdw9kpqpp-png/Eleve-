import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { Intensity, Workout } from '@/types/domain';

const INTENSITY_LABEL_TR: Record<Intensity, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

const INTENSITY_COLOR: Record<Intensity, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

type Props = {
  workout: Workout;
  completedCount: number;
  totalCount: number;
  planNote: string | null;
};

export function WorkoutHeader({ workout, completedCount, totalCount, planNote }: Props) {
  const theme = useTheme();
  const intensityColor = INTENSITY_COLOR[workout.intensity];
  const intensityLabel = INTENSITY_LABEL_TR[workout.intensity];

  return (
    <View>
      <Text variant="overline" color="textMuted">
        BUGÜNÜN ANTRENMANI
      </Text>
      <Text variant="display" style={{ marginTop: 6 }}>
        {workout.name}
      </Text>

      <View style={styles.statsRow}>
        <Stat label="SÜRE" value={`${workout.duration} dk`} />
        <Stat label="KALORİ" value={`${workout.calories} kcal`} />
        <Stat label="YOĞUNLUK" value={intensityLabel} accent={intensityColor} />
      </View>

      <View
        style={[
          styles.progress,
          { backgroundColor: theme.colors.bgElevated, borderRadius: theme.radius.lg },
        ]}
      >
        <View style={styles.progressHeader}>
          <Text variant="overline" color="textMuted">
            İLERLEME
          </Text>
          <Text variant="bodyStrong">
            {completedCount} / {totalCount}
          </Text>
        </View>
        <View
          style={[styles.barTrack, { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.pill }]}
        >
          <View
            style={[
              styles.barFill,
              {
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                backgroundColor: theme.colors.accent,
                borderRadius: theme.radius.pill,
              },
            ]}
          />
        </View>
      </View>

      {planNote ? (
        <Text variant="caption" color="accent" style={{ marginTop: 12 }}>
          Luna notu: {planNote}
        </Text>
      ) : null}
    </View>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'success' | 'warning' | 'danger';
}) {
  return (
    <View style={styles.stat}>
      <Text variant="overline" color="textDim">
        {label}
      </Text>
      <Text variant="bodyStrong" color={accent ?? 'text'} style={{ marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 18,
  },
  stat: { flex: 0 },
  progress: {
    marginTop: 20,
    padding: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  barTrack: { height: 8, overflow: 'hidden' },
  barFill: { height: '100%' },
});
