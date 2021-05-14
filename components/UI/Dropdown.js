import React, { useReducer, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';

import Colors from '../../constants/Colors';
import FontSize from '../../constants/FontSize';
import RNPickerSelect from 'react-native-picker-select';

const DROPDOWN_CHANGE = 'DROPDOWN_CHANGE';

const dropdownReducer = (state, action) => {
  switch (action.type) {
    case DROPDOWN_CHANGE:
      return {
        ...state,
        value: action.value,
        isValid: action.isValid
      };
    default:
      return state;
  }
};

const Dropdown = props => {

  const [dropdownState, dispatch] = useReducer(dropdownReducer, {
    value: props.initialValue ? props.initialValue : isNaN(props.initialValue) ? null:0,
    isValid: props.initialIsValid,
  });

  const { onItemSelected, id } = props;

  useEffect(() => {
    // if (dropdownState.focused) { // It should be disabled otherwise value cannot be saved before onBlur
      onItemSelected(id, dropdownState.value, dropdownState.isValid);
    // }
  }, [dropdownState, onItemSelected, id]);

  const valueChangeHandler = value => {
    let isValid = true;
    if (value===null) {
      isValid = false;
    }
    dispatch({ type: DROPDOWN_CHANGE, value: value, isValid: isValid });
  };

  return (
    <View style={{ ...styles.formControl, ...props.containerStyle }}>
      <RNPickerSelect
        {...props}
        // all props except style are defined when this component is called
        onValueChange={valueChangeHandler}
        // items={[
        //     { label: 'Football', value: 'football' },
        //     { label: 'Baseball', value: 'baseball' },
        //     { label: 'Hockey', value: 'hockey' },
        // ]}
        value={dropdownState.value}
        useNativeAndroidPickerStyle={false}
        style={{ inputIOS: { ...pickerSelectStyles.inputIOS, ...props.style, }, inputAndroid: { ...pickerSelectStyles.inputAndroid, ...props.style, } }}
      />

    </View>


  );
};

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
    paddingRight: 30, // to ensure the text is never behind the icon
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
    paddingRight: 30, // to ensure the text is never behind the icon
    textAlign: 'center',
  },
});

export default Dropdown;