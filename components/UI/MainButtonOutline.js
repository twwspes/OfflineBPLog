import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, TouchableNativeFeedback, Platform } from 'react-native';

import Colors from '../../constants/Colors';
import FontSize from '../../constants/FontSize';

const MainButtonOutline = props => {
    let ButtonComponent = TouchableOpacity; // .jsx need capital head

    if (Platform.OS === 'android' && Platform.Version >= 21) {
        ButtonComponent = TouchableNativeFeedback;
    }

    return (
        <View style={{ ...styles.buttonContainer, ...props.style }}>
            <ButtonComponent activeOpacity={0.8} onPress={props.onPress}>
                <View style={{ ...styles.button, ...props.buttonStyle }}>
                    <Text style={{ ...styles.buttonText, ...props.buttonText }}>{props.children}</Text>
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
        // backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: Colors.grey,
        // fontFamily: 'open-sans',
        fontSize: FontSize.button,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
});

export default MainButtonOutline;