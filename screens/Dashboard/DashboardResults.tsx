import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';

import { Text } from '../../components/UI/Text';
import { MainButtonClear } from '../../components/UI/MainButtonClear';
import { useLocalisation } from '../../hooks/useLocalisation';
import type {
  BloodPressureGeneralType,
  BloodPressureTypeForStatistics,
} from '../../helpers/dbBloodPressure';
import type { DashboardSeries } from '../../helpers/dashboardData';
import {
  systolicColorStyle,
  diastolicColorStyle,
} from '../../constants/TrafficLightStyles';
import { Colors } from '../../constants/Colors';
import { DashboardCharts } from './DashboardCharts';
import { BloodPressureCategories } from './BloodPressureCategories';
import { styles } from './dashboardStyles';

interface Props {
  isLoading: boolean;
  bloodPressures: BloodPressureGeneralType | undefined;
  bloodPressuresAvgMaxMin: BloodPressureTypeForStatistics[];
  period: string;
  series: DashboardSeries;
  bloodPressuresForTable: string[];
}

export const DashboardResults: React.FC<Props> = ({
  isLoading,
  bloodPressures,
  bloodPressuresAvgMaxMin,
  period,
  series,
  bloodPressuresForTable,
}) => {
  const { t } = useLocalisation();
  const showBloodPressureCategory = !!bloodPressures && period !== 'none';
  const stats = bloodPressuresAvgMaxMin[0];
  const counts = stats
    ? [
        stats.percent0,
        stats.percent1,
        stats.percent2,
        stats.percent3,
        stats.percent4,
      ]
    : [0, 0, 0, 0, 0];
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

                  let buttonTextStyle: StyleProp<TextStyle> = styles.tableText;
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

        <DashboardCharts
          bloodPressures={bloodPressures}
          bloodPressuresAvgMaxMin={bloodPressuresAvgMaxMin}
          {...series}
        />

        <BloodPressureCategories counts={counts} />
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
};
