import { useCallback, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { PagerDots } from '@/components/PagerDots';
import { TodayScreen } from '@/screens/main/TodayScreen';
import { LunaScreen } from '@/screens/main/LunaScreen';
import { WorkoutScreen } from '@/screens/main/WorkoutScreen';
import { CalendarScreen } from '@/screens/main/CalendarScreen';
import { ProgressScreen } from '@/screens/main/ProgressScreen';
import { BodyScreen } from '@/screens/main/BodyScreen';

const PAGES = [
  { key: 'today', Component: TodayScreen },
  { key: 'luna', Component: LunaScreen },
  { key: 'workout', Component: WorkoutScreen },
  { key: 'calendar', Component: CalendarScreen },
  { key: 'progress', Component: ProgressScreen },
  { key: 'body', Component: BodyScreen },
] as const;

export function MainPager() {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const progress = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const onScroll = useAnimatedScrollHandler((event) => {
    progress.value = event.contentOffset.x / width;
  });

  const items = useMemo(() => PAGES, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      <PagerDots count={items.length} progress={progress} />
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        snapToInterval={width}
        decelerationRate="fast"
        style={styles.scroll}
      >
        {items.map(({ key, Component }) => (
          <View key={key} style={{ width }}>
            <Component />
          </View>
        ))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
});
