import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { useUserStore } from '@/state/userStore';
import type { RootStackParamList } from '@/navigation/RootNavigator';

export function OnboardingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Onboarding'>>();

  const onSkip = () => {
    setOnboarded(true);
    navigation.replace('Main');
  };

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="overline" color="accent">
          {t('app.name')}
        </Text>
        <Text variant="display" style={{ marginTop: 12 }}>
          {t('onboarding.welcome')}
        </Text>
        <Text variant="body" color="textMuted" style={{ marginTop: 12 }}>
          {t('onboarding.subtitle')}
        </Text>
      </View>
      <Pressable
        onPress={onSkip}
        style={[
          styles.button,
          { backgroundColor: theme.colors.bgElevated, borderRadius: theme.radius.lg },
        ]}
      >
        <Text variant="bodyStrong" color="accent">
          {t('onboarding.skipToApp')}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center' },
  button: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
});
