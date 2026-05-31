import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = {
  cups: number;
  goal: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function WaterTracker({ cups, goal, onAdd, onRemove }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.bgElevated, borderRadius: theme.radius.lg },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text variant="overline" color="textMuted">
            SU
          </Text>
          <Text variant="h2" style={{ marginTop: 4 }}>
            {cups} / {goal}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={onRemove}
            style={[styles.btn, { borderColor: theme.colors.border }]}
            disabled={cups === 0}
          >
            <Text variant="bodyStrong" color={cups === 0 ? 'textDim' : 'text'}>
              −
            </Text>
          </Pressable>
          <Pressable
            onPress={onAdd}
            style={[styles.btn, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
          >
            <Text variant="bodyStrong" style={{ color: '#0A0A0B' }}>
              +
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
        {Array.from({ length: goal }).map((_, i) => {
          const active = i < cups;
          return (
            <View
              key={i}
              style={[
                styles.cup,
                {
                  backgroundColor: active ? theme.colors.accent : 'transparent',
                  borderColor: active ? theme.colors.accent : theme.colors.border,
                  borderRadius: theme.radius.sm,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cup: {
    flex: 1,
    height: 18,
    borderWidth: 1,
  },
});
