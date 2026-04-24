import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/components/Chip';

export const QUICK_SUGGESTIONS = [
  'Bugün yorgunum',
  'Pilates yapalım',
  'Cuma yapamam',
  'Omzum ağrıyor',
  'Canım tatlı istiyor',
  'Bugün ne yapmalıyım?',
] as const;

type Props = {
  onPick: (text: string) => void;
  disabled?: boolean;
};

export function QuickChips({ onPick, disabled }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {QUICK_SUGGESTIONS.map((s) => (
        <Chip key={s} label={s} onPress={disabled ? undefined : () => onPick(s)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
