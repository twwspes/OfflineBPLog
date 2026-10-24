import type {
  BloodPressureGeneralType,
  BloodPressureType,
  BloodPressureTypeForAggregatedResult,
} from './dbBloodPressure';

interface ChartDatabase {
  getAllAsync<T>(source: string, params: number[]): Promise<T[]>;
}

export interface ChartQuery {
  until: number;
  from: number;
  limit: number;
  offset: number;
  sample: number | null | undefined;
}

export const bloodPressureRangeQuery = ({
  until,
  from,
  limit,
  offset,
}: Omit<ChartQuery, 'sample'>) => ({
  source: `SELECT * FROM bloodpressure WHERE id <= ? AND id >= ? ORDER BY id DESC${limit >= 0 && offset >= 0 ? ' LIMIT ? OFFSET ?' : ''};`,
  params:
    limit >= 0 && offset >= 0 ? [until, from, limit, offset] : [until, from],
});

// Number records once instead of recounting all earlier records for every row.
// Preserve the legacy ascending selection and bucket sizes, even when the
// selected page is smaller than the complete date range.
const selectedRows = `WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY id ASC) AS row_number
  FROM bloodpressure WHERE id <= ? AND id >= ?
), selected AS (
  SELECT *, CAST((row_number - 1) / ? AS INTEGER) AS grp
  FROM ranked ORDER BY id ASC LIMIT ? OFFSET ?
)`;

const aggregateQuery = `${selectedRows}
SELECT grp,
  AVG(systolic_blood_pressure) AS systolic_blood_pressure,
  MAX(systolic_blood_pressure) AS max_systolic_blood_pressure,
  MIN(systolic_blood_pressure) AS min_systolic_blood_pressure,
  AVG(diastolic_blood_pressure) AS diastolic_blood_pressure,
  MAX(diastolic_blood_pressure) AS max_diastolic_blood_pressure,
  MIN(diastolic_blood_pressure) AS min_diastolic_blood_pressure,
  AVG(pulse) AS pulse, MAX(pulse) AS max_pulse, MIN(pulse) AS min_pulse,
  CAST(AVG(id) AS INTEGER) AS id, COUNT(id) AS cnt
FROM selected GROUP BY grp ORDER BY grp ASC;`;

type Aggregate = Omit<
  BloodPressureTypeForAggregatedResult,
  'typename' | 'systolic_sd' | 'diastolic_sd' | 'pulse_sd'
>;
type GroupRow = BloodPressureType & { grp: number };

export const fetchChartData = async (
  database: ChartDatabase,
  query: ChartQuery,
): Promise<BloodPressureGeneralType> => {
  const raw = async (): Promise<BloodPressureGeneralType> => {
    const { source, params } = bloodPressureRangeQuery(query);
    return {
      typename: 'BloodPressureType',
      array: await database.getAllAsync<BloodPressureType>(source, params),
    };
  };
  if (
    query.sample == null ||
    !Number.isFinite(query.sample) ||
    query.sample <= 1
  )
    return raw();

  // Compute division in SQLite to retain its integer/real binding semantics.
  const [range] = await database.getAllAsync<{
    count: number;
    bucketSize: number;
  }>(
    `SELECT COUNT(*) AS count, MAX(1, COUNT(*) / ?) AS bucketSize
     FROM bloodpressure WHERE id <= ? AND id >= ?;`,
    [query.sample, query.until, query.from],
  );
  const paginated = query.limit >= 0 && query.offset >= 0;
  const limit = paginated ? query.limit : -1;
  const offset = paginated ? query.offset : 0;
  const pageCount = Math.min(
    limit < 0 ? Infinity : limit,
    Math.max(0, range.count - offset),
  );
  if (pageCount < 24) return raw();

  const params = [query.until, query.from, range.bucketSize, limit, offset];
  const aggregates = await database.getAllAsync<Aggregate & { grp: number }>(
    aggregateQuery,
    params,
  );
  const rows = await database.getAllAsync<GroupRow>(
    `${selectedRows} SELECT id, systolic_blood_pressure, diastolic_blood_pressure, pulse, grp FROM selected ORDER BY id ASC;`,
    params,
  );
  const groups = new Map(
    aggregates.map(({ grp, ...aggregate }) => [
      grp,
      {
        aggregate,
        systolicVariance: 0,
        diastolicVariance: 0,
        pulseVariance: 0,
      },
    ]),
  );
  for (const row of rows) {
    const group = groups.get(row.grp);
    if (!group)
      throw new Error('Chart records changed while calculating statistics.');
    const systolicDifference =
      row.systolic_blood_pressure - group.aggregate.systolic_blood_pressure;
    const diastolicDifference =
      row.diastolic_blood_pressure - group.aggregate.diastolic_blood_pressure;
    const pulseDifference = row.pulse - group.aggregate.pulse;
    // Keep the existing population SD calculation and accumulation order.
    group.systolicVariance += systolicDifference * systolicDifference;
    group.diastolicVariance += diastolicDifference * diastolicDifference;
    group.pulseVariance += pulseDifference * pulseDifference;
  }
  const result = [...groups.values()].map(
    ({ aggregate, systolicVariance, diastolicVariance, pulseVariance }) => ({
      ...aggregate,
      systolic_sd: Math.sqrt(systolicVariance / aggregate.cnt),
      diastolic_sd: Math.sqrt(diastolicVariance / aggregate.cnt),
      pulse_sd: Math.sqrt(pulseVariance / aggregate.cnt),
    }),
  );
  return {
    typename: 'BloodPressureTypeForAggregatedResult',
    array: result as BloodPressureTypeForAggregatedResult[],
  };
};
