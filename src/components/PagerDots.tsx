import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

type Props = {
  count: number;
  /** Page offset in [0, count-1]. */
  progress: SharedValue<number>;
};

const DOT = 6;
const ACTIVE_W = 22;
const GAP = 6;

export function PagerDots({ count, progress }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot
          key={i}
          index={i}
          progress={progress}
          active={theme.colors.text}
          inactive={theme.colors.textDim}
        />
      ))}
    </View>
  );
}

function Dot({
  index,
  progress,
  active,
  inactive,
}: {
  index: number;
  progress: SharedValue<number>;
  active: string;
  inactive: string;
}) {
  const animated = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const width = interpolate(distance, [0, 1], [ACTIVE_W, DOT], 'clamp');
    const opacity = interpolate(distance, [0, 1], [1, 0.45], 'clamp');
    return { width, opacity };
  });
  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: active, borderColor: inactive }, animated]}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GAP,
    paddingVertical: 12,
  },
  dot: {
    height: DOT,
    borderRadius: DOT / 2,
  },
});
