export interface ImportedRecord {
  timestamp: number;
  exactTimestamp: boolean;
  systolic: number;
  diastolic: number;
  pulse: number;
  remark: string;
}

const numericValue = (value: unknown) =>
  typeof value === 'number' ||
  (typeof value === 'string' && value.trim() !== '')
    ? Number(value)
    : NaN;

export const parseImportRecord = (
  row: Record<string, unknown>,
): ImportedRecord | null => {
  const [year, month, day, hours, minutes, seconds] = [
    'Year',
    'Month',
    'Date',
    'Hours',
    'Minutes',
    'Seconds',
  ].map((key) => numericValue(row[key]));
  const exactTimestamp =
    row.Milliseconds !== undefined && row.Milliseconds !== '';
  const milliseconds = exactTimestamp ? numericValue(row.Milliseconds) : 0;
  if (
    ![year, month, day, hours, minutes, seconds, milliseconds].every(
      Number.isInteger,
    ) ||
    year < 1 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59 ||
    milliseconds < 0 ||
    milliseconds > 999
  )
    return null;

  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(hours, minutes, seconds, milliseconds);
  // Reject calendar rollover and local times skipped by daylight-saving changes.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes ||
    date.getSeconds() !== seconds
  )
    return null;
  const [systolic, diastolic, pulse] = ['Systolic', 'Diastolic', 'Pulse'].map(
    (key) => numericValue(row[key]),
  );
  if (
    ![systolic, diastolic, pulse].every(
      (value) => Number.isFinite(value) && value > 20 && value < 250,
    )
  )
    return null;
  return {
    timestamp: date.valueOf(),
    exactTimestamp,
    systolic,
    diastolic,
    pulse,
    remark: (['string', 'number', 'boolean'].includes(typeof row.Remark)
      ? String(row.Remark as string | number | boolean)
      : ''
    ).substring(0, 300),
  };
};

// Legacy spreadsheets omit milliseconds. Match independently within each second,
// so row order cannot prevent a later row from finding its existing record.
export const createImportTimestampMatcher = (records: { id: number }[]) => {
  const idsBySecond = new Map<number, number[]>();
  for (const { id } of [...records].sort((a, b) => b.id - a.id)) {
    const second = Math.floor(id / 1000);
    const ids = idsBySecond.get(second) ?? [];
    ids.push(id);
    idsBySecond.set(second, ids);
  }
  const consumed = new Map<number, number>();
  return (record: ImportedRecord) => {
    if (record.exactTimestamp) return record.timestamp;
    const second = Math.floor(record.timestamp / 1000);
    const ids = idsBySecond.get(second);
    if (!ids?.length) return record.timestamp;
    const index = consumed.get(second) ?? 0;
    consumed.set(second, index + 1);
    return ids[Math.min(index, ids.length - 1)];
  };
};

export const importRecordRows = async (
  rows: Record<string, unknown>[],
  existing: { id: number }[],
  save: (record: ImportedRecord) => Promise<unknown>,
  onProgress: (done: number, total: number) => void,
  onRowError: (rowNumber: number, error: unknown) => void,
) => {
  const matchTimestamp = createImportTimestampMatcher(existing);
  onProgress(0, rows.length);
  for (const [index, row] of rows.entries()) {
    const record = parseImportRecord(row);
    try {
      if (record) await save({ ...record, timestamp: matchTimestamp(record) });
    } catch (error) {
      onRowError(index + 1, error);
    } finally {
      onProgress(index + 1, rows.length);
    }
  }
};

export const toSpreadsheetRow = (record: {
  id: number;
  systolic_blood_pressure: number;
  diastolic_blood_pressure: number;
  pulse: number;
  remark?: string;
}) => {
  const date = new Date(record.id);
  return {
    Systolic: record.systolic_blood_pressure,
    Diastolic: record.diastolic_blood_pressure,
    Pulse: record.pulse,
    Year: date.getFullYear(),
    Month: date.getMonth() + 1,
    Date: date.getDate(),
    Hours: date.getHours(),
    Minutes: date.getMinutes(),
    Seconds: date.getSeconds(),
    Remark: record.remark ?? '',
    Milliseconds: date.getMilliseconds(),
  };
};
