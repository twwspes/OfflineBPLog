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

export const initBloodPressureDB = async () => {
    await (await db).execAsync(
        'CREATE TABLE IF NOT EXISTS bloodpressure (id INTEGER PRIMARY KEY NOT NULL, systolic_blood_pressure REAL NOT NULL, diastolic_blood_pressure REAL NOT NULL, pulse INTEGER NOT NULL);',
    );
}

export const replaceBloodPressureFromSQL = async (id, systolic, diastolic, pulse) => {
    const result = await (await db).runAsync(
        'REPLACE INTO bloodpressure (id, systolic_blood_pressure, diastolic_blood_pressure, pulse) VALUES (?, ?, ?, ?);',
        [id, systolic, diastolic, pulse],
    );
    return result;
};

export const fetchBloodPressureFromSQL = async () => {
    const allRows = await (await db).getAllAsync('SELECT * FROM bloodpressure;');
    return allRows;
};

export const fetchBloodPressureFromSQLBtwDateMilli = async (until, from, limit, offset, sample) => {
    if (sample === 1) {
        const allRows = await (await db).getAllAsync(
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
            [until, from, limit, offset])
        return allRows;
    } else if (sample > 1) {
        const pureresultRows = await (await db).getAllAsync(
            'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
            [until, from, limit, offset],
        )
        if (pureresultRows.length < 24) {
            const resultRows = await (await db).getAllAsync(
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
                    until, from, limit, offset,
                    until, from, limit, offset, sample,
                    until, from, limit, offset,
                ],
            )
            const result2Rows = await (await db).getAllAsync(
                `
                SELECT 
                *, 
                cast((( (select count(*) from bloodpressure b where a.id >= b.id AND id <= ? AND id >= ? LIMIT ? OFFSET ? ) - 1) / ((select count(*) from bloodpressure c WHERE id <= ? AND id >= ? LIMIT ? OFFSET ?) / (?)) ) as int) as grp 
                FROM bloodpressure a WHERE id <= ? AND id >= ? LIMIT ? OFFSET ?;
                `,
                [
                    until, from, limit, offset,
                    until, from, limit, offset, sample,
                    until, from, limit, offset,
                ]
            )
            var len = result2Rows.length;
            const output = {};
            for (let i = 0; i < len; i++) {
                let row = result2Rows.item(i);
                if (!output.hasOwnProperty(row.grp)) {
                    output[row.grp] = {
                        systolic_var_sum: 0,
                        diastolic_var_sum: 0,
                        pulse_var_sum: 0,
                        cnt: 1
                    };
                }
                // console.log("result");
                // console.log(resultRows._array);
                // console.log(result2Rows._array);
                // console.log(row.grp);
                output[row.grp]["systolic_var_sum"] = output[row.grp]["systolic_var_sum"] +
                    ((row.systolic_blood_pressure - resultRows.item(row.grp).systolic_blood_pressure) *
                        (row.systolic_blood_pressure - resultRows.item(row.grp).systolic_blood_pressure));
                output[row.grp]["diastolic_var_sum"] = output[row.grp]["diastolic_var_sum"] +
                    ((row.diastolic_blood_pressure - resultRows.item(row.grp).diastolic_blood_pressure) *
                        (row.diastolic_blood_pressure - resultRows.item(row.grp).diastolic_blood_pressure));
                output[row.grp]["pulse_var_sum"] = output[row.grp]["pulse_var_sum"] +
                    ((row.pulse - resultRows.item(row.grp).pulse) *
                        (row.pulse - resultRows.item(row.grp).pulse));
                output[row.grp]["cnt"] = resultRows.item(row.grp).cnt;

            }
            // const systolic_sd = Math.sqrt(output["0"] / len);
            // console.log("systolic_sd");
            // console.log("output");
            // console.log(output);
            for (const key in output) {
                const systolic_sd = Math.sqrt(output[key].systolic_var_sum / output[key].cnt);
                const diastolic_sd = Math.sqrt(output[key].diastolic_var_sum / output[key].cnt);
                const pulse_sd = Math.sqrt(output[key].pulse_var_sum / output[key].cnt);
                // console.log("systolic_sd", systolic_sd);
                // console.log("diastolic_sd", diastolic_sd);
                // console.log("pulse_sd", pulse_sd);
                resultRows[key]["systolic_sd"] = systolic_sd;
                resultRows[key]["diastolic_sd"] = diastolic_sd;
                resultRows[key]["pulse_sd"] = pulse_sd;
            }
            return resultRows;
        }
        return pureresultRows
    } else if (limit >= 0 && offset >= 0) {
        const resultRows = await (await db).getAllAsync('SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
            [until, from, limit, offset],);
        return resultRows;
    } else {
        const resultRows = await (await db).getAllAsync(
            'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC;',
            [until, from]
        )
        return resultRows;
    }
};

export const deleteBloodPressureFromLocal = async (id) => {
    const result = await (await db).runAsync(
        'DELETE FROM bloodpressure WHERE id = ?;',
        [id],
    );
    return result;
};

export const deleteBloodPressuresFromLocal = async () => {
    const result = await (await db).runAsync(
        'DELETE FROM bloodpressure;',
        [],
    );
    return result;
};
