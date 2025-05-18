import * as React from 'react';
import { Platform } from 'react-native';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { NavigationContainerRef } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { BloodPressureInputModal } from '../screens/BloodPressure/BloodPressureInputModal';
import { BloodPressurePeriodModal } from '../screens/BloodPressure/BloodPressurePeriodModal';
import { BloodPressureScreen } from '../screens/BloodPressure/BloodPressureScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { RecordOutputScreen } from '../screens/RecordOutput/RecordOutputScreen';
import { Colors } from '../constants/Colors';
import { useLocalisation } from '../hooks/useLocalisation';
import {
  BloodPressureStackParamList,
  BottomTabsParamList,
} from '../types/navigation';

const defaultNavOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: Platform.OS === 'android' ? Colors.focus : 'white',
  },
  headerTitleStyle: {},
  headerBackTitleStyle: {},
  headerTintColor: Platform.OS === 'android' ? 'white' : Colors.focus,
  animationEnabled: false,
};

export const navigationRef =
  React.createRef<NavigationContainerRef<BottomTabsParamList>>();

// export function navigate<RouteName extends string = string>(
//   ...args: RouteName extends string
//     ? [screen: RouteName] | [screen: RouteName, params: Record<string, any>]
//     : never
// ): void {
//   navigationRef.current?.navigate(...args);
// }

const BloodPressureStack = createStackNavigator<BloodPressureStackParamList>();

export const BloodPressureNavigator: React.FC = () => {
  const { t } = useLocalisation();

  return (
    <BloodPressureStack.Navigator initialRouteName="BloodPressure">
      <BloodPressureStack.Group>
        <BloodPressureStack.Screen
          name="BloodPressure"
          component={BloodPressureScreen}
          options={{
            ...defaultNavOptions,
            headerTitle: t('pressure'),
            headerShown: false,
          }}
        />
      </BloodPressureStack.Group>

      <BloodPressureStack.Group
        screenOptions={{ presentation: 'transparentModal' }}
      >
        <BloodPressureStack.Screen
          name="BloodPressureInputModal"
          component={BloodPressureInputModal}
          options={{
            ...defaultNavOptions,
            headerTitle: t('input'),
            headerShown: false,
            cardOverlayEnabled: true,
            gestureEnabled: true,
          }}
        />
      </BloodPressureStack.Group>

      <BloodPressureStack.Group
        screenOptions={{ presentation: 'transparentModal' }}
      >
        <BloodPressureStack.Screen
          name="BloodPressurePeriodModal"
          component={BloodPressurePeriodModal}
          options={{
            ...defaultNavOptions,
            headerTitle: t('input'),
            headerShown: false,
            cardOverlayEnabled: true,
            gestureEnabled: true,
          }}
        />
      </BloodPressureStack.Group>
    </BloodPressureStack.Navigator>
  );
};

const Tab = createBottomTabNavigator<BottomTabsParamList>();

const renderTabIconList = ({
  focused,
}: {
  focused: boolean;
  color: string;
  size: number;
}): React.ReactNode => (
  <Ionicons
    name="list-outline"
    size={32}
    color={focused ? Colors.focus : 'grey'}
  />
);

const renderTabIconAnalytics = ({
  focused,
}: {
  focused: boolean;
  color: string;
  size: number;
}): React.ReactNode => (
  <Ionicons
    name="analytics-outline"
    size={32}
    color={focused ? Colors.focus : 'grey'}
  />
);

const renderTabIconShare = ({
  focused,
}: {
  focused: boolean;
  color: string;
  size: number;
}): React.ReactNode => (
  <Ionicons
    name="share-outline"
    size={32}
    color={focused ? Colors.focus : 'grey'}
  />
);

export const BottomTabNavigator: React.FC = () => {
  const { t } = useLocalisation();

  return (
    <Tab.Navigator
      initialRouteName="BloodPressureStack"
      screenOptions={(): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.focus,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: {
          shadowColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          height: '10%',
        },
      })}
    >
      <Tab.Screen
        name="BloodPressureStack"
        component={BloodPressureNavigator}
        options={{
          tabBarIcon: renderTabIconList,
          tabBarLabel: t('pressure'),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: renderTabIconAnalytics,
          tabBarLabel: t('dashboard'),
        }}
      />
      <Tab.Screen
        name="RecordOutput"
        component={RecordOutputScreen}
        options={{
          tabBarIcon: renderTabIconShare,
          tabBarLabel: t('output'),
        }}
      />
    </Tab.Navigator>
  );
};
