import React, { useReducer, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ColorPropType } from 'react-native';

import Colors from '../../constants/Colors';
import FontSize from '../../constants/FontSize';

const INPUT_CHANGE = 'INPUT_CHANGE';
const INPUT_BLUR = 'INPUT_BLUR';
const INPUT_FOCUS = 'INPUT_FOCUS';

const inputReducer = (state, action) => {
    switch (action.type) {
        case INPUT_CHANGE:
            return {
                ...state,
                value: action.value,
                isValid: action.isValid
            };
        case INPUT_BLUR:
            return {
                ...state,
                touched: true
            };
        case INPUT_FOCUS:
            return {
                ...state,
                focused: true
            };
        default:
            return state;
    }
};

const Input = props => {
    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue ? props.initialValue : '',
        isValid: props.initialIsValid,
        touched: false,
        focused: false
    });

    const { onInputChange, id, initialValue } = props;

    useEffect(() => {
        if (inputState.focused) { // It should be disabled otherwise value cannot be saved before onBlur
            onInputChange(id, inputState.value, inputState.isValid);
        }
    }, [inputState, onInputChange, id]);

    useEffect(()=>{
        textChangeHandler(initialValue);
    }, [initialValue]);

    const textChangeHandler = text => {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let isValid = true;
        if (props.required && text.toString().trim().length === 0) {
            isValid = false;
        }
        if (props.email && !emailRegex.test(text.toLowerCase())) {
            isValid = false;
        }
        if (props.min != null && +text < props.min) {
            isValid = false;
        }
        if (props.max != null && +text > props.max) {
            isValid = false;
        }
        if (props.minLength != null && text.length < props.minLength) {
            isValid = false;
        }
        if (props.isNumber && isNaN(text)){
            isValid = false;
        }
        if (props.date ){
            let date = text.toString().trim().replace(/\-+/g,"") // \- replace "-", + more than 1, /g iterative
            date = date.substring(0,8);
            if (isNaN(parseInt(date))){
                isValid = false;
            } else {
                if (date.length === 8 ){
                    isValid = true;
                    if (parseInt(date.substring(0,2))>31 || parseInt(date.substring(0,2)) < 1) {
                        isValid = false;
                    } else if (parseInt(date.substring(2,4))>12 || parseInt(date.substring(2,4)) < 1) {
                        isValid = false;
                    } else if (parseInt(date.substring(4,8))>new Date().getFullYear() || parseInt(date.substring(4,8)) < 1910) {
                        isValie = false;
                    }
                    date = [date.slice(0, 4), '-', date.slice(4)].join('');
                    date = [date.slice(0, 2), '-', date.slice(2)].join('');
                    text = date;
                } else if (date.length > 4 && date.length < 8){
                    date = [date.slice(0, 4), '-', date.slice(4)].join('');
                    date = [date.slice(0, 2), '-', date.slice(2)].join('');
                    text = date;
                    isValid= false;
                } else if (date.length > 2 && date.length <= 4){
                    date = [date.slice(0, 2), '-', date.slice(2)].join('');
                    text = date;
                    isValid= false;
                } else {
                    isValid= false;
                }
            }
        }
        dispatch({ type: INPUT_CHANGE, value: text, isValid: isValid });
    };

    const lostFocusHandler = () => {
        dispatch({ type: INPUT_BLUR });
    };

    const focusHandler = () => {
        dispatch({ type: INPUT_FOCUS });
    };

    return (
        <View style={styles.formControl}>
            <TextInput
                {...props}
                style={{ ...styles.input, ...props.style }}
                value={inputState.value}
                onChangeText={textChangeHandler}
                onBlur={lostFocusHandler}
                onFocus={focusHandler}
                placeholderTextColor={Colors.placeholder}
            />
            {!inputState.isValid && inputState.touched && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{props.errorText}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    formControl: {
        width: '100%'
    },
    input: {
        borderColor: Colors.grey,
        borderWidth: 2,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        fontSize: FontSize.content,
        textAlign: 'center',
    },
    errorContainer: {
        marginVertical: 5
    },
    errorText: {
        // fontFamily: 'open-sans',
        color: 'red',
        fontSize: 13
    }
});

export default Input;