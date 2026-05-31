import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const theme = useTheme();
  const bg =
    variant === 'primary'
      ? theme.colors.accent
      : variant === 'secondary'
        ? theme.colors.bgElevated
        : 'transparent';
  const fg = variant === 'primary' ? '#0A0A0B' : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.lg,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text variant="bodyStrong" style={{ color: fg }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});
