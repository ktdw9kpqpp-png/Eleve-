import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = {
  label: string;
  hint?: string;
  completed: boolean;
  onToggle: () => void;
};

export function TaskRow({ label, hint, completed, onToggle }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.bgElevated,
          borderRadius: theme.radius.lg,
          borderColor: completed ? theme.colors.accent : theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            backgroundColor: completed ? theme.colors.accent : 'transparent',
            borderColor: completed ? theme.colors.accent : theme.colors.border,
          },
        ]}
      >
        {completed ? (
          <Text style={{ color: '#0A0A0B', fontWeight: '700', fontSize: 16 }}>✓</Text>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant="bodyStrong"
          color={completed ? 'textMuted' : 'text'}
          style={completed ? { textDecorationLine: 'line-through' } : undefined}
        >
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" color="textDim" style={{ marginTop: 2 }}>
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
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
