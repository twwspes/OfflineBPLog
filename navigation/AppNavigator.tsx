import React, { useEffect, useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { BottomTabNavigator, navigationRef } from './RootNavigator';
import { useLocalisation } from '../hooks/useLocalisation';

export const AppNavigator: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalisation();

  useEffect(() => {
    if (error) {
      Alert.alert(t('error_occur'), error, [
        { text: t('okay'), onPress: () => setError(null) },
      ]);
    }
  }, [error, t]);

  StatusBar.setBarStyle('dark-content');

  return (
    <NavigationContainer ref={navigationRef}>
      <BottomTabNavigator />
    </NavigationContainer>
  );
};
