import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('message.db');

/*
message db
id INTEGER PRIMARY KEY NOT NULL //id = timestamp
message TEXT NOT NULL
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

export const initMessageDB = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS message (id INTEGER PRIMARY KEY NOT NULL, remark TEXT NOT NULL);',
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

export const replaceMessageFromSQL = (id, remark) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `REPLACE INTO message (id, remark) VALUES (?, ?);`,
                [id, remark],
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

export const updateMessageFromSQL = (id, input, inputValue) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            //
            //UPDATE users SET ' + input + ' = ' + inputValue + ' WHERE id IN ( ' + id + ' );
            tx.executeSql(
                `update message set ${input} = ? where id = ?;`,
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

export const selectDataFromMessageFromSQL = (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM message WHERE id = ?;`,
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

export const selectLatestDataFromMessageFromSQL = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT MAX(id), remark FROM message;`,
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

export const fetchMessageFromSQL = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM message;',
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

export const fetchMessageFromSQLBtwDateMilli = (until, from, limit, offset) => {
    if (limit >= 0 && offset >= 0) {
        const promise = new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM message WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
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
                    'SELECT * FROM message WHERE id <= ? AND id >= ? ORDER BY id DESC;',
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

export const deleteMessageFromLocal = (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM message WHERE id = ?;',
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

export const deleteMessagesFromLocal = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM message;',
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
