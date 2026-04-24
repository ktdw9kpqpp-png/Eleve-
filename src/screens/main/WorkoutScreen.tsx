import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export function WorkoutScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="overline" color="textMuted">
        {t('screens.workout')}
      </Text>
      <Text variant="display" style={{ marginTop: 8 }}>
        {t('tasks.workout')}
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 16 }}>
        Bugünkü antrenman, set/tekrar/dinlenme ve tamamlama sistemi burada (spec §8, §10.2).
      </Text>
    </Screen>
  );
}
