import React, { useState, useContext, useReducer, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Modal, Alert, ScrollView, Image } from 'react-native';

import Input from './Input';
import Dropdown from './Dropdown';
import { FontSize } from '../../constants/FontSize';
import { Colors } from '../../constants/Colors';
import { LocalizationContext } from '../../constants/Localisation';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00000088',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  questionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: Colors.grey,
    borderWidth: 2,
    height: '80%',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContainer: {
    width: '90%',
    height: '90%',
  },
  questionText: {
    fontSize: FontSize.smallContent,
    paddingVertical: 10,
  },
  bottomBtnContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    // borderBottomWidth: 1,
    borderColor: 'grey',
  },
  btnImageBig: {
    height: 400,
    width: '100%',
    resizeMode: 'contain',
    // backgroundColor: 'green'
  }
});

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    console.log(updatedValues);
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues
    };
  }
  return state;
};

const ModalBottom = props => {
  const { t, locale } = useContext(LocalizationContext);

  const { onClose } = props;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={true}
    >
      {/* <TouchableOpacity style={styles.container} onPress={() => {

      }}> */}
      <View style={styles.container}>
        <View style={styles.questionsContainer}>
          <View style={styles.questionContainer}>
            <ScrollView>
              <Text style={styles.questionText}>{props.text}</Text>
                <View>
                  <Image source={require('../../assets/ocrDemo.jpeg')} style={styles.btnImageBig} />
                </View>
            </ScrollView>
          </View>
          <View style={styles.bottomBtnContainer}>
            <TouchableOpacity onPress={() => {
              onClose();
            }}>
              <Text>{t('okay')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* </TouchableOpacity> */}
      </View>
    </Modal>
  );

}

export default ModalBottom;