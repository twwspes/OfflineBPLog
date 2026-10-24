import * as SQLite from 'expo-sqlite';

import { bloodPressureStatisticsQuery } from './bloodPressureCategory';
import { bloodPressureRangeQuery, fetchChartData } from './chartAggregation';

const db = SQLite.openDatabaseAsync('bloodpressure.db');

/*
bloodpressure db
id INTEGER PRIMARY KEY NOT NULL //id = timestamp
diastolic_blood_pressure REAL NOT NULL
diastolic_blood_pressure REAL NOT NULL
pulse INTEGER NOT NULL
*/

// returned promise
// {
//     insertId,
//     rowsAffected,
//     rows: {
//       length,
//       item(),
//       _array,
//     },
//   }

export interface BloodPressureType {
  typename: 'BloodPressureType';
  id: number;
  systolic_blood_pressure: number;
  diastolic_blood_pressure: number;
  pulse: number;
  remark?: string;
}

export interface BloodPressureTypeForStatistics {
  typename: 'BloodPressureTypeForStatistics';
  systolic_blood_pressure: number;
  max_systolic_blood_pressure: number;
  min_systolic_blood_pressure: number;
  diastolic_blood_pressure: number;
  max_diastolic_blood_pressure: number;
  min_diastolic_blood_pressure: number;
  pulse: number;
  max_pulse: number;
  min_pulse: number;
  percent0: number;
  percent1: number;
  percent2: number;
  percent3: number;
  percent4: number;
  count: number;
}

export interface BloodPressureTypeForAggregatedResult {
  typename: 'BloodPressureTypeForAggregatedResult';
  systolic_blood_pressure: number;
  max_systolic_blood_pressure: number;
  min_systolic_blood_pressure: number;
  diastolic_blood_pressure: number;
  max_diastolic_blood_pressure: number;
  min_diastolic_blood_pressure: number;
  pulse: number;
  max_pulse: number;
  min_pulse: number;
  id: number;
  cnt: number;
  systolic_sd: number;
  diastolic_sd: number;
  pulse_sd: number;
}

export interface BloodPressureTypeObject {
  typename: 'BloodPressureType';
  array: Array<BloodPressureType>;
}

export interface BloodPressureTypeForStatisticsObject {
  typename: 'BloodPressureTypeForStatistics';
  array: Array<BloodPressureTypeForStatistics>;
}

export interface BloodPressureTypeForAggregatedResultObject {
  typename: 'BloodPressureTypeForAggregatedResult';
  array: Array<BloodPressureTypeForAggregatedResult>;
}

export type BloodPressureGeneralType =
  | BloodPressureTypeObject
  | BloodPressureTypeForAggregatedResultObject;

export const initBloodPressureDB = async () => {
  await (
    await db
  ).execAsync(
    'CREATE TABLE IF NOT EXISTS bloodpressure (id INTEGER PRIMARY KEY NOT NULL, systolic_blood_pressure REAL NOT NULL, diastolic_blood_pressure REAL NOT NULL, pulse INTEGER NOT NULL);',
  );
};

export const replaceBloodPressureFromSQL = async (
  id: number,
  systolic: number,
  diastolic: number,
  pulse: number,
) => {
  const idInteger = Math.floor(id);
  const result = await (
    await db
  ).runAsync(
    'REPLACE INTO bloodpressure (id, systolic_blood_pressure, diastolic_blood_pressure, pulse) VALUES (?, ?, ?, ?);',
    [idInteger, systolic, diastolic, pulse],
  );
  return result;
};

export const fetchBloodPressureFromSQL =
  async (): Promise<BloodPressureTypeObject> => {
    const allRows = await (
      await db
    ).getAllAsync('SELECT * FROM bloodpressure;');
    return {
      typename: 'BloodPressureType',
      array: allRows as Array<BloodPressureType>,
    };
  };

export const fetchBloodPressureFromSQLBtwDateMilli = async (
  until: number,
  from: number,
  limit: number,
  offset: number,
): Promise<BloodPressureTypeObject> => {
  const { source, params } = bloodPressureRangeQuery({
    until,
    from,
    limit,
    offset,
  });
  return {
    typename: 'BloodPressureType',
    array: await (await db).getAllAsync<BloodPressureType>(source, params),
  };
};

export const fetchBloodPressureFromSQLBtwDateMilliForChart = async (
  until: number,
  from: number,
  limit: number,
  offset: number,
  sample: number | null | undefined,
): Promise<BloodPressureGeneralType> => {
  return fetchChartData(await db, { until, from, limit, offset, sample });
};

export const fetchBloodPressureFromSQLBtwDateMilliForStats = async (
  until: number,
  from: number,
  limit: number,
  offset: number,
): Promise<BloodPressureTypeForStatistics[]> => {
  const allRows = await (
    await db
  ).getAllAsync(bloodPressureStatisticsQuery, [until, from, limit, offset]);
  return allRows as BloodPressureTypeForStatistics[];
};

export const deleteBloodPressureFromLocal = async (id: number) => {
  const idInteger = Math.floor(id);
  const result = await (
    await db
  ).runAsync('DELETE FROM bloodpressure WHERE id = ?;', [idInteger]);
  return result;
};

export const deleteBloodPressuresFromLocal = async () => {
  const result = await (await db).runAsync('DELETE FROM bloodpressure;', []);
  return result;
};
