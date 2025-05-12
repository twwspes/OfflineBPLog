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
  PanResponder,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import { StackScreenProps } from '@react-navigation/stack';

import { MainButton } from '../../components/UI/MainButton';
import { MainButtonOutline } from '../../components/UI/MainButtonOutline';
import { Colors } from '../../constants/Colors';
import * as bloodPressureActions from '../../store/actions/bloodPressure';
import { FontSize } from '../../constants/FontSize';
import { DateAndTimePicker } from '../../components/UI/DateAndTimePicker';
import { useLocalisation } from '../../hooks/useLocalisation';
// import { RootState } from '../store/reducers'; // Import your RootState type
import { useAppSelector } from '../../hooks/useRedux';
import { BloodPressureStackParamList } from '../../types/navigation';

const screenHeight = Math.round(Dimensions.get('window').height);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00000000',
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  dateTimeButton: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginVertical: 7,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 7,
  },
  button: {
    // additional button styles if any
  },
});

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

interface FormState {
  inputValues: {
    fromdate: string;
    todate: string;
  };
  inputValidities: {
    fromdate: boolean;
    todate: boolean;
  };
  formIsValid: boolean;
}

interface FormAction {
  type: 'FORM_INPUT_UPDATE';
  value: string;
  isValid: boolean;
  input: 'fromdate' | 'todate';
}

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

type Props = StackScreenProps<
  BloodPressureStackParamList,
  'BloodPressurePeriodModal'
>;

