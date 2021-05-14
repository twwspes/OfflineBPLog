import React, { useState, useEffect, useReducer, useCallback, useContext } from 'react';
import {
    ScrollView,
    View,
    Text,
    Image,
    ImageBackground,
    TouchableOpacity,
    KeyboardAvoidingView,
    StyleSheet,
    Button,
    ActivityIndicator,
    Alert,
    Switch
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import moment from "moment/min/moment-with-locales";

import CardOpacity from '../../components/UI/CardOpacity';
import OCRPicker from '../../components/Tools/OCRPicker';
import Input from '../../components/UI/Input';
import MainButton from '../../components/UI/MainButton';
import MainButtonOutline from '../../components/UI/MainButtonOutline';
import Colors from '../../constants/Colors';
import * as OCRAPIActions from '../../store/actions/OCRAPI';
import * as bloodPressureActions from '../../store/actions/bloodPressure'; // for HKU server
import { LocalizationContext } from '../../constants/Localisation';
import FontSize from '../../constants/FontSize';
import DateAndTimePicker from '../../components/UI/DateAndTimePicker';
import ModalBottom from '../../components/UI/ModalBottom';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';
const FORM_INPUT_UPDATE_BLE = 'FORM_INPUT_UPDATE_BLE';

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
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    } else if (action.type === FORM_INPUT_UPDATE_BLE) {
        const updatedValues = {
            ...state.inputValues,
            systolic: action.sys,
            diastolic: action.dia,
            pulse: action.pul,
        };
        const updatedValidities = {
            ...state.inputValidities,
            systolic: action.sys !== '' ? true : false,
            diastolic: action.dia !== '' ? true : false,
            pulse: action.pul !== '' ? true : false,
        };
        console.log(action);
        let updatedFormIsValid = true;
        for (const key in updatedValidities) {
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
        }
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
};

const BloodPressureInputScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale } = useContext(LocalizationContext);
    const oldID = props.route.params ? props.route.params.id : "";
    const oldSys = props.route.params ? props.route.params.systolic : "";
    const oldDia = props.route.params ? props.route.params.diastolic : "";
    const oldPul = props.route.params ? props.route.params.pulse : "";
    const oldDate = props.route.params ? new Date(parseInt(oldID)).toISOString() : new Date().toISOString();
    const oldTime = props.route.params ? new Date(parseInt(oldID)).toISOString() : new Date().toISOString();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showModalButton, setShowModalButton] = useState(false);
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : 'en');

    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            systolic: oldSys,
            diastolic: oldDia,
            pulse: oldPul,
            date: oldDate,
            time: oldTime
        },
        inputValidities: {
            systolic: props.route.params ? true : false,
            diastolic: props.route.params ? true : false,
            pulse: props.route.params ? true : false,
            date: true,
            time: true
        },
        formIsValid: props.route.params ? true : false,
    });

    useEffect(() => {
        if (error) {
            Alert.alert(t('error_occur'), error, [{ text: t('okay'), onPress: () => setError(null) }]);
        }
    }, [error])

    function parseISOString(s) {
        var b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
    }

    const saveNewBloodPressureHandler = async () => {
        if (!formState.formIsValid) {
            Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
                { text: t('okay') }
            ]);
            return;
        }
        var date = new Date(formState.inputValues.date);
        const hours = new Date(formState.inputValues.time).getHours();
        const minutes = new Date(formState.inputValues.time).getMinutes();
        date.setHours(hours);
        date.setMinutes(minutes);
        // if (!!props.route.params) {
        //     console.log(oldID);
        //     date = new Date(parseInt(oldID));
        // }
        // const updatedbloodPressureData = {
        //     id: date.valueOf(),
        //     systolic: parseInt(formState.inputValues.systolic),
        //     diastolic: parseInt(formState.inputValues.diastolic),
        //     pulse: parseInt(formState.inputValues.pulse)
        // }; // for firebase
        const updatedbloodPressureData = {
            timestamp: date.toISOString(),
            systolic: parseInt(formState.inputValues.systolic),
            diastolic: parseInt(formState.inputValues.diastolic),
            pulse: parseInt(formState.inputValues.pulse)
        }; // for firebase
        setError(null);
        setIsLoading(true);
        try {
            // await dispatch(bloodPressureActions.updateBloodPressure(updatedbloodPressureData)); // for firebase
            // scheduleNoti(updatedbloodPressureData.systolic, updatedbloodPressureData.diastolic);
            console.log("updatedbloodPressureData to be saved");
            console.log(updatedbloodPressureData);
            await dispatch(bloodPressureActions.addBloodPressure(
                updatedbloodPressureData.timestamp,
                updatedbloodPressureData.systolic,
                updatedbloodPressureData.diastolic,
                updatedbloodPressureData.pulse
            )); // for firebase
            setIsLoading(false);
            props.navigation.goBack();
        } catch (err) {
            console.log(err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    const deleteBloodPressureHandler = async () => {
        if (!!props.route.params) {
            console.log(oldID);
            let date = new Date(parseInt(oldID));
            let timestampInISO = date.toISOString();
            try {
                await dispatch(bloodPressureActions.deleteBloodPressure(
                    timestampInISO
                )); // for firebase
                setIsLoading(false);
                props.navigation.goBack();
            } catch (err) {
                console.log(err);
                setError(err.message);
                setIsLoading(false);
            }
        }
    };

    const inputChangeHandler = useCallback(
        (inputIdentifier, inputValue, inputValidity) => {
            dispatchFormState({
                type: FORM_INPUT_UPDATE,
                value: inputValue,
                isValid: inputValidity,
                input: inputIdentifier
            });
        },
        [dispatchFormState]
    );

    const imageTakenHandler = async (imagePath) => {
        setError(null);
        setIsLoading(true);
        console.log("OCR Image Path");
        console.log(imagePath);
        try {
            const responseArray = await OCRAPIActions.sendPictureToGetNumberBack(imagePath);
            console.log("OCR result to UI js preparing for UI update");
            console.log(responseArray);
            bluetoothInputChangeHandler(responseArray[0], responseArray[1], responseArray[2]);
        } catch (e) {
            setError(e);
        }
        setIsLoading(false);
    };

    const bluetoothInputChangeHandler = useCallback(
        (sys, dia, pul) => {
            console.log("going to update form state" + sys + " " + dia + " " + pul);
            dispatchFormState({
                type: FORM_INPUT_UPDATE_BLE,
                sys: sys.toString(),
                dia: dia.toString(),
                pul: pul.toString()
            });
        },
        [dispatchFormState]
    );

    return (
        <ScrollView>
            <View
                // keyboardVerticalOffset={-100}
                // behavior={Platform.OS == "ios" ? "padding" : "height"}
                style={styles.screen}
            >
                <View style={styles.loginInputAndButtonContainer}>
                    <Input
                        id="systolic"
                        placeholder={t('systolic_blood_pressure')}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        errorText={t('require_input_warning')}
                        onInputChange={inputChangeHandler}
                        initialValue={formState.inputValues.systolic.toString()}
                        style={styles.input}
                        required
                        isNumber
                    />
                    <Input
                        id="diastolic"
                        placeholder={t('diastolic_blood_pressure')}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        errorText={t('require_input_warning')}
                        onInputChange={inputChangeHandler}
                        initialValue={formState.inputValues.diastolic.toString()}
                        style={styles.input}
                        required
                        isNumber
                    />
                    <Input
                        id="pulse"
                        placeholder={t('heartbeat')}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        errorText={t('require_input_warning')}
                        onInputChange={inputChangeHandler}
                        initialValue={formState.inputValues.pulse.toString()}
                        style={styles.input}
                        required
                        isNumber
                    />
                    <View style={styles.buttonContainer}>
                        {isLoading ? (
                            <ActivityIndicator size='small' color={Colors.primary} />
                        ) : (
                            <MainButton onPress={saveNewBloodPressureHandler} style={styles.button}>
                                {t('save')}
                            </MainButton>
                        )
                        }
                    </View>

                    {!!(oldID && oldSys === formState.inputValues.systolic
                        && oldDia === formState.inputValues.diastolic
                        && oldPul === formState.inputValues.pulse
                    ) && <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <View />
                            ) : (
                                <MainButton onPress={deleteBloodPressureHandler} style={styles.button}>
                                    {t('delete')}
                                </MainButton>
                            )
                            }
                        </View>}

                    <MainButtonOutline onPress={() => { setShowDatePicker(true) }} style={styles.dateTimeButton}>
                        {!!formState.inputValues.date ?
                            <Text style={{ fontSize: FontSize.content }}>{moment(formState.inputValues.date).format('ll')}</Text> :
                            <Text style={{ color: '#bbb', fontSize: FontSize.content }}>{t('click_to_choose')}</Text>
                        }
                    </MainButtonOutline>
                    {showDatePicker && (
                        <DateAndTimePicker
                            date={!!formState.inputValues.date ? parseISOString(formState.inputValues.date) : new Date()}
                            onClose={date => {
                                if (date && Platform.OS !== 'iOS') {
                                    setShowDatePicker(false);
                                    inputChangeHandler('date', date.toISOString(), true);
                                } else {
                                    setShowDatePicker(false);
                                }
                            }}
                            onChange={d => {
                                inputChangeHandler('date', d.toISOString(), true);
                            }}
                        />
                    )}

                    <View style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',

                    }}></View>

                    <MainButtonOutline onPress={() => { setShowTimePicker(true) }} style={styles.dateTimeButton}>
                        {!!formState.inputValues.time ?
                            <Text style={{ fontSize: FontSize.content }}>{moment(formState.inputValues.time).format('LT')}</Text> :
                            <Text style={{ color: '#bbb', fontSize: FontSize.content }}>{t('click_to_choose')}</Text>
                        }
                    </MainButtonOutline>
                    {showTimePicker && (
                        <DateAndTimePicker
                            date={!!formState.inputValues.time ? parseISOString(formState.inputValues.time) : dateWithSpecificTime(7, 0, false, false)}
                            mode="time"
                            onClose={date => {
                                if (date && Platform.OS !== 'iOS') {
                                    setShowTimePicker(false);
                                    inputChangeHandler('time', date.toISOString(), true);
                                } else {
                                    setShowTimePicker(false);
                                }
                            }}
                            onChange={d => {
                                inputChangeHandler('time', d.toISOString(), true);
                            }}
                        />
                    )}

                    <View style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <OCRPicker
                            // onImageDataTaken={imageTakenHandler}
                            onImageTaken={imageTakenHandler}
                            imagePickerStyles={styles.imagePickerStyles}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <MainButton onPress={() => { setShowModalButton(true) }} style={styles.button}>
                            {t('ocr_demo')}
                        </MainButton>
                    </View>

                    {!!showModalButton &&
                        <ModalBottom
                            onClose={() => {
                                setShowModalButton(false);
                            }}
                            text={t('ocr_demo')}
                        />
                    }

                    <View style={{ height: 300 }} />
                </View>
            </View>
        </ScrollView>

    );
};

