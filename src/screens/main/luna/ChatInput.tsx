import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function ChatInput({ disabled, onSend }: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');

  const trimmed = text.trim();
  const canSend = trimmed.length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.bgElevated,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xl,
        },
      ]}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Luna’ya yaz…"
        placeholderTextColor={theme.colors.textDim}
        editable={!disabled}
        multiline
        style={[styles.input, { color: theme.colors.text }]}
        onSubmitEditing={handleSend}
        blurOnSubmit
        returnKeyType="send"
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={[
          styles.send,
          {
            backgroundColor: canSend ? theme.colors.accent : theme.colors.bgCard,
            borderRadius: theme.radius.pill,
          },
        ]}
      >
        <Text variant="bodyStrong" style={{ color: canSend ? '#0A0A0B' : theme.colors.textDim }}>
          ↑
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    maxHeight: 140,
  },
  send: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
