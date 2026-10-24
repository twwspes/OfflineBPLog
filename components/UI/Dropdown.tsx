import React, { useReducer, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

import RNPickerSelect from 'react-native-picker-select';
import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';

const styles = StyleSheet.create({
  formControl: {
    width: '100%',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: FontSize.content,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: Colors.grey,
    borderRadius: 30,
    color: 'black',
    paddingRight: 30,
    textAlign: 'center',
  },
  inputAndroid: {
    fontSize: FontSize.content,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.grey,
    borderRadius: 30,
    color: 'black',
    paddingRight: 30,
    textAlign: 'center',
  },
});

const DROPDOWN_CHANGE = 'DROPDOWN_CHANGE';

interface DropdownProps {
  id: string;
  initialValue: string | number | null;
  initialIsValid: boolean;
  onItemSelected: (
    id: string,
    value: string | number | null,
    isValid: boolean,
  ) => void;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  items: { label: string; value: string | number }[];
  placeholder?: { label: string; value: null };
  mode?: 'dialog' | 'dropdown';
  value?: string | number | null;
  disabled?: boolean;
}

interface DropdownState {
  value: string | number | null;
  isValid: boolean;
}

type DropdownAction = {
  type: typeof DROPDOWN_CHANGE;
  value: string | number | null;
  isValid: boolean;
};

const dropdownReducer = (
  state: DropdownState,
  action: DropdownAction,
): DropdownState => {
  switch (action.type) {
    case DROPDOWN_CHANGE:
      return {
        ...state,
        value: action.value,
        isValid: action.isValid,
      };
    default:
      return state;
  }
};

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  initialValue,
  initialIsValid,
  onItemSelected,
  containerStyle,
  style,
  ...pickerProps
}) => {
  const normalizedInitialValue: string | number | null = (() => {
    if (initialValue !== undefined && initialValue !== null)
      return initialValue;
    if (Number.isNaN(Number(initialValue))) return null;
    return 0;
  })();

  const [dropdownState, dispatch] = useReducer(dropdownReducer, {
    value: normalizedInitialValue,
    isValid: initialIsValid,
  });

  useEffect(() => {
    onItemSelected(id, dropdownState.value, dropdownState.isValid);
  }, [dropdownState, onItemSelected, id]);

  const valueChangeHandler = (value: string | number | null) => {
    const isValid = value !== null;
    dispatch({ type: DROPDOWN_CHANGE, value, isValid });
  };

  return (
    <View style={[styles.formControl, containerStyle]}>
      <RNPickerSelect
        {...pickerProps}
        onValueChange={valueChangeHandler}
        value={dropdownState.value}
        useNativeAndroidPickerStyle={false}
        style={{
          inputIOS: { ...pickerSelectStyles.inputIOS, ...(style as object) },
          inputAndroid: {
            ...pickerSelectStyles.inputAndroid,
            ...(style as object),
          },
        }}
      />
    </View>
  );
};
