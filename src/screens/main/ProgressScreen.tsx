import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export function ProgressScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="overline" color="textMuted">
        {t('screens.progress')}
      </Text>
      <Text variant="display" style={{ marginTop: 8 }}>
        {t('screens.progress')}
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 16 }}>
        Haftalık grafikler, kilo eğrisi, uyku ortalaması ve AI haftalık özet burada (spec §10.2).
      </Text>
    </Screen>
  );
}
