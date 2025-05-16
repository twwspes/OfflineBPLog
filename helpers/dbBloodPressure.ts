/* eslint-disable @typescript-eslint/naming-convention */
import * as SQLite from 'expo-sqlite';

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
  if (limit >= 0 && offset >= 0) {
    const resultRows = await (
      await db
    ).getAllAsync(
      'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
      [until, from, limit, offset],
    );
    return {
      typename: 'BloodPressureType',
      array: resultRows as Array<BloodPressureType>,
    };
  }
  const resultRows = await (
    await db
  ).getAllAsync(
    'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC;',
    [until, from],
  );
  return {
    typename: 'BloodPressureType',
    array: resultRows as Array<BloodPressureType>,
  };
};

export const fetchBloodPressureFromSQLBtwDateMilliForChart = async (
  until: number,
  from: number,
  limit: number,
  offset: number,
  sample: number | null | undefined,
): Promise<BloodPressureGeneralType> => {
  if (sample !== null && sample !== undefined && sample > 1) {
    const pureresultRows = await (
      await db
    ).getAllAsync(
      'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
      [until, from, limit, offset],
    );
    if (pureresultRows.length < 24) {
      return {
        typename: 'BloodPressureType',
        array: pureresultRows as Array<BloodPressureType>,
      };
    }
    const resultRows = await (
      await db
    ).getAllAsync(
      `
                SELECT
                AVG(systolic_blood_pressure) AS systolic_blood_pressure,
                MAX(systolic_blood_pressure) AS max_systolic_blood_pressure,
                MIN(systolic_blood_pressure) AS min_systolic_blood_pressure,
                AVG(diastolic_blood_pressure) AS diastolic_blood_pressure,
                MAX(diastolic_blood_pressure) AS max_diastolic_blood_pressure,
                MIN(diastolic_blood_pressure) AS min_diastolic_blood_pressure,
                AVG(pulse) AS pulse,
                MAX(pulse) AS max_pulse,
                MIN(pulse) AS min_pulse,
                cast(AVG(id) as int) AS id,
                COUNT(id) AS cnt
                FROM (SELECT
                *,
                cast((( (select count(*) from bloodpressure b where a.id >= b.id AND id <= ? AND id >= ? LIMIT ? OFFSET ? ) - 1) / ((select count(*) from bloodpressure c WHERE id <= ? AND id >= ? LIMIT ? OFFSET ?) / (?)) ) as int) as grp
                FROM bloodpressure a WHERE id <= ? AND id >= ? LIMIT ? OFFSET ?) AS listofrecordsbygrp GROUP BY grp;
                `,
      [
        until,
        from,
        limit,
        offset,
        until,
        from,
        limit,
        offset,
        sample,
        until,
        from,
        limit,
        offset,
      ],
    );
    const resultRowsTyped =
      resultRows as Array<BloodPressureTypeForAggregatedResult>;
    const result2Rows = await (
      await db
    ).getAllAsync(
      `
              SELECT
              *,
              cast((( (select count(*) from bloodpressure b where a.id >= b.id AND id <= ? AND id >= ? LIMIT ? OFFSET ? ) - 1) / ((select count(*) from bloodpressure c WHERE id <= ? AND id >= ? LIMIT ? OFFSET ?) / (?)) ) as int) as grp
              FROM bloodpressure a WHERE id <= ? AND id >= ? LIMIT ? OFFSET ?;
              `,
      [
        until,
        from,
        limit,
        offset,
        until,
        from,
        limit,
        offset,
        sample,
        until,
        from,
        limit,
        offset,
      ],
    );
    const len = result2Rows.length;
    const output: Record<
      number,
      {
        systolic_var_sum: number;
        diastolic_var_sum: number;
        pulse_var_sum: number;
        cnt: number;
      }
    > = {};
    for (let i = 0; i < len; i += 1) {
      const row = result2Rows[i] as {
        grp: number;
        systolic_blood_pressure: number;
        diastolic_blood_pressure: number;
        pulse: number;
        cnt: number;
      };
      if (!Object.prototype.hasOwnProperty.call(output, row.grp)) {
        output[row.grp] = {
          systolic_var_sum: 0,
          diastolic_var_sum: 0,
          pulse_var_sum: 0,
          cnt: 1,
        };
      }
      // console.log("result", resultRows, result2Rows);
      // console.log(row.grp);
      output[row.grp].systolic_var_sum +=
        (row.systolic_blood_pressure -
          resultRowsTyped[row.grp].systolic_blood_pressure) *
        (row.systolic_blood_pressure -
          resultRowsTyped[row.grp].systolic_blood_pressure);
      output[row.grp].diastolic_var_sum +=
        (row.diastolic_blood_pressure -
          resultRowsTyped[row.grp].diastolic_blood_pressure) *
        (row.diastolic_blood_pressure -
          resultRowsTyped[row.grp].diastolic_blood_pressure);
      output[row.grp].pulse_var_sum +=
        (row.pulse - resultRowsTyped[row.grp].pulse) *
        (row.pulse - resultRowsTyped[row.grp].pulse);
      output[row.grp].cnt = resultRowsTyped[row.grp].cnt;
    }
    // const systolic_sd = Math.sqrt(output["0"] / len);
    // console.log("systolic_sd");
    // console.log("output");
    // console.log(output);
    Object.keys(output).forEach((key) => {
      const keyInNumber = Number(key);
      const systolic_sd = Math.sqrt(
        output[keyInNumber].systolic_var_sum / output[keyInNumber].cnt,
      );
      const diastolic_sd = Math.sqrt(
        output[keyInNumber].diastolic_var_sum / output[keyInNumber].cnt,
      );
      const pulse_sd = Math.sqrt(
        output[keyInNumber].pulse_var_sum / output[keyInNumber].cnt,
      );
      // console.log("systolic_sd", systolic_sd);
      // console.log("diastolic_sd", diastolic_sd);
      // console.log("pulse_sd", pulse_sd);

      resultRowsTyped[keyInNumber].systolic_sd = systolic_sd;
      resultRowsTyped[keyInNumber].diastolic_sd = diastolic_sd;
      resultRowsTyped[keyInNumber].pulse_sd = pulse_sd;
    });
    return {
      typename: 'BloodPressureTypeForAggregatedResult',
      array: resultRowsTyped,
    };
  }
  if (limit >= 0 && offset >= 0) {
    const resultRows = await (
      await db
    ).getAllAsync(
      'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
      [until, from, limit, offset],
    );
    return {
      typename: 'BloodPressureType',
      array: resultRows as Array<BloodPressureType>,
    };
  }
  const resultRows = await (
    await db
  ).getAllAsync(
    'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC;',
    [until, from],
  );
  return {
    typename: 'BloodPressureType',
    array: resultRows as Array<BloodPressureType>,
  };
};