export const BloodPressurePeriodModal: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale2 } = useLocalisation();

  const fromdateState = useAppSelector((state) => state.bloodPressure.fromdate);
  const todateState = useAppSelector((state) => state.bloodPressure.todate);

  const oldFromDate =
    fromdateState !== ''
      ? new Date(fromdateState).toISOString()
      : new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();
  const oldToDate =
    todateState !== ''
      ? new Date(todateState).toISOString()
      : new Date().toISOString();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [, setOnShow] = useState(false);

  moment.locale(locale2);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [onRelease, setOnRelease] = useState(true);

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        setOnRelease(false);
        return true;
      },
      onMoveShouldSetPanResponder: (_evt, { dx, dy }) => {
        if (dx > 10 || dy > 10) {
          setOnRelease(false);
          return true;
        }
        return false;
      },
      onPanResponderGrant: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-underscore-dangle
        pan.setOffset({ x: pan.x._value, y: 0 });
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
      fromdate: oldFromDate,
      todate: oldToDate,
    },
    inputValidities: {
      fromdate: true,
      todate: true,
    },
    formIsValid: true,
  });

  useEffect(() => {
    if (error) {
      Alert.alert(t('error_occur'), error, [
        { text: t('okay'), onPress: () => setError(null) },
      ]);
    }
  }, [error, t]);

  const parseISOString = (s: string): Date => {
    const [year, month, day, hour, minute, second, ms] = s
      .split(/\D+/)
      .map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
  };

  const inputChangeHandler = useCallback(
    (
      inputIdentifier: 'fromdate' | 'todate',
      inputValue: string,
      inputValidity: boolean,
    ) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [],
  );

  const onUpdateFromToDateHandler = () => {
    setIsLoading(true);
    if (!formState.formIsValid) {
      Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
        { text: t('okay') },
      ]);
      setIsLoading(false);
      return;
    }
    if (
      new Date(formState.inputValues.fromdate) >=
      new Date(formState.inputValues.todate)
    ) {
      Alert.alert(t('wrong_input'), t('fromdate_over_todate'), [
        { text: t('okay') },
      ]);
      setIsLoading(false);
      return;
    }
    const todate = new Date(formState.inputValues.todate);
    todate.setHours(23, 59);
    const fromdate = new Date(formState.inputValues.fromdate);
    fromdate.setHours(0, 0);

    bloodPressureActions.setFromdate(fromdate.toISOString());
    bloodPressureActions.setTodate(todate.toISOString());

    setIsLoading(false);
    navigation.navigate({
      name: 'BloodPressure',
      params: { filtered: true, feedbackTimestamp: Date.now() },
      merge: true,
    });
  };

  const onRemoveFilterBtnPress = () => {
    setIsLoading(true);
    bloodPressureActions.setFromdate('');
    bloodPressureActions.setTodate('');
    setIsLoading(false);
    navigation.navigate({
      name: 'BloodPressure',
      params: { filtered: false, feedbackTimestamp: Date.now() },
      merge: true,
    });
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0.1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (onRelease) {
      // eslint-disable-next-line no-underscore-dangle
      if (pan.y._value > screenHeight * 0.5 * 0.3) {
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
    }
  }, [pan.y, onRelease, fadeAnim, navigation]);

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
      <Modal
        animationType="slide"
        transparent
        visible
        style={styles.container}
        // useNativeDriver
        onShow={() => {
          setOnShow(true);
        }}
      >
        <View style={styles.container}>
          <Pressable
            style={[StyleSheet.absoluteFill]}
            onPress={() => {
              navigation.goBack();
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
              margin:
                -1 * (screenHeight * (0.000731 * screenHeight - 0.254878)),
              height: screenHeight,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              transform: [{ translateY: pan.y }],
            }}
            {...panResponder.panHandlers}
          >
            <MainButtonOutline
              onPress={() => {
                setShowDatePicker(true);
              }}
              style={styles.dateTimeButton}
            >
              {formState.inputValues.fromdate ? (
                <Text style={{ fontSize: FontSize.content }}>
                  {t('from') +
                    moment(formState.inputValues.fromdate).format('ll')}
                </Text>
              ) : (
                <Text style={{ color: '#bbb', fontSize: FontSize.content }}>
                  {t('click_to_choose')}
                </Text>
              )}
            </MainButtonOutline>
            {showDatePicker && (
              <DateAndTimePicker
                date={
                  formState.inputValues.fromdate
                    ? parseISOString(formState.inputValues.fromdate)
                    : new Date()
                }
                onClose={(date) => {
                  if (date && Platform.OS !== 'ios') {
                    setShowDatePicker(false);
                    inputChangeHandler('fromdate', date.toISOString(), true);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
                onChange={(d) => {
                  inputChangeHandler('fromdate', d.toISOString(), true);
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
              {formState.inputValues.todate ? (
                <Text style={{ fontSize: FontSize.content }}>
                  {t('to') + moment(formState.inputValues.todate).format('ll')}
                </Text>
              ) : (
                <Text style={{ color: '#bbb', fontSize: FontSize.content }}>
                  {t('click_to_choose')}
                </Text>
              )}
            </MainButtonOutline>
            {showTimePicker && (
              <DateAndTimePicker
                date={
                  formState.inputValues.todate
                    ? parseISOString(formState.inputValues.todate)
                    : new Date()
                }
                onClose={(date) => {
                  if (date && Platform.OS !== 'ios') {
                    setShowTimePicker(false);
                    inputChangeHandler('todate', date.toISOString(), true);
                  } else {
                    setShowTimePicker(false);
                  }
                }}
                onChange={(d) => {
                  inputChangeHandler('todate', d.toISOString(), true);
                }}
              />
            )}

            <View style={styles.buttonContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <MainButton
                  onPress={onUpdateFromToDateHandler}
                  style={styles.button}
                >
                  {t('add_filter')}
                </MainButton>
              )}
            </View>

            <View style={styles.buttonContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <MainButton
                  onPress={onRemoveFilterBtnPress}
                  style={styles.button}
                >
                  {t('remove_filter')}
                </MainButton>
              )}
            </View>

            {/* <View style={{ height: 500 }} /> */}
          </Animated.View>
          {/* </View> */}
        </View>
      </Modal>
    </Animated.View>
  );
};
