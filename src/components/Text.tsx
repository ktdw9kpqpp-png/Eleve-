import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme, type TypographyVariant } from '@/theme';

type ColorKey = 'text' | 'textMuted' | 'textDim' | 'accent' | 'success' | 'warning' | 'danger';

type Props = Omit<RNTextProps, 'style'> & {
  variant?: TypographyVariant;
  color?: ColorKey;
  style?: TextStyle;
};

export function Text({ variant = 'body', color = 'text', style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <RNText
      {...rest}
      style={[theme.typography[variant] as TextStyle, { color: theme.colors[color] }, style]}
    />
  );
}
