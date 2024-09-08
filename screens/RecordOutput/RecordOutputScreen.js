import React, { useState, useContext, useEffect, useCallback, useReducer } from 'react';
import { View, Text, StyleSheet, Linking, ActivityIndicator, Alert, TouchableOpacity, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from "moment/min/moment-with-locales";
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
/* load 'fs' for readFile and writeFile support */
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import * as bloodPressureActions from '../../store/actions/bloodPressure';

import pkg from '../../app.json';
import MainButton from '../../components/UI/MainButton';
import MainButtonClear from '../../components/UI/MainButtonClear';
import { LocalizationContext } from '../../constants/Localisation';
import Input from '../../components/UI/Input';
import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';
import isValidDate from '../../helpers/isValidDate';

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

const excelDir = FileSystem.documentDirectory + 'Excels/';
const excelFileUri = () => excelDir + "hello.xlsx";

const RecordOutputScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale } = useContext(LocalizationContext);
    const dispatch = useDispatch();
    const [bloodPressures, setBloodPressures] = useState([]);
    const [bloodPressuresReverse, setBloodPressuresReverse] = useState([]);
    const bloodPressuresUpdateIndicator = useSelector(state => state.bloodPressure.update);
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : locale.includes('es') ? 'es' : 'en');
    const privacyPolicyWebsite = locale.includes('zh') ?
        'https://twwspes.github.io/OfflineBPLog-Intro/?lang=zh' :
        locale.includes('fr') ?
            'https://twwspes.github.io/OfflineBPLog-Intro/?lang=fr' :
            locale.includes('es') ?
                'https://twwspes.github.io/OfflineBPLog-Intro/?lang=es' :
                'https://twwspes.github.io/OfflineBPLog-Intro/';

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
    useEffect(() => {
        const downloadItems = async () => {
            setError(null);
            setIsLoading(true);
            console.log("RecordOutputScreen useEffect downloadItems");

            const date = new Date();
            const nowISODateString = date.toISOString();
            const oneWeekAgoDate = moment().subtract(1, 'years');
            const oneWeekAgoDateISODateString = oneWeekAgoDate.toISOString();
            const beginningISODateString = "1970-01-01T00:00:00.000Z"
            try {
                setBloodPressures(await bloodPressureActions.fetchBloodPressure(-1, -1, beginningISODateString, nowISODateString, null));
            } catch (err) {
                setBloodPressures([]);
                console.log("failed to download RecordOutputScreen useEffect downloadItems");
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

    const deleteAllLogsHandler = () => {
        Alert.alert(t('warning'), t('all_logs_removed_warning'), [
            {
                text: t('okay'), onPress: async () => {
                    setIsLoading(true);
                    const promise = dispatch(bloodPressureActions.deleteAllBloodPressures());
                    promise.then(() => {
                        setIsLoading(false);
                    })
                }
            },
            { text: t('cancel'), style: 'cancel', }
        ]);
        return;
    }

    return (
        <TouchableOpacity style={styles.screen}
            onPress={Keyboard.dismiss}
            activeOpacity={1}
        >
            {isLoading ? (
                <ActivityIndicator size='large' color={Colors.primary} />
            ) : (<>
                <View style={styles.buttonContainer}>
                    <MainButton onPress={async () => {
                        try {
                            setIsLoading(true);
                            const result = await DocumentPicker.getDocumentAsync({
                                copyToCacheDirectory: true,
                                type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
                            });
                            console.log("RecordOutputScreen result", result);

                            if (!result.canceled && !!result.assets[0].uri) {

                                const path = result.assets[0].uri;

                                const b64 = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 });
                                const workbook = XLSX.read(b64, { type: "base64" });

                                const importJsonArray = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
                                // console.log("RecordOutputScreen json", importJsonArray);

                                if (importJsonArray !== undefined) {
                                    console.log("RecordOutputScreen json is valid");

                                    let bloodPressuresReverseIndex = 0;

                                    const promises = [];

                                    for (const item of importJsonArray) {
                                        const date = new Date(item.Year, item.Month - 1, item.Date, item.Hours, item.Minutes, item.Seconds);
                                        if (isValidDate(date)) {

                                            if (item.Systolic > 20
                                                && item.Systolic < 250
                                                && item.Diastolic > 20
                                                && item.Diastolic < 250
                                                && item.Pulse > 20
                                                && item.Pulse < 250
                                            ) {

                                                const remark = item.Remark !== undefined ? item.Remark.toString().substring(0, 300) : '';

                                                // console.log("RecordOutputScreen date", date, bloodPressuresReverseIndex);
                                                if (bloodPressuresReverseIndex < bloodPressuresReverse.length) {
                                                    for (let i = bloodPressuresReverseIndex; i < bloodPressuresReverse.length; i++) {
                                                        // console.log(date);
                                                        // console.log(new Date(bloodPressuresReverse[i].id));
                                                        if (date.valueOf() === Math.floor(Number(bloodPressuresReverse[i].id) / 1000) * 1000) {
                                                            // console.log("RecordOutputScreen date === existing records", date);
                                                            const promise = dispatch(bloodPressureActions.addBloodPressure(
                                                                bloodPressuresReverse[i].id,
                                                                item.Systolic,
                                                                item.Diastolic,
                                                                item.Pulse,
                                                                remark,
                                                                true,
                                                                false
                                                            ));
                                                            promises.push(promise);
                                                            bloodPressuresReverseIndex = i + 1;
                                                            break;
                                                        } else if (date.valueOf() >= Math.floor(Number(bloodPressuresReverse[i].id) / 1000) * 1000) {
                                                            // console.log("RecordOutputScreen date !== existing records", date);
                                                            const promise = dispatch(bloodPressureActions.addBloodPressure(
                                                                date.valueOf(),
                                                                item.Systolic,
                                                                item.Diastolic,
                                                                item.Pulse,
                                                                remark,
                                                                true,
                                                                false
                                                            ));
                                                            promises.push(promise);
                                                            bloodPressuresReverseIndex = i + 1
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    // console.log("bloodPressuresReverseIndex < bloodPressuresReverse.length", date);
                                                    const promise = dispatch(bloodPressureActions.addBloodPressure(
                                                        date.valueOf(),
                                                        item.Systolic,
                                                        item.Diastolic,
                                                        item.Pulse,
                                                        remark,
                                                        true,
                                                        false
                                                    ));
                                                    promises.push(promise);
                                                }
                                            }

                                        }

                                    }

                                    // wait for all the promises in the promises array to resolve
                                    Promise.all(promises).then(results => {
                                        // all the fetch requests have completed, and the results are in the "results" array
                                        // console.log("All done", results);
                                        Alert.alert(t('congrat'), t('all_logs_imported'), [
                                            { text: t('okay'), style: t('cancel'), }
                                        ]);
                                        dispatch(bloodPressureActions.forceUpdateBPState());

                                        setIsLoading(false);
                                    });
                                } else {
                                    Alert.alert(t('sorry'), t('error_occur_relaunch_apps'), [
                                        { text: t('okay'), style: t('cancel'), }
                                    ]);
                                    setIsLoading(false);
                                }
                            } else {
                                setIsLoading(false);
                            }

                        } catch (err) {
                            console.log('RecordOutputScreen Import xml Error: ', err);
                            Alert.alert(t('sorry'), t('error_occur_relaunch_apps'), [
                                { text: t('okay'), style: t('cancel'), }
                            ]);
                            setIsLoading(false);
                        }
                    }}>
                        {t('import_xlsx')}
                    </MainButton>
                </View>
                <View style={styles.buttonContainer}>
                    <MainButton onPress={async () => {
                        const bloodPressuresJson = bloodPressuresReverse.map((item) => {
                            const dateTemp = new Date(parseInt(item.id));
                            return {
                                systolic: item.systolic_blood_pressure,
                                diastolic: item.diastolic_blood_pressure,
                                pulse: item.pulse,
                                year: dateTemp.getFullYear(),
                                month: dateTemp.getMonth() + 1,
                                date: dateTemp.getDate(),
                                hours: dateTemp.getHours(),
                                minutes: dateTemp.getMinutes(),
                                seconds: dateTemp.getSeconds(),
                                remark: item.remark ?? "",
                            }
                        });
                        console.log('bloodPressuresJson', bloodPressuresJson);
                        /* generate worksheet and workbook */
                        const worksheet = XLSX.utils.json_to_sheet(bloodPressuresJson);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

                        /* fix headers */
                        XLSX.utils.sheet_add_aoa(worksheet, [["Systolic", "Diastolic", "Pulse", "Year", "Month", "Date", "Hours", "Minutes", "Seconds", "Remark"]], { origin: "A1" });

                        /* calculate column width */
                        // const max_width = bloodPressuresJson.reduce((w, r) => Math.max(w, r.name.length), 10);
                        // worksheet["!cols"] = [{ wch: max_width }];
                        const b64 = XLSX.write(workbook, { type: 'base64', bookType: "xlsx" });
                        // /* b64 is a Base64 string */
                        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "BloodPressure.xlsx", b64, { encoding: FileSystem.EncodingType.Base64 });

                        const isSharingAvailable = Sharing.isAvailableAsync();

                        if (isSharingAvailable) {
                            Sharing.shareAsync(FileSystem.documentDirectory + "BloodPressure.xlsx");
                        }
                    }}>
                        {t('export_xlsx')}
                    </MainButton>
                </View>
                <View style={styles.buttonContainer}>
                    <MainButton onPress={async () => {
                        const sampleBloodPressureLog = [
                            {
                                id: new Date().valueOf(),
                                systolic_blood_pressure: 113,
                                diastolic_blood_pressure: 79,
                                pulse: 63,
                                remark: "Left Arm"
                            },
                            {
                                id: new Date().valueOf() - 12 * 60 * 60 * 1000,
                                systolic_blood_pressure: 116,
                                diastolic_blood_pressure: 75,
                                pulse: 64,
                                remark: "Right Arm"
                            }
                        ]
                        const bloodPressuresJson = sampleBloodPressureLog.map((item) => {
                            const dateTemp = new Date(parseInt(item.id));
                            return {
                                systolic: item.systolic_blood_pressure,
                                diastolic: item.diastolic_blood_pressure,
                                pulse: item.pulse,
                                year: dateTemp.getFullYear(),
                                month: dateTemp.getMonth() + 1,
                                date: dateTemp.getDate(),
                                hours: dateTemp.getHours(),
                                minutes: dateTemp.getMinutes(),
                                seconds: dateTemp.getSeconds(),
                                remark: item.remark ?? "",
                            }
                        });
                        console.log('bloodPressuresJson', bloodPressuresJson);
                        /* generate worksheet and workbook */
                        const worksheet = XLSX.utils.json_to_sheet(bloodPressuresJson);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

                        /* fix headers */
                        XLSX.utils.sheet_add_aoa(worksheet, [["Systolic", "Diastolic", "Pulse", "Year", "Month", "Date", "Hours", "Minutes", "Seconds", "Remark"]], { origin: "A1" });

                        /* calculate column width */
                        // const max_width = bloodPressuresJson.reduce((w, r) => Math.max(w, r.name.length), 10);
                        // worksheet["!cols"] = [{ wch: max_width }];
                        const b64 = XLSX.write(workbook, { type: 'base64', bookType: "xlsx" });
                        // /* b64 is a Base64 string */
                        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "BloodPressure.xlsx", b64, { encoding: FileSystem.EncodingType.Base64 });

                        const isSharingAvailable = Sharing.isAvailableAsync();

                        if (isSharingAvailable) {
                            Sharing.shareAsync(FileSystem.documentDirectory + "BloodPressure.xlsx");
                        }
                    }}>
                        {t('download_sample_xlsx')}
                    </MainButton>
                </View>
                <View style={styles.buttonContainer}>
                    <MainButton onPress={deleteAllLogsHandler}>
                        {t('delete_all_logs')}
                    </MainButton>
                </View>
            </>
            )}
            <Text>BP Log v.{pkg.expo.version}</Text>
            <Text style={{ fontSize: 12 }}>{'© 2021-' + new Date().getFullYear() + ' Tak Wai WONG'}</Text>
            <MainButtonClear
                onPress={() => {
                    Linking.openURL(privacyPolicyWebsite);
                }}
                buttonText={{ fontSize: FontSize.veryvarySmallContent }}
            >
                {t('privacy_policy')}
            </MainButtonClear>
        </TouchableOpacity >
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