import React, { useEffect, useCallback, useState, useContext } from 'react';
import { Alert, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer} from '@react-navigation/native';

import { BottomTabNavigator, navigationRef} from './RootNavigator';
import { LocalizationContext } from '../constants/Localisation';

const AppNavigator = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale, setLocale } = useContext(LocalizationContext);

    useEffect(() => {
        if (error) {
            Alert.alert(t('error_occur'), error, [{ text: t('okay'), onPress: () => setError(null) }]);
        }
    }, [error]);

    StatusBar.setBarStyle('default');

    return (
        <NavigationContainer ref={navigationRef}>
            <BottomTabNavigator />
        </NavigationContainer>
    );
};

export default AppNavigator;