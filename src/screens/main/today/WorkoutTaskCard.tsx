import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { Intensity, Workout } from '@/types/domain';

const INTENSITY_LABEL: Record<Intensity, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

type Props = {
  workout: Workout | null;
  completedCount: number;
  taskComplete: boolean;
  onOpen: () => void;
  onToggleTask: () => void;
};

export function WorkoutTaskCard({
  workout,
  completedCount,
  taskComplete,
  onOpen,
  onToggleTask,
}: Props) {
  const theme = useTheme();
  const total = workout?.exercises.length ?? 0;
  const allDone = total > 0 && completedCount === total;
  const showComplete = taskComplete || allDone;

  return (
    <Pressable
      onPress={onOpen}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.bgElevated,
          borderRadius: theme.radius.lg,
          borderColor: showComplete ? theme.colors.accent : theme.colors.border,
        },
      ]}
    >
      <Pressable
        onPress={onToggleTask}
        hitSlop={8}
        style={[
          styles.check,
          {
            backgroundColor: showComplete ? theme.colors.accent : 'transparent',
            borderColor: showComplete ? theme.colors.accent : theme.colors.border,
          },
        ]}
      >
        {showComplete ? (
          <Text style={{ color: '#0A0A0B', fontWeight: '700', fontSize: 16 }}>✓</Text>
        ) : null}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text variant="overline" color="textMuted">
          ANTRENMAN
        </Text>
        <Text
          variant="bodyStrong"
          style={{ marginTop: 2 }}
          color={showComplete ? 'textMuted' : 'text'}
        >
          {workout?.name ?? 'Bugünkü antrenmanı seç'}
        </Text>
        {workout ? (
          <Text variant="caption" color="textDim" style={{ marginTop: 4 }}>
            {workout.duration} dk · {INTENSITY_LABEL[workout.intensity]} · {completedCount}/{total} egzersiz
          </Text>
        ) : null}
      </View>

      <Text variant="bodyStrong" color="textDim">
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: 1,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
