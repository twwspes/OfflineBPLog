import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { Text } from '../../components/UI/Text';
import { SingleChoice } from '../../components/MultipleChoice/DropdownList';
import { useLocalisation } from '../../hooks/useLocalisation';
import { useDashboardData } from '../../hooks/useDashboardData';
import {
  buildDashboardSeries,
  buildDashboardTable,
} from '../../helpers/dashboardData';
import { FontSize } from '../../constants/FontSize';
import { DashboardResults } from './DashboardResults';
import { styles } from './dashboardStyles';

export const DashboardScreen: React.FC = () => {
  const { t } = useLocalisation();
  const [bloodPressuresPeriodForTable, setBloodPressuresPeriodForTable] =
    useState('one_day');
  const { isLoading, bloodPressures, bloodPressuresAvgMaxMin } =
    useDashboardData(bloodPressuresPeriodForTable);
  const series = useMemo(
    () => buildDashboardSeries(bloodPressures),
    [bloodPressures],
  );
  const bloodPressuresForTable = useMemo(
    () =>
      buildDashboardTable(
        bloodPressuresAvgMaxMin[0],
        bloodPressuresPeriodForTable,
        t,
      ),
    [bloodPressuresAvgMaxMin, bloodPressuresPeriodForTable, t],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* BloodPressure */}
        <View style={styles.titleContainer}>
          <View style={{ width: '100%' }}>
            <Text style={styles.title}>{t('dashboard')}</Text>
          </View>
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

        <DashboardResults
          isLoading={isLoading}
          bloodPressures={bloodPressures}
          bloodPressuresAvgMaxMin={bloodPressuresAvgMaxMin}
          period={bloodPressuresPeriodForTable}
          series={series}
          bloodPressuresForTable={bloodPressuresForTable}
        />

        <Text>
          LeWine, H. E. (2024, March 26). Reading the new blood pressure
          guidelines. Harvard Health Publishing.
          https://www.health.harvard.edu/heart-health/reading-the-new-blood-pressure-guidelines
        </Text>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};
