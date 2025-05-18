import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Colors.focus,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: FontSize.button,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

interface MainButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonText?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const MainButton: React.FC<MainButtonProps> = ({
  onPress,
  style,
  buttonStyle,
  buttonText,
  children,
}) => {
  return (
    <View style={[styles.buttonContainer, style]}>
      {Platform.OS === 'android' && Platform.Version >= 21 ? (
        <TouchableNativeFeedback onPress={onPress}>
          <View style={[styles.button, buttonStyle]}>
            <Text style={[styles.buttonText, buttonText]}>{children}</Text>
          </View>
        </TouchableNativeFeedback>
      ) : (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <View style={[styles.button, buttonStyle]}>
            <Text style={[styles.buttonText, buttonText]}>{children}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};
