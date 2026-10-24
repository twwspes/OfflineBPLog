import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { Colors } from '../../constants/Colors';

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
    justifyContent: 'center',
    width: '100%',
  },
});

interface MainButtonOutlineImageProps {
  onPress: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  delayLongPress?: number;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const MainButtonOutlineImage: React.FC<MainButtonOutlineImageProps> = ({
  onPress,
  onLongPress,
  delayLongPress,
  style,
  buttonStyle,
  children,
}) => {
  const content = <View style={[styles.button, buttonStyle]}>{children}</View>;

  return (
    <View style={[styles.buttonContainer, style]}>
      {Platform.OS === 'android' && Platform.Version >= 21 ? (
        <TouchableNativeFeedback
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={delayLongPress}
          background={TouchableNativeFeedback.Ripple('#fff', false)}
        >
          {content}
        </TouchableNativeFeedback>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={delayLongPress}
          activeOpacity={0.8}
          style={{ width: '100%' }}
        >
          {content}
        </TouchableOpacity>
      )}
    </View>
  );
};
