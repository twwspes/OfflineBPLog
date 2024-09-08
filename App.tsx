import React from 'react';
import { Text, TextInput } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import * as Localization from 'expo-localization'; // or whatever library you want
import i18n from 'i18n-js'; // or whatever library you want

import bloodPressureReducer from './store/reducers/bloodPressure';
import AppNavigator from './navigation/AppNavigator';
import { LocalisationProvider } from './hooks/useLocalisation';
import { initBloodPressureDB } from './helpers/dbBloodPressure';
import { initMessageDB } from './helpers/dbMessage';

initBloodPressureDB()
  .then(() => {
    console.log('Initialized BloodPressureDB');
  })
  .catch((err) => {
    console.log('Initializing BloodPressureDB failed.');
    console.log(err);
  });

initMessageDB()
  .then(() => {
    console.log('Initialized MessageDB');
  })
  .catch((err) => {
    console.log('Initializing MessageDB failed.');
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

const App = () => {
  return (
    <LocalisationProvider>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </LocalisationProvider>
  );
};

export default App;
