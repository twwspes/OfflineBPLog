import React from 'react';
import * as Localization from 'expo-localization'; // or whatever library you want
import i18n from 'i18n-js'; // or whatever library you want

import en from './lang/en';
import zh_HK from './lang/zh_HK';
import zh_CN from './lang/zh_CN';
import fr from './lang/fr';
import es from './lang/es';

export const LocalizationContext = React.createContext();

i18n.fallbacks = true;
i18n.translations = { zh_HK, en, zh_CN, fr, es };

console.log(Localization.locale); //en-US