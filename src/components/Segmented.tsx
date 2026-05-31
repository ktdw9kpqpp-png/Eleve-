import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Option<T> = { value: T; label: string };

type Props<T extends string | number> = {
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function Segmented<T extends string | number>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.colors.bgElevated, borderRadius: theme.radius.md, borderColor: theme.colors.border },
      ]}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[
              styles.item,
              {
                backgroundColor: selected ? theme.colors.accent : 'transparent',
                borderRadius: theme.radius.sm,
              },
            ]}
          >
            <Text
              variant="bodyStrong"
              style={{ color: selected ? '#0A0A0B' : theme.colors.text }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
  },
  item: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
