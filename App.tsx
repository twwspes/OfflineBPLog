// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
// import { Text, TextInput } from 'react-native';
import { Provider } from 'react-redux';

import { AppNavigator } from './navigation/AppNavigator';
import { LocalisationProvider } from './hooks/useLocalisation';
import { initBloodPressureDB } from './helpers/dbBloodPressure';
import { initMessageDB } from './helpers/dbMessage';
import { store } from './store/store';

void initBloodPressureDB();

void initMessageDB();

// // Avoid text scaling by os's Text scaling feature on Accessibility
// if (Text.defaultProps == null) Text.defaultProps = {};
// Text.defaultProps.allowFontScaling = false;
// if (TextInput.defaultProps == null) TextInput.defaultProps = {};
// TextInput.defaultProps.allowFontScaling = false;

// const rootReducer = combineReducers({
//   bloodPressure: bloodPressureReducer,
// });

// composeWithDevTools are only for debugging and should be removed when building a production
// const store = createStore(rootReducer, applyMiddleware(ReduxThunk));
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

// eslint-disable-next-line import/no-default-export
export default App;
