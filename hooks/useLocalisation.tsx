/* eslint-disable import/no-named-as-default-member */
import React, {
  useCallback,
  useState,
  createContext,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { t as i18nt } from 'i18n-js';
import * as Localization from 'expo-localization';

import { en } from '../constants/lang/en';
import { zh_HK } from '../constants/lang/zh_HK';
import { zh_CN } from '../constants/lang/zh_CN';
import { fr } from '../constants/lang/fr';
import { es } from '../constants/lang/es';

interface ProviderProps {
  children: React.ReactNode;
}

export type LanguageType = 'zh_CN' | 'zh_HK' | 'fr' | 'es' | 'en';

export type LanguageType2 = 'zh-cn' | 'zh-hk' | 'fr' | 'es' | 'en';

interface LocalizationContextType {
  t: (scope: i18n.Scope, options?: i18n.TranslateOptions) => string;
  locale: LanguageType;
  locale2: LanguageType2;
  setLocale: React.Dispatch<React.SetStateAction<LanguageType>>;
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

i18n.fallbacks = true;
i18n.translations = { zh_HK, en, zh_CN, fr, es };

const localeStorageKey = 'BP_LOG_LOCALE';

const localeFormats: Record<LanguageType, LanguageType2> = {
  zh_CN: 'zh-cn',
  zh_HK: 'zh-hk',
  fr: 'fr',
  es: 'es',
  en: 'en',
};

const isLanguageType = (value: string | null): value is LanguageType => {
  return (
    value === 'zh_CN' ||
    value === 'zh_HK' ||
    value === 'fr' ||
    value === 'es' ||
    value === 'en'
  );
};

const getDeviceLocale = (): LanguageType => {
  const languageTag = Localization.getLocales()[0].languageTag;

  if (languageTag.includes('CN')) {
    return 'zh_CN';
  }
  if (languageTag.includes('zh')) {
    return 'zh_HK';
  }
  if (languageTag.includes('fr')) {
    return 'fr';
  }
  if (languageTag.includes('es')) {
    return 'es';
  }
  return 'en';
};

export const LocalisationProvider: React.FC<ProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<LanguageType>(getDeviceLocale);
  const [hasLoadedStoredLocale, setHasLoadedStoredLocale] = useState(false);
  const locale2 = localeFormats[locale];

  useEffect(() => {
    let isMounted = true;

    const loadStoredLocale = async () => {
      try {
        const storedLocale = await AsyncStorage.getItem(localeStorageKey);

        if (!isMounted) return;

        if (isLanguageType(storedLocale)) {
          setLocale(storedLocale);
        }
      } finally {
        if (isMounted) {
          setHasLoadedStoredLocale(true);
        }
      }
    };

    void loadStoredLocale();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredLocale) return;

    void AsyncStorage.setItem(localeStorageKey, locale);
  }, [hasLoadedStoredLocale, locale]);

  const t = useCallback(
    (scope: i18n.Scope, options?: i18n.TranslateOptions) =>
      i18nt(scope, { locale, ...options }),
    [locale],
  );

  const localizationContext = useMemo(
    () => ({
      t,
      locale,
      locale2,
      setLocale,
    }),
    [locale, locale2, t],
  );

  return (
    <LocalizationContext.Provider value={localizationContext}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalisation = () => {
  const value = useContext(LocalizationContext);

  if (value === null) {
    throw new Error(
      'The useLocalisation hook must be called within the context of LocalisationProvider.',
    );
  }

  return value;
};
