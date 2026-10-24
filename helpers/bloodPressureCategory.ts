// Existing app thresholds, evaluated from highest to lowest severity.
const thresholds = [
  { category: 4, systolic: 180, diastolic: 120 },
  { category: 3, systolic: 140, diastolic: 90 },
  { category: 2, systolic: 130, diastolic: 80 },
  { category: 1, systolic: 120, diastolic: null },
] as const;

export const bloodPressureCategory = (
  systolic: number | null,
  diastolic: number | null,
) => {
  if (
    systolic === null ||
    diastolic === null ||
    !Number.isFinite(systolic) ||
    !Number.isFinite(diastolic)
  )
    return 4;
  return (
    thresholds.find(
      (threshold) =>
        systolic >= threshold.systolic ||
        (threshold.diastolic !== null && diastolic >= threshold.diastolic),
    )?.category ?? 0
  );
};

const categorySQL = `CASE ${thresholds
  .map(
    ({ category, systolic, diastolic }) =>
      `WHEN systolic_blood_pressure >= ${systolic}${diastolic === null ? '' : ` OR diastolic_blood_pressure >= ${diastolic}`} THEN ${category}`,
  )
  .join(' ')} ELSE 0 END`;

export const bloodPressureStatisticsQuery = `
  SELECT AVG(systolic_blood_pressure) AS systolic_blood_pressure,
    MAX(systolic_blood_pressure) AS max_systolic_blood_pressure,
    MIN(systolic_blood_pressure) AS min_systolic_blood_pressure,
    AVG(diastolic_blood_pressure) AS diastolic_blood_pressure,
    MAX(diastolic_blood_pressure) AS max_diastolic_blood_pressure,
    MIN(diastolic_blood_pressure) AS min_diastolic_blood_pressure,
    AVG(pulse) AS pulse, MAX(pulse) AS max_pulse, MIN(pulse) AS min_pulse,
    ${[0, 1, 2, 3, 4].map((category) => `SUM(CASE WHEN category = ${category} THEN 1 ELSE 0 END) AS percent${category}`).join(',\n    ')},
    COUNT(id) AS count
  FROM (SELECT *, ${categorySQL} AS category FROM bloodpressure WHERE id <= ? AND id >= ?)
  LIMIT ? OFFSET ?;`;
