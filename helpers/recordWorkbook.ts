import * as XLSX from 'xlsx';

import type { toSpreadsheetRow } from './importRecords';

export type SpreadsheetRecord = Parameters<typeof toSpreadsheetRow>[0];
type SpreadsheetRow = ReturnType<typeof toSpreadsheetRow>;

const headers = [
  'Systolic',
  'Diastolic',
  'Pulse',
  'Year',
  'Month',
  'Date',
  'Hours',
  'Minutes',
  'Seconds',
  'Remark',
  'Milliseconds',
];

export const encodeRecordWorkbook = (rows: SpreadsheetRow[]) => {
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: headers,
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;
};

export const decodeRecordWorkbook = (base64: string) => {
  const workbook = XLSX.read(base64, { type: 'base64' });
  if (!workbook.Sheets.Sheet1) throw new Error('Missing Sheet1 worksheet.');
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets.Sheet1,
  );
};
