import React, { useState, useEffect, useReducer, useCallback, useContext, useRef } from 'react';
import {
    ScrollView,
    View,
    Text,
    Platform,
    ImageBackground,
    TouchableOpacity,
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
import * as bloodPressureActions from '../../store/actions/bloodPressure'; 
import { LocalizationContext } from '../../constants/Localisation';
import FontSize from '../../constants/FontSize';
import DateAndTimePicker from '../../components/UI/DateAndTimePicker';
// import ModalBottom from '../../components/UI/ModalBottom';
// import Dropdown from '../../components/UI/Dropdown';
import DropdownList from '../../components/MultipleChoice/DropdownList';

const screenHeight = Math.round(Dimensions.get('window').height);

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
        console.log("form in PeriodModal", action.value);
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

const BloodPressurePeriodModal = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale } = useContext(LocalizationContext);
    const fromdateState = useSelector(state => state.bloodPressure.fromdate);
    const todateState = useSelector(state => state.bloodPressure.todate);
    const oldFromDate = fromdateState !== "" ? new Date(fromdateState).toISOString() : new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7).toISOString();
    const oldToDate = todateState !== "" ? new Date(todateState).toISOString() : new Date().toISOString();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [onShow, setOnShow] = useState(false);
    // const [showModalButton, setShowModalButton] = useState(false);
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : locale.includes('es') ? 'es' : 'en');
    // const netInfo = useNetInfo();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [onRelease, setOnRelease] = useState(true);

    const { current } = useCardAnimation();
    const dispatch = useDispatch();

    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => {
                setOnRelease(false);
                return true;
            },
            onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
                if (dx > 10 || dy > 10) {
                    setOnRelease(false);
                    return true;
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
            fromdate: oldFromDate,
            todate: oldToDate
        },
        inputValidities: {
            fromdate: true,
            todate: true
        },
        formIsValid: true,
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

    const onUpdateFromToDateHandler = () => {
        setIsLoading(true);
        if (!formState.formIsValid) {
            Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
                { text: t('okay') }
            ]);
            setIsLoading(false);
            return;
        }
        if (new Date(formState.inputValues.fromdate).valueOf() >= new Date(formState.inputValues.todate).valueOf()) {
            Alert.alert(t('wrong_input'), t('fromdate_over_todate'), [
                { text: t('okay') }
            ]);
            setIsLoading(false);
            return;
        }
        const todate = new Date(formState.inputValues.todate);
        todate.setHours(23, 59);
        const fromdate = new Date(formState.inputValues.fromdate);
        fromdate.setHours(0, 0);
        dispatch(bloodPressureActions.setFromdate(fromdate.toISOString()));
        dispatch(bloodPressureActions.setTodate(todate.toISOString()));
        setIsLoading(false);
        props.navigation.navigate({
            name: 'BloodPressure',
            params: {
                filtered: true,
                feedbackTimestamp: new Date().valueOf()
            },
            merge: true,
        });;
    }

    const onRemoveFilterBtnPress = () => {
        setIsLoading(true);
        dispatch(bloodPressureActions.setFromdate(""));
        dispatch(bloodPressureActions.setTodate(""));
        setIsLoading(false);
        props.navigation.navigate({
            name: 'BloodPressure',
            params: {
                filtered: false,
                feedbackTimestamp: new Date().valueOf()
            },
            merge: true,
        });;
    }

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
                <View style={styles.container}>
                    <Pressable
                        style={[
                            StyleSheet.absoluteFill,
                        ]
                        }
                        onPress={() => {
                            props.navigation.goBack();
                        }}
                    />
                    <Animated.View
                        style={{
                            padding: 16,
                            width: '100%',
                            maxWidth: 400,
                            minHeight: 500,
                            borderRadius: 3,
                            backgroundColor: 'white',
                            margin: -1 * (screenHeight * (0.000731 * screenHeight - 0.254878)),
                            height: screenHeight,
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            transform: [{ translateY: pan.y }]
                        }}
                        {...panResponder.panHandlers}
                    >

                        <MainButtonOutline onPress={() => { setShowDatePicker(true) }} style={styles.dateTimeButton}>
                            {!!formState.inputValues.fromdate ?
                                <Text style={{ fontSize: FontSize.content }}>{t('from') + moment(formState.inputValues.fromdate).format('ll')}</Text> :
                                <Text style={{ color: '#bbb', fontSize: FontSize.content }}>{t('click_to_choose')}</Text>
                            }
                        </MainButtonOutline>
                        {showDatePicker && (
                            <DateAndTimePicker
                                date={!!formState.inputValues.fromdate ? parseISOString(formState.inputValues.fromdate) : new Date()}
                                onClose={date => {
                                    if (date && Platform.OS !== 'iOS') {
                                        setShowDatePicker(false);
                                        inputChangeHandler('fromdate', date.toISOString(), true);
                                    } else {
                                        setShowDatePicker(false);
                                    }
                                }}
                                onChange={d => {
                                    inputChangeHandler('fromdate', d.toISOString(), true);
                                }}
                            />
                        )}

                        <View style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',

                        }}></View>

                        <MainButtonOutline onPress={() => { setShowTimePicker(true) }} style={styles.dateTimeButton}>
                            {!!formState.inputValues.todate ?
                                <Text style={{ fontSize: FontSize.content }}>{t('to') + moment(formState.inputValues.todate).format('ll')}</Text> :
                                <Text style={{ color: '#bbb', fontSize: FontSize.content }}>{t('click_to_choose')}</Text>
                            }
                        </MainButtonOutline>
                        {showTimePicker && (
                            <DateAndTimePicker
                                date={!!formState.inputValues.todate ? parseISOString(formState.inputValues.todate) : new Date()}
                                onClose={date => {
                                    if (date && Platform.OS !== 'iOS') {
                                        setShowTimePicker(false);
                                        inputChangeHandler('todate', date.toISOString(), true);
                                    } else {
                                        setShowTimePicker(false);
                                    }
                                }}
                                onChange={d => {
                                    inputChangeHandler('todate', d.toISOString(), true);
                                }}
                            />
                        )}


                        <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator size='small' color={Colors.primary} />
                            ) : (
                                <MainButton
                                    onPress={onUpdateFromToDateHandler}
                                    style={styles.button}>
                                    {t('add_filter')}
                                </MainButton>
                            )
                            }
                        </View>

                        <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator size='small' color={Colors.primary} />
                            ) : (
                                <MainButton
                                    onPress={onRemoveFilterBtnPress}
                                    style={styles.button}>
                                    {t('remove_filter')}
                                </MainButton>
                            )
                            }
                        </View>

                        {/* <View style={{ height: 500 }} /> */}

                    </Animated.View>
                    {/* </View> */}
                </View>

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
});

export default BloodPressurePeriodModal;