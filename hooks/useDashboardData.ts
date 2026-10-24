import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useAppSelector } from './useRedux';
import { useLocalisation } from './useLocalisation';
import type {
  BloodPressureGeneralType,
  BloodPressureTypeForStatistics,
} from '../helpers/dbBloodPressure';
import { dashboardPeriod } from '../helpers/dashboardData';
import {
  fetchBloodPressureForChart,
  fetchBloodPressureForStatistics,
} from '../store/actions/bloodPressure';

interface Data {
  bloodPressures: BloodPressureGeneralType | undefined;
  bloodPressuresAvgMaxMin: BloodPressureTypeForStatistics[];
}

export const useDashboardData = (period: string) => {
  const { t } = useLocalisation();
  const update = useAppSelector((state) => state.bloodPressure.update);
  const [data, setData] = useState<Data>({
    bloodPressures: undefined,
    bloodPressuresAvgMaxMin: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      const { from, until, samples } = dashboardPeriod(period);
      try {
        const bloodPressures = await fetchBloodPressureForChart(
          20000,
          0,
          from,
          until,
          samples,
        );
        const bloodPressuresAvgMaxMin = await fetchBloodPressureForStatistics(
          5000,
          0,
          from,
          until,
        );
        if (active) setData({ bloodPressures, bloodPressuresAvgMaxMin });
      } catch (error) {
        if (active) {
          setData({ bloodPressures: undefined, bloodPressuresAvgMaxMin: [] });
          Alert.alert(
            t('error_occur'),
            error instanceof Error ? error.message : t('error_occur'),
            [{ text: t('okay') }],
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [period, update, t]);
  return { ...data, isLoading };
};
