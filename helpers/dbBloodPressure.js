import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('bloodpressure.db');

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

export const initBloodPressureDB = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS bloodpressure (id INTEGER PRIMARY KEY NOT NULL, systolic_blood_pressure REAL NOT NULL, diastolic_blood_pressure REAL NOT NULL, pulse INTEGER NOT NULL);',
                [],
                () => {
                    resolve();
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};

export const replaceBloodPressureFromSQL = (id, systolic, diastolic, pulse) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `REPLACE INTO bloodpressure (id, systolic_blood_pressure, diastolic_blood_pressure, pulse) VALUES (?, ?, ?, ?);`,
                [id, systolic, diastolic, pulse],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};

export const updateBloodPressureFromSQL = (id, input, inputValue) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            //
            //UPDATE users SET ' + input + ' = ' + inputValue + ' WHERE id IN ( ' + id + ' );
            tx.executeSql(
                `update bloodpressure set ${input} = ? where id = ?;`,
                [inputValue, id],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};

export const selectDataFromBloodPressureFromSQL = (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM bloodpressure WHERE id = ?;`,
                [id],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};

export const selectLatestDataFromBloodPressureFromSQL = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT MAX(id), systolic_blood_pressure, diastolic_blood_pressure, pulse FROM bloodpressure;`,
                [],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};

export const fetchBloodPressureFromSQL = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM bloodpressure;',
                [],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};

export const fetchBloodPressureFromSQLBtwDateMilli = (until, from, limit, offset, sample) => {
    if (sample === 1) {
        const promise = new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
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
                    (_, result) => {
                        resolve(result);
                    },
                    (_, err) => {
                        reject(err);
                    }
                );
            });
        });
        return promise;
    } else if (sample > 1) {
        const promise = new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
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
                    cast(AVG(id) as int) AS id
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
                    (_, result) => {
                        resolve(result);
                    },
                    (_, err) => {
                        reject(err);
                    }
                );
            });
        });
        return promise;
    } else if (limit >= 0 && offset >= 0) {
        const promise = new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
                    [until, from, limit, offset],
                    (_, result) => {
                        resolve(result);
                    },
                    (_, err) => {
                        reject(err);
                    }
                );
            });
        });
        return promise;
    } else {
        const promise = new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC;',
                    [until, from],
                    (_, result) => {
                        resolve(result);
                    },
                    (_, err) => {
                        reject(err);
                    }
                );
            });
        });
        return promise;
    }
};

export const deleteBloodPressureFromLocal = (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM bloodpressure WHERE id = ?;',
                [id],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};

export const deleteBloodPressuresFromLocal = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM bloodpressure;',
                [],
                (_, result) => {
                    resolve(result);
                },
                (_, err) => {
                    reject(err);
                }
            );
        });
    });
    return promise;
};
