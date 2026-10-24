import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { BottomTabNavigator, navigationRef } from './RootNavigator';

export const AppNavigator: React.FC = () => (
  <NavigationContainer ref={navigationRef}>
    <StatusBar barStyle="dark-content" />
    <BottomTabNavigator />
  </NavigationContainer>
);
