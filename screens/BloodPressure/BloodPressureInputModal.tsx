import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  PanResponder,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Pressable,
  PanResponderInstance,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import { StackScreenProps } from '@react-navigation/stack';

import { CardOpacity } from '../../components/UI/CardOpacity';
import { Input } from '../../components/UI/Input';
import { MainButton } from '../../components/UI/MainButton';
import { MainButtonOutline } from '../../components/UI/MainButtonOutline';
import { Colors } from '../../constants/Colors';
import * as bloodPressureActions from '../../store/actions/bloodPressure';
import { FontSize } from '../../constants/FontSize';
import { DateAndTimePicker } from '../../components/UI/DateAndTimePicker';
import { SingleChoice } from '../../components/MultipleChoice/DropdownList';
import { useLocalisation } from '../../hooks/useLocalisation';
import { BloodPressureStackParamList } from '../../types/navigation';
import { replaceBloodPressureFromSQL } from '../../helpers/dbBloodPressure';

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
    textAlign: 'center',
  },
  titleText: {
    width: '90%',
    fontSize: FontSize.subsubtitle,
    color: Colors.primary,
  },
  loginInputAndButtonContainer: {
    backgroundColor: 'yellow',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
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
    width: '100%',
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
    width: '100%',
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
    justifyContent: 'center',
  },
  titleToggleButtonText: {
    // backgroundColor: 'yellow',
    textAlign: 'center',
    color: Colors.darkGreen,
  },
});

type Props = StackScreenProps<
  BloodPressureStackParamList,
  'BloodPressureInputModal'
>;

const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);
const aspectRatio = screenHeight / screenWidth;
const isPhone = aspectRatio > 1.6;

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

type FormState = {
  inputValues: {
    systolic: string;
    diastolic: string;
    pulse: string;
    date: string;
    time: string;
    remark: string;
  };
  inputValidities: Record<string, boolean>;
  formIsValid: boolean;
};

type FormAction = {
  type: 'FORM_INPUT_UPDATE';
  value: string;
  isValid: boolean;
  input: string;
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    };
    const updatedFormIsValid = Object.values(updatedValidities).every(Boolean);
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    };
  }
  return state;
};

