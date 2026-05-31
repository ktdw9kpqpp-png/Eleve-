import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export function CalendarScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="overline" color="textMuted">
        {t('screens.calendar')}
      </Text>
      <Text variant="display" style={{ marginTop: 8 }}>
        {t('screens.calendar')}
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 16 }}>
        7 günlük şerit, aylık görünüm ve döngü faz renk kodlaması burada (spec §10.2).
      </Text>
    </Screen>
  );
}
