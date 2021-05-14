import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, TouchableNativeFeedback, Platform } from 'react-native';

import Colors from '../../constants/Colors';

const MainButtonOutlineImage = props => {
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
        borderRadius: 30, // make TouchableNativeFeedback ripple effect match the shape of button
        overflow: 'hidden',
        backgroundColor: Colors.transparent,
        borderColor: Colors.grey,
        borderWidth: 2,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});

export default MainButtonOutlineImage;