import { strict as assert } from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import * as XLSX from 'xlsx';

import {
  bloodPressureCategory,
  bloodPressureStatisticsQuery,
} from '../helpers/bloodPressureCategory.ts';
import {
  combineRecordTimestamp,
  saveRecordTimestamp,
} from '../helpers/recordTimestamp.ts';
import {
  createImportTimestampMatcher,
  importRecordRows,
  parseImportRecord,
  toSpreadsheetRow,
} from '../helpers/importRecords.ts';
import {
  encodeRecordWorkbook,
  decodeRecordWorkbook,
} from '../helpers/recordWorkbook.ts';
import { runWithLoading } from '../helpers/runWithLoading.ts';

await test('time-only and date-only edits replace the original ID; unchanged edits never delete it', async () => {
  const original = new Date(2026, 9, 20, 10, 15, 30, 123);
  for (const [date, time, expected] of [
    [
      original,
      new Date(2026, 9, 20, 11, 25),
      new Date(2026, 9, 20, 11, 25, 30, 123),
    ],
    [
      new Date(2026, 9, 21, 10, 15, 30, 123),
      original,
      new Date(2026, 9, 21, 10, 15, 30, 123),
    ],
    [original, original, original],
  ]) {
    const timestamp = combineRecordTimestamp(
      date.toISOString(),
      time.toISOString(),
    );
    assert.equal(timestamp, expected.valueOf());
    const records = new Set([original.valueOf()]);
    await saveRecordTimestamp(
      timestamp,
      original.valueOf(),
      (id) => {
        records.add(id);
        return Promise.resolve();
      },
      (id) => {
        records.delete(id);
        return Promise.resolve();
      },
    );
    assert.deepEqual([...records], [timestamp]);
  }
});

await test('failed saves preserve the original; failed deletes propagate; new records never delete', async () => {
  const removed: number[] = [];
  const remove = (id: number) => {
    removed.push(id);
    return Promise.resolve();
  };
  await assert.rejects(
    saveRecordTimestamp(
      2,
      1,
      () => Promise.reject(new Error('write failed')),
      remove,
    ),
    /write failed/,
  );
  assert.deepEqual(removed, []);
  await saveRecordTimestamp(2, undefined, () => Promise.resolve(), remove);
  assert.deepEqual(removed, []);
  await assert.rejects(
    saveRecordTimestamp(
      2,
      1,
      () => Promise.resolve(),
      () => Promise.reject(new Error('delete failed')),
    ),
    /delete failed/,
  );
  assert.throws(
    () => combineRecordTimestamp('invalid', new Date().toISOString()),
    /Invalid record/,
  );
});

const validRow = {
  Year: 2024,
  Month: 2,
  Date: 29,
  Hours: 12,
  Minutes: 15,
  Seconds: 30,
  Systolic: 120,
  Diastolic: 80,
  Pulse: 65,
  Remark: 'Left arm',
};
const parse = (row: Record<string, unknown>) => {
  const record = parseImportRecord(row);
  assert.ok(record);
  return record;
};

await test('import rejects calendar rollover, missing fields, malformed numbers and non-finite measurements', () => {
  for (const invalid of [
    { Year: 2023 },
    { Month: 0 },
    { Month: 13 },
    { Date: 30 },
    { Date: 0 },
    { Hours: 24 },
    { Minutes: 60 },
    { Seconds: -1 },
    { Milliseconds: 1000 },
    { Year: 2024.5 },
    { Systolic: Infinity },
    { Diastolic: NaN },
    { Pulse: '' },
    { Pulse: true },
    { Systolic: 20 },
    { Diastolic: 250 },
    { Date: undefined },
    { Minutes: '15abc' },
  ])
    assert.equal(
      parseImportRecord({ ...validRow, ...invalid }),
      null,
      JSON.stringify(invalid),
    );
  assert.equal(
    parseImportRecord({ ...validRow, Year: 2026, Month: 2, Date: 31 }),
    null,
  );
  assert.equal(parse({ ...validRow, Year: '2024', Pulse: '65' }).pulse, 65);
  assert.equal(
    parse({ ...validRow, Remark: 'a'.repeat(301) }).remark.length,
    300,
  );
});

await test('legacy import matches existing milliseconds in any row order and repeated imports do not add IDs', () => {
  const first = parse(validRow);
  const second = parse({ ...validRow, Date: 28 });
  const existing = [
    { id: first.timestamp + 123 },
    { id: second.timestamp + 456 },
  ];
  for (const rows of [
    [first, second],
    [second, first],
  ]) {
    const match = createImportTimestampMatcher(existing);
    const ids = new Set(existing.map(({ id }) => id));
    rows.forEach((row) => ids.add(match(row)));
    assert.equal(ids.size, 2);
    assert.equal(match(first), existing[0].id);
  }
  const match = createImportTimestampMatcher([
    { id: first.timestamp + 1 },
    { id: first.timestamp + 2 },
  ]);
  assert.equal(match(first), first.timestamp + 2);
  assert.equal(match(first), first.timestamp + 1);
});