export const fetchBloodPressureFromSQLBtwDateMilliForStats = async (
  until: number,
  from: number,
  limit: number,
  offset: number,
): Promise<BloodPressureTypeForStatistics[]> => {
  const allRows = await (
    await db
  ).getAllAsync(
    `SELECT AVG(systolic_blood_pressure) AS systolic_blood_pressure,
                    MAX(systolic_blood_pressure) AS max_systolic_blood_pressure,
                    MIN(systolic_blood_pressure) AS min_systolic_blood_pressure,
                    AVG(diastolic_blood_pressure) AS diastolic_blood_pressure,
                    MAX(diastolic_blood_pressure) AS max_diastolic_blood_pressure,
                    MIN(diastolic_blood_pressure) AS min_diastolic_blood_pressure,
                    AVG(pulse) AS pulse,
                    MAX(pulse) AS max_pulse,
                    MIN(pulse) AS min_pulse,
                    SUM(CASE WHEN systolic_blood_pressure < 120 AND diastolic_blood_pressure < 80 THEN 1 ELSE 0 END) AS percent0,
                    SUM(CASE WHEN systolic_blood_pressure >= 120 AND systolic_blood_pressure < 130 AND diastolic_blood_pressure < 80 THEN 1 ELSE 0 END) AS percent1,
                    SUM(CASE WHEN (systolic_blood_pressure >= 130 AND systolic_blood_pressure < 140) OR (diastolic_blood_pressure >= 80 AND diastolic_blood_pressure < 90) THEN 1 ELSE 0 END) AS percent2,
                    SUM(CASE WHEN (systolic_blood_pressure >= 140 AND systolic_blood_pressure < 180) OR (diastolic_blood_pressure >= 90 AND diastolic_blood_pressure < 120) THEN 1 ELSE 0 END) AS percent3,
                    SUM(CASE WHEN systolic_blood_pressure >= 180 OR diastolic_blood_pressure >= 120 THEN 1 ELSE 0 END) AS percent4,
                    COUNT(id) AS count
                    FROM bloodpressure WHERE id <= ? AND id >= ? LIMIT ? OFFSET ?;`,
    [until, from, limit, offset],
  );
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
