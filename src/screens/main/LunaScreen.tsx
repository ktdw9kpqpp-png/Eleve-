import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export function LunaScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="overline" color="textMuted">
        {t('screens.luna')}
      </Text>
      <Text variant="display" style={{ marginTop: 8 }}>
        Luna
      </Text>
      <Text variant="body" color="textMuted" style={{ marginTop: 16 }}>
        AI koç sohbeti, sesli giriş ve hızlı soru chip&apos;leri burada (spec §10.2).
      </Text>
    </Screen>
  );
}
