import React from 'react';
import {
  GestureResponderEvent,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { Text } from './Text';
import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';

export interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  delayLongPress?: number;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonText?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

interface Props extends ButtonProps {
  variant: 'filled' | 'clear' | 'outline';
  image?: boolean;
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 30 },
  filled: { backgroundColor: Colors.focus },
  clear: { borderRadius: 10 },
  clearImage: { backgroundColor: Colors.transparent },
  outline: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.grey,
    borderWidth: 2,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  outlineContent: { paddingHorizontal: 10 },
  clearContent: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  imageContent: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    width: '100%',
  },
  fullWidth: { width: '100%' },
  text: {
    color: 'white',
    fontSize: FontSize.button,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  greyText: { color: Colors.grey },
});

export const Button: React.FC<Props> = ({
  variant,
  image = false,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  buttonStyle,
  buttonText,
  children,
}) => {
  const content = (
    <View
      style={[
        variant === 'clear' ? styles.clearContent : styles.content,
        variant === 'outline' && styles.outlineContent,
        image && styles.imageContent,
        buttonStyle,
      ]}
    >
      {image ? (
        children
      ) : (
        <Text
          style={[
            styles.text,
            variant !== 'filled' && styles.greyText,
            buttonText,
          ]}
        >
          {children}
        </Text>
      )}
    </View>
  );
  const touchProps = { onPress, onLongPress, delayLongPress };
  return (
    <View
      style={[
        styles.container,
        styles[variant],
        image && variant === 'clear' && styles.clearImage,
        style,
      ]}
    >
      {Platform.OS === 'android' && Platform.Version >= 21 ? (
        <TouchableNativeFeedback
          {...touchProps}
          background={
            image || variant === 'clear'
              ? TouchableNativeFeedback.Ripple('#fff', false)
              : undefined
          }
        >
          {content}
        </TouchableNativeFeedback>
      ) : (
        <TouchableOpacity
          {...touchProps}
          activeOpacity={0.8}
          style={image ? styles.fullWidth : undefined}
        >
          {content}
        </TouchableOpacity>
      )}
    </View>
  );
};
