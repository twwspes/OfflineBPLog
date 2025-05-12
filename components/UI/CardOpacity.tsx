import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

import { Colors } from '../../constants/Colors';

interface CardProps {
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30, // make TouchableNativeFeedback ripple effect match the shape of button
    overflow: 'hidden',
    backgroundColor: Colors.transparent,
    borderColor: Colors.grey,
    borderWidth: 2,
  },
});

export const CardOpacity: React.FC<React.PropsWithChildren<CardProps>> = ({
  style,
  children,
}) => {
  return <View style={[styles.card, style]}>{children}</View>;
};
