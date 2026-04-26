import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { findWorkoutById } from '@/data/workouts';
import { selectWorkout } from '@/services/selectWorkout';
import { useDailyStore } from '@/state/dailyStore';
import { usePagerStore } from '@/state/pagerStore';
import { useUserStore } from '@/state/userStore';
import { computePhase } from '@/utils/cycle';
import { CyclePhaseCard } from './today/CyclePhaseCard';
import { PetGreeting } from './today/PetGreeting';
import { StreakBadge } from './today/StreakBadge';
import { TaskRow } from './today/TaskRow';
import { WaterTracker } from './today/WaterTracker';
import { WorkoutTaskCard } from './today/WorkoutTaskCard';

export function TodayScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const entries = useDailyStore((s) => s.entries);
  const streak = useDailyStore((s) => s.streak);
  const waterGoal = useDailyStore((s) => s.waterGoal);
  const toggleTask = useDailyStore((s) => s.toggleTask);
  const addWater = useDailyStore((s) => s.addWater);
  const getToday = useDailyStore((s) => s.getToday);
  const setSelectedWorkout = useDailyStore((s) => s.setSelectedWorkout);
  const goTo = usePagerStore((s) => s.goTo);

  const today = useMemo(() => {
    void entries; // re-compute when entries map changes
    return getToday();
  }, [entries, getToday]);

  const phaseInfo = useMemo(() => {
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
    return selectWorkout({ profile, phase: phaseInfo, today });
  }, [profile, phaseInfo, today]);

  useEffect(() => {
    if (today.selectedWorkoutId !== workout.id) {
      setSelectedWorkout(workout.id, workout.exercises.length);
    }
  }, [workout.id, workout.exercises.length, today.selectedWorkoutId, setSelectedWorkout]);

  const completedExercises = workout.exercises.reduce(
    (n, _, i) => n + (today.exerciseProgress[i] === true ? 1 : 0),
    0,
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="overline" color="textMuted">
          {t('screens.today').toUpperCase()}
        </Text>
        <Text variant="display" style={{ marginTop: 6 }}>
          {greet(profile.name)}
        </Text>

        <View style={{ marginTop: 24, gap: 14 }}>
          <PetGreeting
            petName={profile.pet?.name ?? 'Luna'}
            petAvatar={profile.pet?.avatar ?? '🌙'}
            userName={profile.name}
            phase={phaseInfo?.phase ?? null}
          />

          {phaseInfo ? <CyclePhaseCard info={phaseInfo} /> : null}

          <View style={{ gap: 10, marginTop: 6 }}>
            <Text variant="overline" color="textMuted">
              BUGÜNÜN GÖREVLERİ
            </Text>
            <WorkoutTaskCard
              workout={workout}
              completedCount={completedExercises}
              taskComplete={today.tasks.workout}
              onOpen={() => goTo('workout')}
              onToggleTask={() => toggleTask('workout')}
            />
            <TaskRow
              label={t('tasks.nutrition')}
              hint="Öğünleri takip et"
              completed={today.tasks.nutrition}
              onToggle={() => toggleTask('nutrition')}
            />
            <TaskRow
              label={t('tasks.study')}
              hint="15–30 dakika odaklanma"
              completed={today.tasks.study}
              onToggle={() => toggleTask('study')}
            />
          </View>

          <WaterTracker
            cups={today.waterCups}
            goal={waterGoal}
            onAdd={() => addWater(1)}
            onRemove={() => addWater(-1)}
          />

          <StreakBadge current={streak.current} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function greet(name: string | undefined): string {
  const hour = new Date().getHours();
  const prefix =
    hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'Merhaba' : 'İyi akşamlar';
  return name ? `${prefix}, ${name}.` : `${prefix}.`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
});
