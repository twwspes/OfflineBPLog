import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { fetchChartData } from '../helpers/chartAggregation.ts';
import { fetchLegacyChart } from './fixtures/legacyChart.ts';
import { createChartDatabase } from './fixtures/chartDatabase.ts';

await test('optimized chart queries exactly match legacy values for raw and aggregated date ranges', async () => {
  for (const integers of [true, false]) {
    for (const size of [0, 1, 23, 24, 25, 48, 101, 300]) {
      const { db, reader, firstId } = createChartDatabase(size, integers);
      try {
        for (const sample of [null, undefined, 1, 2.5, 3, 7, 12]) {
          for (const [from, until, limit] of [
            [firstId, firstId + size * 60000, 20000],
            [
              firstId + 5 * 60000,
              firstId + Math.max(5, size - 5) * 60000,
              20000,
            ],
            [firstId, firstId + size * 60000, 24],
          ]) {
            const expected = await fetchLegacyChart(
              reader,
              until,
              from,
              limit,
              0,
              sample,
            );
            const actual = await fetchChartData(reader, {
              until,
              from,
              limit,
              offset: 0,
              sample,
            });
            assert.deepEqual(
              actual,
              expected,
              `size=${size}, integerBindings=${integers}, sample=${sample}, limit=${limit}`,
            );
          }
        }
      } finally {
        db.close();
      }
    }
  }
});

await test('pagination preserves global bucket positions, counts and selected records without assuming groups start at zero', async () => {
  const { db, reader, firstId } = createChartDatabase(100);
  try {
    const result = await fetchChartData(reader, {
      until: firstId + 100 * 60000,
      from: firstId,
      limit: 25,
      offset: 50,
      sample: 12,
    });
    assert.equal(result.typename, 'BloodPressureTypeForAggregatedResult');
    if (result.typename !== 'BloodPressureTypeForAggregatedResult') return;
    assert.equal(
      result.array.reduce((count, row) => count + row.cnt, 0),
      25,
    );
    assert.deepEqual(
      result.array.map(({ cnt }) => cnt),
      [6, 8, 8, 3],
    );
    assert.ok(
      result.array.every(
        (row) =>
          Number.isFinite(row.systolic_sd) && row.id >= firstId + 50 * 60000,
      ),
    );
  } finally {
    db.close();
  }
});

await test('unlimited queries and the 24-record switch retain existing behaviour', async () => {
  const { db, reader, firstId } = createChartDatabase(48);
  try {
    const query = {
      until: firstId + 48 * 60000,
      from: firstId,
      limit: -1,
      offset: -1,
      sample: 12,
    };
    assert.deepEqual(
      await fetchChartData(reader, query),
      await fetchLegacyChart(reader, query.until, query.from, -1, -1, 12),
    );
    const raw = await fetchChartData(reader, {
      ...query,
      limit: 23,
      offset: 0,
    });
    assert.equal(raw.typename, 'BloodPressureType');
    assert.equal(raw.array.length, 23);
    const empty = await fetchChartData(reader, {
      ...query,
      limit: 100,
      offset: 100,
    });
    assert.deepEqual(empty, { typename: 'BloodPressureType', array: [] });
  } finally {
    db.close();
  }
});

await test('oversized sample counts produce finite one-record buckets instead of dividing by zero', async () => {
  const { db, reader, firstId } = createChartDatabase(24);
  try {
    const query = {
      until: firstId + 24 * 60000,
      from: firstId,
      limit: 100,
      offset: 0,
      sample: 100,
    };
    const result = await fetchChartData(reader, query);
    assert.equal(result.typename, 'BloodPressureTypeForAggregatedResult');
    if (result.typename !== 'BloodPressureTypeForAggregatedResult') return;
    assert.equal(result.array.length, 24);
    assert.ok(
      result.array.every(
        (row) =>
          row.cnt === 1 &&
          row.systolic_sd === 0 &&
          row.diastolic_sd === 0 &&
          row.pulse_sd === 0,
      ),
    );
  } finally {
    db.close();
  }
});
