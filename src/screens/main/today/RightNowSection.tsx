import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { Suggestion } from '@/services/suggestNow';

type Props = {
  suggestions: Suggestion[];
  onPress: (s: Suggestion) => void;
};

export function RightNowSection({ suggestions, onPress }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <View>
      <Text variant="overline" color="textMuted">
        ŞU AN
      </Text>
      <View style={{ gap: 10, marginTop: 10 }}>
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} onPress={() => onPress(s)} />
        ))}
      </View>
    </View>
  );
}

function SuggestionCard({ suggestion, onPress }: { suggestion: Suggestion; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.bgElevated,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.emojiBubble, { backgroundColor: theme.colors.bgCard }]}>
        <Text style={{ fontSize: 22 }}>{suggestion.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{suggestion.title}</Text>
        <Text variant="caption" color="textMuted" style={{ marginTop: 4, lineHeight: 18 }}>
          {suggestion.description}
        </Text>
      </View>
      <View style={[styles.timePill, { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.pill }]}>
        <Text variant="caption" color="textMuted" style={{ fontWeight: '600' }}>
          {suggestion.timeEstimate}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  emojiBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