export const BloodPressureInputModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  type Option = { label: string; value: string };

  const [systolicRange, setsystolicRange] = useState<Option[]>([]);
  const [diastolicRange, setdiastolicRange] = useState<Option[]>([]);
  const [pulseRange, setpulseRange] = useState<Option[]>([]);

  const { t, locale2 } = useLocalisation();
  const oldID = route.params ? route.params.id.toString() : '';
  const oldSys = route.params ? route.params.systolic.toString() : '113';
  const oldDia = route.params ? route.params.diastolic.toString() : '79';
  const oldPul = route.params ? route.params.pulse.toString() : '63';
  const oldDate = route.params
    ? new Date(Number.parseInt(oldID, 10)).toISOString()
    : new Date().toISOString();
  const oldTime = route.params
    ? new Date(Number.parseInt(oldID, 10)).toISOString()
    : new Date().toISOString();
  const oldRemark = route.params?.remark ?? '';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  moment.locale(locale2);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [onRelease, setOnRelease] = useState(true);

  const pan = useRef(new Animated.ValueXY()).current;
  const isModalActive = useRef(true);

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-underscore-dangle
          x: pan.x._value,
          y: 0,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        setOnRelease(true);
        pan.flattenOffset();
      },
    }),
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
      systolic: !!route.params,
      diastolic: !!route.params,
      pulse: !!route.params,
      date: true,
      time: true,
      remark: true,
    },
    formIsValid: !!route.params,
  });

  useEffect(() => {
    if (error) {
      Alert.alert(t('error_occur'), error, [
        { text: t('okay'), onPress: () => setError(null) },
      ]);
    }
  }, [error, t]);

  function parseISOString(s: string): Date {
    return new Date(s);
  }

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generate1000Records = async () => {
    setError(null);
    setIsLoading(true);
    for (let i = 0; i < 2000; i += 1) {
      const updatedbloodPressureData = {
        timestamp: new Date(
          new Date().valueOf() - 1000 * 60 * 60 * 24 * 182 + 3110400 * 5 * i,
        ).toISOString(),
        systolic: getRandomInt(70) + 90,
        diastolic: getRandomInt(70) + 60,
        pulse: 90,
      }; // for firebase
      try {
        // eslint-disable-next-line no-await-in-loop
        await replaceBloodPressureFromSQL(
          new Date(updatedbloodPressureData.timestamp).valueOf(),
          updatedbloodPressureData.systolic,
          updatedbloodPressureData.diastolic,
          updatedbloodPressureData.pulse,
        );
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      }
    }
    setIsLoading(false);
  };

  const saveNewBloodPressureHandler = async () => {
    Keyboard.dismiss();
    if (!formState.formIsValid) {
      Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
        { text: t('okay') },
      ]);
      return;
    }
    if (
      typeof formState.inputValues.systolic === 'undefined' ||
      typeof formState.inputValues.diastolic === 'undefined' ||
      typeof formState.inputValues.pulse === 'undefined'
    ) {
      Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
        { text: t('okay') },
      ]);
      return;
    }
    if (
      formState.inputValues.systolic === '' ||
      formState.inputValues.diastolic === '' ||
      formState.inputValues.pulse === '' ||
      formState.inputValues.systolic === '0' ||
      formState.inputValues.diastolic === '0' ||
      formState.inputValues.pulse === '0'
    ) {
      Alert.alert(t('wrong_input'), t('you_may_forget_to_select_bp_values'), [
        { text: t('okay') },
      ]);
      return;
    }
    const date = new Date(formState.inputValues.date);
    const hours = new Date(formState.inputValues.time).getHours();
    const minutes = new Date(formState.inputValues.time).getMinutes();
    date.setHours(hours);
    date.setMinutes(minutes);
    // update / create a records with selected date
    const updatedbloodPressureData = {
      timestamp: date.toISOString(),
      systolic: Number.parseInt(formState.inputValues.systolic, 10),
      diastolic: Number.parseInt(formState.inputValues.diastolic, 10),
      pulse: Number.parseInt(formState.inputValues.pulse, 10),
    }; // for firebase
    setError(null);
    setIsLoading(true);
    try {
      // await dispatch(bloodPressureActions.updateBloodPressure(updatedbloodPressureData)); // for firebase
      // scheduleNoti(updatedbloodPressureData.systolic, updatedbloodPressureData.diastolic);
      //   console.log('updatedbloodPressureData to be saved');
      //   console.log(updatedbloodPressureData);
      //   console.log(formState.inputValues.remark);
      await bloodPressureActions.addBloodPressure(
        updatedbloodPressureData.timestamp,
        updatedbloodPressureData.systolic,
        updatedbloodPressureData.diastolic,
        updatedbloodPressureData.pulse,
        oldRemark !== '',
        false,
        formState.inputValues.remark,
      );

      // delete old record if users change the date of old records
      // since new record has just been created above
      if (oldID) {
        if (
          new Date(formState.inputValues.date).valueOf() !==
          new Date(Number.parseInt(oldID, 10)).valueOf()
        ) {
          await bloodPressureActions.deleteBloodPressure(
            new Date(Number.parseInt(oldID, 10)).toISOString(),
            oldRemark !== '',
          );
        }
      }
      navigation.goBack();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
    setIsLoading(false);
  };

  const deleteBloodPressureHandler = async () => {
    Keyboard.dismiss();
    if (route.params) {
      try {
        await bloodPressureActions.deleteBloodPressure(
          new Date(Number.parseInt(oldID, 10)).toISOString(),
          oldRemark !== '',
        );

        navigation.goBack();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      }
      setIsLoading(false);
    }
  };

  const inputChangeHandler = useCallback(
    (
      inputIdentifier: string,
      inputValue: string | number,
      inputValidity: boolean,
    ) => {
      dispatchFormState({
        type: 'FORM_INPUT_UPDATE',
        value: inputValue.toString(),
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [],
  );

  useEffect(() => {
    const systolicRangeTemp = [{ label: t('systolic_short'), value: '0' }];
    for (let i = 20; i < 250; i += 1) {
      systolicRangeTemp.push({ label: i.toString(), value: i.toString() });
    }
    setsystolicRange(systolicRangeTemp);
  }, [t]);

  useEffect(() => {
    const diastolicRangeTemp = [{ label: t('diastolic_short'), value: '' }];
    for (let i = 20; i < 250; i += 1) {
      diastolicRangeTemp.push({ label: i.toString(), value: i.toString() });
    }
    setdiastolicRange(diastolicRangeTemp);
  }, [t]);

  useEffect(() => {
    const pulseRangeTemp = [{ label: t('pulse_short'), value: '' }];
    for (let i = 20; i < 250; i += 1) {
      pulseRangeTemp.push({ label: i.toString(), value: i.toString() });
    }
    setpulseRange(pulseRangeTemp);
  }, [t]);

  useEffect(() => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 0.1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const [timestampForGestureHandling, setTimestampForGestureHandling] =
    useState(0);

  useEffect(() => {
    if (onRelease) {
      const timestampWhenFingerOffScreen = new Date().valueOf();
      // console.log("timestampForGestureHandling", timestampForGestureHandling);
      // console.log("timestampWhenFingerOffScreen", timestampWhenFingerOffScreen);
      const timeDifference =
        timestampWhenFingerOffScreen - timestampForGestureHandling;
      setTimestampForGestureHandling(0);
      // console.log("timeDifference", timeDifference);
      // console.log("pan.y", pan.y);
      // console.log(screenHeight * 0.5 * 0.3);
      // console.log(screenHeight);
      Keyboard.dismiss();
      if (
        // eslint-disable-next-line no-underscore-dangle
        pan.y._value > screenHeight * 0.5 * 0.5 ||
        // eslint-disable-next-line no-underscore-dangle
        (pan.y._value > screenHeight * 0.5 * 0.1 && timeDifference < 100)
      ) {
        Animated.timing(pan.y, {
          toValue: screenHeight,
          duration: 150,
          useNativeDriver: true,
        }).start();
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
        setTimeout(() => {
          navigation.goBack();
        }, 160);
      } else {
        Animated.timing(pan.y, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // timestamp when touch begins
      // if (timestampForGestureHandling == 0) {
      setTimestampForGestureHandling(new Date().valueOf());
      // }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan.y, onRelease]);

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        // Bind opacity to animated value
        opacity: fadeAnim,
      }}
    >
      <Modal animationType="slide" transparent visible style={styles.container}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={0}
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          contentContainerStyle={{
            ...styles.container,
            height: '100%',
          }}
          style={styles.container}
        >
          {/* <View style={styles.container}> */}
          <Pressable
            style={[StyleSheet.absoluteFill]}
            onPress={() => {
              Keyboard.dismiss();
              navigation.goBack();
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
              margin: isPhone
                ? -1 * (screenHeight * (0.000731 * screenHeight - 0.254878))
                : -500,
              height: screenHeight,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              transform: [{ translateY: pan.y }],
            }}
            {...panResponder.panHandlers}
          >
            <CardOpacity style={styles.bpContainer}>
              <View style={styles.bpTitlesContainer}>
                <View style={styles.bpTitleContainer}>
                  <Text style={styles.bpTitlesText}>{t('systolic_short')}</Text>
                </View>
                <View style={styles.bpTitleContainer}>
                  <Text style={styles.bpTitlesText}>
                    {t('diastolic_short')}
                  </Text>
                </View>
                <View style={styles.bpTitleContainer}>
                  <Text style={styles.bpTitlesText}>{t('pulse_short')}</Text>
                </View>
              </View>
              <View style={styles.bpValuesContainer}>
                <View style={styles.dropdownContainerStyle}>
                  <SingleChoice
                    // scrollEnabled={false}
                    id="systolic"
                    items={systolicRange}
                    onItemSelected={inputChangeHandler}
                    initialValue={formState.inputValues.systolic.toString()}
                    buttonTextStyle={{ fontSize: FontSize.varyBigTitle }}
                    isModalActive={(isActive) => {
                      isModalActive.current = isActive;
                    }}
                  />
                </View>
                <View style={styles.dropdownContainerStyle}>
                  <SingleChoice
                    // scrollEnabled={false}
                    id="diastolic"
                    items={diastolicRange}
                    onItemSelected={inputChangeHandler}
                    initialValue={formState.inputValues.diastolic.toString()}
                    buttonTextStyle={{ fontSize: FontSize.varyBigTitle }}
                    isModalActive={(isActive) => {
                      isModalActive.current = isActive;
                    }}
                  />
                </View>
                <View style={styles.dropdownContainerStyle}>
                  <SingleChoice
                    // scrollEnabled={false}
                    id="pulse"
                    items={pulseRange}
                    onItemSelected={inputChangeHandler}
                    initialValue={formState.inputValues.pulse.toString()}
                    buttonTextStyle={{ fontSize: FontSize.varyBigTitle }}
                    isModalActive={(isActive) => {
                      isModalActive.current = isActive;
                    }}
                  />
                </View>
              </View>
            </CardOpacity>

            <View style={styles.buttonContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <MainButton
                  onPress={() => {
                    void saveNewBloodPressureHandler();
                  }}
                >
                  {t('save')}
                </MainButton>
              )}
            </View>

            {!!oldID &&
              oldSys.toString() === formState.inputValues.systolic &&
              oldDia.toString() === formState.inputValues.diastolic &&
              oldPul.toString() === formState.inputValues.pulse && (
                <View style={styles.buttonContainer}>
                  {isLoading ? (
                    <View />
                  ) : (
                    <MainButton
                      onPress={() => {
                        void deleteBloodPressureHandler();
                      }}
                    >
                      {t('delete')}
                    </MainButton>
                  )}
                </View>
              )}

            <MainButtonOutline
              onPress={() => {
                setShowDatePicker(true);
              }}
              style={styles.dateTimeButton}
            >
              {formState.inputValues.date ? (
                <Text style={{ fontSize: FontSize.content }}>
                  {moment(formState.inputValues.date).format('ll')}
                </Text>
              ) : (
                <Text style={{ color: '#bbb', fontSize: FontSize.content }}>
                  {t('click_to_choose')}
                </Text>
              )}
            </MainButtonOutline>
            {showDatePicker && (
              <DateAndTimePicker
                mode="datetime"
                date={
                  formState.inputValues.date
                    ? parseISOString(formState.inputValues.date)
                    : new Date()
                }
                onClose={(date) => {
                  if (date && Platform.OS !== 'ios') {
                    setShowDatePicker(false);
                    inputChangeHandler('date', date.toISOString(), true);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
                onChange={(d) => {
                  inputChangeHandler('date', d.toISOString(), true);
                }}
              />
            )}

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            />

            <MainButtonOutline
              onPress={() => {
                setShowTimePicker(true);
              }}
              style={styles.dateTimeButton}
            >
              {formState.inputValues.time ? (
                <Text style={{ fontSize: FontSize.content }}>
                  {moment(formState.inputValues.time).format('LT')}
                </Text>
              ) : (
                <Text style={{ color: '#bbb', fontSize: FontSize.content }}>
                  {t('click_to_choose')}
                </Text>
              )}
            </MainButtonOutline>
            {showTimePicker && (
              <DateAndTimePicker
                date={parseISOString(formState.inputValues.time)}
                mode="time"
                onClose={(date) => {
                  if (date && Platform.OS !== 'ios') {
                    setShowTimePicker(false);
                    inputChangeHandler('time', date.toISOString(), true);
                  } else {
                    setShowTimePicker(false);
                  }
                }}
                onChange={(d) => {
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
