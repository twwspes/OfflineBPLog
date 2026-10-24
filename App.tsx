import React from 'react';
import { Provider } from 'react-redux';

import { AppNavigator } from './navigation/AppNavigator';
import { LocalisationProvider } from './hooks/useLocalisation';
import { initBloodPressureDB } from './helpers/dbBloodPressure';
import { initMessageDB } from './helpers/dbMessage';
import { store } from './store/store';

void initBloodPressureDB();

void initMessageDB();

const App: React.FC = () => {
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
