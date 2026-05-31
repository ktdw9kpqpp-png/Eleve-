import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import tr from './locales/tr.json';
import en from './locales/en.json';

const SUPPORTED = ['tr', 'en'] as const;
type Supported = (typeof SUPPORTED)[number];

function detectLanguage(): Supported {
  const locales = getLocales();
  for (const loc of locales) {
    const code = loc.languageCode?.toLowerCase();
    if (code && (SUPPORTED as readonly string[]).includes(code)) {
      return code as Supported;
    }
  }
  return 'tr';
}

void i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: 'tr',
  interpolation: { escapeValue: false },
  returnNull: false,
  compatibilityJSON: 'v4',
});

export default i18n;
