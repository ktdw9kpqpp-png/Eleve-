import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { ChatMessage } from '@/types/domain';

type Props = {
  message: ChatMessage;
  petAvatar: string;
};

export function MessageBubble({ message, petAvatar }: Props) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      {!isUser ? (
        <View style={[styles.avatar, { backgroundColor: theme.colors.bgElevated }]}>
          <Text style={{ fontSize: 18 }}>{petAvatar}</Text>
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? theme.colors.accent : theme.colors.bgElevated,
            borderBottomRightRadius: isUser ? 4 : theme.radius.lg,
            borderBottomLeftRadius: isUser ? theme.radius.lg : 4,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <Text
          variant="body"
          style={{
            color: isUser ? '#0A0A0B' : theme.colors.text,
            lineHeight: 22,
          }}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
