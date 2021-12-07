import React, { useContext, useState, useEffect, PureComponent, useMemo } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert, Platform, TouchableOpacity, FlatList, Pressable } from 'react-native';
import moment from "moment/min/moment-with-locales";
import { useSelector, useDispatch } from 'react-redux';
import { AntDesign, Ionicons } from '@expo/vector-icons';

import * as bloodPressureActions from '../../store/actions/bloodPressure'; // for HKU server

import ActivityIndicatorWithModal from '../../components/UI/ActivityIndicatorWithModal';
import MainButtonOutlineImage from '../../components/UI/MainButtonOutlineImage';
import MainButtonOutline from '../../components/UI/MainButtonOutline';
import MainButton from '../../components/UI/MainButton';
import {
    bloodPressureColorStyle,
    systolicColorStyle,
    diastolicColorStyle,
} from '../../constants/TrafficLightStyles';
import DateAndTimePicker from '../../components/UI/DateAndTimePicker';
import Colors from '../../constants/Colors';
import { LocalizationContext } from '../../constants/Localisation';
import FontSize from '../../constants/FontSize';

// class FlatListItem extends PureComponent {
//     render() {
//         const { itemData, onFlatListItemPress, noRecordLocalisedString } = this.props;

const FlatListItem = ({ itemData, onFlatListItemPress, noRecordLocalisedString }) => {

    return <MainButtonOutlineImage
        onPress={() => {
            onFlatListItemPress(itemData);
        }} style={{
            ...styles.otherProfileCard,
            height: !!itemData.item.remark ? 150 : 100,
        }}>
        <View style={styles.dateContainer}>
            {!!itemData.item.id ?
                <Text style={styles.title}>{moment(itemData.item.id).format('lll')}</Text> :
                <Text style={styles.title}>{noRecordLocalisedString}</Text>
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
        {!!itemData.item.remark && <View style={styles.dateContainer}>
            <Text style={styles.remark}>{itemData.item.remark}</Text>
        </View>}
    </MainButtonOutlineImage>
}
// }

const HealthParametersScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale } = useContext(LocalizationContext);
    const dispatch = useDispatch();
    const [bloodPressures, setBloodPressures] = useState([]); // for HKU server
    const [bloodPressuresReverse, setBloodPressuresReverse] = useState([]); // for HKU server
    const bloodPressuresUpdateIndicator = useSelector(state => state.bloodPressure.update); // for HKU server
    const flatListPaginationIncrement = 100;
    const [currentOffset, setCurrentOffset] = useState(0);
    const [latestBloodPressures, setLatestBloodPressures] = useState([]);
    const fromdate = useSelector(state => state.bloodPressure.fromdate);
    const todate = useSelector(state => state.bloodPressure.todate);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : locale.includes('es') ? 'es' : 'en');

    useEffect(() => {
        if (error) {
            Alert.alert(t('error_occur'), error, [{ text: t('okay'), onPress: () => setError(null) }]);
        }
    }, [error]);

    useEffect(() => {
        if (props.route.params?.filtered) {
            // filter updated, do something with `route.params.filter`
            const filtered = props.route.params?.filtered;
            if (filtered) {
                setBloodPressures([]);
                setIsFiltered(true);
            } else {
                setBloodPressures([]);
                setIsFiltered(false);
            }
        } else {
            setBloodPressures([]);
            setIsFiltered(false);
        }
    }, [props.route.params?.filtered]);

    useEffect(() => {
        setBloodPressures([]);
    }, [bloodPressuresUpdateIndicator]);

    // Grab data from source
    useEffect(() => {  // for HKU server
        const downloadItems = async () => {
            setError(null);
            setIsLoading(true);
            // console.log("download HealthParameter items");

            const nowISODateString = new Date().toISOString();
            const longTimeAgoISOString = '1970-01-01T00:00:00.000Z';
            console.log("fromdate In Screen useEffect");
            console.log(fromdate);
            console.log("todate In Screen useEffect");
            console.log(todate);

            const newBloodPressures = await bloodPressureActions.fetchBloodPressure(
                flatListPaginationIncrement,
                currentOffset,
                fromdate === "" ? longTimeAgoISOString : fromdate,
                todate === "" ? nowISODateString : todate,
                null
            );
            console.log("newBloodPressures length");
            console.log(newBloodPressures.length);
            console.log(currentOffset);
            setLatestBloodPressures(newBloodPressures);
            try {
                setBloodPressures((prevValue) => {
                    const bloodPressuresTemp = [...prevValue, ...newBloodPressures];
                    bloodPressuresTemp.sort(function (a, b) {
                        return parseInt(b.id) - parseInt(a.id);
                    });
                    const bloodPressuresTempDupliRemoved = bloodPressuresTemp.filter((arr, index, self) =>
                        index === self.findIndex((t) => (t.id === arr.id)))
                    return bloodPressuresTempDupliRemoved;
                });
            } catch (err) {
                setBloodPressures([]);
                console.log("failed to download HealthParameter items");
                setIsLoading(false);
                setError(err.message);
            }
            setIsLoading(false);
        };

        downloadItems();
        // }, []);
    }, [bloodPressuresUpdateIndicator, currentOffset, todate, fromdate]);

    const onEndReached = async () => {
        if (latestBloodPressures.length >= flatListPaginationIncrement) {
            setCurrentOffset(prevValue => prevValue += flatListPaginationIncrement);
        }
    }

    useEffect(() => {
        // setBloodPressuresReverse(bloodPressures.reverse());
        setBloodPressuresReverse(bloodPressures);
    }, [bloodPressures]);

    const onFlatListItemPress = (itemData) => {
        props.navigation.navigate('BloodPressureInputModal', {
            id: itemData.item.id.toString(),
            systolic: itemData.item.systolic_blood_pressure,
            diastolic: itemData.item.diastolic_blood_pressure,
            pulse: itemData.item.pulse,
            remark: !!itemData.item.remark ? itemData.item.remark : ""
        });
    }

    return (
        <View style={{
            ...styles.screen,
            backgroundColor: isFiltered ? Colors.secondary : 'white',
        }}>
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
                <Pressable
                    onPress={() => {
                        props.navigation.navigate('BloodPressurePeriodModal');
                    }}
                    style={styles.titleToggleButton}
                >
                    <Text style={styles.titleToggleButtonText}>{isFiltered ? t('filter_in_use') : t('filter')}</Text>
                </Pressable>
            </View>
            <View style={{
                ...styles.flatListContainer,
                backgroundColor: isFiltered ? Colors.secondary : 'white',
            }}>
                {bloodPressuresReverse.length !== 0 ?
                    <FlatList
                        onEndReached={() => {
                            console.log("onEndReached");
                            onEndReached();
                        }}
                        onEndReachedThreshold={30}
                        showsVerticalScrollIndicator={false}
                        data={bloodPressuresReverse}
                        keyExtractor={item => item.id.toString()}
                        renderItem={itemData => <FlatListItem
                            itemData={itemData}
                            onFlatListItemPress={onFlatListItemPress}
                            noRecordLocalisedString={t('no_record')}
                        />}
                    />
                    :
                    isLoading ?
                        <View style={styles.descriptionContainer}>
                            <View style={{ height: 30 }}></View>
                            <View style={styles.indicatorContainer}>
                                <ActivityIndicator size="large" color={Colors.focus} />
                            </View>
                        </View>
                        : <View style={styles.descriptionContainer}>
                            <View style={{ height: 30 }}></View>
                            <Text style={styles.LowerBtnsText}>{t('press')} <AntDesign name="pluscircle" size={24} color={Colors.focus} /> {t('health_parameters_description')}</Text>
                        </View>
                }
            </View>
            <TouchableOpacity onPress={() => {
                props.navigation.navigate('BloodPressureInputModal');
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
        height: "25%",
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
    titleDateContainer: {
        width: '90%',
        // height: 60,
    },
    dateTimeButton: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 18,
        marginVertical: 7,
    },
    button: {
        marginVertical: 7,
    },
    title: {
        fontSize: FontSize.content,
    },
    remark: {
        fontSize: FontSize.smallContent,
    },
    titleImage: {
        maxHeight: '60%',
        resizeMode: 'contain',
    },
    flatListContainer: {
        width: '95%',
        height: "75%",
        alignItems: 'center',
        backgroundColor: 'white',
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
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 5
    },
    dataContainer: {
        width: '100%',
        height: 60,
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
    activityIndicatorContainer: {
        width: '95%',
        height: "75%",
        alignItems: 'center',
        justifyContent: 'center'
    },
    indicatorContainer: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HealthParametersScreen;