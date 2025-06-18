import React, { useReducer, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextStyle,
  Platform,
  TextInputProps,
} from 'react-native';
import { Text } from '@/components/UI/Text';
import { TextInput } from '@/components/UI/TextInput';

import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';

const styles = StyleSheet.create({
  formControl: {
    width: '100%',
  },
  input: {
    borderColor: Colors.grey,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    fontSize: FontSize.content,
    textAlign: Platform.OS === 'ios' ? 'center' : 'left',
  },
  errorContainer: {
    marginVertical: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
  },
});

const INPUT_CHANGE = 'INPUT_CHANGE';
const INPUT_BLUR = 'INPUT_BLUR';
const INPUT_FOCUS = 'INPUT_FOCUS';

interface InputProps extends TextInputProps {
  id: string;
  initialValue?: string;
  initialIsValid?: boolean;
  onInputChange: (id: string, value: string, isValid: boolean) => void;
  style?: TextStyle;
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  isNumber?: boolean;
  date?: boolean;
  errorText?: string;
}

interface InputState {
  value: string;
  isValid: boolean;
  touched: boolean;
  focused: boolean;
}

type Action =
  | { type: 'INPUT_CHANGE'; value: string; isValid: boolean }
  | { type: 'INPUT_BLUR' }
  | { type: 'INPUT_FOCUS' };

const inputReducer = (state: InputState, action: Action): InputState => {
  switch (action.type) {
    case INPUT_CHANGE:
      return { ...state, value: action.value, isValid: action.isValid };
    case INPUT_BLUR:
      return { ...state, touched: true };
    case INPUT_FOCUS:
      return { ...state, focused: true };
    default:
      return state;
  }
};

export const Input: React.FC<InputProps> = ({
  id,
  initialValue,
  initialIsValid = false,
  onInputChange,
  style,
  errorText,
  required,
  email,
  min,
  max,
  minLength,
  isNumber,
  date,
  ...rest
}) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: initialValue ?? '',
    isValid: initialIsValid,
    touched: false,
    focused: false,
  });

  useEffect(() => {
    if (inputState.focused) {
      onInputChange(id, inputState.value, inputState.isValid);
    }
  }, [inputState, onInputChange, id]);

  const textChangeHandler = useCallback(
    (text: string) => {
      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let isValid = true;

      if (required && text.trim().length === 0) {
        isValid = false;
      }
      if (email && !emailRegex.test(text.toLowerCase())) {
        isValid = false;
      }
      if (min !== null && min !== undefined && +text < min) {
        isValid = false;
      }
      if (max !== null && max !== undefined && +text > max) {
        isValid = false;
      }
      if (
        minLength !== null &&
        minLength !== undefined &&
        text.length < minLength
      ) {
        isValid = false;
      }
      if (isNumber && Number.isNaN(Number(text))) {
        isValid = false;
      }

      let formattedText = text;

      if (date) {
        let dateInternal = text.trim().replace(/-+/g, '').substring(0, 8);

        if (Number.isNaN(parseInt(dateInternal, 10))) {
          isValid = false;
        } else if (dateInternal.length === 8) {
          const day = parseInt(dateInternal.substring(0, 2), 10);
          const month = parseInt(dateInternal.substring(2, 4), 10);
          const year = parseInt(dateInternal.substring(4, 8), 10);
          const currentYear = new Date().getFullYear();

          if (
            day < 1 ||
            day > 31 ||
            month < 1 ||
            month > 12 ||
            year > currentYear ||
            year < 1910
          ) {
            isValid = false;
          }

          dateInternal = [
            dateInternal.slice(0, 4),
            '-',
            dateInternal.slice(4),
          ].join('');
          dateInternal = [
            dateInternal.slice(0, 2),
            '-',
            dateInternal.slice(2),
          ].join('');
          formattedText = dateInternal;
        } else if (dateInternal.length > 4 && dateInternal.length < 8) {
          dateInternal = [
            dateInternal.slice(0, 4),
            '-',
            dateInternal.slice(4),
          ].join('');
          dateInternal = [
            dateInternal.slice(0, 2),
            '-',
            dateInternal.slice(2),
          ].join('');
          formattedText = dateInternal;
          isValid = false;
        } else if (dateInternal.length > 2 && dateInternal.length <= 4) {
          dateInternal = [
            dateInternal.slice(0, 2),
            '-',
            dateInternal.slice(2),
          ].join('');
          formattedText = dateInternal;
          isValid = false;
        } else {
          isValid = false;
        }
      }

      dispatch({ type: INPUT_CHANGE, value: formattedText, isValid });
    },
    [required, email, min, max, minLength, isNumber, date],
  );

  useEffect(() => {
    if (initialValue !== undefined) {
      textChangeHandler(initialValue);
    }
  }, [initialValue, textChangeHandler]);

  const lostFocusHandler = () => {
    dispatch({ type: INPUT_BLUR });
  };

  const focusHandler = () => {
    dispatch({ type: INPUT_FOCUS });
  };

  return (
    <View style={styles.formControl}>
      <TextInput
        {...rest}
        style={[styles.input, style]}
        value={inputState.value}
        onChangeText={textChangeHandler}
        onBlur={lostFocusHandler}
        onFocus={focusHandler}
        placeholderTextColor={Colors.placeholder}
      />
      {!inputState.isValid && inputState.touched && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      )}
    </View>
  );
};
