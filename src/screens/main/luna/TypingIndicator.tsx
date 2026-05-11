import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

type Props = {
  petAvatar: string;
  petName?: string;
};

export function TypingIndicator({ petAvatar, petName = 'Luna' }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.bgElevated }]}>
        <Text style={{ fontSize: 18 }}>{petAvatar}</Text>
      </View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.colors.bgElevated,
            borderRadius: theme.radius.lg,
            borderBottomLeftRadius: 4,
          },
        ]}
      >
        <Text variant="caption" color="textMuted" style={{ marginRight: 4 }}>
          {petName} yazıyor
        </Text>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [delay, opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, { backgroundColor: theme.colors.textMuted }, animated]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
