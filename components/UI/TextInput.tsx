import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';

export interface TextInputProps extends RNTextInputProps {
  style?: StyleProp<TextStyle>;
}

export const TextInput: React.FC<TextInputProps> = ({
  style,
  allowFontScaling = false,
  ...rest
}) => {
  return (
    <RNTextInput allowFontScaling={allowFontScaling} style={style} {...rest} />
  );
};
