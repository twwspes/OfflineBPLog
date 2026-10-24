import { strict as assert } from 'node:assert';
import { performance } from 'node:perf_hooks';

import { fetchChartData } from '../helpers/chartAggregation.ts';
import { fetchLegacyChart } from './fixtures/legacyChart.ts';
import { createChartDatabase } from './fixtures/chartDatabase.ts';

console.log(
  'Synthetic in-memory SQLite benchmark; timings exclude the native bridge.',
);
for (const size of [1000, 5000, 20000]) {
  const { db, reader, firstId } = createChartDatabase(size);
  try {
    const until = firstId + size * 60000;
    const query = { until, from: firstId, limit: 20000, offset: 0, sample: 12 };
    const before = performance.now();
    const expected = await fetchLegacyChart(
      reader,
      until,
      firstId,
      20000,
      0,
      12,
    );
    const legacyMs = performance.now() - before;
    const times: number[] = [];
    for (let run = 0; run < 3; run += 1) {
      const start = performance.now();
      const actual = await fetchChartData(reader, query);
      times.push(performance.now() - start);
      assert.deepEqual(actual, expected);
    }
    const medianMs = times.sort((a, b) => a - b)[1];
    console.log(
      JSON.stringify({
        records: size,
        legacyMs: Number(legacyMs.toFixed(1)),
        optimizedMedianMs: Number(medianMs.toFixed(1)),
        speedup: Number((legacyMs / medianMs).toFixed(1)),
        resultsMatch: true,
      }),
    );
  } finally {
    db.close();
  }
}
