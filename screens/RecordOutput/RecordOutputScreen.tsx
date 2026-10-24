import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from '@/components/UI/Text';
import moment from 'moment/min/moment-with-locales';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { LanguageType, useLocalisation } from 'hooks/useLocalisation';
import { useAppSelector } from 'hooks/useRedux';
import * as bloodPressureActions from '../../store/actions/bloodPressure';

import pkg from '../../app.json';
import { SingleChoice } from '../../components/MultipleChoice/DropdownList';
import { MainButton } from '../../components/UI/MainButton';
import { MainButtonClear } from '../../components/UI/MainButtonClear';
import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';
import {
  createImportTimestampMatcher,
  parseImportRecord,
  toSpreadsheetRow,
} from '../../helpers/importRecords';
import { runWithLoading } from '../../helpers/runWithLoading';

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
  languageContainer: {
    width: '90%',
    marginBottom: 14,
  },
  languageLabel: {
    color: Colors.grey,
    fontSize: FontSize.smallContent,
    marginBottom: 6,
    textAlign: 'center',
  },
  languageButton: {
    minHeight: 50,
  },
  languageButtonText: {
    fontSize: FontSize.content,
  },
});

interface BloodPressure {
  id: number;
  systolic_blood_pressure: number;
  diastolic_blood_pressure: number;
  pulse: number;
  remark?: string;
}

const XLSX_SHARING_OPTIONS = {
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  UTI: 'org.openxmlformats.spreadsheetml.sheet',
};

export const RecordOutputScreen: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { t, locale, locale2, setLocale } = useLocalisation();
  const [bloodPressures, setBloodPressures] = useState<BloodPressure[]>([]);
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

  const onLanguageSelected = useCallback(
    (_: string, value: string | number | null) => {
      if (typeof value === 'string') {
        setLocale(value as LanguageType);
      }
    },
    [setLocale],
  );

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

  const deleteAllLogsHandler = () => {
    const handleDeleteAll = async () => {
      await runWithLoading(
        bloodPressureActions.deleteAllBloodPressures,
        setIsLoading,
        (error) => {
          setError(error instanceof Error ? error.message : t('error_occur'));
        },
      );
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

        if (!workbook.Sheets.Sheet1)
          throw new Error('Missing Sheet1 worksheet.');
        const importJsonArray = XLSX.utils.sheet_to_json<
          Record<string, unknown>
        >(workbook.Sheets.Sheet1);
        // console.log("RecordOutputScreen json", importJsonArray);

        if (importJsonArray !== undefined) {
          // console.log('RecordOutputScreen json is valid');

          // Use fresh IDs rather than a possibly stale screen snapshot.
          const existing = await bloodPressureActions.fetchBloodPressure(
            -1,
            -1,
            '0001-01-01T00:00:00.000Z',
            '9999-12-31T23:59:59.999Z',
            null,
          );
          const matchTimestamp = createImportTimestampMatcher(existing);

          setImportTotal(importJsonArray.length);
          setImportCount(0);

          for (let i = 0; i < importJsonArray.length; i += 1) {
            const record = parseImportRecord(importJsonArray[i]);
            if (!record) {
              setImportCount((prev) => prev + 1);
              continue;
            }
            try {
              await bloodPressureActions.addBloodPressure(
                new Date(matchTimestamp(record)).toISOString(),
                record.systolic,
                record.diastolic,
                record.pulse,
                true,
                true,
                record.remark,
              );
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
    } catch {
      // console.log('RecordOutputScreen Import xml Error: ', err);
      Alert.alert(t('sorry'), t('error_occur_relaunch_apps'), [
        { text: t('okay'), style: 'cancel' },
      ]);
      setIsImporting(false);
      setIsLoading(false);
    }
    bloodPressureActions.forceUpdateBPState();
  }, [t]);

  const onExportButtonPress = useCallback(async () => {
    if (FileSystem.documentDirectory !== null) {
      const bloodPressuresJson = bloodPressures.map(toSpreadsheetRow);
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
            'Milliseconds',
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
          XLSX_SHARING_OPTIONS,
        );
      }
    }
  }, [bloodPressures]);

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
      const bloodPressuresJson = sampleBloodPressureLog.map(toSpreadsheetRow);
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
            'Milliseconds',
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
          XLSX_SHARING_OPTIONS,
        );
      }
    }
  }, []);

  return (
    <View style={styles.screen}>
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
          <View style={styles.languageContainer}>
            <Text style={styles.languageLabel}>{t('language')}</Text>
            <SingleChoice
              id="language"
              onItemSelected={onLanguageSelected}
              initialValue={locale}
              items={[
                { label: 'English', value: 'en' },
                { label: 'Français', value: 'fr' },
                { label: 'Español', value: 'es' },
                { label: '繁體中文', value: 'zh_HK' },
                { label: '简体中文', value: 'zh_CN' },
              ]}
              buttonStyle={styles.languageButton}
              buttonTextStyle={styles.languageButtonText}
            />
          </View>
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
    </View>
  );
};