// export const screenOptions = () => {
//     // const { t } = useContext(LocalizationContext);
//     return {
//         // headerTitle: t('authenticate')
//         headerTitle: 'authenticate'
//     };
// };

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    titleContainer: {
        width: '90%',
        maxHeight: '20%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 30,
    },
    switchContainer: {
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 7,
        flexDirection: 'row',
    },
    switchText: {
        width: '90%',
        fontSize: FontSize.content,
        textAlign: 'center'
    },
    titleText: {
        width: '90%',
        fontSize: FontSize.subsubtitle,
        color: Colors.primary
    },
    loginInputAndButtonContainer: {
        // backgroundColor: Colors.lightGrey,
        width: '90%',
        minHeight: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        marginVertical: 7,
    },
    buttonContainer: {
        width: '100%',
        marginVertical: 7,
    },
    imageContainer: {
        width: '90%',
        maxHeight: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerStyles: {
        marginVertical: 7,
        width: '100%'
    },
    LowerBtnsImage: {
        marginTop: 5,
        height: 72,
        width: 72,
        resizeMode: 'contain',
        // backgroundColor: 'red',
    },
    dateTimeButton: {
        width: '100%',
        alignItems: 'flex-start',
        paddingHorizontal: 18,
        marginVertical: 7,
    }
});

export default BloodPressureInputScreen;
