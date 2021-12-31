import React, { useState, useContext, useEffect, useCallback, useReducer } from 'react';
import { View, Text, StyleSheet, Linking, ActivityIndicator, Alert, TouchableOpacity, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from "moment/min/moment-with-locales";

import * as bloodPressureActions from '../../store/actions/bloodPressure'; // for HKU server

import pkg from '../../app.json';
import MainButton from '../../components/UI/MainButton';
import MainButtonClear from '../../components/UI/MainButtonClear';
import { LocalizationContext } from '../../constants/Localisation';
import Input from '../../components/UI/Input';
import Colors from '../../constants/Colors';
import FontSize from '../../constants/FontSize';

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

const RecordOutputScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale } = useContext(LocalizationContext);
    const dispatch = useDispatch();
    const [bloodPressures, setBloodPressures] = useState([]); // for HKU server
    const [bloodPressuresReverse, setBloodPressuresReverse] = useState([]); // for HKU server
    const [bloodPressuresReverseText, setBloodPressuresReverseText] = useState(''); // for HKU server
    const bloodPressuresUpdateIndicator = useSelector(state => state.bloodPressure.update); // for HKU server
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : locale.includes('es') ? 'es' : 'en');
    const privacyPolicyWebsite = locale.includes('zh') ?
        'https://sites.google.com/connect.hku.hk/offlinebplog-zh/home' :
        locale.includes('fr') ?
            'https://sites.google.com/connect.hku.hk/offlinebplog-fr/home' :
            locale.includes('es') ?
                'https://sites.google.com/connect.hku.hk/offlinebplog-es/home' :
                'https://sites.google.com/connect.hku.hk/offlinebplog/home';

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            email: "",
        },
        inputValidities: {
            email: false,
        },
        formIsValid: false,
    });

    useEffect(() => {
        if (error) {
            Alert.alert(t('error_occur'), error, [{ text: t('okay'), onPress: () => setError(null) }]);
        }
    }, [error])

    // Grab data from source
    useEffect(() => {  // for HKU server
        const downloadItems = async () => {
            setError(null);
            setIsLoading(true);
            console.log("download HealthParameter items");

            const date = new Date();
            const nowISODateString = date.toISOString();
            const oneWeekAgoDate = moment().subtract(1, 'years');
            const oneWeekAgoDateISODateString = oneWeekAgoDate.toISOString();
            const beginningISODateString = "1970-01-01T00:00:00.000Z"
            try {
                setBloodPressures(await bloodPressureActions.fetchBloodPressure(-1, -1, beginningISODateString, nowISODateString, null));
            } catch (err) {
                setBloodPressures([]);
                console.log("failed to download HealthParameter items");
                setIsLoading(false);
                setError(err.message);
            }
            setIsLoading(false);
        };

        downloadItems();

    }, [bloodPressuresUpdateIndicator, dispatch]);

    useEffect(() => {
        // setBloodPressuresReverse(bloodPressures.reverse());
        setBloodPressuresReverse(bloodPressures);
    }, [bloodPressures]);

    useEffect(() => {
        let bloodPressuresReverseTextTemp = 'Date,Systolic,Diastolic,Pulse,Remarks\n';
        for (const item of bloodPressuresReverse) {
            bloodPressuresReverseTextTemp += new Date(parseInt(item.id)).toISOString() + ",";
            bloodPressuresReverseTextTemp += item.systolic_blood_pressure + ",";
            bloodPressuresReverseTextTemp += item.diastolic_blood_pressure + ",";
            bloodPressuresReverseTextTemp += item.pulse + ",";
            bloodPressuresReverseTextTemp += !!item.remark ? item.remark + "\n" : "\n";
        }
        setBloodPressuresReverseText(bloodPressuresReverseTextTemp);
    }, [bloodPressuresReverse]);

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

    const sendEmailHandler = () => {
        if (!formState.formIsValid) {
            Alert.alert(t('wrong_input'), t('please_check_the_errors_in_the_form'), [
                { text: t('okay') }
            ]);
            return;
        }
        Linking.openURL(`mailto:${formState.inputValues.email}?subject=${t('appName')}&body=${bloodPressuresReverseText}`);
    }

    return (
        <TouchableOpacity style={styles.screen}
            onPress={Keyboard.dismiss}
            activeOpacity={1}
        >
            <View style={styles.inputContainer}>
                <Input
                    id="email"
                    placeholder={t('email_for_data')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    errorText={t('email_address_is_needed')}
                    onInputChange={inputChangeHandler}
                    style={styles.input}
                    required
                    initialValue={formState.inputValues.email}
                    email
                />
            </View>
            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <ActivityIndicator size='small' color={Colors.primary} />
                ) : (
                    <MainButton onPress={sendEmailHandler} style={styles.button}>
                        {t('send')}
                    </MainButton>
                )
                }
            </View>
            <View style={styles.buttonContainer}>
                <MainButton onPress={() => {
                    Linking.openURL('mailto:wai.wong@stringdynamic.com?subject=An improvement advice for Offline BP Log');
                }}>
                    {t('send_email_to_developer')}
                </MainButton>
            </View>
            <Text>BP Log v.{pkg.expo.version}</Text>
            <Text style={{ fontSize: 12 }}>© 2021-2022 Tak Wai WONG</Text>
            <MainButtonClear
                onPress={() => {
                    Linking.openURL(privacyPolicyWebsite);
                }}
                buttonText={{ fontSize: FontSize.veryvarySmallContent }}
            >
                {t('privacy_policy')}
            </MainButtonClear>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    inputContainer: {
        width: '90%',
    },
    input: {
        marginVertical: 7,
    },
    buttonContainer: {
        width: '90%',
        marginVertical: 7,
    },
});

export default RecordOutputScreen;