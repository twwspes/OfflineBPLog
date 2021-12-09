import React, { useState, useEffect, useReducer, useCallback, useContext, useRef } from 'react';
import {
    ScrollView,
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Keyboard,
    PanResponder,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert,
    Modal,
    Animated,
    Pressable
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import moment from "moment/min/moment-with-locales";
import { useCardAnimation } from '@react-navigation/stack';

import CardOpacity from '../../components/UI/CardOpacity';
// import OCRPicker from '../../components/Tools/OCRPicker';
import Input from '../../components/UI/Input';
import MainButton from '../../components/UI/MainButton';
import MainButtonOutline from '../../components/UI/MainButtonOutline';
import Colors from '../../constants/Colors';
// import * as OCRAPIActions from '../../store/actions/OCRAPI';
import * as bloodPressureActions from '../../store/actions/bloodPressure'; // for HKU server
import { LocalizationContext } from '../../constants/Localisation';
import FontSize from '../../constants/FontSize';
import DateAndTimePicker from '../../components/UI/DateAndTimePicker';
// import Dropdown from '../../components/UI/Dropdown';
import DropdownList from '../../components/MultipleChoice/DropdownList';

const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);
const aspectRatio = screenHeight / screenWidth;
const isPhone = aspectRatio > 1.6;

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
    const oldSys = props.route.params ? props.route.params.systolic.toString() : "113";
    const oldDia = props.route.params ? props.route.params.diastolic.toString() : "79";
    const oldPul = props.route.params ? props.route.params.pulse.toString() : "63";
    const oldDate = props.route.params ? new Date(parseInt(oldID)).toISOString() : new Date().toISOString();
    const oldTime = props.route.params ? new Date(parseInt(oldID)).toISOString() : new Date().toISOString();
    const oldRemark = !!props.route.params ? !!props.route.params.remark ? props.route.params.remark : "" : "";
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [onShow, setOnShow] = useState(false);
    // const [isModalActive, setIsModalActive] = useState(false);
    // const [showModalButton, setShowModalButton] = useState(false);
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : locale.includes('es') ? 'es' : 'en');
    // const netInfo = useNetInfo();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [onRelease, setOnRelease] = useState(true);

    const { current } = useCardAnimation();
    const dispatch = useDispatch();

    const [bgColor, setBgColor] = useState(false);
    const pan = useRef(new Animated.ValueXY()).current;
    const isModalActive = useRef(true);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => {
                if (!isModalActive.current) {
                    setOnRelease(false);
                    return true;
                }
                return false;
            },
            onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
                if (!isModalActive.current) {
                    if (dx > 10 || dy > 10) {
                        setOnRelease(false);
                        return true;
                    }
                }
                return false;
            },
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: 0
                });
            },
            onPanResponderMove: Animated.event(
                [
                    null,
                    { dx: pan.x, dy: pan.y }
                ],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                setOnRelease(true);
                pan.flattenOffset();
            }
        })
    ).current;

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            systolic: oldSys,
            diastolic: oldDia,
            pulse: oldPul,
            date: oldDate,
            time: oldTime,
            remark: oldRemark,
        },
        inputValidities: {
            systolic: props.route.params ? true : false,
            diastolic: props.route.params ? true : false,
            pulse: props.route.params ? true : false,
            date: true,
            time: true,
            remark: true,
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

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    const generate1000Records = async () => {
        setError(null);
        setIsLoading(true);
        for (let i = 0; i < 2000; i++) {
            const updatedbloodPressureData = {
                timestamp: new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 182 + 3110400 * 5 * i).toISOString(),
                systolic: getRandomInt(70) + 90,
                diastolic: getRandomInt(70) + 60,
                pulse: 90
            }; // for firebase
            console.log(i);
            try {
                await dispatch(bloodPressureActions.addBloodPressure(
                    updatedbloodPressureData.timestamp,
                    updatedbloodPressureData.systolic,
                    updatedbloodPressureData.diastolic,
                    updatedbloodPressureData.pulse,
                    ""
                )); // for firebase
            } catch (err) {
                console.log(err);
                setError(err.message);
            }
        }
        setIsLoading(false);
    };

    const saveNewBloodPressureHandler = async () => {
        Keyboard.dismiss();
        if (!formState.formIsValid) {
            Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
                { text: t('okay') }
            ]);
            return;
        }
        if (typeof formState.inputValues.systolic === "undefined" ||
            typeof formState.inputValues.diastolic === "undefined" ||
            typeof formState.inputValues.pulse === "undefined"
        ) {
            Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
                { text: t('okay') }
            ]);
            return;
        }
        if (formState.inputValues.systolic === "" ||
            formState.inputValues.diastolic === "" ||
            formState.inputValues.pulse === "" ||
            formState.inputValues.systolic === "0" ||
            formState.inputValues.diastolic === "0" ||
            formState.inputValues.pulse === "0"
        ) {
            Alert.alert(t('wrong_input'), t('you_may_forget_to_select_bp_values'), [
                { text: t('okay') }
            ]);
            return;
        }
        var date = new Date(formState.inputValues.date);
        const hours = new Date(formState.inputValues.time).getHours();
        const minutes = new Date(formState.inputValues.time).getMinutes();
        date.setHours(hours);
        date.setMinutes(minutes);
        // update / create a records with selected date
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
            console.log(formState.inputValues.remark);
            await dispatch(bloodPressureActions.addBloodPressure(
                updatedbloodPressureData.timestamp,
                updatedbloodPressureData.systolic,
                updatedbloodPressureData.diastolic,
                updatedbloodPressureData.pulse,
                formState.inputValues.remark,
                oldRemark !== "" ? true : false
            )); // for firebase

            // delete old record if users change the date of old records
            // since new record has just been created above
            if (!!oldID) {
                if (new Date(formState.inputValues.date).valueOf() !== new Date(parseInt(oldID)).valueOf()) {
                    console.log("deleting old record due to change in date");
                    console.log(new Date(formState.inputValues.date));
                    console.log(new Date(parseInt(oldID)));
                    let date = new Date(parseInt(oldID));
                    let timestampInISO = date.toISOString();
                    await dispatch(bloodPressureActions.deleteBloodPressure(
                        timestampInISO,
                        oldRemark !== "" ? true : false
                    ));
                }
            }
            setIsLoading(false);
            props.navigation.goBack();
        } catch (err) {
            console.log(err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    const deleteBloodPressureHandler = async () => {
        Keyboard.dismiss();
        if (!!props.route.params) {
            console.log(oldID);
            let date = new Date(parseInt(oldID));
            let timestampInISO = date.toISOString();
            try {
                await dispatch(bloodPressureActions.deleteBloodPressure(
                    timestampInISO,
                    oldRemark !== "" ? true : false
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

    const minMax = (numberInString) => {
        if (numberInString === "" || numberInString === "NaN" || numberInString === null) {
            return "100";
        }
        const minMaxValue = Math.min(Math.max(parseInt(numberInString), 30), 220);
        return minMaxValue.toString();
    };

    const [systolicRange, setsystolicRange] = useState([]);
    const [diastolicRange, setdiastolicRange] = useState([]);
    const [pulseRange, setpulseRange] = useState([]);

    useEffect(() => {
        var systolicRangeTemp = [{ label: t('systolic_short'), value: "0" }];
        for (let i = 20; i < 250; i++) {
            systolicRangeTemp.push({ label: i.toString(), value: i.toString() });
        }
        setsystolicRange(systolicRangeTemp);
    }, []);

    useEffect(() => {
        var diastolicRangeTemp = [{ label: t('diastolic_short'), value: "" }];
        for (let i = 20; i < 250; i++) {
            diastolicRangeTemp.push({ label: i.toString(), value: i.toString() });
        }
        setdiastolicRange(diastolicRangeTemp);
    }, []);

    useEffect(() => {
        var pulseRangeTemp = [{ label: t('pulse_short'), value: "" }];
        for (let i = 20; i < 250; i++) {
            pulseRangeTemp.push({ label: i.toString(), value: i.toString() });
        }
        setpulseRange(pulseRangeTemp);
    }, []);

    useEffect(() => {
        // Will change fadeAnim value to 1 in 5 seconds
        Animated.timing(fadeAnim, {
            toValue: 0.1,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, []);

    useEffect(() => {
        if (onRelease) {
            console.log("pan.y");
            console.log(pan.y);
            console.log(screenHeight * 0.5 * 0.3);
            console.log(screenHeight);
            Keyboard.dismiss()
            if (pan.y._value > screenHeight * 0.5 * 0.3) {
                console.log("pan.y > screenHeight");
                Animated.timing(pan.y, {
                    toValue: screenHeight,
                    duration: 150,
                    useNativeDriver: true
                }).start();
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true
                }).start();
                setTimeout(() => {
                    props.navigation.goBack();
                }, 160);
            } else {
                console.log("pan.y < screenHeight");
                Animated.timing(pan.y, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true
                }).start();
            }
        }
    }, [pan.y, onRelease]);

    return (

        <Animated.View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                // Bind opacity to animated value
                opacity: fadeAnim
            }}
        >
            <Modal
                animationType="slide"
                transparent
                visible={true}
                style={styles.container}
                useNativeDriver={true}
                onShow={() => { setOnShow(true) }}
            >
                <KeyboardAvoidingView
                    keyboardVerticalOffset={0}
                    behavior={Platform.OS == "ios" ? "position" : "height"}
                    contentContainerStyle={{
                        ...styles.container,
                        height: '100%',
                    }}
                    style={styles.container}
                >
                    {/* <View style={styles.container}> */}
                    <Pressable
                        style={[
                            StyleSheet.absoluteFill,
                        ]
                        }
                        onPress={() => {
                            Keyboard.dismiss();
                            props.navigation.goBack();
                        }}
                    />
                    <Animated.View
                        style={{
                            padding: 16,
                            width: '100%',
                            maxWidth: isPhone ? 400 : '90%',
                            minHeight: 500,
                            borderRadius: 3,
                            backgroundColor: 'white',
                            margin: isPhone ? -1 * (screenHeight * (0.000731 * screenHeight - 0.254878)): -500,
                            height: screenHeight,
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            transform: [{ translateY: pan.y }]
                        }}
                        {...panResponder.panHandlers}
                    >
                        <CardOpacity style={styles.bpContainer}>
                            <View style={styles.bpTitlesContainer}>
                                <View style={styles.bpTitleContainer}>
                                    <Text style={styles.bpTitlesText}>
                                        {t('systolic_short')}
                                    </Text>
                                </View>
                                <View style={styles.bpTitleContainer}>
                                    <Text style={styles.bpTitlesText}>
                                        {t('diastolic_short')}
                                    </Text>
                                </View>
                                <View style={styles.bpTitleContainer}>
                                    <Text style={styles.bpTitlesText}>
                                        {t('pulse_short')}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.bpValuesContainer}>
                                <View style={styles.dropdownContainerStyle}>
                                    <DropdownList
                                        scrollEnabled={false}
                                        id='systolic'
                                        items={systolicRange}
                                        onItemSelected={inputChangeHandler}
                                        initialValue={formState.inputValues.systolic.toString()}
                                        buttonTextStyle={{ fontSize: FontSize.varyBigTitle }}
                                        isModalActive={(isActive) => {
                                            console.log("setIsModalActive", isActive);
                                            isModalActive.current = isActive;
                                        }}
                                    />
                                </View>
                                <View style={styles.dropdownContainerStyle}>
                                    <DropdownList
                                        scrollEnabled={false}
                                        id='diastolic'
                                        items={diastolicRange}
                                        onItemSelected={inputChangeHandler}
                                        initialValue={formState.inputValues.diastolic.toString()}
                                        buttonTextStyle={{ fontSize: FontSize.varyBigTitle }}
                                        isModalActive={(isActive) => {
                                            console.log("setIsModalActive", isActive);
                                            isModalActive.current = isActive;
                                        }}
                                    />
                                </View>
                                <View style={styles.dropdownContainerStyle}>
                                    <DropdownList
                                        scrollEnabled={false}
                                        id='pulse'
                                        items={pulseRange}
                                        onItemSelected={inputChangeHandler}
                                        initialValue={formState.inputValues.pulse.toString()}
                                        buttonTextStyle={{ fontSize: FontSize.varyBigTitle }}
                                        isModalActive={(isActive) => {
                                            console.log("setIsModalActive", isActive);
                                            isModalActive.current = isActive;
                                        }}
                                    />
                                </View>
                            </View>
                        </CardOpacity>

                        <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator size='small' color={Colors.primary} />
                            ) : (
                                <MainButton
                                    onPress={saveNewBloodPressureHandler}
                                    style={styles.button}>
                                    {t('save')}
                                </MainButton>
                            )
                            }
                        </View>

                        {(!!oldID && oldSys.toString() === formState.inputValues.systolic
                            && oldDia.toString() === formState.inputValues.diastolic
                            && oldPul.toString() === formState.inputValues.pulse
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


                        <View style={styles.inputContainer}>
                            <Input
                                id="remark"
                                placeholder={t('optional_remark')}
                                keyboardType="default"
                                autoCapitalize="none"
                                errorText={t('text_only')}
                                onInputChange={inputChangeHandler}
                                style={styles.input}
                                initialValue={formState.inputValues.remark}
                                maxLength={30}
                            />
                        </View>

                        {/* <View style={{ height: 500 }} /> */}

                    </Animated.View>

                    {/* </View> */}
                </KeyboardAvoidingView>
            </Modal>
        </Animated.View>

    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#00000000',
        position: 'absolute',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    modalPressableArea: {
        width: '100%',
        height: '30%',
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
        backgroundColor: 'yellow',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30
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
        alignItems: 'center',
        paddingHorizontal: 18,
        marginVertical: 7,
    },
    picker: {
        borderWidth: 0,
        backgroundColor: 'yellow',
        paddingHorizontal: 0,
        paddingVertical: 0,
        fontSize: FontSize.varyBigTitle,
        borderRadius: 30,
        marginVertical: 0,
        width: '100%'
    },
    bpValuesContainer: {
        width: '100%',
        flexDirection: 'row',
    },
    dropdownContainerStyle: {
        width: '33%',
    },
    bpContainer: {
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 7,
        marginVertical: 7,
    },
    bpTitlesContainer: {
        width: '100%',
        flexDirection: 'row',
    },
    bpTitleContainer: {
        width: '33%',
    },
    bpTitlesText: {
        textAlign: 'center',
        fontSize: FontSize.content,
    },
    inputContainer: {
        width: '100%',
    },
    titleToggleButton: {
        height: 30,
        minWidth: '30%',
        paddingHorizontal: 10,
        backgroundColor: Colors.primary,
        margin: 5,
        borderRadius: 30,
        justifyContent: 'center'
    },
    titleToggleButtonText: {
        // backgroundColor: 'yellow',
        textAlign: 'center',
        color: Colors.darkGreen,
    },
});

export default BloodPressureInputScreen;