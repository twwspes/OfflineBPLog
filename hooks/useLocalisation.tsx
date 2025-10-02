/* eslint-disable import/no-named-as-default-member */
import React, {
  useCallback,
  useState,
  createContext,
  useEffect,
  useMemo,
  useContext,
} from 'react';
// import * as Localization from 'expo-localization'; // or whatever library you want
import i18n, { t as i18nt } from 'i18n-js'; // or whatever library you want
import * as Localization from 'expo-localization'; // or whatever library you want

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

export const LocalisationProvider: React.FC<ProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<LanguageType>(() => {
    // console.log("Localization.locale value");
    if (Localization.getLocales()[0].languageTag.includes('CN')) {
      return 'zh_CN';
    }
    if (Localization.getLocales()[0].languageTag.includes('zh')) {
      return 'zh_HK';
    }
    if (Localization.getLocales()[0].languageTag.includes('fr')) {
      return 'fr';
    }
    if (Localization.getLocales()[0].languageTag.includes('es')) {
      return 'es';
    }
    return 'en';
  });
  const [locale2, setLocale2] = useState<LanguageType2>(() => {
    // console.log("Localization.locale value");
    if (Localization.getLocales()[0].languageTag.includes('CN')) {
      return 'zh-cn';
    }
    if (Localization.getLocales()[0].languageTag.includes('zh')) {
      return 'zh-hk';
    }
    if (Localization.getLocales()[0].languageTag.includes('fr')) {
      return 'fr';
    }
    if (Localization.getLocales()[0].languageTag.includes('es')) {
      return 'es';
    }
    return 'en';
  });

  const convertType1ToType2 = useCallback<
    (type1: LanguageType) => LanguageType2
  >((type1) => {
    switch (type1) {
      case 'zh_CN':
        return 'zh-cn';
      case 'zh_HK':
        return 'zh-hk';
      case 'fr':
        return 'fr';
      case 'es':
        return 'es';
      case 'en':
        return 'en';
      default:
        return 'en';
    }
  }, []);

  useEffect(() => {
    setLocale2(convertType1ToType2(locale));
  }, [convertType1ToType2, locale]);

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
