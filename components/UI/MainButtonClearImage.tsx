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
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.transparent,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

interface MainButtonClearProps {
  onPress: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  delayLongPress?: number;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const MainButtonClearImage: React.FC<MainButtonClearProps> = ({
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
