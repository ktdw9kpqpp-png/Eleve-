import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  badge?: string | number;
  style?: ViewStyle;
};

export function Chip({ label, selected, onPress, badge, style }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: selected ? theme.colors.accent : theme.colors.bgElevated,
          borderColor: selected ? theme.colors.accent : theme.colors.border,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      <Text
        variant="bodyStrong"
        style={{ color: selected ? '#0A0A0B' : theme.colors.text }}
      >
        {label}
      </Text>
      {badge !== undefined ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: selected ? '#0A0A0B' : theme.colors.accent,
              borderRadius: theme.radius.pill,
            },
          ]}
        >
          <Text
            variant="caption"
            style={{ color: selected ? theme.colors.accent : '#0A0A0B', fontWeight: '700' }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
