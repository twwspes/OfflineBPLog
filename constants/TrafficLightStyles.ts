import { StyleSheet } from 'react-native';
import { Colors } from './Colors';
import { bloodPressureCategory } from '../helpers/bloodPressureCategory';

const greenStyles = StyleSheet.create({
  customFontStyle: { color: Colors.darkGreen },
  customStyle: { backgroundColor: Colors.green },
  customStyleContrast: { color: 'black' },
});

const yellowStyles = StyleSheet.create({
  customFontStyle: { color: Colors.darkYellow },
  customStyle: { backgroundColor: 'yellow' },
  customStyleContrast: { color: 'black' },
});

const orangeStyles = StyleSheet.create({
  customFontStyle: { color: Colors.darkOrange },
  customStyle: { backgroundColor: Colors.orange },
  customStyleContrast: { color: 'black' },
});

const pinkStyles = StyleSheet.create({
  customFontStyle: { color: Colors.salmon },
  customStyle: { backgroundColor: Colors.salmon },
  customStyleContrast: { color: 'black' },
});

const redStyles = StyleSheet.create({
  customFontStyle: { color: Colors.red },
  customStyle: { backgroundColor: Colors.red },
  customStyleContrast: { color: 'white' },
});

export const bloodPressureColorStyle = (
  systolic: number | null,
  diastolic: number | null,
) =>
  [greenStyles, yellowStyles, orangeStyles, pinkStyles, redStyles][
    bloodPressureCategory(systolic, diastolic)
  ];

export const systolicColorStyle = (systolic: number | null) => {
  if (systolic !== null && !Number.isNaN(systolic)) {
    if (systolic < 120) {
      return greenStyles;
    }
    if (systolic < 130) {
      return yellowStyles;
    }
    if (systolic < 140) {
      return orangeStyles;
    }
    if (systolic < 180) {
      return pinkStyles;
    }
    return redStyles;
  }
  return redStyles;
};

export const diastolicColorStyle = (diastolic: number | null) => {
  if (diastolic !== null && !Number.isNaN(diastolic)) {
    if (diastolic < 80) {
      return greenStyles;
    }
    if (diastolic < 90) {
      return orangeStyles;
    }
    if (diastolic < 120) {
      return pinkStyles;
    }
    return redStyles;
  }
  return redStyles;
};
