import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { findWorkoutById } from '@/data/workouts';
import { selectWorkout } from '@/services/selectWorkout';
import { useDailyStore } from '@/state/dailyStore';
import { useUserStore } from '@/state/userStore';
import { computePhase } from '@/utils/cycle';
import { ExerciseRow } from './workout/ExerciseRow';
import { WorkoutHeader } from './workout/WorkoutHeader';

export function WorkoutScreen() {
  const theme = useTheme();
  const profile = useUserStore((s) => s.profile);
  const entries = useDailyStore((s) => s.entries);
  const setSelectedWorkout = useDailyStore((s) => s.setSelectedWorkout);
  const toggleExercise = useDailyStore((s) => s.toggleExercise);
  const getToday = useDailyStore((s) => s.getToday);

  const today = useMemo(() => {
    void entries; // recompute when the entries map changes
    return getToday();
  }, [entries, getToday]);

  const phase = useMemo(() => {
    const c = profile.cycle;
    if (!c?.lastPeriodStart) return null;
    return computePhase({
      lastPeriodStart: c.lastPeriodStart,
      averageCycleDays: c.averageCycleDays || 28,
    });
  }, [profile.cycle]);

  const workout = useMemo(() => {
    const pinned = today.selectedWorkoutId ? findWorkoutById(today.selectedWorkoutId) : undefined;
    if (pinned) return pinned;
    return selectWorkout({ profile, phase, today });
  }, [profile, phase, today]);

  // Persist the freshly selected workout once per change so progress survives reloads.
  useEffect(() => {
    if (today.selectedWorkoutId !== workout.id) {
      setSelectedWorkout(workout.id, workout.exercises.length);
    }
  }, [workout.id, workout.exercises.length, today.selectedWorkoutId, setSelectedWorkout]);

  const completedCount = workout.exercises.reduce(
    (n, _, i) => n + (today.exerciseProgress[i] === true ? 1 : 0),
    0,
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <WorkoutHeader
          workout={workout}
          completedCount={completedCount}
          totalCount={workout.exercises.length}
          planNote={today.planNote}
        />

        <Text variant="overline" color="textMuted" style={{ marginTop: 24, marginBottom: 12 }}>
          EGZERSİZLER
        </Text>
        <View style={{ gap: 10 }}>
          {workout.exercises.map((ex, i) => (
            <ExerciseRow
              key={`${workout.id}-${i}`}
              index={i}
              exercise={ex}
              done={today.exerciseProgress[i] === true}
              onToggle={() => toggleExercise(i, workout.exercises.length)}
            />
          ))}
        </View>

        {completedCount === workout.exercises.length ? (
          <View
            style={[
              styles.completedBanner,
              { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.accent, borderRadius: theme.radius.lg },
            ]}
          >
            <Text variant="bodyStrong" color="accent">
              Hepsi tamam — bugün için harikaydın 🌙
            </Text>
            <Text variant="caption" color="textMuted" style={{ marginTop: 4 }}>
              Antrenman görevin otomatik tamamlandı.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  completedBanner: {
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
  },
});
