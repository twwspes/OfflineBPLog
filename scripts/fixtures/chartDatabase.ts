import { DatabaseSync } from 'node:sqlite';

// Only synthetic, in-memory data. Both binding modes are checked because native
// SQLite bridges can bind integral JavaScript numbers differently from Node.
export const createChartDatabase = (size: number, integers = true) => {
  const db = new DatabaseSync(':memory:');
  db.exec(
    'CREATE TABLE bloodpressure (id INTEGER PRIMARY KEY NOT NULL, systolic_blood_pressure REAL NOT NULL, diastolic_blood_pressure REAL NOT NULL, pulse INTEGER NOT NULL)',
  );
  const firstId = Date.UTC(2020, 0, 1);
  const insert = db.prepare('INSERT INTO bloodpressure VALUES (?, ?, ?, ?)');
  db.exec('BEGIN');
  for (let index = size - 1; index >= 0; index -= 1) {
    insert.run(
      firstId + index * 60000 + (index % 997),
      100 + (index % 81) + (index % 3) / 10,
      60 + (index % 51) + (index % 7) / 10,
      50 + (index % 70),
    );
  }
  db.exec('COMMIT');
  return {
    db,
    firstId,
    reader: {
      getAllAsync: <T>(source: string, params: number[]): Promise<T[]> => {
        const bindings = params.map((value) =>
          integers && Number.isSafeInteger(value) ? BigInt(value) : value,
        );
        return Promise.resolve(
          db
            .prepare(source)
            .all(...bindings)
            .map((row) => ({ ...row })) as unknown as T[],
        );
      },
    },
  };
};
