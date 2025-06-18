import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  StyleProp,
} from 'react-native';

export interface TextProps extends RNTextProps {
  style?: StyleProp<TextStyle>;
}

export const Text: React.FC<TextProps> = ({
  style,
  allowFontScaling = false,
  ...rest
}) => {
  return <RNText allowFontScaling={allowFontScaling} style={style} {...rest} />;
};
