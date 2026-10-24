import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from '@/components/UI/Text';

import { LanguageType, useLocalisation } from 'hooks/useLocalisation';
import { useAppSelector } from 'hooks/useRedux';
import * as bloodPressureActions from '../../store/actions/bloodPressure';

import pkg from '../../app.json';
import { SingleChoice } from '../../components/MultipleChoice/DropdownList';
import { MainButton } from '../../components/UI/MainButton';
import { MainButtonClear } from '../../components/UI/MainButtonClear';
import { Colors } from '../../constants/Colors';
import { FontSize } from '../../constants/FontSize';
import { importRecordRows } from '../../helpers/importRecords';
import { pickRecordRows, shareRecordFile } from '../../services/recordFiles';
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

export const RecordOutputScreen: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { t, locale, locale2, setLocale } = useLocalisation();
  const [bloodPressures, setBloodPressures] = useState<BloodPressure[]>([]);
  const bloodPressuresUpdateIndicator = useAppSelector(
    (state) => state.bloodPressure.update,
  );

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
    setIsImporting(true);
    setIsLoading(true);
    setImportCount(0);
    setImportTotal(0);
    try {
      const rows = await pickRecordRows();
      if (rows === null) return;
      const existing = await bloodPressureActions.fetchBloodPressure(
        -1,
        -1,
        '0001-01-01T00:00:00.000Z',
        '9999-12-31T23:59:59.999Z',
        null,
      );
      await importRecordRows(
        rows,
        existing,
        (record) =>
          bloodPressureActions.addBloodPressure(
            new Date(record.timestamp).toISOString(),
            record.systolic,
            record.diastolic,
            record.pulse,
            true,
            true,
            record.remark,
          ),
        (done, total) => {
          setImportCount(done);
          setImportTotal(total);
        },
        (rowNumber, error) =>
          Alert.alert(
            t('sorry'),
            `${t('error_occur_importing')}${rowNumber}, ${error instanceof Error ? error.message : 'Unknown'}`,
            [{ text: t('okay'), style: 'cancel' }],
          ),
      );
    } catch {
      Alert.alert(t('sorry'), t('error_occur_relaunch_apps'), [
        { text: t('okay'), style: 'cancel' },
      ]);
    } finally {
      setIsImporting(false);
      setIsLoading(false);
      bloodPressureActions.forceUpdateBPState();
    }
  }, [t]);

  const onExportButtonPress = useCallback(
    () => shareRecordFile(bloodPressures),
    [bloodPressures],
  );

  const onDownloadSamplePress = useCallback(
    () =>
      shareRecordFile([
        {
          id: Date.now(),
          systolic_blood_pressure: 113,
          diastolic_blood_pressure: 79,
          pulse: 63,
          remark: 'Left Arm',
        },
        {
          id: Date.now() - 12 * 60 * 60 * 1000,
          systolic_blood_pressure: 116,
          diastolic_blood_pressure: 75,
          pulse: 64,
          remark: 'Right Arm',
        },
      ]),
    [],
  );

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
