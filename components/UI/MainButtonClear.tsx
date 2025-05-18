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
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.grey,
    fontSize: FontSize.button,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

interface MainButtonClearProps {
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonText?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const MainButtonClear: React.FC<MainButtonClearProps> = ({
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
        <TouchableNativeFeedback
          onPress={onPress}
          background={TouchableNativeFeedback.Ripple('#fff', false)}
        >
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
