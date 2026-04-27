import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { findWorkoutById } from '@/data/workouts';
import { selectWorkout } from '@/services/selectWorkout';
import { suggestNow, type Suggestion } from '@/services/suggestNow';
import { useDailyStore } from '@/state/dailyStore';
import { usePagerStore } from '@/state/pagerStore';
import { useUserStore } from '@/state/userStore';
import type { CyclePhase } from '@/types/domain';
import { computePhase } from '@/utils/cycle';
import { BodyContextCard } from './today/BodyContextCard';
import { CyclePhaseCard } from './today/CyclePhaseCard';
import { RightNowSection } from './today/RightNowSection';
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
    void entries;
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

  const suggestions = useMemo(
    () =>
      suggestNow({
        now: new Date(),
        profile,
        phase: phaseInfo,
        today,
        waterGoal,
        workout,
      }),
    [profile, phaseInfo, today, waterGoal, workout],
  );

  const greeting = useMemo(
    () => buildGreeting(profile.name, phaseInfo?.phase ?? null, new Date()),
    [profile.name, phaseInfo],
  );

  const onSuggestion = (s: Suggestion) => {
    switch (s.action.kind) {
      case 'open-workout':
        goTo('workout');
        break;
      case 'open-luna':
        goTo('luna');
        break;
      case 'add-water':
        addWater(1);
        break;
      case 'toggle-task':
        toggleTask(s.action.task);
        break;
      case 'acknowledge':
        // No state change — the card itself is the reminder.
        break;
    }
  };

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
          {greeting.lead}
        </Text>
        {greeting.tail ? (
          <Text variant="body" color="textMuted" style={{ marginTop: 6 }}>
            {greeting.tail}
          </Text>
        ) : null}

        <View style={{ marginTop: 24 }}>
          <RightNowSection suggestions={suggestions} onPress={onSuggestion} />
        </View>

        {phaseInfo ? (
          <View style={{ marginTop: 24 }}>
            <BodyContextCard info={phaseInfo} />
          </View>
        ) : null}

        {phaseInfo ? (
          <View style={{ marginTop: 14 }}>
            <CyclePhaseCard info={phaseInfo} />
          </View>
        ) : null}

        <View style={{ marginTop: 24, gap: 10 }}>
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

        <View style={{ marginTop: 14, gap: 14 }}>
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

const PHASE_TAIL: Record<CyclePhase, string> = {
  menstrual: 'Bugün kendine yumuşak ol.',
  follicular: 'Enerjin yükseliyor — yeni şeylere açıksın.',
  ovulation: 'Tepe haftandasın, en güçlü hâlin.',
  luteal: 'Yavaşla, sezgilerine güven.',
};

function buildGreeting(
  name: string | undefined,
  phase: CyclePhase | null,
  now: Date,
): { lead: string; tail: string | null } {
  const hour = now.getHours();
  const word =
    hour < 5
      ? 'Hâlâ ayakta mısın'
      : hour < 12
        ? 'Günaydın'
        : hour < 18
          ? 'Merhaba'
          : hour < 22
            ? 'İyi akşamlar'
            : 'Gece geç oldu';
  const lead = name ? `${word}, ${name}.` : `${word}.`;
  const tail = phase ? PHASE_TAIL[phase] : null;
  return { lead, tail };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
});
