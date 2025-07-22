import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationVI from './locales/vi/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  vi: { translation: translationVI },
  en: { translation: translationEN },
};

const getStoredLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem('language');
    return storedLanguage || 'vi';
  } catch {
    return 'vi';
  }
};

const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('language', language);
  } catch {}
};

const initI18n = async () => {
  const savedLanguage = await getStoredLanguage();

  await i18next.use(initReactI18next).init({
    lng: savedLanguage,
    fallbackLng: 'vi',
    debug: __DEV__,
    resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  i18next.on('languageChanged', saveLanguage);
};

export const changeLanguage = async (language: string) => {
  await i18next.changeLanguage(language);
};

initI18n().catch(console.error);

export default i18next;
