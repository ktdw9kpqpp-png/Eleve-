import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  /** 1..max */
  value: number;
  max?: number;
  onChange: (v: number) => void;
};

export function DotsPicker({ value, max = 5, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        const active = idx <= value;
        return (
          <Pressable
            key={idx}
            onPress={() => onChange(idx)}
            hitSlop={8}
            style={[
              styles.dot,
              {
                backgroundColor: active ? theme.colors.accent : theme.colors.bgElevated,
                borderColor: active ? theme.colors.accent : theme.colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
});
