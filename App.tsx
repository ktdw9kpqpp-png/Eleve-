import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import i18n from '@/i18n';
import { ThemeProvider } from '@/theme';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useSettingsStore } from '@/state/settingsStore';

export default function App() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    if (language && i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider mode={themeMode}>
          <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
