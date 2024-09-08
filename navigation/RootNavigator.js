import * as React from 'react';
import { Text, View, StyleSheet, Platform, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { LocalizationContext } from '../constants/Localisation';

// import BloodPressureInputScreen from '../screens/BloodPressure/BloodPressureInputScreen';
import BloodPressureInputModal from '../screens/BloodPressure/BloodPressureInputModal';
import BloodPressurePeriodModal from '../screens/BloodPressure/BloodPressurePeriodModal';
import BloodPressureScreen from '../screens/BloodPressure/BloodPressureScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import RecordOutputScreen from '../screens/RecordOutput/RecordOutputScreen';
import { Colors } from '../constants/Colors';
import { useLocalisation } from 'hooks/useLocalisation';

const screenWidth = Math.round(Dimensions.get('window').width);
const { height, width } = Dimensions.get('window');
const aspectRatio = height / width;

const config = {
    animation: 'spring',
    config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },
};

const defaultNavOptions = {
    headerStyle: {
        backgroundColor: Platform.OS === 'android' ? Colors.focus : 'white'
    },
    headerTitleStyle: {
        // fontFamily: 'open-sans-bold',
    },
    headerBackTitleStyle: {
        // fontFamily: 'open-sans',
    },
    headerTintColor: Platform.OS === 'android' ? 'white' : Colors.focus,
    // transitionSpec: {
    //     open: config,
    //     close: config,
    // },
    // animation need to be disabled to avoid crash on Android 9.0+
    animationEnabled: false,
};

export const navigationRef = React.createRef();

export function navigate(name, params) {
    navigationRef.current?.navigate(name, params);
}

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
    const { t } = useLocalisation();

    function getTabBarVisibility(route) {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
        console.log("RootNavigator route");
        console.log(route);
        if (routeName === 'Home' || routeName === 'ResourceMappingInput') {
            return true;
        }
        return false;
    }

    return (
        <Tab.Navigator
            initialRouteName="BloodPressureStack"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: Colors.focus,
                tabBarInactiveTintColor: Colors.grey,
                tabBarStyle: {
                    shadowColor: 'transparent',
                    elevation: 0,
                    shadowOpacity: 0,
                    shadowOffset: { width: 0, height: 0 },
                    height: '10%'
                },
            })}
        >
            <Tab.Screen name="BloodPressureStack" component={BloodPressureNavigator} options={{
                tabBarIcon: ({ focused }) => {
                    return (
                        <Ionicons name="list-outline" size={32} color={focused ? Colors.focus : "grey"} />
                    )
                },
                tabBarLabel: t('pressure'),
            }}
            />
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={({ route }) => ({
                tabBarIcon: ({ focused, color }) => {
                    return (
                        <Ionicons name="analytics-outline" size={32} color={focused ? Colors.focus : "grey"} />
                    )
                },
                tabBarLabel: t('dashboard'),
            })}
            />
            <Tab.Screen name="RecordOutput" component={RecordOutputScreen} options={({ route }) => ({
                tabBarIcon: ({ focused, color }) => {
                    return (
                        <Ionicons name="share-outline" size={32} color={focused ? Colors.focus : "grey"} />
                    )
                },
                tabBarLabel: t('output'),
            })}
            />
        </Tab.Navigator>
    );
}

const BloodPressureStackNavigator = createStackNavigator();

export const BloodPressureNavigator = () => {
    const { t } = useLocalisation();

    const screenOptions = () => {
        return {
            ...defaultNavOptions,
            ...{
                headerTitle: t('pressure'),
            }
        };
    };

    return (
        <BloodPressureStackNavigator.Navigator
            initialRouteName="BloodPressure"

        >
            <BloodPressureStackNavigator.Group>
                <BloodPressureStackNavigator.Screen
                    name="BloodPressure"
                    component={BloodPressureScreen}
                    options={() => {
                        return {
                            ...defaultNavOptions,
                            headerTitle: t('pressure'),
                            headerShown: false,
                            // ...userScreenOptions
                        }
                    }}
                />
                {/* <BloodPressureStackNavigator.Screen
                    name="BloodPressureInput"
                    component={BloodPressureInputScreen}
                    options={() => {
                        return {
                            ...defaultNavOptions,
                            headerTitle: t('input'),
                            // ...userScreenOptions
                        };
                    }}
                /> */}
            </BloodPressureStackNavigator.Group>
            <BloodPressureStackNavigator.Group screenOptions={{ presentation: 'transparentModal' }}>
                <BloodPressureStackNavigator.Screen
                    name="BloodPressureInputModal"
                    component={BloodPressureInputModal}
                    options={() => {
                        return {
                            ...defaultNavOptions,
                            headerTitle: t('input'),
                            headerShown: false,
                            cardOverlayEnabled: true,
                            gestureEnabled: true,
                            // ...userScreenOptions
                        };
                    }}
                />
            </BloodPressureStackNavigator.Group>
            <BloodPressureStackNavigator.Group screenOptions={{ presentation: 'transparentModal' }}>
                <BloodPressureStackNavigator.Screen
                    name="BloodPressurePeriodModal"
                    component={BloodPressurePeriodModal}
                    options={() => {
                        return {
                            ...defaultNavOptions,
                            headerTitle: t('input'),
                            headerShown: false,
                            cardOverlayEnabled: true,
                            gestureEnabled: true,
                            // ...userScreenOptions
                        };
                    }}
                />
            </BloodPressureStackNavigator.Group>
        </BloodPressureStackNavigator.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarIcon: {
        width: 30,
        height: '100%',
        resizeMode: 'contain',
    },
});