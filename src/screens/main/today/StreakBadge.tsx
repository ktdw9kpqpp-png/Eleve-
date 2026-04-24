import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = {
  current: number;
};

export function StreakBadge({ current }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.bgElevated, borderRadius: theme.radius.lg },
      ]}
    >
      <Text style={{ fontSize: 28 }}>🔥</Text>
      <View style={{ flex: 1 }}>
        <Text variant="overline" color="textMuted">
          ZİNCİR
        </Text>
        <Text variant="h2" style={{ marginTop: 2 }}>
          {current} gün
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
});
