import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, TouchableNativeFeedback, Platform } from 'react-native';

import Colors from '../../constants/Colors';
import FontSize from '../../constants/FontSize';

const MainButtonClear = props => {
    let ButtonComponent = TouchableOpacity; // .jsx need capital head

    if (Platform.OS === 'android' && Platform.Version >= 21) {
        ButtonComponent = TouchableNativeFeedback;
    }

    return (
        <View style={{ ...styles.buttonContainer, ...props.style }}>
            <ButtonComponent activeOpacity={0.8} onPress={props.onPress} delayLongPress={props.delayLongPress} onLongPress={props.onLongPress} style={{ width: '100%' }} background={TouchableNativeFeedback.Ripple('#fff', false)}>
                <View style={{ ...styles.button, ...props.buttonStyle }}>
                    {props.children}
                </View>
            </ButtonComponent>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: 10, // make TouchableNativeFeedback ripple effect match the shape of button
        overflow: 'hidden',
        backgroundColor: Colors.transparent,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});

export default MainButtonClear;