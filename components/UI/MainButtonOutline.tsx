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
    backgroundColor: Colors.transparent,
    borderColor: Colors.grey,
    borderWidth: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: Colors.grey,
    fontSize: FontSize.button,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

interface MainButtonOutlineProps {
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonText?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const MainButtonOutline: React.FC<MainButtonOutlineProps> = ({
  onPress,
  style,
  buttonStyle,
  buttonText,
  children,
}) => {
  const content = (
    <View style={[styles.button, buttonStyle]}>
      <Text style={[styles.buttonText, buttonText]}>{children}</Text>
    </View>
  );

  return (
    <View style={[styles.buttonContainer, style]}>
      {Platform.OS === 'android' && Platform.Version >= 21 ? (
        <TouchableNativeFeedback onPress={onPress}>
          {content}
        </TouchableNativeFeedback>
      ) : (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {content}
        </TouchableOpacity>
      )}
    </View>
  );
};
