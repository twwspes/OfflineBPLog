/* eslint-disable no-await-in-loop */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useLocalisation } from 'hooks/useLocalisation';
import { useAppSelector } from 'hooks/useRedux';
import * as bloodPressureActions from '../../store/actions/bloodPressure';

import pkg from '../../app.json';
import { MainButton } from '../../components/UI/MainButton';
import { MainButtonClear } from '../../components/UI/MainButtonClear';
import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';
import { isValidDate } from '../../helpers/isValidDate';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  inputContainer: {
    width: '90%',
  },
  input: {
    marginVertical: 7,
  },
  buttonContainer: {
    width: '90%',
    marginVertical: 7,
  },
});

interface BloodPressure {
  id: number;
  systolic_blood_pressure: number;
  diastolic_blood_pressure: number;
  pulse: number;
  remark?: string;
}

export const RecordOutputScreen: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { t, locale2 } = useLocalisation();
  const [bloodPressures, setBloodPressures] = useState<BloodPressure[]>([]);
  const [bloodPressuresReverse, setBloodPressuresReverse] = useState<
    BloodPressure[]
  >([]);
  const bloodPressuresUpdateIndicator = useAppSelector(
    (state) => state.bloodPressure.update,
  );
  moment.locale(locale2);

  const [importTotal, setImportTotal] = useState(0);
  const [importCount, setImportCount] = useState(0);

  const localePrefixes = ['zh', 'fr', 'es'] as const;

  const foundPrefix = localePrefixes.find((prefix) => locale2.includes(prefix));

  const privacyPolicyWebsite = foundPrefix
    ? `https://twwspes.github.io/OfflineBPLog-Intro/?lang=${foundPrefix}`
    : 'https://twwspes.github.io/OfflineBPLog-Intro/';

  useEffect(() => {
    if (error) {
      Alert.alert(t('error_occur'), error, [
        { text: t('okay'), onPress: () => setError(undefined) },
      ]);
    }
  }, [error, t]);

  useEffect(() => {
    const downloadItems = async () => {
      setError(undefined);
      setIsLoading(true);
      try {
        const nowISODateString = new Date().toISOString();
        const beginningISODateString = '1970-01-01T00:00:00.000Z';

        const result = await bloodPressureActions.fetchBloodPressure(
          -1,
          -1,
          beginningISODateString,
          nowISODateString,
          null,
        );

        setBloodPressures(result);
      } catch (err: unknown) {
        setBloodPressures([]);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('error_occur'));
        }
      }
      setIsLoading(false);
    };

    void downloadItems();
  }, [bloodPressuresUpdateIndicator, t]);

  useEffect(() => {
    setBloodPressuresReverse(bloodPressures);
  }, [bloodPressures]);

  const deleteAllLogsHandler = () => {
    const handleDeleteAll = async () => {
      setIsLoading(true);
      await bloodPressureActions.deleteAllBloodPressures();
      setIsLoading(false);
    };

    Alert.alert(t('warning'), t('all_logs_removed_warning'), [
      {
        text: t('okay'),
        onPress: () => {
          void handleDeleteAll(); // no `await`, so it's void-returning
        },
      },
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  const onImportButtonPress = useCallback(async () => {
    try {
      setIsImporting(true);
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      });
      // console.log('RecordOutputScreen result', result);

      if (!result.canceled && !!result.assets[0].uri) {
        const path = result.assets[0].uri;

        const b64 = await FileSystem.readAsStringAsync(path, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const workbook = XLSX.read(b64, { type: 'base64' });

        const importJsonArray = XLSX.utils.sheet_to_json<{
          Year: number;
          Month: number;
          Date: number;
          Hours: number;
          Minutes: number;
          Seconds: number;
          Systolic: number;
          Diastolic: number;
          Pulse: number;
          Remark: string | undefined;
        }>(workbook.Sheets.Sheet1);
        // console.log("RecordOutputScreen json", importJsonArray);

        if (importJsonArray !== undefined) {
          // console.log('RecordOutputScreen json is valid');

          let bloodPressuresReverseIndex = 0;

          setImportTotal(importJsonArray.length);
          setImportCount(0);

          for (let i = 0; i < importJsonArray.length; i += 1) {
            const item = importJsonArray[i];

            const date = new Date(
              item.Year,
              item.Month - 1,
              item.Date,
              item.Hours,
              item.Minutes,
              item.Seconds,
            );

            const isValid = isValidDate(date);
            const isInRange =
              item.Systolic > 20 &&
              item.Systolic < 250 &&
              item.Diastolic > 20 &&
              item.Diastolic < 250 &&
              item.Pulse > 20 &&
              item.Pulse < 250;

            if (!isValid || !isInRange) {
              setImportCount((prev) => prev + 1);
              // eslint-disable-next-line no-continue
              continue;
            }

            const remark = item.Remark?.toString().substring(0, 300) || '';
            const dateValue = date.valueOf();

            const matchedIndex = bloodPressuresReverse
              .slice(bloodPressuresReverseIndex)
              .findIndex((bp) => {
                const bpTimestamp = Math.floor(Number(bp.id) / 1000) * 1000;
                return dateValue >= bpTimestamp;
              });

            try {
              if (matchedIndex !== -1) {
                const index = bloodPressuresReverseIndex + matchedIndex;
                const bp = bloodPressuresReverse[index];
                const bpTimestamp = Math.floor(Number(bp.id) / 1000) * 1000;
                const idToUse = dateValue === bpTimestamp ? bp.id : dateValue;

                await bloodPressureActions.addBloodPressure(
                  new Date(idToUse).toISOString(),
                  item.Systolic,
                  item.Diastolic,
                  item.Pulse,
                  remark !== '',
                  true,
                  remark,
                );

                bloodPressuresReverseIndex = index + 1;
              } else {
                await bloodPressureActions.addBloodPressure(
                  new Date(dateValue).toISOString(),
                  item.Systolic,
                  item.Diastolic,
                  item.Pulse,
                  remark !== '',
                  true,
                  remark,
                );
              }
            } catch (e: unknown) {
              if (e instanceof Error) {
                Alert.alert(
                  t('sorry'),
                  `${t('error_occur_importing')}${i + 1}, ${e.message}`,
                  [{ text: t('okay'), style: 'cancel' }],
                );
              } else {
                Alert.alert(
                  t('sorry'),
                  `${t('error_occur_importing')}${i + 1}, Unknown`,
                  [{ text: t('okay'), style: 'cancel' }],
                );
              }
            }

            setImportCount((prev) => prev + 1);
          }
          setIsImporting(false);
          setIsLoading(false);
        } else {
          Alert.alert(t('sorry'), t('error_occur_relaunch_apps'), [
            { text: t('okay'), style: 'cancel' },
          ]);
          setIsImporting(false);
          setIsLoading(false);
        }
      } else {
        setIsImporting(false);
        setIsLoading(false);
      }
    } catch (err) {
      // console.log('RecordOutputScreen Import xml Error: ', err);
      Alert.alert(t('sorry'), t('error_occur_relaunch_apps'), [
        { text: t('okay'), style: 'cancel' },
      ]);
      setIsImporting(false);
      setIsLoading(false);
    }
  }, [bloodPressuresReverse, t]);

  const onExportButtonPress = useCallback(async () => {
    if (FileSystem.documentDirectory !== null) {
      const bloodPressuresJson = bloodPressuresReverse.map((item) => {
        const dateTemp = new Date(item.id);
        return {
          systolic: item.systolic_blood_pressure,
          diastolic: item.diastolic_blood_pressure,
          pulse: item.pulse,
          year: dateTemp.getFullYear(),
          month: dateTemp.getMonth() + 1,
          date: dateTemp.getDate(),
          hours: dateTemp.getHours(),
          minutes: dateTemp.getMinutes(),
          seconds: dateTemp.getSeconds(),
          remark: item.remark ?? '',
        };
      });
      /* generate worksheet and workbook */
      const worksheet = XLSX.utils.json_to_sheet(bloodPressuresJson);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      /* fix headers */
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          [
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
          ],
        ],
        { origin: 'A1' },
      );

      /* calculate column width */
      // const max_width = bloodPressuresJson.reduce((w, r) => Math.max(w, r.name.length), 10);
      // worksheet["!cols"] = [{ wch: max_width }];
      const b64 = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      }) as string;
      // /* b64 is a Base64 string */
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}BloodPressure.xlsx`,
        b64,
        { encoding: FileSystem.EncodingType.Base64 },
      );

      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await Sharing.shareAsync(
          `${FileSystem.documentDirectory}BloodPressure.xlsx`,
        );
      }
    }
  }, [bloodPressuresReverse]);

  const onDownloadSamplePress = useCallback(async () => {
    if (FileSystem.documentDirectory !== null) {
      const sampleBloodPressureLog = [
        {
          id: new Date().valueOf(),
          systolic_blood_pressure: 113,
          diastolic_blood_pressure: 79,
          pulse: 63,
          remark: 'Left Arm',
        },
        {
          id: new Date().valueOf() - 12 * 60 * 60 * 1000,
          systolic_blood_pressure: 116,
          diastolic_blood_pressure: 75,
          pulse: 64,
          remark: 'Right Arm',
        },
      ];
      const bloodPressuresJson = sampleBloodPressureLog.map((item) => {
        const dateTemp = new Date(item.id);
        return {
          systolic: item.systolic_blood_pressure,
          diastolic: item.diastolic_blood_pressure,
          pulse: item.pulse,
          year: dateTemp.getFullYear(),
          month: dateTemp.getMonth() + 1,
          date: dateTemp.getDate(),
          hours: dateTemp.getHours(),
          minutes: dateTemp.getMinutes(),
          seconds: dateTemp.getSeconds(),
          remark: item.remark ?? '',
        };
      });
      /* generate worksheet and workbook */
      const worksheet = XLSX.utils.json_to_sheet(bloodPressuresJson);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      /* fix headers */
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          [
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
          ],
        ],
        { origin: 'A1' },
      );

      /* calculate column width */
      // const max_width = bloodPressuresJson.reduce((w, r) => Math.max(w, r.name.length), 10);
      // worksheet["!cols"] = [{ wch: max_width }];
      const b64 = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      }) as string;
      // /* b64 is a Base64 string */
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}BloodPressure.xlsx`,
        b64,
        { encoding: FileSystem.EncodingType.Base64 },
      );

      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await Sharing.shareAsync(
          `${FileSystem.documentDirectory}BloodPressure.xlsx`,
        );
      }
    }
  }, []);

  return (
    <TouchableOpacity
      style={styles.screen}
      onPress={Keyboard.dismiss}
      activeOpacity={1}
    >
      {isLoading && isImporting && (
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text>
            {t('importing')} {importCount} / {importTotal}
          </Text>
        </View>
      )}

      {isLoading && !isImporting && (
        <ActivityIndicator size="large" color={Colors.primary} />
      )}

      {!isLoading && (
        <>
          <View style={styles.buttonContainer}>
            <MainButton
              onPress={() => {
                void onImportButtonPress();
              }}
            >
              {t('import_xlsx')}
            </MainButton>
          </View>
          <View style={styles.buttonContainer}>
            <MainButton
              onPress={() => {
                void onExportButtonPress();
              }}
            >
              {t('export_xlsx')}
            </MainButton>
          </View>
          <View style={styles.buttonContainer}>
            <MainButton
              onPress={() => {
                void onDownloadSamplePress();
              }}
            >
              {t('download_sample_xlsx')}
            </MainButton>
          </View>
          <View style={styles.buttonContainer}>
            <MainButton onPress={deleteAllLogsHandler}>
              {t('delete_all_logs')}
            </MainButton>
          </View>
        </>
      )}
      <Text>BP Log v.{pkg.expo.version}</Text>
      <Text style={{ fontSize: 12 }}>
        {`© 2021-${new Date().getFullYear()} Tak Wai WONG`}
      </Text>
      <MainButtonClear
        onPress={() => {
          void Linking.openURL(privacyPolicyWebsite);
        }}
        buttonText={{ fontSize: FontSize.veryvarySmallContent }}
      >
        {t('privacy_policy')}
      </MainButtonClear>
    </TouchableOpacity>
  );
};
