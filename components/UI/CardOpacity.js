import React from 'react';
import {View, StyleSheet} from 'react-native';

import Colors from '../../constants/Colors';

const Card = props => {
    return (
        <View style={{...styles.card, ...props.style}}>
            {props.children}
        </View>
    );
};

const styles = StyleSheet.create({
    card:{
        borderRadius: 30, // make TouchableNativeFeedback ripple effect match the shape of button
        overflow: 'hidden',
        backgroundColor: Colors.transparent,
        borderColor: Colors.grey,
        borderWidth: 2,
    }
});

export default Card;