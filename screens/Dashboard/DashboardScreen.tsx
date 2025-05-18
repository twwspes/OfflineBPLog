import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleProp,
  TextStyle,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
  VictoryLegend,
  VictoryBoxPlot,
  VictoryScatter,
} from 'victory-native';

import { useLocalisation } from 'hooks/useLocalisation';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabsParamList } from 'types/navigation';
import { useAppSelector } from 'hooks/useRedux';
import {
  BloodPressureGeneralType,
  BloodPressureTypeForStatistics,
} from 'helpers/dbBloodPressure';
import * as bloodPressureActions from '../../store/actions/bloodPressure';
import { MainButtonClear } from '../../components/UI/MainButtonClear';
import { ChartAxis } from '../../components/Charts/ChartAxis';
import {
  systolicColorStyle,
  diastolicColorStyle,
} from '../../constants/TrafficLightStyles';
import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';
import { SingleChoice } from '../../components/MultipleChoice/DropdownList';

interface ChartType {
  x: Date;
  y: number;
}

interface ChartAggregateType {
  x: Date;
  min: number;
  median: number;
  max: number;
  q1: number;
  q3: number;
}

type TableType = string[];

const screenWidth = Math.round(Dimensions.get('window').width);

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
    textAlign: 'center',
  },
  anotherDigit: {
    width: '50%',
    fontSize: FontSize.bigTitle,
    color: Colors.grey,
    textAlign: 'center',
  },
  anotherLowerBtnsText: {
    width: '50%',
    fontSize: FontSize.smallContent,
    color: Colors.grey,
    textAlign: 'center',
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
    textAlign: 'center',
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
    margin: '1%',
    minHeight: 50,
    width: screenWidth * 0.2,
  },
  flatListItemClear: {
    margin: '1%',
    minHeight: 50,
    width: screenWidth * 0.2,
  },
  flatListItem5: {
    margin: '1%',
    minHeight: 50,
    width: screenWidth * 0.16,
  },
  flatListItemClear5: {
    margin: '1%',
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
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },
  bloodPressureRangeTableTitleContainer: {
    alignItems: 'center',
    height: 100,
    width: '100%',
    flexDirection: 'row',
  },
  bloodPressureRangeTableTitleTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: '50%',
  },
  bloodPressureRangeTableTitleText: {
    fontSize: FontSize.smallContent,
  },
  bloodPressureRangeTableRowContainer: {
    alignItems: 'center',
    height: 120,
    width: '100%',
  },
  bloodPressureRangeTableRowDescContainer: {
    alignItems: 'center',
    height: 30,
    width: '100%',
    flexDirection: 'row',
  },
  bloodPressureRangeTableRowDescTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: '40%',
  },
  bloodPressureRangeTableRowDescText: {
    fontSize: FontSize.smallContent,
  },
  bloodPressureRangeTableRowContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: '100%',
    flexDirection: 'row',
  },
  bloodPressureRangeTableRowContentTextContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 60,
    width: '50%',
  },
  bloodPressureRangeTableRowContentText: {
    fontSize: FontSize.varySmallContent,
    textAlign: 'right',
  },
  bloodPressureRangeTableRowContentDigitContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: '50%',
  },
  bloodPressureRangeTableRowContentDigit: {
    fontSize: FontSize.title,
  },
  indicatorContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordText: {
    // backgroundColor: 'yellow',
    textAlign: 'center',
    fontSize: FontSize.content,
  },
});

const periodToValue: Record<string, number | null> = {
  one_day: null,
  one_week: 7,
  one_month: 4,
  three_months: 3,
  six_months: 6,
  one_year: 12,
};

