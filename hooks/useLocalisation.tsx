import React, { useCallback, useState } from 'react';
// import * as Localization from 'expo-localization'; // or whatever library you want
import i18n from 'i18n-js'; // or whatever library you want
import * as Localization from 'expo-localization'; // or whatever library you want

import en from '../constants/lang/en';
import zh_HK from '../constants/lang/zh_HK';
import zh_CN from '../constants/lang/zh_CN';
import fr from '../constants/lang/fr';
import es from '../constants/lang/es';

interface ProviderProps {
  children: React.ReactNode;
}

export type LanguageType = 'zh_CN' | 'zh_HK' | 'fr' | 'es' | 'en';

interface LocalizationContextType {
  t: (scope: i18n.Scope, options?: i18n.TranslateOptions | undefined) => string;
  locale: LanguageType;
  setLocale: React.Dispatch<React.SetStateAction<LanguageType>>;
}

const LocalizationContext = React.createContext<LocalizationContextType | null>(
  null,
);

i18n.fallbacks = true;
i18n.translations = { zh_HK, en, zh_CN, fr, es };

export const LocalisationProvider: React.FC<ProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<LanguageType>(() => {
    // console.log("Localization.locale value");
    if (Localization.getLocales()[0].languageTag.includes('CN')) {
      return 'zh_CN';
    }
    if (Localization.getLocales()[0].languageTag.includes('zh')) {
      return 'zh_CN';
    }
    if (Localization.getLocales()[0].languageTag.includes('fr')) {
      return 'fr';
    }
    if (Localization.getLocales()[0].languageTag.includes('es')) {
      return 'es';
    }
    return 'en';
  });

  const t = useCallback(
    (scope: i18n.Scope, options?: i18n.TranslateOptions | undefined) =>
      i18n.t(scope, { locale, ...options }),
    [locale],
  );

  const localizationContext = React.useMemo(
    () => ({
      t,
      locale,
      setLocale,
    }),
    [locale, t],
  );

  return (
    <LocalizationContext.Provider value={localizationContext}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalisation = () => {
  const value = React.useContext(LocalizationContext);

  if (value === null) {
    throw new Error(
      'The useLocalisation hook must be called within the context of LocalisationProvider.',
    );
  }

  return value;
};
