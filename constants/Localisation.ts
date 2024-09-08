import React from 'react';
// import * as Localization from 'expo-localization'; // or whatever library you want
import i18n from 'i18n-js'; // or whatever library you want

import en from './lang/en';
import zh_HK from './lang/zh_HK';
import zh_CN from './lang/zh_CN';
import fr from './lang/fr';
import es from './lang/es';

interface LocalizationContextType {
  t: (scope: i18n.Scope, options?: i18n.TranslateOptions | undefined) => string;
  locale: 'zh_CN' | 'zh_HK' | 'fr' | 'es' | 'en';
  setLocale: React.Dispatch<
    React.SetStateAction<'zh_CN' | 'zh_HK' | 'fr' | 'es' | 'en'>
  >;
}

export const LocalizationContext =
  React.createContext<LocalizationContextType | null>(null);

i18n.fallbacks = true;
i18n.translations = { zh_HK, en, zh_CN, fr, es };

// console.log(Localization.getLocales()); //en-US
