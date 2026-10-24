import type {
  BloodPressureGeneralType,
  BloodPressureTypeForStatistics,
} from './dbBloodPressure';

interface ChartPoint {
  x: Date;
  y: number;
}
interface AggregatePoint {
  x: Date;
  min: number;
  median: number;
  max: number;
  q1: number;
  q3: number;
}

export interface DashboardSeries {
  bloodPressuresSystolicForChart: ChartPoint[];
  bloodPressuresDiastolicForChart: ChartPoint[];
  bloodPressuresPulseForChart: ChartPoint[];
  bloodPressuresSystolicMinMaxForChart: AggregatePoint[];
  bloodPressuresDiastolicMinMaxForChart: AggregatePoint[];
  bloodPressuresPulseMinMaxForChart: AggregatePoint[];
}

const aggregatePoint = (
  id: number,
  mean: number,
  min: number,
  max: number,
  sd: number,
): AggregatePoint => ({
  x: new Date(id),
  min: Math.round(min),
  median: Math.round(mean),
  max: Math.round(max),
  q1: Math.round(mean - (Math.sqrt(3) * sd) / 2),
  q3: Math.round(mean + (Math.sqrt(3) * sd) / 2),
});

export const buildDashboardSeries = (
  records: BloodPressureGeneralType | undefined,
): DashboardSeries => {
  const result: DashboardSeries = {
    bloodPressuresSystolicForChart: [],
    bloodPressuresDiastolicForChart: [],
    bloodPressuresPulseForChart: [],
    bloodPressuresSystolicMinMaxForChart: [],
    bloodPressuresDiastolicMinMaxForChart: [],
    bloodPressuresPulseMinMaxForChart: [],
  };
  if (!records) return result;
  // SQL returns descending records; preserve the existing reversal and rounding.
  for (const record of [...records.array].reverse()) {
    if (
      record.systolic_blood_pressure &&
      !Number.isNaN(record.systolic_blood_pressure)
    )
      result.bloodPressuresSystolicForChart.push({
        x: new Date(record.id),
        y: record.systolic_blood_pressure,
      });
    if (
      record.diastolic_blood_pressure &&
      !Number.isNaN(record.diastolic_blood_pressure)
    )
      result.bloodPressuresDiastolicForChart.push({
        x: new Date(record.id),
        y: record.diastolic_blood_pressure,
      });
    if (record.pulse && !Number.isNaN(record.pulse))
      result.bloodPressuresPulseForChart.push({
        x: new Date(record.id),
        y: record.pulse,
      });
  }
  if (records.typename === 'BloodPressureTypeForAggregatedResult') {
    for (const record of [...records.array].reverse()) {
      result.bloodPressuresSystolicMinMaxForChart.push(
        aggregatePoint(
          record.id,
          record.systolic_blood_pressure,
          record.min_systolic_blood_pressure,
          record.max_systolic_blood_pressure,
          record.systolic_sd,
        ),
      );
      result.bloodPressuresDiastolicMinMaxForChart.push(
        aggregatePoint(
          record.id,
          record.diastolic_blood_pressure,
          record.min_diastolic_blood_pressure,
          record.max_diastolic_blood_pressure,
          record.diastolic_sd,
        ),
      );
      result.bloodPressuresPulseMinMaxForChart.push(
        aggregatePoint(
          record.id,
          record.pulse,
          record.min_pulse,
          record.max_pulse,
          record.pulse_sd,
        ),
      );
    }
  }
  return result;
};

export const buildDashboardTable = (
  stats: BloodPressureTypeForStatistics | undefined,
  period: string,
  t: (key: string) => string,
) => {
  if (!stats) return [];
  return [
    t(period),
    t('systolic_short'),
    t('diastolic_short'),
    t('heartbeat'),
    t('avg'),
    ...[
      stats.systolic_blood_pressure,
      stats.diastolic_blood_pressure,
      stats.pulse,
    ].map((value) => Math.round(value).toString()),
    t('max'),
    ...[
      stats.max_systolic_blood_pressure,
      stats.max_diastolic_blood_pressure,
      stats.max_pulse,
    ].map((value) => Math.round(value).toString()),
    t('min'),
    ...[
      stats.min_systolic_blood_pressure,
      stats.min_diastolic_blood_pressure,
      stats.min_pulse,
    ].map((value) => Math.round(value).toString()),
  ];
};

const day = 1000 * 60 * 60 * 24;
const periods: Record<string, { duration: number; samples: number | null }> = {
  one_day: { duration: day, samples: null },
  one_week: { duration: day * 7, samples: 7 },
  one_month: { duration: day * 31, samples: 4 },
  three_months: { duration: day * 31 * 3, samples: 3 },
  six_months: { duration: day * 31 * 6, samples: 6 },
  one_year: { duration: day * 366, samples: 12 },
};

export const dashboardPeriod = (period: string, now = Date.now()) => ({
  from: new Date(
    period === 'all' ? 0 : now - (periods[period]?.duration ?? day),
  ).toISOString(),
  until: new Date(now).toISOString(),
  // Retain the existing fallback, including the one-day sampling behaviour.
  samples: periods[period]?.samples ?? 12,
});
