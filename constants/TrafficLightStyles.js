import { StyleSheet } from 'react-native';
import Colors from './Colors';

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

export const bmiColorStyle = (bmi) => {
    if (bmi !== null && !isNaN(bmi)) {
        if (bmi < 18.5) {
            return orangeStyles;
        } else if (bmi <= 23) {
            return greenStyles;
        } else if (bmi <= 27.5) {
            return orangeStyles;
        } else {
            return redStyles;
        }
    } else {
        return {};
    }
};

export const bloodPressureColorStyle = (systolic, diastolic) => {
    if (systolic !== null && diastolic !== null && !(isNaN(systolic) || isNaN(diastolic))) {
        if (systolic < 120 && diastolic < 80) {
            return greenStyles;
        } else if ((systolic >= 120 && systolic < 130) && diastolic < 80) {
            return yellowStyles;
        } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
            return orangeStyles;
        } else if ((systolic >= 140 && systolic < 180) || (diastolic >= 90 && diastolic < 120)) {
            return pinkStyles;
        } else {
            return redStyles;
        }
    } else {
        return greenStyles;
    }
};

export const systolicColorStyle = (systolic) => {
    if (systolic !== null && !isNaN(systolic)) {
        if (systolic >= 110 && systolic < 136) {
            return greenStyles;
        } else if (systolic >= 90 && systolic < 110) {
            return orangeStyles;
        } else if (systolic >= 136 && systolic < 160) {
            return orangeStyles;
        } else {
            return redStyles;
        }
    } else {
        return {};
    }
};

export const diastolicColorStyle = (diastolic) => {
    if (diastolic !== null && !isNaN(diastolic)) {
        if (diastolic >= 60 && diastolic < 86) {
            return greenStyles;
        } else if (diastolic >= 86 && diastolic < 100) {
            return orangeStyles;
        } else if (diastolic >= 50 && diastolic < 60) {
            return orangeStyles;
        } else {
            return redStyles;
        }
    } else {
        return {};
    }
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

export const homeColorStyle = (bloodGlucose, when) => {
    if (bloodGlucose !== null && !isNaN(bloodGlucose)) {
        // for firebase
        // if (when === "before_breakfast" ||
        //     when === "before_lunch" ||
        //     when === "before_dinner" ||
        //     when === "before_bedtime"
        // ) 
        // for HKU server
        if (!isNaN(when)) {
            if (when === 1 ||
                when === 3 ||
                when === 5 ||
                when === 7
            ) {
                if (bloodGlucose < 4 || bloodGlucose > 10) {
                    return redStyles;
                } else if (bloodGlucose >= 8.1) {
                    return orangeStyles;
                } else {
                    return greenStyles;
                }
            } else {
                if (bloodGlucose < 4 || bloodGlucose > 13) {
                    return redStyles;
                } else if (bloodGlucose >= 10.1) {
                    return orangeStyles;
                } else {
                    return greenStyles;
                }
            }
        } else {
            if (when === "before_breakfast" ||
                when === "before_lunch" ||
                when === "before_dinner" ||
                when === "before_bedtime"
            ) {
                if (bloodGlucose < 4 || bloodGlucose > 10) {
                    return redStyles;
                } else if (bloodGlucose >= 8.1) {
                    return orangeStyles;
                } else {
                    return greenStyles;
                }
            } else {
                if (bloodGlucose < 4 || bloodGlucose > 13) {
                    return redStyles;
                } else if (bloodGlucose >= 10.1) {
                    return orangeStyles;
                } else {
                    return greenStyles;
                }
            }
        }
    } else {
        return {};
    }
};

export const fastingColorStyle = (bloodGlucose, hasDiabetes) => {
    if (bloodGlucose !== null && hasDiabetes !== null && !isNaN(bloodGlucose)) {
        if (hasDiabetes) {
            if (bloodGlucose < 4 || bloodGlucose > 10) {
                return redStyles;
            } else if (bloodGlucose >= 8.1) {
                return orangeStyles;
            } else {
                return greenStyles;
            }
        } else {
            if (bloodGlucose < 4 || bloodGlucose >= 7) {
                return redStyles;
            } else if (bloodGlucose >= 5.6) {
                return orangeStyles;
            } else {
                return greenStyles;
            }
        }
    } else {
        return {};
    }
};

export const randomColorStyle = (bloodGlucose, hasDiabetes) => {
    if (bloodGlucose !== null && hasDiabetes !== null && !isNaN(bloodGlucose)) {
        if (hasDiabetes) {
            if (bloodGlucose < 4 || bloodGlucose > 13) {
                return redStyles;
            } else if (bloodGlucose >= 10.1) {
                return orangeStyles;
            } else {
                return greenStyles;
            }
        } else {
            if (bloodGlucose < 4 || bloodGlucose >= 11.1) {
                return redStyles;
            } else {
                return greenStyles;
            }
        }
    } else {
        return {};
    }
};

export const HbA1CColorStyle = (bloodGlucose, hasDiabetes) => {
    if (bloodGlucose !== null && hasDiabetes !== null && !isNaN(bloodGlucose)) {
        if (hasDiabetes) {
            if (bloodGlucose >= 8) {
                return redStyles;
            } else if (bloodGlucose >= 6.5) {
                return orangeStyles;
            } else {
                return greenStyles;
            }
        } else {
            if (bloodGlucose >= 6.5) {
                return redStyles;
            } else if (bloodGlucose > 5.7) {
                return orangeStyles;
            } else {
                return greenStyles;
            }
        }
    } else {
        return {};
    }
};


export const totalColorStyle = (lipids) => {
    if (lipids != null && !isNaN(lipids)) {
        if (lipids >= 6.2) {
            return redStyles;
        } else if (lipids >= 5.2) {
            return orangeStyles;
        } else {
            return greenStyles;
        }
    } else {
        return {};
    }
};

export const lowDensityLipoColorStyle = (lipids) => {
    if (lipids != null && !isNaN(lipids)) {
        if (lipids >= 2.6) {
            return redStyles;
        } else if (lipids >= 1.8) {
            return orangeStyles;
        } else {
            return greenStyles;
        }
    } else {
        return {};
    }
};

export const highDensityLipoColorStyle = (lipids) => {
    if (lipids != null && !isNaN(lipids)) {
        if (lipids < 1.0) {
            return redStyles;
        } else if (lipids < 1.6) {
            return orangeStyles;
        } else {
            return greenStyles;
        }
    } else {
        return {};
    }
};

export const triglycerideColorStyle = (lipids) => {
    if (lipids != null && !isNaN(lipids)) {
        if (lipids >= 2.26) {
            return redStyles;
        } else if (lipids >= 1.7) {
            return orangeStyles;
        } else {
            return greenStyles;
        }
    } else {
        return {};
    }
};
