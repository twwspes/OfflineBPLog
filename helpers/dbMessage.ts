import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('message.db');

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

interface MessageType {
  id: number;
  remark: string;
}

export const initMessageDB = async () => {
  await (
    await db
  ).execAsync(
    'CREATE TABLE IF NOT EXISTS message (id INTEGER PRIMARY KEY NOT NULL, remark TEXT NOT NULL);',
  );
};

export const replaceMessageFromSQL = async (id: number, remark: string) => {
  const idInteger = Math.floor(id);
  const result = (await db).runAsync(
    `REPLACE INTO message (id, remark) VALUES (?, ?);`,
    [idInteger, remark],
  );
  return result;
};

export const fetchMessageFromSQL = async () => {
  const allRows = await (await db).getAllAsync('SELECT * FROM message;');
  return allRows as Array<MessageType>;
};

export const fetchMessageFromSQLBtwDateMilli = async (
  until: number,
  from: number,
  limit: number,
  offset: number,
) => {
  if (limit >= 0 && offset >= 0) {
    const allRows = await (
      await db
    ).getAllAsync(
      'SELECT * FROM message WHERE id <= ? AND id >= ? ORDER BY id DESC LIMIT ? OFFSET ? ;',
      [until, from, limit, offset],
    );
    // console.log(fetchMessageFromSQLBtwDateMilli, allRows);
    return allRows as Array<MessageType>;
  }
  const allRows = await (
    await db
  ).getAllAsync(
    'SELECT * FROM message WHERE id <= ? AND id >= ? ORDER BY id DESC;',
    [until, from],
  );
  // console.log(fetchMessageFromSQLBtwDateMilli, allRows);
  return allRows as Array<MessageType>;
};

export const deleteMessageFromLocal = async (id: number) => {
  const idInteger = Math.floor(id);
  const result = await (
    await db
  ).runAsync('DELETE FROM message WHERE id = ?;', [idInteger]);
  return result;
};

export const deleteMessagesFromLocal = async () => {
  const result = await (await db).runAsync('DELETE FROM message;', []);
  return result;
};
