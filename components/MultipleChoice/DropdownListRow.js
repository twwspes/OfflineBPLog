import React, { useContext } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import MainButtonClearImage from '../UI/MainButtonClearImage';
import { FontSize } from '../../constants/FontSize';
import { Colors } from '../../constants/Colors';

const screenWidth = Math.round(Dimensions.get('window').width);

const MultipleChoiceRow = ({ onPress, title, selected }) => {
  // console.log("render DropdownListRow" + title);
  return (
    // <View style={styles.flatlist} >
    <MainButtonClearImage
      style={styles.circleFocused}
      buttonStyle={
        selected ? styles.btnInnerPaddingSelected : styles.btnInnerPadding
      }
      onPress={onPress}
    >
      <Text style={styles.subQuestionText}>{title}</Text>
    </MainButtonClearImage>
    // </View>
  );
};

const areEqual = (prevProps, nextProps) => {
  const { title } = nextProps;
  const { title: prevTitle } = prevProps;

  /*if the props are equal, it won't update*/
  const titleEqual = title === prevTitle;

  return titleEqual;
};

const styles = StyleSheet.create({
  flatlist: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    // backgroundColor: 'yellow',
  },
  subQuestionText: {
    fontSize: FontSize.bigTitle,
    paddingVertical: 5,
  },
  circleFocused: {
    width: screenWidth * 0.8,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 0,
  },
  btnInnerPadding: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  btnInnerPadding: {
    backgroundColor: 'white',
    height: 80,
    borderRadius: 0,
  },
  btnInnerPaddingSelected: {
    backgroundColor: Colors.blur,
    height: 80,
    borderRadius: 0,
  },
});

export default React.memo(MultipleChoiceRow, areEqual);
