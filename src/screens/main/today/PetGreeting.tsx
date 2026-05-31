import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import type { CyclePhase } from '@/types/domain';

type Props = {
  petName: string;
  petAvatar: string;
  userName: string | undefined;
  phase: CyclePhase | null;
};

/** Static templated greetings per cycle phase. Claude-generated copy lands later. */
const PHASE_MESSAGES: Record<CyclePhase, (name: string) => string> = {
  menstrual: (n) => `Bugün kendine nazik ol ${n}. Yoga, nefes, ılık çay iyi gelir.`,
  follicular: (n) => `Enerjin yükseliyor ${n} — bu haftayı iyi değerlendirelim.`,
  ovulation: (n) => `Zirve haftan ${n}! Zorlayıcı bir antrenmana hazır mısın?`,
  luteal: (n) => `Yavaş ve düşünceli ilerle ${n}. Pilates ve yüzme bugün ideal.`,
};

export function PetGreeting({ petName, petAvatar, userName, phase }: Props) {
  const theme = useTheme();
  const name = userName ?? 'sen';
  const message = phase ? PHASE_MESSAGES[phase](name) : `Günaydın ${name} — bugün ne yapıyoruz?`;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.bgCard, borderRadius: theme.radius.xl },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: theme.colors.bgElevated }]}>
        <Text style={{ fontSize: 28 }}>{petAvatar}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="overline" color="accent">
          {petName}
        </Text>
        <Text variant="body" style={{ marginTop: 6, lineHeight: 22 }}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
