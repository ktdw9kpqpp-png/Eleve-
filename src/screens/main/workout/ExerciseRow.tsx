import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { Exercise } from '@/types/domain';

type Props = {
  index: number;
  exercise: Exercise;
  done: boolean;
  onToggle: () => void;
};

export function ExerciseRow({ index, exercise, done, onToggle }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.bgElevated,
          borderRadius: theme.radius.lg,
          borderColor: done ? theme.colors.accent : theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            backgroundColor: done ? theme.colors.accent : 'transparent',
            borderColor: done ? theme.colors.accent : theme.colors.border,
          },
        ]}
      >
        {done ? (
          <Text style={{ color: '#0A0A0B', fontWeight: '700', fontSize: 16 }}>✓</Text>
        ) : (
          <Text variant="caption" color="textMuted">
            {index + 1}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant="bodyStrong"
          color={done ? 'textMuted' : 'text'}
          style={done ? { textDecorationLine: 'line-through' } : undefined}
        >
          {exercise.name}
        </Text>
        <Text variant="caption" color="textMuted" style={{ marginTop: 4 }}>
          {exercise.sets} set · {exercise.reps} · {exercise.rest} dinlenme
        </Text>
        {exercise.note ? (
          <Text variant="caption" color="textDim" style={{ marginTop: 4, lineHeight: 18 }}>
            {exercise.note}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderWidth: 1,
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