type Props = BottomTabScreenProps<BottomTabsParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale2 } = useLocalisation();
  const [bloodPressures, setBloodPressures] = useState<
    BloodPressureGeneralType | undefined
  >();
  const [showBloodPressureCategory, setShowBloodPressureCategory] =
    useState(false);
  const bloodPressuresUpdateIndicator = useAppSelector(
    (state) => state.bloodPressure.update,
  );
  const [bloodPressuresSystolicForChart, setBloodPressuresSystolicForChart] =
    useState<ChartType[]>([]);
  const [bloodPressuresDiastolicForChart, setBloodPressuresDiastolicForChart] =
    useState<ChartType[]>([]);
  const [bloodPressuresPulseForChart, setBloodPressuresPulseForChart] =
    useState<ChartType[]>([]);
  const [
    bloodPressuresSystolicMinMaxForChart,
    setBloodPressuresSystolicMinMaxForChart,
  ] = useState<ChartAggregateType[]>([]);
  const [
    bloodPressuresDiastolicMinMaxForChart,
    setBloodPressuresDiastolicMinMaxForChart,
  ] = useState<ChartAggregateType[]>([]);
  const [
    bloodPressuresPulseMinMaxForChart,
    setBloodPressuresPulseMinMaxForChart,
  ] = useState<ChartAggregateType[]>([]);
  const [bloodPressuresAvgMaxMin, setBloodPressuresAvgMaxMin] = useState<
    BloodPressureTypeForStatistics[]
  >([]);
  const [bloodPressuresForTable, setBloodPressuresForTable] =
    useState<TableType>([]);
  const [bloodPressuresPeriodForTable, setBloodPressuresPeriodForTable] =
    useState('one_day');
  const [bloodPressuresPercent0, setBloodPressuresPercent0] =
    useState<number>(0);
  const [bloodPressuresPercent1, setBloodPressuresPercent1] =
    useState<number>(0);
  const [bloodPressuresPercent2, setBloodPressuresPercent2] =
    useState<number>(0);
  const [bloodPressuresPercent3, setBloodPressuresPercent3] =
    useState<number>(0);
  const [bloodPressuresPercent4, setBloodPressuresPercent4] =
    useState<number>(0);
  moment.locale(locale2);

  function periodValueMapping(period: string) {
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
        return 1000 * 60 * 60 * 24;
    }
  }

  useEffect(() => {
    if (error) {
      Alert.alert(t('error_occur'), error, [
        { text: t('okay'), onPress: () => setError(null) },
      ]);
    }
  }, [error, t]);

  // Grab data from source
  useEffect(() => {
    const downloadItems = async () => {
      setError(null);
      // console.log("setIsLoading true");
      setIsLoading(true);

      const date = new Date();
      const nowISODateString = date.toISOString();
      const sinceMoment =
        new Date().valueOf() - periodValueMapping(bloodPressuresPeriodForTable);
      let sinceDate = new Date(sinceMoment);
      if (bloodPressuresPeriodForTable === 'all') {
        sinceDate = new Date(0);
      }
      const sinceDateISODateString = sinceDate.toISOString();
      try {
        setBloodPressures(
          await bloodPressureActions.fetchBloodPressureForChart(
            5000,
            0,
            sinceDateISODateString,
            nowISODateString,
            periodToValue[bloodPressuresPeriodForTable] ?? 12,
          ),
        );
        // const testingResult = await bloodPressureActions.fetchBloodPressure(5000, 0, sinceDateISODateString, nowISODateString, 20);
        // console.log("testingResult");
        // console.log(testingResult);
        setBloodPressuresAvgMaxMin(
          await bloodPressureActions.fetchBloodPressureForStatistics(
            5000,
            0,
            sinceDateISODateString,
            nowISODateString,
          ),
        );
      } catch (err: unknown) {
        setBloodPressures(undefined);
        setBloodPressuresAvgMaxMin([]);
        setIsLoading(false);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('error_occur'));
        }
        // return;
      }
      setIsLoading(false);
    };
    void downloadItems();
  }, [bloodPressuresUpdateIndicator, bloodPressuresPeriodForTable, t]);

  useEffect(() => {
    const bloodPressuresSystolicForChartTemp: ChartType[] = [];
    const bloodPressuresDiastolicForChartTemp: ChartType[] = [];
    const bloodPressuresPulseForChartTemp: ChartType[] = [];
    const bloodPressuresSystolicMinMaxForChartTemp: ChartAggregateType[] = [];
    const bloodPressuresDiastolicMinMaxForChartTemp: ChartAggregateType[] = [];
    const bloodPressuresPulseMinMaxForChartTemp: ChartAggregateType[] = [];
    const bloodPressuresSystolicForTable: number[] = [];
    const bloodPressuresDiastolicForTable: number[] = [];
    const bloodPressuresPulseForTable: number[] = [];
    let columnHeadings = [];
    let bloodPressuresAvgForTable = [];
    let bloodPressuresMaxForTable = [];
    let bloodPressuresMinForTable = [];
    // let sinceMoment = new Date().valueOf() - periodValueMapping(bloodPressuresPeriodForTable); // for firebase

    if (bloodPressures && bloodPressuresAvgMaxMin.length > 0) {
      if (bloodPressures.typename === 'BloodPressureTypeForAggregatedResult') {
        bloodPressures.array.forEach((bloodPressure) => {
          bloodPressuresSystolicMinMaxForChartTemp.push({
            x: new Date(bloodPressure.id),
            min: Math.round(bloodPressure.min_systolic_blood_pressure),
            median: Math.round(bloodPressure.systolic_blood_pressure),
            max: Math.round(bloodPressure.max_systolic_blood_pressure),
            q1: Math.round(
              bloodPressure.systolic_blood_pressure -
                (Math.sqrt(3) * bloodPressure.systolic_sd) / 2,
            ),
            q3: Math.round(
              bloodPressure.systolic_blood_pressure +
                (Math.sqrt(3) * bloodPressure.systolic_sd) / 2,
            ),
          });
          bloodPressuresDiastolicMinMaxForChartTemp.push({
            x: new Date(bloodPressure.id),
            min: Math.round(bloodPressure.min_diastolic_blood_pressure),
            median: Math.round(bloodPressure.diastolic_blood_pressure),
            max: Math.round(bloodPressure.max_diastolic_blood_pressure),
            q1: Math.round(
              bloodPressure.diastolic_blood_pressure -
                (Math.sqrt(3) * bloodPressure.diastolic_sd) / 2,
            ),
            q3: Math.round(
              bloodPressure.diastolic_blood_pressure +
                (Math.sqrt(3) * bloodPressure.diastolic_sd) / 2,
            ),
          });
          bloodPressuresPulseMinMaxForChartTemp.push({
            x: new Date(bloodPressure.id),
            min: Math.round(bloodPressure.min_pulse),
            median: Math.round(bloodPressure.pulse),
            max: Math.round(bloodPressure.max_pulse),
            q1: Math.round(
              bloodPressure.pulse - (Math.sqrt(3) * bloodPressure.pulse_sd) / 2,
            ),
            q3: Math.round(
              bloodPressure.pulse + (Math.sqrt(3) * bloodPressure.pulse_sd) / 2,
            ),
          });
        });
      }
      bloodPressures.array.forEach((bloodPressure) => {
        if (
          !!bloodPressure.systolic_blood_pressure &&
          !Number.isNaN(bloodPressure.systolic_blood_pressure)
        ) {
          bloodPressuresSystolicForChartTemp.push({
            x: new Date(bloodPressure.id),
            y: bloodPressure.systolic_blood_pressure,
          });
          bloodPressuresSystolicForTable.push(
            bloodPressure.systolic_blood_pressure,
          );
        }
        if (
          !!bloodPressure.diastolic_blood_pressure &&
          !Number.isNaN(bloodPressure.diastolic_blood_pressure)
        ) {
          bloodPressuresDiastolicForChartTemp.push({
            x: new Date(bloodPressure.id),
            y: bloodPressure.diastolic_blood_pressure,
          });
          bloodPressuresDiastolicForTable.push(
            bloodPressure.diastolic_blood_pressure,
          );
        }
        if (!!bloodPressure.pulse && !Number.isNaN(bloodPressure.pulse)) {
          bloodPressuresPulseForChartTemp.push({
            x: new Date(bloodPressure.id),
            y: bloodPressure.pulse,
          });
          bloodPressuresPulseForTable.push(bloodPressure.pulse);
        }
      });
      setBloodPressuresSystolicForChart(
        bloodPressuresSystolicForChartTemp.reverse(),
      );
      setBloodPressuresDiastolicForChart(
        bloodPressuresDiastolicForChartTemp.reverse(),
      );
      setBloodPressuresPulseForChart(bloodPressuresPulseForChartTemp.reverse());
      setBloodPressuresSystolicMinMaxForChart(
        bloodPressuresSystolicMinMaxForChartTemp.reverse(),
      );
      setBloodPressuresDiastolicMinMaxForChart(
        bloodPressuresDiastolicMinMaxForChartTemp.reverse(),
      );
      setBloodPressuresPulseMinMaxForChart(
        bloodPressuresPulseMinMaxForChartTemp.reverse(),
      );
      columnHeadings = [
        t(bloodPressuresPeriodForTable),
        t('systolic_short'),
        t('diastolic_short'),
        t('heartbeat'),
      ];
      bloodPressuresAvgForTable = [
        t('avg'),
        Math.round(
          bloodPressuresAvgMaxMin[0].systolic_blood_pressure,
        ).toString(),
        Math.round(
          bloodPressuresAvgMaxMin[0].diastolic_blood_pressure,
        ).toString(),
        Math.round(bloodPressuresAvgMaxMin[0].pulse).toString(),
      ];
      bloodPressuresMaxForTable = [
        t('max'),
        Math.round(
          bloodPressuresAvgMaxMin[0].max_systolic_blood_pressure,
        ).toString(),
        Math.round(
          bloodPressuresAvgMaxMin[0].max_diastolic_blood_pressure,
        ).toString(),
        Math.round(bloodPressuresAvgMaxMin[0].max_pulse).toString(),
      ];
      bloodPressuresMinForTable = [
        t('min'),
        Math.round(
          bloodPressuresAvgMaxMin[0].min_systolic_blood_pressure,
        ).toString(),
        Math.round(
          bloodPressuresAvgMaxMin[0].min_diastolic_blood_pressure,
        ).toString(),
        Math.round(bloodPressuresAvgMaxMin[0].min_pulse).toString(),
      ];
      setBloodPressuresForTable([
        ...columnHeadings,
        ...bloodPressuresAvgForTable,
        ...bloodPressuresMaxForTable,
        ...bloodPressuresMinForTable,
      ]);

      setBloodPressuresPercent0(bloodPressuresAvgMaxMin[0].percent0);
      setBloodPressuresPercent1(bloodPressuresAvgMaxMin[0].percent1);
      setBloodPressuresPercent2(bloodPressuresAvgMaxMin[0].percent2);
      setBloodPressuresPercent3(bloodPressuresAvgMaxMin[0].percent3);
      setBloodPressuresPercent4(bloodPressuresAvgMaxMin[0].percent4);
    }
  }, [
    bloodPressures,
    bloodPressuresAvgMaxMin,
    bloodPressuresPeriodForTable,
    t,
  ]);

  useEffect(() => {
    if (bloodPressures && bloodPressuresPeriodForTable !== 'none') {
      setShowBloodPressureCategory(true);
    } else {
      setShowBloodPressureCategory(false);
    }
  }, [bloodPressures, bloodPressuresPeriodForTable]);

  const shouldRenderSystolicChart =
    bloodPressures !== undefined &&
    bloodPressures.array.length > 0 &&
    (bloodPressuresSystolicForChart.length > 0 ||
      bloodPressuresDiastolicForChart.length > 0);

  const hasDiastolicMinMax = !!bloodPressuresDiastolicMinMaxForChart[1];

  const renderSystolicChart = useMemo(() => {
    if (!shouldRenderSystolicChart) return null;

    const maxSysY = bloodPressuresAvgMaxMin[0].max_systolic_blood_pressure + 10;
    const minDiaY =
      bloodPressuresAvgMaxMin[0].min_diastolic_blood_pressure - 10;

    const renderAxis = () => {
      if (
        bloodPressuresSystolicForChart[1] &&
        bloodPressuresDiastolicForChart[1]
      ) {
        return (
          <ChartAxis
            crossAxis
            minValue={Math.min(
              bloodPressuresSystolicForChart[0].x.valueOf(),
              bloodPressuresDiastolicForChart[0].x.valueOf(),
            )}
            maxValue={Math.max(
              bloodPressuresSystolicForChart[
                bloodPressuresSystolicForChart.length - 1
              ].x.valueOf(),
              bloodPressuresDiastolicForChart[
                bloodPressuresDiastolicForChart.length - 1
              ].x.valueOf(),
            )}
          />
        );
      }
      if (bloodPressuresSystolicForChart[1]) {
        return (
          <ChartAxis
            crossAxis
            minValue={bloodPressuresSystolicForChart[0].x.valueOf()}
            maxValue={bloodPressuresSystolicForChart[
              bloodPressuresSystolicForChart.length - 1
            ].x.valueOf()}
          />
        );
      }
      if (bloodPressuresDiastolicForChart[1]) {
        return (
          <ChartAxis
            crossAxis
            minValue={bloodPressuresDiastolicForChart[0].x.valueOf()}
            maxValue={bloodPressuresDiastolicForChart[
              bloodPressuresDiastolicForChart.length - 1
            ].x.valueOf()}
          />
        );
      }
      return null;
    };

    return (
      <View>
        <VictoryChart
          theme={VictoryTheme.material}
          scale={{ x: 'time' }}
          maxDomain={{ y: maxSysY }}
          minDomain={{ y: minDiaY }}
          domainPadding={10}
        >
          {renderAxis()}
          <VictoryAxis dependentAxis />
          <VictoryLegend
            x={100}
            y={0}
            borderPadding={{ right: 25 }}
            orientation="vertical"
            gutter={20}
            style={{
              border: { stroke: 'black' },
              labels: { fontSize: FontSize.veryvarySmallContent },
            }}
            data={
              bloodPressuresSystolicMinMaxForChart[1]
                ? [
                    {
                      name: `${t('systolic_blood_pressure')} (mmHg)`,
                      symbol: { fill: 'red' },
                    },
                    {
                      name: t('min_q1_mean_q3_max'),
                      symbol: { fill: 'grey' },
                    },
                  ]
                : [
                    {
                      name: `${t('systolic_blood_pressure')} (mmHg)`,
                      symbol: { fill: 'red' },
                    },
                    {
                      name: `${t('diastolic_blood_pressure')} (mmHg)`,
                      symbol: { fill: 'blue' },
                    },
                  ]
            }
          />
          {!!bloodPressuresSystolicMinMaxForChart[1] && (
            <VictoryBoxPlot
              data={bloodPressuresSystolicMinMaxForChart}
              boxWidth={10}
              whiskerWidth={5}
            />
          )}
          {!!bloodPressuresSystolicForChart[1] && (
            <VictoryLine
              style={{
                data: { stroke: 'red' },
                parent: { border: '1px solid #ccc' },
              }}
              data={bloodPressuresSystolicForChart}
            />
          )}
          {!!bloodPressuresSystolicForChart[1] && (
            <VictoryScatter
              data={bloodPressuresSystolicForChart}
              style={{ data: { fill: 'red' } }}
            />
          )}
          {!!bloodPressuresDiastolicForChart[1] && !hasDiastolicMinMax && (
            <VictoryLine
              style={{
                data: { stroke: 'blue' },
                parent: { border: '1px solid #ccc' },
              }}
              data={bloodPressuresDiastolicForChart}
            />
          )}
          {!!bloodPressuresDiastolicForChart[1] && !hasDiastolicMinMax && (
            <VictoryScatter
              data={bloodPressuresDiastolicForChart}
              style={{ data: { fill: 'blue' } }}
            />
          )}
        </VictoryChart>

        {hasDiastolicMinMax && (
          <VictoryChart
            theme={VictoryTheme.material}
            scale={{ x: 'time' }}
            maxDomain={{
              y: bloodPressuresAvgMaxMin[0].max_diastolic_blood_pressure + 10,
            }}
            minDomain={{
              y: bloodPressuresAvgMaxMin[0].min_diastolic_blood_pressure - 10,
            }}
            domainPadding={10}
          >
            {renderAxis()}
            <VictoryAxis dependentAxis />
            <VictoryLegend
              x={100}
              y={0}
              borderPadding={{ right: 25 }}
              orientation="vertical"
              gutter={20}
              style={{
                border: { stroke: 'black' },
                labels: { fontSize: FontSize.veryvarySmallContent },
              }}
              data={[
                {
                  name: `${t('diastolic_blood_pressure')} (mmHg)`,
                  symbol: { fill: 'blue' },
                },
                {
                  name: t('min_q1_mean_q3_max'),
                  symbol: { fill: 'grey' },
                },
              ]}
            />
            {!!bloodPressuresDiastolicMinMaxForChart[1] && (
              <VictoryBoxPlot
                data={bloodPressuresDiastolicMinMaxForChart}
                boxWidth={10}
                whiskerWidth={5}
              />
            )}
            {!!bloodPressuresDiastolicForChart[1] && (
              <VictoryLine
                style={{
                  data: { stroke: 'blue' },
                  parent: { border: '1px solid #ccc' },
                }}
                data={bloodPressuresDiastolicForChart}
              />
            )}
            {!!bloodPressuresDiastolicForChart[1] && (
              <VictoryScatter
                data={bloodPressuresDiastolicForChart}
                style={{ data: { fill: 'blue' } }}
              />
            )}
          </VictoryChart>
        )}
      </View>
    );
  }, [
    bloodPressuresAvgMaxMin,
    bloodPressuresDiastolicForChart,
    bloodPressuresDiastolicMinMaxForChart,
    bloodPressuresSystolicForChart,
    bloodPressuresSystolicMinMaxForChart,
    hasDiastolicMinMax,
    shouldRenderSystolicChart,
    t,
  ]);

  const renderPulseChart = useMemo(() => {
    const hasPulseData =
      bloodPressures &&
      bloodPressures.array.length > 1 &&
      bloodPressuresPulseForChart.length > 1;

    if (!hasPulseData) return null;

    const hasPulseMinMax = bloodPressuresPulseMinMaxForChart.length > 1;

    const minValue = bloodPressuresPulseForChart[0].x.valueOf();
    const maxValue =
      bloodPressuresPulseForChart[
        bloodPressuresPulseForChart.length - 1
      ].x.valueOf();

    const minY = bloodPressuresAvgMaxMin[0].min_pulse - 10;
    const maxY = bloodPressuresAvgMaxMin[0].max_pulse + 10;

    return (
      <VictoryChart
        theme={VictoryTheme.material}
        scale={{ x: 'time' }}
        maxDomain={{ y: maxY }}
        minDomain={{ y: minY }}
        domainPadding={10}
      >
        <ChartAxis crossAxis minValue={minValue} maxValue={maxValue} />
        <VictoryAxis dependentAxis />
        <VictoryLegend
          x={125}
          y={0}
          borderPadding={{ right: 25 }}
          orientation="vertical"
          gutter={20}
          style={{
            border: { stroke: 'black' },
            labels: { fontSize: FontSize.veryvarySmallContent },
          }}
          data={[
            {
              name: `${t('heartbeat')} (bpm)`,
              symbol: { fill: 'red' },
            },
            ...(hasPulseMinMax
              ? [{ name: t('min_q1_mean_q3_max'), symbol: { fill: 'grey' } }]
              : []),
          ]}
        />
        {hasPulseMinMax && (
          <VictoryBoxPlot
            data={bloodPressuresPulseMinMaxForChart}
            boxWidth={10}
            whiskerWidth={5}
          />
        )}
        <VictoryLine
          style={{
            data: { stroke: '#c43a31' },
            parent: { border: '1px solid #ccc' },
          }}
          data={bloodPressuresPulseForChart}
        />
        <VictoryScatter
          data={bloodPressuresPulseForChart}
          style={{ data: { fill: 'red' } }}
        />
      </VictoryChart>
    );
  }, [
    bloodPressures,
    bloodPressuresAvgMaxMin,
    bloodPressuresPulseForChart,
    bloodPressuresPulseMinMaxForChart,
    t,
  ]);

  const chartsAndTableSection = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.categoryContainer}>
          <View style={styles.indicatorContainer}>
            <ActivityIndicator size="large" color={Colors.focus} />
          </View>
        </View>
      );
    }

    if (showBloodPressureCategory) {
      return (
        <View style={styles.categoryContainer}>
          {Array.isArray(bloodPressuresAvgMaxMin) &&
            bloodPressuresAvgMaxMin.length > 0 && (
              <View style={styles.flatListContainer}>
                <FlatList
                  scrollEnabled={false}
                  numColumns={4}
                  data={bloodPressuresForTable}
                  keyExtractor={(item) => item}
                  renderItem={(itemData) => {
                    const { index, item } = itemData;
                    const isDataRow = [5, 6, 7, 9, 10, 11, 13, 14, 15].includes(
                      index,
                    );

                    if (!isDataRow) {
                      return (
                        <MainButtonClear
                          style={styles.flatListItemClear}
                          buttonStyle={styles.button}
                          buttonText={styles.tableTitleText}
                          onPress={() => {}}
                        >
                          {item}
                        </MainButtonClear>
                      );
                    }

                    let buttonTextStyle: StyleProp<TextStyle> =
                      styles.tableText;
                    if ([5, 9, 13].includes(index)) {
                      buttonTextStyle = {
                        ...systolicColorStyle(Number(item)).customFontStyle,
                        ...styles.tableText,
                      } as StyleProp<TextStyle>;
                    } else if ([6, 10, 14].includes(index)) {
                      buttonTextStyle = {
                        ...diastolicColorStyle(Number(item)).customFontStyle,
                        ...styles.tableText,
                      };
                    }

                    return (
                      <MainButtonClear
                        style={styles.flatListItem}
                        buttonStyle={styles.button}
                        buttonText={buttonTextStyle}
                        onPress={() => {}}
                      >
                        {item}
                      </MainButtonClear>
                    );
                  }}
                />
              </View>
            )}

          {renderSystolicChart}

          {renderPulseChart}

          <View
            style={{
              ...styles.bloodPressureRangeTable,
              backgroundColor: Colors.lightGrey,
            }}
          >
            <View
              style={{
                ...styles.bloodPressureRangeTableTitleContainer,
                backgroundColor: Colors.blur,
              }}
            >
              <View
                style={{
                  ...styles.bloodPressureRangeTableTitleTextContainer,
                  backgroundColor: Colors.blur,
                }}
              >
                <Text style={{ ...styles.bloodPressureRangeTableTitleText }}>
                  {t('systolic')}
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                  width: '50%',
                  backgroundColor: Colors.blur,
                }}
              >
                <Text style={{ ...styles.bloodPressureRangeTableTitleText }}>
                  {t('diastolic')}
                </Text>
              </View>
            </View>
            <View
              style={{
                ...styles.bloodPressureRangeTableRowContainer,
                backgroundColor: Colors.green,
              }}
            >
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowDescContainer,
                  backgroundColor: Colors.green,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.green,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('less_than_120')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    width: '20%',
                    backgroundColor: Colors.green,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('and')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.green,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('less_than_80')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowContentContainer,
                  backgroundColor: Colors.green,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentTextContainer,
                    backgroundColor: Colors.green,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentText,
                    }}
                  >
                    {t('normal')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentDigitContainer,
                    backgroundColor: Colors.green,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentDigit,
                    }}
                  >
                    {bloodPressuresPercent0}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                ...styles.bloodPressureRangeTableRowContainer,
                backgroundColor: Colors.yellow,
              }}
            >
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowDescContainer,
                  backgroundColor: Colors.yellow,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.yellow,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('m120_129')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    width: '20%',
                    backgroundColor: Colors.yellow,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('and')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.yellow,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('less_than_80')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowContentContainer,
                  backgroundColor: Colors.yellow,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentTextContainer,
                    backgroundColor: Colors.yellow,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentText,
                    }}
                  >
                    {t('elevated')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentDigitContainer,
                    backgroundColor: Colors.yellow,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentDigit,
                    }}
                  >
                    {bloodPressuresPercent1}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                ...styles.bloodPressureRangeTableRowContainer,
                backgroundColor: Colors.orange,
              }}
            >
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowDescContainer,
                  backgroundColor: Colors.orange,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.orange,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('m130_139')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    width: '20%',
                    backgroundColor: Colors.orange,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('or')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.orange,
                  }}
                >
                  <Text
                    style={{ ...styles.bloodPressureRangeTableRowDescText }}
                  >
                    {t('m80_89')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowContentContainer,
                  backgroundColor: Colors.orange,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentTextContainer,
                    backgroundColor: Colors.orange,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentText,
                    }}
                  >
                    {t('high_blood_pressure_stage_1')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentDigitContainer,
                    backgroundColor: Colors.orange,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentDigit,
                    }}
                  >
                    {bloodPressuresPercent2}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                ...styles.bloodPressureRangeTableRowContainer,
                backgroundColor: Colors.salmon,
              }}
            >
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowDescContainer,
                  backgroundColor: Colors.salmon,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.salmon,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowDescText,
                      color: 'white',
                    }}
                  >
                    {t('m140_or_higher')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    width: '20%',
                    backgroundColor: Colors.salmon,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowDescText,
                      color: 'white',
                    }}
                  >
                    {t('or')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.salmon,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowDescText,
                      color: 'white',
                    }}
                  >
                    {t('m90_or_higher')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowContentContainer,
                  backgroundColor: Colors.salmon,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentTextContainer,
                    backgroundColor: Colors.salmon,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentText,
                      color: 'white',
                    }}
                  >
                    {t('high_blood_pressure_stage_2')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentDigitContainer,
                    backgroundColor: Colors.salmon,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentDigit,
                      color: 'white',
                    }}
                  >
                    {bloodPressuresPercent3}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                ...styles.bloodPressureRangeTableRowContainer,
                backgroundColor: Colors.red,
              }}
            >
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowDescContainer,
                  backgroundColor: Colors.red,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.red,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowDescText,
                      color: 'white',
                    }}
                  >
                    {t('higher_than_180')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    width: '20%',
                    backgroundColor: Colors.red,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowDescText,
                      color: 'white',
                    }}
                  >
                    {t('and_or')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowDescTextContainer,
                    backgroundColor: Colors.red,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowDescText,
                      color: 'white',
                    }}
                  >
                    {t('higher_than_120')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  ...styles.bloodPressureRangeTableRowContentContainer,
                  backgroundColor: Colors.red,
                }}
              >
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentTextContainer,
                    backgroundColor: Colors.red,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentText,
                      color: 'white',
                    }}
                  >
                    {t('hypertensive_crisis')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.bloodPressureRangeTableRowContentDigitContainer,
                    backgroundColor: Colors.red,
                  }}
                >
                  <Text
                    style={{
                      ...styles.bloodPressureRangeTableRowContentDigit,
                      color: 'white',
                    }}
                  >
                    {bloodPressuresPercent4}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.noRecordText}>
          {bloodPressures
            ? t('no_records_in_the_selected_period')
            : t('no_records')}
        </Text>
      </View>
    );
  }, [
    isLoading,
    showBloodPressureCategory,
    bloodPressures,
    t,
    bloodPressuresAvgMaxMin,
    bloodPressuresForTable,
    renderSystolicChart,
    renderPulseChart,
    bloodPressuresPercent0,
    bloodPressuresPercent1,
    bloodPressuresPercent2,
    bloodPressuresPercent3,
    bloodPressuresPercent4,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* BloodPressure */}
        <View style={styles.titleContainer}>
          <View style={{ width: '100%' }}>
            <Text style={styles.title}>{t('dashboard')}</Text>
          </View>
          {/* <Image source={require('../../assets/bloodPressure2.png')} style={styles.titleImage} /> */}
        </View>

        {bloodPressures ? (
          <View style={styles.otherProfileBtnContainer}>
            <View style={{ width: '95%' }}>
              <Text
                style={{ fontSize: FontSize.subsubtitle, textAlign: 'center' }}
              >
                {t('blood_pressure_records_since_last')}
              </Text>
              <View style={{ height: 10 }} />
              <SingleChoice
                id="bloodPressureTablePeriod"
                items={[
                  {
                    label: t('please_select'),
                    value: 'none',
                  },
                  { label: t('one_day'), value: 'one_day' },
                  { label: t('one_week'), value: 'one_week' },
                  { label: t('one_month'), value: 'one_month' },
                  { label: t('three_months'), value: 'three_months' },
                  { label: t('six_months'), value: 'six_months' },
                  { label: t('one_year'), value: 'one_year' },
                  { label: t('all'), value: 'all' },
                ]}
                onItemSelected={(_, value) => {
                  setBloodPressuresPeriodForTable(value as string);
                }}
                initialValue="one_day"
                buttonTextStyle={{ fontSize: FontSize.varyBigTitle }}
              />
            </View>
          </View>
        ) : (
          <View />
        )}

        {chartsAndTableSection}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};
