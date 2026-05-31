import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  helper?: string;
};

export function TextField({ label, helper, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="overline" color="textMuted" style={{ marginBottom: 8 }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        {...rest}
        placeholderTextColor={theme.colors.textDim}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.bgElevated,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      />
      {helper ? (
        <Text variant="caption" color="textDim" style={{ marginTop: 6 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
});
