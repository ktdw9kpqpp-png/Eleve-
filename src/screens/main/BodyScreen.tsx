import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export function BodyScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="overline" color="textMuted">
        {t('screens.body')}
      </Text>
      <Text variant="display" style={{ marginTop: 8 }}>
        {t('screens.body')}
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 16 }}>
        Kilo, ölçü takibi, before/after galeri (cihazda) ve rozetler burada (spec §10.2).
      </Text>
    </Screen>
  );
}
