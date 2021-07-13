import React, { useContext, useState, useEffect, useReducer, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, FlatList } from 'react-native';
import moment from "moment/min/moment-with-locales";
import { useSelector, useDispatch } from 'react-redux';
import { AntDesign, Ionicons } from '@expo/vector-icons';

import * as bloodPressureActions from '../../store/actions/bloodPressure'; // for HKU server

import ActivityIndicatorWithModal from '../../components/UI/ActivityIndicatorWithModal';
import MainButtonOutlineImage from '../../components/UI/MainButtonOutlineImage';
import {
    bloodPressureColorStyle,
    systolicColorStyle,
    diastolicColorStyle,
} from '../../constants/TrafficLightStyles';
import Colors from '../../constants/Colors';
import { LocalizationContext } from '../../constants/Localisation';
import FontSize from '../../constants/FontSize';

const HealthParametersScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale } = useContext(LocalizationContext);
    const dispatch = useDispatch();
    const [bloodPressures, setBloodPressures] = useState([]); // for HKU server
    const [bloodPressuresReverse, setBloodPressuresReverse] = useState([]); // for HKU server
    const bloodPressuresUpdateIndicator = useSelector(state => state.bloodPressure.update); // for HKU server
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : locale.includes('es') ? 'es' : 'en');

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
                setBloodPressures(await bloodPressureActions.fetchBloodPressure(100, 0, beginningISODateString, nowISODateString, null));
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

    return (
        <View style={styles.screen}>
            {/* <View style={{ height: 60 }}></View> */}
            <View style={styles.titleContainer}>
                <View style={styles.titleTextContainter}>
                    <Text style={styles.title}>{t('blood_pressure_long')}</Text>
                </View>
                <View style={styles.titleDataContainer}>
                    <View style={styles.digitContainer}>
                        <Text style={styles.LowerBtnsText}>{t('systolic')}</Text>
                        <Text style={styles.unitText}>mmHg</Text>
                    </View>
                    <View style={styles.digitContainer}>
                        <Text style={styles.LowerBtnsText}>{t('diastolic')}</Text>
                        <Text style={styles.unitText}>mmHg</Text>
                    </View>
                    <View style={styles.digitContainer}>
                        <Text style={styles.LowerBtnsText}>{t('heartbeat')}</Text>
                        <Text style={styles.unitText}>bpm</Text>
                    </View>

                </View>
            </View>

            <View style={styles.flatListContainer}>
                {bloodPressuresReverse.length !== 0 ?
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={bloodPressuresReverse}
                        keyExtractor={item => item.id.toString()}
                        renderItem={itemData => <MainButtonOutlineImage onPress={() => {
                            props.navigation.navigate('BloodPressureInput', {
                                id: itemData.item.id.toString(),
                                systolic: itemData.item.systolic_blood_pressure,
                                diastolic: itemData.item.diastolic_blood_pressure,
                                pulse: itemData.item.pulse
                            });
                        }} style={styles.otherProfileCard}>
                            <View style={styles.dateContainer}>
                                {!!itemData.item.id ?
                                    <Text style={styles.title}>{moment(itemData.item.id).format('lll')}</Text> :
                                    <Text style={styles.title}>{t('no_record')}</Text>
                                }
                            </View>
                            <View style={styles.dataContainer}>
                                <View style={styles.digitContainer}>
                                    {itemData.item.systolic_blood_pressure ?
                                        <Text style={{
                                            ...styles.digit,
                                            ...bloodPressureColorStyle(itemData.item.systolic_blood_pressure, itemData.item.diastolic_blood_pressure).customFontStyle
                                        }}>{itemData.item.systolic_blood_pressure}</Text> :
                                        <Text style={styles.digit}>--</Text>
                                    }
                                </View>
                                <View style={styles.digitContainer}>
                                    {itemData.item.systolic_blood_pressure ?
                                        <Text style={{
                                            ...styles.digit,
                                            ...bloodPressureColorStyle(itemData.item.systolic_blood_pressure, itemData.item.diastolic_blood_pressure).customFontStyle
                                        }}>{itemData.item.diastolic_blood_pressure}</Text> :
                                        <Text style={styles.digit}>--</Text>
                                    }
                                </View>
                                <View style={styles.digitContainer}>
                                    {!!itemData.item.pulse ?
                                        <Text style={styles.digit}>{itemData.item.pulse}</Text> :
                                        <Text style={styles.digit}>--</Text>
                                    }
                                </View>

                            </View>
                        </MainButtonOutlineImage>}
                    />
                    :
                    <View style={styles.descriptionContainer}>
                        <View style={{ height: 30 }}></View>
                        <Text style={styles.LowerBtnsText}>{t('press')} <AntDesign name="pluscircle" size={24} color={Colors.focus} /> {t('health_parameters_description')}</Text>
                    </View>
                }
            </View>

            {/* for HKU server */}
            {!!isLoading &&
                <ActivityIndicatorWithModal />
            }
            <TouchableOpacity onPress={() => {
                props.navigation.navigate('BloodPressureInput');
            }} style={styles.fab}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>

    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        // paddingTop: Platform.OS === 'ios' ? 40 : 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    titleContainer: {
        height: Platform.OS === 'android' ? "20%" : "20%",
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        // backgroundColor: 'yellow'
    },
    titleTextContainter: {
        height: 30,
        // backgroundColor: 'green'
    },
    titleDataContainer: {
        width: '90%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        // backgroundColor: 'red'
    },
    title: {
        fontSize: FontSize.content,
    },
    titleImage: {
        maxHeight: '60%',
        resizeMode: 'contain',
    },
    flatListContainer: {
        width: '95%',
        height: "80%",
        alignItems: 'center',
    },
    otherProfileCard: {
        height: 100,
        width: '100%',
        marginBottom: 0,
        backgroundColor: Colors.blur,
        overflow: 'visible',
        borderColor: Colors.lightGrey,
        marginVertical: 15,
    },
    dateContainer: {
        width: '100%',
        height: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5
    },
    dataContainer: {
        width: '100%',
        height: '65%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    digitContainer: {
        width: '33%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    digit: {
        width: '100%',
        fontSize: FontSize.varyBigTitle,
        color: Colors.grey,
        textAlign: 'center'
    },
    LowerBtnsText: {
        width: '100%',
        fontSize: FontSize.subsubtitle,
        color: Colors.grey,
        textAlign: 'center'
    },
    unitText: {
        width: '100%',
        fontSize: FontSize.varySmallContent,
        color: Colors.grey,
        textAlign: 'center'
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: Colors.focus,
        borderRadius: 30,
        elevation: 8
    },
    fabIcon: {
        fontSize: 40,
        color: 'white'
    },
    descriptionContainer: {
        width: '90%',
        height: 400,
    },
    LowerBtnsText: {
        width: '100%',
        fontSize: FontSize.content,
        color: Colors.grey,
        textAlign: 'center'
    },
});

export default HealthParametersScreen;