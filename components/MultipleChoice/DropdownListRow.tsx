// MultipleChoiceRow.tsx

import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { MainButtonClearImage } from '../UI/MainButtonClearImage';
import { FontSize } from '../../constants/FontSize';
import { Colors } from '../../constants/Colors';

const screenWidth = Math.round(Dimensions.get('window').width);

const styles = StyleSheet.create({
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

export interface MultipleChoiceRowProps {
  onPress: () => void;
  title: string;
  selected: boolean;
}

export const MultipleChoiceRow: React.FC<MultipleChoiceRowProps> = ({
  onPress,
  title,
  selected,
}) => {
  return (
    <MainButtonClearImage
      style={styles.circleFocused}
      buttonStyle={
        selected ? styles.btnInnerPaddingSelected : styles.btnInnerPadding
      }
      onPress={onPress}
    >
      <Text style={styles.subQuestionText}>{title}</Text>
    </MainButtonClearImage>
  );
};

// Export memoized version
export const MemoizedMultipleChoiceRow = React.memo(
  MultipleChoiceRow,
  (prev, next) => {
    return prev.title === next.title;
  },
);