await test('XLSX export/import round trip preserves IDs, values and remarks even within the same second', () => {
  const base = parse(validRow).timestamp;
  const originals = [123, 456].map((milliseconds) => ({
    id: base + milliseconds,
    systolic_blood_pressure: 123,
    diastolic_blood_pressure: 81,
    pulse: 65,
    remark: 'Quoted "remark", with\nnewline',
  }));
  const encoded = encodeRecordWorkbook(originals.map(toSpreadsheetRow));
  const rows = decodeRecordWorkbook(encoded);
  const match = createImportTimestampMatcher(originals);
  assert.deepEqual(
    rows.map((row) => {
      const record = parse(row);
      return {
        id: match(record),
        systolic_blood_pressure: record.systolic,
        diastolic_blood_pressure: record.diastolic,
        pulse: record.pulse,
        remark: record.remark,
      };
    }),
    originals,
  );
  assert.equal(
    createImportTimestampMatcher([])(parse(rows[0])),
    originals[0].id,
  );
});

await test('category boundaries use the higher applicable category and SQL counts each record once', () => {
  const cases = [
    [119, 79, 0],
    [120, 79, 1],
    [129, 79, 1],
    [130, 79, 2],
    [139, 79, 2],
    [140, 79, 3],
    [179, 79, 3],
    [180, 79, 4],
    [119, 80, 2],
    [119, 89, 2],
    [119, 90, 3],
    [119, 119, 3],
    [119, 120, 4],
    [190, 85, 4],
    [135, 100, 3],
  ];
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(
      'CREATE TABLE bloodpressure (id INTEGER PRIMARY KEY, systolic_blood_pressure REAL, diastolic_blood_pressure REAL, pulse INTEGER)',
    );
    for (const [index, [systolic, diastolic, expected]] of cases.entries()) {
      assert.equal(bloodPressureCategory(systolic, diastolic), expected);
      db.prepare('INSERT INTO bloodpressure VALUES (?, ?, ?, ?)').run(
        index,
        systolic,
        diastolic,
        70,
      );
      const single = db
        .prepare(bloodPressureStatisticsQuery)
        .get(index, index, -1, 0);
      assert.ok(single);
      assert.equal(single[`percent${expected}`], 1);
      assert.equal(
        [0, 1, 2, 3, 4].reduce(
          (sum, category) => sum + Number(single[`percent${category}`]),
          0,
        ),
        1,
      );
    }
    const aggregate = db
      .prepare(bloodPressureStatisticsQuery)
      .get(100, 0, -1, 0);
    assert.ok(aggregate);
    assert.equal(aggregate.count, cases.length);
    assert.equal(
      [0, 1, 2, 3, 4].reduce(
        (sum, category) => sum + Number(aggregate[`percent${category}`]),
        0,
      ),
      cases.length,
    );
    assert.equal(aggregate.pulse, 70);
  } finally {
    db.close();
  }
});

await test('deletion failure clears loading, reports the error and allows a successful retry', async () => {
  const loading: boolean[] = [];
  const errors: unknown[] = [];
  const reportError = (error: unknown) => errors.push(error);
  const failure = new Error('Database write failed');
  const rows = new Set([1]);
  const failed = await runWithLoading(
    () => Promise.reject(failure),
    (value) => loading.push(value),
    reportError,
  );
  assert.equal(failed, false);
  assert.deepEqual(loading, [true, false]);
  assert.deepEqual(errors, [failure]);
  assert.equal(rows.size, 1);
  const succeeded = await runWithLoading(
    () => {
      rows.clear();
      return Promise.resolve();
    },
    (value) => loading.push(value),
    reportError,
  );
  assert.equal(succeeded, true);
  assert.equal(rows.size, 0);
  assert.deepEqual(loading, [true, false, true, false]);
  assert.deepEqual(errors, [failure]);
});

await test('workbook encoding retains headers for an empty export and rejects a missing worksheet', () => {
  const empty = encodeRecordWorkbook([]);
  assert.deepEqual(decodeRecordWorkbook(empty), []);
  const workbook = XLSX.read(empty, { type: 'base64' });
  assert.equal(workbook.Sheets.Sheet1.A1.v, 'Systolic');
  assert.equal(workbook.Sheets.Sheet1.K1.v, 'Milliseconds');
  const wrongSheet = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wrongSheet,
    XLSX.utils.aoa_to_sheet([['Year']]),
    'Other',
  );
  assert.throws(
    () =>
      decodeRecordWorkbook(
        XLSX.write(wrongSheet, { type: 'base64', bookType: 'xlsx' }) as string,
      ),
    /Missing Sheet1/,
  );
});

await test('batch import preserves progress, skips invalid rows and continues after a failed write', async () => {
  const progress: number[][] = [];
  const errors: number[] = [];
  const ids: number[] = [];
  const timestamp = parse(validRow).timestamp;
  await importRecordRows(
    [validRow, { ...validRow, Date: 31 }, { ...validRow, Date: 28 }],
    [{ id: timestamp + 123 }],
    (record) => {
      ids.push(record.timestamp);
      return ids.length === 1
        ? Promise.reject(new Error('write failed'))
        : Promise.resolve();
    },
    (done, total) => progress.push([done, total]),
    (rowNumber) => errors.push(rowNumber),
  );
  assert.deepEqual(progress, [
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
  ]);
  assert.deepEqual(errors, [1]);
  assert.deepEqual(ids, [
    timestamp + 123,
    parse({ ...validRow, Date: 28 }).timestamp,
  ]);
});
