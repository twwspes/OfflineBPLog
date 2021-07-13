import React from 'react';
import { Text, TextInput } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import * as Localization from 'expo-localization'; // or whatever library you want
import i18n from 'i18n-js'; // or whatever library you want

import bloodPressureReducer from './store/reducers/bloodPressure'; // for HKU server
import AppNavigator from './navigation/AppNavigator';
import { LocalizationContext } from './constants/Localisation';
import { initBloodPressureDB } from './helpers/dbBloodPressure';

initBloodPressureDB()
  .then(() => {
    console.log('Initialized BloodPressureDB');
  })
  .catch(err => {
    console.log('Initializing BloodPressureDB failed.');
    console.log(err);
  });

// Avoid text scaling by os's Text scaling feature on Accessibility
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

const rootReducer = combineReducers({
  bloodPressure: bloodPressureReducer,
});

// composeWithDevTools are only for debugging and should be removed when building a production
const store = createStore(rootReducer, applyMiddleware(ReduxThunk));
// const store = createStore(rootReducer, composeWithDevTools(
//   applyMiddleware(ReduxThunk),
//   // other store enhancers if any
// ));

export default function App() {
  const [locale, setLocale] = React.useState(
    () => {
      console.log("Localization.locale value");
      const localeToBeSet = Localization.locale.includes('zh') ?
        ((Localization.locale.includes('CN') || Localization.locale.includes('Hans')) ?
          'zh_CN' : 'zh_HK') :
        Localization.locale.includes('fr') ?
          'fr' :
          Localization.locale.includes('es') ?
            'es' : 'en';
      console.log(localeToBeSet);
      return localeToBeSet;
    }
    // The following code retrieve locale from system and decide which language the app should use
  );
  const localizationContext = React.useMemo(
    () => ({
      t: (scope, options) => i18n.t(scope, { locale, ...options }),
      locale,
      setLocale,
    }),
    [locale]
  );

  return (
    <LocalizationContext.Provider value={localizationContext}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </LocalizationContext.Provider>
  );
}