import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

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

export const bmiColorStyle = (bmi: number | null) => {
  if (bmi !== null && !Number.isNaN(bmi)) {
    if (bmi < 18.5) {
      return orangeStyles;
    }
    if (bmi <= 23) {
      return greenStyles;
    }
    if (bmi <= 27.5) {
      return orangeStyles;
    }
    return redStyles;
  }
  return {};
};

export const bloodPressureColorStyle = (
  systolic: number | null,
  diastolic: number | null,
) => {
  if (
    systolic !== null &&
    diastolic !== null &&
    !(Number.isNaN(systolic) || Number.isNaN(diastolic))
  ) {
    if (systolic < 120 && diastolic < 80) {
      return greenStyles;
    }
    if (systolic >= 120 && systolic < 130 && diastolic < 80) {
      return yellowStyles;
    }
    if (
      (systolic >= 130 && systolic < 140) ||
      (diastolic >= 80 && diastolic < 90)
    ) {
      return orangeStyles;
    }
    if (
      (systolic >= 140 && systolic < 180) ||
      (diastolic >= 90 && diastolic < 120)
    ) {
      return pinkStyles;
    }
  }
  return redStyles;
};

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
  return {};
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
  return {};
};

// export function percent130Style (percent) {
//     if (percent >= 75){
//         return "green";
//     } else if (percent >= 50){
//         return "yellow";
//     } else {
//         return "red";
//     }
// };

// export function percent160Style (percent) {
//     if (percent === 0){
//         return "green";
//     } else if (percent < 25){
//         return "yellow";
//     } else {
//         return "red";
//     }
// };

export const homeColorStyle = (
  bloodGlucose: number | null,
  when:
    | 'before_breakfast'
    | 'before_lunch'
    | 'before_dinner'
    | 'before_bedtime'
    | null,
) => {
  if (bloodGlucose !== null && !Number.isNaN(bloodGlucose)) {
    // for firebase
    // if (when === "before_breakfast" ||
    //     when === "before_lunch" ||
    //     when === "before_dinner" ||
    //     when === "before_bedtime"
    // )

    // if (!Number.isNaN(when)) {
    //   if (when === 1 || when === 3 || when === 5 || when === 7) {
    //     if (bloodGlucose < 4 || bloodGlucose > 10) {
    //       return redStyles;
    //     }
    //     if (bloodGlucose >= 8.1) {
    //       return orangeStyles;
    //     }
    //     return greenStyles;
    //   }
    //   if (bloodGlucose < 4 || bloodGlucose > 13) {
    //     return redStyles;
    //   }
    //   if (bloodGlucose >= 10.1) {
    //     return orangeStyles;
    //   }
    //   return greenStyles;
    // }
    if (
      when === 'before_breakfast' ||
      when === 'before_lunch' ||
      when === 'before_dinner' ||
      when === 'before_bedtime'
    ) {
      if (bloodGlucose < 4 || bloodGlucose > 10) {
        return redStyles;
      }
      if (bloodGlucose >= 8.1) {
        return orangeStyles;
      }
      return greenStyles;
    }
    if (bloodGlucose < 4 || bloodGlucose > 13) {
      return redStyles;
    }
    if (bloodGlucose >= 10.1) {
      return orangeStyles;
    }
    return greenStyles;
  }
  return {};
};

export const fastingColorStyle = (
  bloodGlucose: number | null,
  hasDiabetes: boolean,
) => {
  if (
    bloodGlucose !== null &&
    hasDiabetes !== null &&
    !Number.isNaN(bloodGlucose)
  ) {
    if (hasDiabetes) {
      if (bloodGlucose < 4 || bloodGlucose > 10) {
        return redStyles;
      }
      if (bloodGlucose >= 8.1) {
        return orangeStyles;
      }
      return greenStyles;
    }
    if (bloodGlucose < 4 || bloodGlucose >= 7) {
      return redStyles;
    }
    if (bloodGlucose >= 5.6) {
      return orangeStyles;
    }
    return greenStyles;
  }
  return {};
};

export const randomColorStyle = (
  bloodGlucose: number | null,
  hasDiabetes: boolean,
) => {
  if (
    bloodGlucose !== null &&
    hasDiabetes !== null &&
    !Number.isNaN(bloodGlucose)
  ) {
    if (hasDiabetes) {
      if (bloodGlucose < 4 || bloodGlucose > 13) {
        return redStyles;
      }
      if (bloodGlucose >= 10.1) {
        return orangeStyles;
      }
      return greenStyles;
    }
    if (bloodGlucose < 4 || bloodGlucose >= 11.1) {
      return redStyles;
    }
    return greenStyles;
  }
  return {};
};

export const HbA1CColorStyle = (
  bloodGlucose: number | null,
  hasDiabetes: boolean,
) => {
  if (
    bloodGlucose !== null &&
    hasDiabetes !== null &&
    !Number.isNaN(bloodGlucose)
  ) {
    if (hasDiabetes) {
      if (bloodGlucose >= 8) {
        return redStyles;
      }
      if (bloodGlucose >= 6.5) {
        return orangeStyles;
      }
      return greenStyles;
    }
    if (bloodGlucose >= 6.5) {
      return redStyles;
    }
    if (bloodGlucose > 5.7) {
      return orangeStyles;
    }
    return greenStyles;
  }
  return {};
};

export const totalColorStyle = (lipids: number | null) => {
  if (lipids !== null && !Number.isNaN(lipids)) {
    if (lipids >= 6.2) {
      return redStyles;
    }
    if (lipids >= 5.2) {
      return orangeStyles;
    }
    return greenStyles;
  }
  return {};
};

export const lowDensityLipoColorStyle = (lipids: number | null) => {
  if (lipids !== null && !Number.isNaN(lipids)) {
    if (lipids >= 2.6) {
      return redStyles;
    }
    if (lipids >= 1.8) {
      return orangeStyles;
    }
    return greenStyles;
  }
  return {};
};

export const highDensityLipoColorStyle = (lipids: number | null) => {
  if (lipids !== null && !Number.isNaN(lipids)) {
    if (lipids < 1.0) {
      return redStyles;
    }
    if (lipids < 1.6) {
      return orangeStyles;
    }
    return greenStyles;
  }
  return {};
};

export const triglycerideColorStyle = (lipids: number | null) => {
  if (lipids !== null && !Number.isNaN(lipids)) {
    if (lipids >= 2.26) {
      return redStyles;
    }
    if (lipids >= 1.7) {
      return orangeStyles;
    }
    return greenStyles;
  }
  return {};
};
