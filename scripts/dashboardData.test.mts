import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import type {
  BloodPressureGeneralType,
  BloodPressureTypeForStatistics,
} from '../helpers/dbBloodPressure.ts';
import {
  buildDashboardSeries,
  buildDashboardTable,
  dashboardPeriod,
} from '../helpers/dashboardData.ts';

await test('dashboard raw series preserve values and chronological reversal without mutating fetched records', () => {
  const records: BloodPressureGeneralType = {
    typename: 'BloodPressureType',
    array: [
      {
        typename: 'BloodPressureType',
        id: 2000,
        systolic_blood_pressure: 123,
        diastolic_blood_pressure: 81,
        pulse: 71,
      },
      {
        typename: 'BloodPressureType',
        id: 1000,
        systolic_blood_pressure: 119,
        diastolic_blood_pressure: 79,
        pulse: 68,
      },
    ],
  };
  const before = JSON.stringify(records);
  const result = buildDashboardSeries(records);
  assert.deepEqual(result.bloodPressuresSystolicForChart, [
    { x: new Date(1000), y: 119 },
    { x: new Date(2000), y: 123 },
  ]);
  assert.deepEqual(
    result.bloodPressuresDiastolicForChart.map(({ y }) => y),
    [79, 81],
  );
  assert.deepEqual(
    result.bloodPressuresPulseForChart.map(({ y }) => y),
    [68, 71],
  );
  assert.deepEqual(result.bloodPressuresSystolicMinMaxForChart, []);
  assert.equal(JSON.stringify(records), before);
  assert.deepEqual(
    buildDashboardSeries(undefined).bloodPressuresSystolicForChart,
    [],
  );
});

await test('aggregate chart points retain the existing mean/SD calculation and rounding for every metric', () => {
  const records: BloodPressureGeneralType = {
    typename: 'BloodPressureTypeForAggregatedResult',
    array: [
      {
        typename: 'BloodPressureTypeForAggregatedResult',
        id: 1000,
        cnt: 5,
        systolic_blood_pressure: 130.4,
        min_systolic_blood_pressure: 120.4,
        max_systolic_blood_pressure: 142.7,
        systolic_sd: 2,
        diastolic_blood_pressure: 80.2,
        min_diastolic_blood_pressure: 70.3,
        max_diastolic_blood_pressure: 92.6,
        diastolic_sd: 4,
        pulse: 70,
        min_pulse: 60,
        max_pulse: 80,
        pulse_sd: 6,
      },
    ],
  };
  const result = buildDashboardSeries(records);
  assert.deepEqual(result.bloodPressuresSystolicMinMaxForChart, [
    { x: new Date(1000), min: 120, median: 130, max: 143, q1: 129, q3: 132 },
  ]);
  assert.deepEqual(result.bloodPressuresDiastolicMinMaxForChart, [
    { x: new Date(1000), min: 70, median: 80, max: 93, q1: 77, q3: 84 },
  ]);
  assert.deepEqual(result.bloodPressuresPulseMinMaxForChart, [
    { x: new Date(1000), min: 60, median: 70, max: 80, q1: 65, q3: 75 },
  ]);
  assert.equal(result.bloodPressuresSystolicForChart[0].y, 130.4);
});

await test('summary rows preserve labels, rounding and column order and clear when data is absent', () => {
  const stats: BloodPressureTypeForStatistics = {
    typename: 'BloodPressureTypeForStatistics',
    systolic_blood_pressure: 120.4,
    diastolic_blood_pressure: 80.6,
    pulse: 70,
    max_systolic_blood_pressure: 140,
    max_diastolic_blood_pressure: 90,
    max_pulse: 85,
    min_systolic_blood_pressure: 110,
    min_diastolic_blood_pressure: 70,
    min_pulse: 60,
    percent0: 1,
    percent1: 2,
    percent2: 3,
    percent3: 4,
    percent4: 0,
    count: 10,
  };
  assert.deepEqual(
    buildDashboardTable(stats, 'one_week', (key) => key),
    [
      'one_week',
      'systolic_short',
      'diastolic_short',
      'heartbeat',
      'avg',
      '120',
      '81',
      '70',
      'max',
      '140',
      '90',
      '85',
      'min',
      '110',
      '70',
      '60',
    ],
  );
  assert.deepEqual(
    buildDashboardTable(undefined, 'one_week', (key) => key),
    [],
  );
});

await test('dashboard date windows and sampling keep the previous period definitions', () => {
  const now = Date.UTC(2026, 9, 24);
  const day = 86400000;
  for (const [period, days, samples] of [
    ['one_day', 1, 12],
    ['one_week', 7, 7],
    ['one_month', 31, 4],
    ['three_months', 93, 3],
    ['six_months', 186, 6],
    ['one_year', 366, 12],
  ] as const) {
    assert.deepEqual(dashboardPeriod(period, now), {
      from: new Date(now - days * day).toISOString(),
      until: new Date(now).toISOString(),
      samples,
    });
  }
  assert.equal(dashboardPeriod('all', now).from, new Date(0).toISOString());
});
