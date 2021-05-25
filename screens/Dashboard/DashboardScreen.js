import React, { useContext, useState, useEffect, useReducer, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, FlatList, Dimensions, ActivityIndicator, Linking, SafeAreaView } from 'react-native';
import moment from "moment/min/moment-with-locales";
import { useSelector, useDispatch } from 'react-redux';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryLegend, VictoryPie, VictoryArea, VictoryLabel, VictoryScatter } from "victory-native";
import { Ionicons } from '@expo/vector-icons';

import * as bloodPressureActions from '../../store/actions/bloodPressure'; // for HKU server
import ActivityIndicatorWithModal from '../../components/UI/ActivityIndicatorWithModal';
import MainButtonOutlineImage from '../../components/UI/MainButtonOutlineImage';
import MainButtonClear from '../../components/UI/MainButtonClear';
import MainButtonClearImage from '../../components/UI/MainButtonClearImage';
import ChartAxis from '../../components/Charts/ChartAxis';
import Dropdown from '../../components/UI/Dropdown';
import {
    systolicColorStyle,
    diastolicColorStyle,
} from '../../constants/TrafficLightStyles';
import Colors from '../../constants/Colors';
import { LocalizationContext } from '../../constants/Localisation';
import FontSize from '../../constants/FontSize';

const screenWidth = Math.round(Dimensions.get('window').width);

const DashboardScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const { t, locale } = useContext(LocalizationContext);
    const [lastBloodPressures, setLastBloodPressures] = useState([]); // for HKU server
    const [bloodPressures, setBloodPressures] = useState([]); // for HKU server
    const [showBloodPressureCategory, setShowBloodPressureCategory] = useState(false);
    const bloodPressuresUpdateIndicator = useSelector(state => state.bloodPressure.update); // for HKU server
    const [bloodPressuresSystolicForChart, setBloodPressuresSystolicForChart] = useState([]);
    const [bloodPressuresDiastolicForChart, setBloodPressuresDiastolicForChart] = useState([]);
    const [bloodPressuresPulseForChart, setBloodPressuresPulseForChart] = useState([]);
    const [bloodPressuresAvgMaxMin, setBloodPressuresAvgMaxMin] = useState([]);
    const [bloodPressuresForTable, setBloodPressuresForTable] = useState([]);
    const [bloodPressuresPeriodForTable, setBloodPressuresPeriodForTable] = useState('one_day');
    const [bloodPressuresPercent0, setBloodPressuresPercent0] = useState([]);
    const [bloodPressuresPercent1, setBloodPressuresPercent1] = useState([]);
    const [bloodPressuresPercent2, setBloodPressuresPercent2] = useState([]);
    const [bloodPressuresPercent3, setBloodPressuresPercent3] = useState([]);
    const [bloodPressuresPercent4, setBloodPressuresPercent4] = useState([]);
    moment.locale(locale.includes('zh') ? (locale.includes('CN') ? 'zh-cn' : 'zh-hk') : locale.includes('fr') ? 'fr' : 'en');

    function periodValueMapping(period) {
        switch (period) {
            case 'one_day':
                return 1000 * 60 * 60 * 24;
            case 'one_week':
                return 1000 * 60 * 60 * 24 * 7;
            case 'one_month':
                return 1000 * 60 * 60 * 24 * 31;
            case 'three_months':
                return 1000 * 60 * 60 * 24 * 31 * 3;
            case 'six_months':
                return 1000 * 60 * 60 * 24 * 31 * 6;
            case 'one_year':
                return 1000 * 60 * 60 * 24 * 366;
            case 'all':
                return 1593633109356;
            default:
                return 1000 * 60 * 60 * 24
        }
    };

    useEffect(() => {
        if (error) {
            Alert.alert(t('error_occur'), error, [{ text: t('okay'), onPress: () => setError(null) }]);
        }
    }, [error])

    useEffect(() => {  // for HKU server
        const downloadItems = async () => {
            setError(null);
            setIsLoading(true);
            console.log("download the latest bloodPressures items");

            const date = new Date();
            const nowISODateString = date.toISOString();
            const oneYearAgoDate = moment().subtract(1, 'years');
            const oneYearAgoDateISODateString = oneYearAgoDate.toISOString();
            try {
                setLastBloodPressures(await bloodPressureActions.fetchBloodPressure(1, 0, oneYearAgoDateISODateString, nowISODateString, null));
                console.log("setLastBloodPressure finished");
                console.log(lastBloodPressures);
            } catch (err) {
                setLastBloodPressures([]);
                console.log("failed to download the latest HealthParameter items");
                setIsLoading(false);
                setError(err.message);
                if (parseInt(err.message.substring(err.message.length - n)) === "401") {
                    // dispatch(authActions.loginByRefreshToken(null));
                }
                // return;
            }
            setIsLoading(false);
        };

        downloadItems();

    }, [bloodPressuresUpdateIndicator]);

    // Grab data from source
    useEffect(() => {  // for HKU server
        const downloadItems = async () => {
            setError(null);
            setIsLoading(true);
            console.log("download bloodPressures graph items");

            const date = new Date();
            const nowISODateString = date.toISOString();
            const sinceMoment = new Date().valueOf() - periodValueMapping(bloodPressuresPeriodForTable);
            var sinceDate = new Date(sinceMoment);
            if (bloodPressuresPeriodForTable === 'all') {
                sinceDate = new Date(0);
            }
            const sinceDateISODateString = sinceDate.toISOString();
            try {
                setBloodPressures(await bloodPressureActions.fetchBloodPressure(1000, 0, sinceDateISODateString, nowISODateString,
                    bloodPressuresPeriodForTable === 'one_day' || bloodPressuresPeriodForTable === 'one_week' || bloodPressuresPeriodForTable === 'one_month' ? null : null
                ));
                // console.log(await bloodPressureActions.fetchBloodPressure(1000, 0, sinceDateISODateString, nowISODateString, 1));
                setBloodPressuresAvgMaxMin(await bloodPressureActions.fetchBloodPressure(1000, 0, sinceDateISODateString, nowISODateString, 1));
            } catch (err) {
                setBloodPressures([]);
                setBloodPressuresAvgMaxMin([]);
                console.log("failed to download HealthParameter items");
                setIsLoading(false);
                setError(err.message);
                if (parseInt(err.message.substring(err.message.length - n)) === "401") {
                    // dispatch(authActions.loginByRefreshToken(null));
                }
                // return;
            }
            setIsLoading(false);
            console.log("BloodPressuresAvgMaxMin");
            console.log(bloodPressuresAvgMaxMin);
        };
        downloadItems();
    }, [bloodPressuresUpdateIndicator, bloodPressuresPeriodForTable]);

    function arrAvg(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

    useEffect(() => {
        let bloodPressuresSystolicForChartTemp = [];
        let bloodPressuresDiastolicForChartTemp = [];
        let bloodPressuresPulseForChartTemp = [];
        let bloodPressuresSystolicForTable = [];
        let bloodPressuresDiastolicForTable = [];
        let bloodPressuresPulseForTable = [];
        let columnHeadings = [];
        let bloodPressuresAvgForTable = [];
        let bloodPressuresMaxForTable = [];
        let bloodPressuresMinForTable = [];
        // let sinceMoment = new Date().valueOf() - periodValueMapping(bloodPressuresPeriodForTable); // for firebase

        if (bloodPressures && bloodPressuresAvgMaxMin.length > 0) {
            bloodPressures.forEach((bloodPressure) => { // for HKU server
                if (!!bloodPressure.systolic_blood_pressure && !isNaN(bloodPressure.systolic_blood_pressure)) {
                    bloodPressuresSystolicForChartTemp.push({ x: new Date(bloodPressure.id), y: bloodPressure.systolic_blood_pressure });
                    bloodPressuresSystolicForTable.push(bloodPressure.systolic_blood_pressure);
                }
                if (!!bloodPressure.diastolic_blood_pressure && !isNaN(bloodPressure.diastolic_blood_pressure)) {
                    bloodPressuresDiastolicForChartTemp.push({ x: new Date(bloodPressure.id), y: bloodPressure.diastolic_blood_pressure });
                    bloodPressuresDiastolicForTable.push(bloodPressure.diastolic_blood_pressure);
                }
                if (!!bloodPressure.pulse && !isNaN(bloodPressure.pulse)) {
                    bloodPressuresPulseForChartTemp.push({ x: new Date(bloodPressure.id), y: bloodPressure.pulse });
                    bloodPressuresPulseForTable.push(bloodPressure.pulse);
                }
            });
            setBloodPressuresSystolicForChart(bloodPressuresSystolicForChartTemp.reverse());
            setBloodPressuresDiastolicForChart(bloodPressuresDiastolicForChartTemp.reverse());
            setBloodPressuresPulseForChart(bloodPressuresPulseForChartTemp.reverse());
            console.log("bloodPressuresSystolicForChart");
            console.log(bloodPressuresSystolicForChart);
            columnHeadings = [
                t(bloodPressuresPeriodForTable),
                t('systolic_short'),
                t('diastolic_short'),
                t('heartbeat')
            ];
            console.log('bloodPressuresAvgMaxMin[0]');
            console.log(bloodPressuresAvgMaxMin);
            console.log('bloodPressures');
            console.log(bloodPressures);
            bloodPressuresAvgForTable = [
                t('avg'),
                Math.round(bloodPressuresAvgMaxMin[0].systolic_blood_pressure),
                Math.round(bloodPressuresAvgMaxMin[0].diastolic_blood_pressure),
                Math.round(bloodPressuresAvgMaxMin[0].pulse),
            ];
            bloodPressuresMaxForTable = [
                t('max'),
                Math.round(bloodPressuresAvgMaxMin[0].max_systolic_blood_pressure),
                Math.round(bloodPressuresAvgMaxMin[0].max_diastolic_blood_pressure),
                Math.round(bloodPressuresAvgMaxMin[0].max_pulse)
            ];
            bloodPressuresMinForTable = [
                t('min'),
                Math.round(bloodPressuresAvgMaxMin[0].min_systolic_blood_pressure),
                Math.round(bloodPressuresAvgMaxMin[0].min_diastolic_blood_pressure),
                Math.round(bloodPressuresAvgMaxMin[0].min_pulse)
            ];
            setBloodPressuresForTable([
                ...columnHeadings,
                ...bloodPressuresAvgForTable,
                ...bloodPressuresMaxForTable,
                ...bloodPressuresMinForTable
            ]);

            const percent130Style = (percent) => {
                if (percent >= 75) {
                    return "green";
                } else if (percent >= 50) {
                    return "yellow";
                } else {
                    return "red";
                }
            };

            const percent160Style = (percent) => {
                if (percent === 0) {
                    return "green";
                } else if (percent < 25) {
                    return "yellow";
                } else {
                    return "red";
                }
            };

            setBloodPressuresPercent0(bloodPressuresAvgMaxMin[0].percent0);
            setBloodPressuresPercent1(bloodPressuresAvgMaxMin[0].percent1);
            setBloodPressuresPercent2(bloodPressuresAvgMaxMin[0].percent2);
            setBloodPressuresPercent3(bloodPressuresAvgMaxMin[0].percent3);
            setBloodPressuresPercent4(bloodPressuresAvgMaxMin[0].percent4);

        }
    }, [bloodPressures, bloodPressuresAvgMaxMin]);

    useEffect(() => {
        if (bloodPressures.length > 0 && bloodPressuresPeriodForTable !== 'none') {
            setShowBloodPressureCategory(true);
        } else {
            setShowBloodPressureCategory(false);
        }
    }, [bloodPressures, bloodPressuresPeriodForTable]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* BloodPressure */}
                <View style={styles.titleContainer}>
                    <View style={{ width: '100%' }}><Text style={styles.title}>{t('dashboard')}</Text></View>
                    {/* <Image source={require('../../assets/bloodPressure2.png')} style={styles.titleImage} /> */}
                </View>
                {false && <View style={styles.otherProfileBtnContainer}>
                    <MainButtonClearImage onPress={() => {
                        // setShowBloodPressureCategory((prevValue) => !prevValue)
                    }} style={styles.otherProfileCard}>
                        <View style={styles.dataContainer}>
                            <View style={{ ...styles.digitContainer, width: '27%' }}>
                                {lastBloodPressures[0] ?
                                    <Text style={{
                                        ...styles.digit,
                                        ...systolicColorStyle(lastBloodPressures[0].systolic_blood_pressure).customFontStyle
                                    }}>{lastBloodPressures[0].systolic_blood_pressure}</Text> :
                                    <Text style={styles.digit}>--</Text>
                                }
                                <Text style={styles.LowerBtnsText}>{t('systolic')}</Text>
                                <Text style={styles.unitText}>mmHg</Text>
                            </View>
                            <View style={{ ...styles.digitContainer, width: '27%' }}>
                                {lastBloodPressures[0] ?
                                    <Text style={{
                                        ...styles.digit,
                                        ...diastolicColorStyle(lastBloodPressures[0].diastolic_blood_pressure).customFontStyle
                                    }}>{lastBloodPressures[0].diastolic_blood_pressure}</Text> :
                                    <Text style={styles.digit}>--</Text>
                                }
                                <Text style={styles.LowerBtnsText}>{t('diastolic')}</Text>
                                <Text style={styles.unitText}>mmHg</Text>
                            </View>
                            <View style={{ ...styles.digitContainer, width: '27%' }}>
                                {!!lastBloodPressures[0] ?
                                    <Text style={styles.digit}>{lastBloodPressures[0].pulse}</Text> :
                                    <Text style={styles.digit}>--</Text>
                                }
                                <Text style={styles.LowerBtnsText}>{t('heartbeat')}</Text>
                                <Text style={styles.unitText}>bpm</Text>
                            </View>
                            <View style={{ ...styles.digitContainer, width: '20%' }}>
                                <Ionicons
                                    name={showBloodPressureCategory ? "chevron-down-outline" : "chevron-back-outline"}
                                    size={24}
                                    color="black"
                                />
                            </View>
                        </View>

                    </MainButtonClearImage>
                </View>}

                {bloodPressures ?
                    <View style={styles.otherProfileBtnContainer}>
                        <View style={{ width: "95%" }}>
                            <Text style={{ fontSize: FontSize.subsubtitle, textAlign: 'center', }}>{t('blood_pressure_records_since_last')}</Text>
                            <Dropdown
                                id="bloodPressureTablePeriod"
                                onItemSelected={(inputIdentifier, inputValue, inputValidity) => {
                                    setBloodPressuresPeriodForTable(inputValue);
                                }}
                                items={[
                                    { label: t('one_day'), value: 'one_day' },
                                    { label: t('one_week'), value: 'one_week' },
                                    { label: t('one_month'), value: 'one_month' },
                                    { label: t('three_months'), value: 'three_months' },
                                    { label: t('six_months'), value: 'six_months' },
                                    { label: t('one_year'), value: 'one_year' },
                                    { label: t('all'), value: 'all' },
                                ]}
                                placeholder={{
                                    label: t('please_select'),
                                    value: 'none',
                                }}
                                style={styles.picker}
                                initialValue={'one_day'}
                                initialIsValid={true}
                            />
                        </View>
                    </View>
                    : <View></View>
                }

                {showBloodPressureCategory && <View style={styles.categoryContainer}>


                    {bloodPressuresAvgMaxMin ? !!bloodPressuresAvgMaxMin[0] ?
                        <View style={styles.flatListContainer}>
                            <FlatList
                                // {...props}
                                scrollEnabled={false}
                                numColumns={4}
                                data={bloodPressuresForTable}
                                keyExtractor={item => item}
                                renderItem={itemData =>
                                    [5, 6, 7, 9, 10, 11, 13, 14, 15].includes(itemData.index) ?
                                        [5, 9, 13].includes(itemData.index) ?
                                            <MainButtonClear
                                                style={styles.flatListItem}
                                                buttonStyle={styles.button}
                                                buttonText={{
                                                    ...systolicColorStyle(itemData.item).customFontStyle,
                                                    ...styles.tableText
                                                }}
                                                onPress={() => { }}>
                                                {itemData.item}
                                            </MainButtonClear>
                                            :
                                            [6, 10, 14].includes(itemData.index) ?
                                                <MainButtonClear
                                                    style={styles.flatListItem}
                                                    buttonStyle={styles.button}
                                                    buttonText={{
                                                        ...diastolicColorStyle(itemData.item).customFontStyle,
                                                        ...styles.tableText
                                                    }}
                                                    onPress={() => { }}>
                                                    {itemData.item}
                                                </MainButtonClear>
                                                :
                                                <MainButtonClear style={styles.flatListItem} buttonStyle={styles.button} buttonText={styles.tableText} onPress={() => {
                                                }}>
                                                    {itemData.item}
                                                </MainButtonClear>
                                        :
                                        <MainButtonClear style={styles.flatListItemClear} buttonStyle={styles.button} buttonText={styles.tableTitleText} onPress={() => {
                                        }}>
                                            {itemData.item}
                                        </MainButtonClear>
                                }
                            />
                        </View>
                        : <View></View>
                        : <View></View>
                    }

                    {bloodPressures ? !!bloodPressures[1] ? !!bloodPressuresSystolicForChart[1] || !!bloodPressuresDiastolicForChart[1] ?
                        <VictoryChart
                            theme={VictoryTheme.material}
                            scale={{ x: "time" }}
                            maxDomain={{ y: 250 }}
                            minDomain={{ y: 0 }}
                        // containerComponent={
                        //     <VictoryZoomContainer
                        //         zoomDimension="x"
                        //     />
                        // }
                        >
                            {!!bloodPressuresSystolicForChart[1] && !!bloodPressuresDiastolicForChart[1] ?
                                <ChartAxis crossAxis
                                    minValue={Math.min(bloodPressuresSystolicForChart[0].x.valueOf(), bloodPressuresDiastolicForChart[0].x.valueOf())}
                                    maxValue={Math.max(bloodPressuresSystolicForChart[bloodPressuresSystolicForChart.length - 1].x.valueOf(), bloodPressuresDiastolicForChart[bloodPressuresDiastolicForChart.length - 1].x.valueOf())}
                                />
                                : !!bloodPressuresSystolicForChart[1] ?
                                    <ChartAxis crossAxis
                                        minValue={bloodPressuresSystolicForChart[0].x.valueOf()}
                                        maxValue={bloodPressuresSystolicForChart[bloodPressuresSystolicForChart.length - 1].x.valueOf()}
                                    /> : !!bloodPressuresDiastolicForChart[1] && <ChartAxis crossAxis
                                        minValue={bloodPressuresDiastolicForChart[0].x.valueOf()}
                                        maxValue={bloodPressuresDiastolicForChart[bloodPressuresDiastolicForChart.length - 1].x.valueOf()}
                                    />
                            }
                            <VictoryAxis dependentAxis />
                            <VictoryLegend x={100} y={0}
                                borderPadding={{ right: 25 }}
                                orientation="vertical"
                                gutter={20}
                                style={{ border: { stroke: "black" }, labels: { fontSize: FontSize.veryvarySmallContent } }}
                                data={[
                                    { name: (t('systolic_blood_pressure') + ' (mmHg)'), symbol: { fill: "red" } },
                                    { name: (t('diastolic_blood_pressure') + ' (mmHg)'), symbol: { fill: "blue" } },
                                ]}
                            />
                            {!!bloodPressuresSystolicForChart[1] && <VictoryLine
                                style={{
                                    data: { stroke: "red" },
                                    parent: { border: "1px solid #ccc" }
                                }}
                                data={bloodPressuresSystolicForChart}
                            />}
                            {!!bloodPressuresSystolicForChart[1] && <VictoryScatter
                                data={bloodPressuresSystolicForChart}
                                style={{ data: { fill: "red" } }}
                            />}
                            {!!bloodPressuresDiastolicForChart[1] && <VictoryLine
                                style={{
                                    data: { stroke: "blue" },
                                    parent: { border: "1px solid #ccc" }
                                }}
                                data={bloodPressuresDiastolicForChart}
                            />}
                            {!!bloodPressuresDiastolicForChart[1] && <VictoryScatter
                                data={bloodPressuresDiastolicForChart}
                                style={{ data: { fill: "blue" } }}
                            />}
                        </VictoryChart>
                        : <View></View>
                        : <View></View>
                        : <View></View>
                    }

                    {bloodPressures ? !!bloodPressures[1] ? !!bloodPressuresPulseForChart[1] ?
                        <VictoryChart
                            theme={VictoryTheme.material}
                            scale={{ x: "time" }}
                            maxDomain={{ y: 210 }}
                            minDomain={{ y: 0 }}
                        // containerComponent={
                        //     <VictoryZoomContainer
                        //         zoomDimension="x"
                        //     />
                        // }
                        >
                            <ChartAxis crossAxis
                                minValue={bloodPressuresPulseForChart[0].x.valueOf()}
                                maxValue={bloodPressuresPulseForChart[bloodPressuresPulseForChart.length - 1].x.valueOf()}
                            />
                            <VictoryAxis dependentAxis />
                            <VictoryLegend x={125} y={0}
                                borderPadding={{ right: 25 }}
                                orientation="vertical"
                                gutter={20}
                                style={{ border: { stroke: "black" }, labels: { fontSize: FontSize.smallContent } }}
                                data={[
                                    { name: (t('heartbeat') + ' (bpm)'), symbol: { fill: "red" } },
                                ]}
                            />
                            <VictoryLine
                                style={{
                                    data: { stroke: "#c43a31" },
                                    parent: { border: "1px solid #ccc" }
                                }}
                                data={bloodPressuresPulseForChart}
                            />
                            <VictoryScatter
                                data={bloodPressuresPulseForChart}
                                style={{ data: { fill: "red" } }}
                            />
                        </VictoryChart>
                        : <View></View>
                        : <View></View>
                        : <View></View>
                    }

                    <View style={{ ...styles.bloodPressureRangeTable, backgroundColor: Colors.lightGrey }}>
                        <View style={{ ...styles.bloodPressureRangeTableTitleContainer, backgroundColor: Colors.blur }}>
                            <View style={{ ...styles.bloodPressureRangeTableTitleTextContainer, backgroundColor: Colors.blur }}>
                                <Text style={{ ...styles.bloodPressureRangeTableTitleText }}>{t('systolic')}</Text>
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', height: 30, width: '50%', backgroundColor: Colors.blur }}>
                                <Text style={{ ...styles.bloodPressureRangeTableTitleText }}>{t('diastolic')}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.bloodPressureRangeTableRowContainer, backgroundColor: Colors.green }}>
                            <View style={{ ...styles.bloodPressureRangeTableRowDescContainer, backgroundColor: Colors.green }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.green }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('less_than_120')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, width: '20%', backgroundColor: Colors.green }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('and')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.green }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('less_than_80')}</Text>
                                </View>
                            </View>
                            <View style={{ ...styles.bloodPressureRangeTableRowContentContainer, backgroundColor: Colors.green }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentTextContainer, backgroundColor: Colors.green }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentText }}>{t('normal')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentDigitContainer, backgroundColor: Colors.green }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentDigit }}>{bloodPressuresPercent0}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ ...styles.bloodPressureRangeTableRowContainer, backgroundColor: Colors.yellow }}>
                            <View style={{ ...styles.bloodPressureRangeTableRowDescContainer, backgroundColor: Colors.yellow }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.yellow }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('m120_129')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, width: '20%', backgroundColor: Colors.yellow }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('and')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.yellow }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('less_than_80')}</Text>
                                </View>
                            </View>
                            <View style={{ ...styles.bloodPressureRangeTableRowContentContainer, backgroundColor: Colors.yellow }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentTextContainer, backgroundColor: Colors.yellow }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentText }}>{t('elevated')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentDigitContainer, backgroundColor: Colors.yellow }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentDigit }}>{bloodPressuresPercent1}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ ...styles.bloodPressureRangeTableRowContainer, backgroundColor: Colors.orange }}>
                            <View style={{ ...styles.bloodPressureRangeTableRowDescContainer, backgroundColor: Colors.orange }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.orange }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('m130_139')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, width: '20%', backgroundColor: Colors.orange }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('or')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.orange }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText }}>{t('m80_89')}</Text>
                                </View>
                            </View>
                            <View style={{ ...styles.bloodPressureRangeTableRowContentContainer, backgroundColor: Colors.orange }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentTextContainer, backgroundColor: Colors.orange }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentText }}>{t('high_blood_pressure_stage_1')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentDigitContainer, backgroundColor: Colors.orange }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentDigit }}>{bloodPressuresPercent2}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ ...styles.bloodPressureRangeTableRowContainer, backgroundColor: Colors.salmon }}>
                            <View style={{ ...styles.bloodPressureRangeTableRowDescContainer, backgroundColor: Colors.salmon }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.salmon }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText, color: 'white' }}>{t('m140_or_higher')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, width: '20%', backgroundColor: Colors.salmon }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText, color: 'white' }}>{t('or')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.salmon }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText, color: 'white' }}>{t('m90_or_higher')}</Text>
                                </View>
                            </View>
                            <View style={{ ...styles.bloodPressureRangeTableRowContentContainer, backgroundColor: Colors.salmon }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentTextContainer, backgroundColor: Colors.salmon }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentText, color: 'white' }}>{t('high_blood_pressure_stage_2')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentDigitContainer, backgroundColor: Colors.salmon }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentDigit, color: 'white' }}>{bloodPressuresPercent3}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ ...styles.bloodPressureRangeTableRowContainer, backgroundColor: Colors.red }}>
                            <View style={{ ...styles.bloodPressureRangeTableRowDescContainer, backgroundColor: Colors.red }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.red }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText, color: 'white' }}>{t('higher_than_180')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, width: '20%', backgroundColor: Colors.red }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText, color: 'white' }}>{t('and_or')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowDescTextContainer, backgroundColor: Colors.red }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowDescText, color: 'white' }}>{t('higher_than_120')}</Text>
                                </View>
                            </View>
                            <View style={{ ...styles.bloodPressureRangeTableRowContentContainer, backgroundColor: Colors.red }}>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentTextContainer, backgroundColor: Colors.red }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentText, color: 'white' }}>{t('hypertensive_crisis')}</Text>
                                </View>
                                <View style={{ ...styles.bloodPressureRangeTableRowContentDigitContainer, backgroundColor: Colors.red }}>
                                    <Text style={{ ...styles.bloodPressureRangeTableRowContentDigit, color: 'white' }}>{bloodPressuresPercent4}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <MainButtonClear onPress={() => {
                        Linking.openURL("https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings");
                    }}>
                        {t('heart_org_button')}
                    </MainButtonClear>
                </View>}

                <View style={styles.footer}></View>
                {!!isLoading &&
                    <ActivityIndicatorWithModal />
                }
                {/* </View> */}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        // paddingTop: Platform.OS === 'ios' ? 40 : 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 200,
    },
    container: {
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'ios' ? 0 : 30,
    },
    categoryContainer: {
        width: '100%',
    },
    titleContainer: {
        height: 40,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    title: {
        fontSize: FontSize.subsubsubtitle,
        textAlign: 'center',
    },
    titleImage: {
        maxHeight: '100%',
        resizeMode: 'contain',
    },
    titleText: {
        fontSize: FontSize.subtitle,
        paddingHorizontal: '5%',
    },
    otherProfileBtnContainer: {
        width: '100%',
        height: 120,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otherProfileCard: {
        height: 100,
        width: '90%',
        marginBottom: 0,
        backgroundColor: 'white',
        overflow: 'visible',
        borderColor: Colors.lightGrey,
        marginVertical: 15,
    },
    anotherDataContainer: {
        width: '100%',
        height: '20%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    dataContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    anotherDigitContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    digitContainer: {
        width: '27%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    digit: {
        width: '100%',
        fontSize: FontSize.title,
        color: Colors.grey,
        textAlign: 'center'
    },
    anotherDigit: {
        width: '50%',
        fontSize: FontSize.bigTitle,
        color: Colors.grey,
        textAlign: 'center'
    },
    anotherLowerBtnsText: {
        width: '50%',
        fontSize: FontSize.smallContent,
        color: Colors.grey,
        textAlign: 'center'
    },
    lowerBtnsItemsContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    LowerBtnsText: {
        width: '100%',
        fontSize: FontSize.button,
        color: Colors.grey,
        textAlign: 'center'
    },
    otherProfileBtn: {
        paddingHorizontal: 10,
        marginHorizontal: 0,
        paddingVertical: 2,
    },
    footer: {
        height: 40,
    },
    flatListContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 180,
    },
    flatListItem: {
        margin: "1%",
        minHeight: 50,
        width: screenWidth * 0.20,
    },
    flatListItemClear: {
        margin: "1%",
        minHeight: 50,
        width: screenWidth * 0.20,
    },
    flatListItem5: {
        margin: "1%",
        minHeight: 50,
        width: screenWidth * 0.16,
    },
    flatListItemClear5: {
        margin: "1%",
        minHeight: 50,
        width: screenWidth * 0.16,
    },
    button: {
        minHeight: 50,
        paddingHorizontal: 0,
    },
    tableText: {
        fontSize: FontSize.title,
    },
    tableTitleText: {
        fontSize: FontSize.smallButton,
    },
    bloodPressureRangeTable: {
        alignItems: 'center', width: '100%', marginTop: 30
    },
    bloodPressureRangeTableTitleContainer: {
        alignItems: 'center', height: 100, width: '100%', flexDirection: 'row'
    },
    bloodPressureRangeTableTitleTextContainer: {
        justifyContent: 'center', alignItems: 'center', height: 30, width: '50%'
    },
    bloodPressureRangeTableTitleText: {
        fontSize: FontSize.smallContent
    },
    bloodPressureRangeTableRowContainer: {
        alignItems: 'center', height: 120, width: '100%'
    },
    bloodPressureRangeTableRowDescContainer: {
        alignItems: 'center', height: 30, width: '100%', flexDirection: 'row'
    },
    bloodPressureRangeTableRowDescTextContainer: {
        justifyContent: 'center', alignItems: 'center', height: 30, width: '40%'
    },
    bloodPressureRangeTableRowDescText: {
        fontSize: FontSize.smallContent
    },
    bloodPressureRangeTableRowContentContainer: {
        justifyContent: 'center', alignItems: 'center', height: 70, width: '100%', flexDirection: 'row'
    },
    bloodPressureRangeTableRowContentTextContainer: {
        justifyContent: 'center', alignItems: 'flex-end', height: 60, width: '50%'
    },
    bloodPressureRangeTableRowContentText: {
        fontSize: FontSize.varySmallContent, textAlign: 'right'
    },
    bloodPressureRangeTableRowContentDigitContainer: {
        justifyContent: 'center', alignItems: 'center', height: 45, width: '50%'
    },
    bloodPressureRangeTableRowContentDigit: {
        fontSize: FontSize.title
    },
});

export default DashboardScreen;