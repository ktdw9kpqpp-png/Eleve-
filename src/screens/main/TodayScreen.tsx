import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export function TodayScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="overline" color="textMuted">
        {t('screens.today')}
      </Text>
      <Text variant="display" style={{ marginTop: 8 }}>
        {t('app.tagline')}
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 16 }}>
        Döngü kartı, 3 görev, streak ve su takibi burada olacak (spec §10.2).
      </Text>
    </Screen>
  );
}
