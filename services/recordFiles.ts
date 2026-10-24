import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { toSpreadsheetRow } from '../helpers/importRecords';
import {
  decodeRecordWorkbook,
  encodeRecordWorkbook,
  SpreadsheetRecord,
} from '../helpers/recordWorkbook';

const mimeType =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const pickRecordRows = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: ['application/vnd.ms-excel', mimeType],
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return decodeRecordWorkbook(base64);
};

export const shareRecordFile = async (records: SpreadsheetRecord[]) => {
  if (FileSystem.documentDirectory === null) return;
  const path = `${FileSystem.documentDirectory}BloodPressure.xlsx`;
  await FileSystem.writeAsStringAsync(
    path,
    encodeRecordWorkbook(records.map(toSpreadsheetRow)),
    {
      encoding: FileSystem.EncodingType.Base64,
    },
  );
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType,
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }
};
