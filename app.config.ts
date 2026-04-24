import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Eleve',
  slug: 'eleve',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0B',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.eleve.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0A0B',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.eleve.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-dev-client', 'expo-localization', 'expo-secure-store'],
  extra: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },
};

export default config;
