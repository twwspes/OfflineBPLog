import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/UI/Text';
import moment from 'moment/min/moment-with-locales';
import { AntDesign } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { BloodPressureStackParamList } from 'types/navigation';
import { bloodPressureColorStyle } from 'constants/TrafficLightStyles';

import * as bloodPressureActions from '../../store/actions/bloodPressure';
import { MainButtonOutlineImage } from '../../components/UI/MainButtonOutlineImage';
import { Colors } from '../../constants/Colors';
import { useLocalisation } from '../../hooks/useLocalisation';
import { FontSize } from '../../constants/FontSize';
import { useAppSelector } from '../../hooks/useRedux';
import { usePaginatedRecords } from '../../hooks/usePaginatedRecords';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // paddingTop: Platform.OS === 'ios' ? 40 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  titleContainer: {
    height: '25%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    // backgroundColor: 'yellow'
  },
  titleTextContainter: {
    height: 30,
    // backgroundColor: 'green'
  },
  titleDataContainer: {
    width: '90%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    // backgroundColor: 'red'
  },
  titleToggleButton: {
    height: 30,
    minWidth: '30%',
    paddingHorizontal: 10,
    backgroundColor: Colors.primary,
    margin: 5,
    borderRadius: 30,
    justifyContent: 'center',
  },
  titleToggleButtonText: {
    // backgroundColor: 'yellow',
    textAlign: 'center',
    color: Colors.darkGreen,
  },
  titleDateContainer: {
    width: '90%',
    // height: 60,
  },
  dateTimeButton: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginVertical: 7,
  },
  button: {
    marginVertical: 7,
  },
  title: {
    fontSize: FontSize.content,
  },
  remark: {
    fontSize: FontSize.smallContent,
  },
  titleImage: {
    maxHeight: '60%',
    resizeMode: 'contain',
  },
  flatListContainer: {
    width: '95%',
    height: '75%',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  otherProfileCard: {
    height: 100,
    width: '100%',
    marginBottom: 0,
    backgroundColor: Colors.blur,
    overflow: 'visible',
    borderColor: Colors.lightGrey,
    marginVertical: 15,
  },
  dateContainer: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 5
  },
  dataContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  digitContainer: {
    width: '33%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  digit: {
    width: '100%',
    fontSize: FontSize.varyBigTitle,
    color: Colors.grey,
    textAlign: 'center',
  },
  unitText: {
    width: '100%',
    fontSize: FontSize.varySmallContent,
    color: Colors.grey,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: Colors.focus,
    borderRadius: 30,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 40,
    color: 'white',
  },
  descriptionContainer: {
    width: '90%',
    height: 400,
  },
  LowerBtnsText: {
    width: '100%',
    fontSize: FontSize.content,
    color: Colors.grey,
    textAlign: 'center',
  },
  activityIndicatorContainer: {
    width: '95%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface BloodPressureItem {
  id: number;
  systolic_blood_pressure: number;
  diastolic_blood_pressure: number;
  pulse: number;
  remark?: string;
}

interface FlatListItemProps {
  itemData: { item: BloodPressureItem };
  onFlatListItemPress: (itemData: { item: BloodPressureItem }) => void;
  noRecordLocalisedString: string;
}

const FlatListItem: React.FC<FlatListItemProps> = ({
  itemData,
  onFlatListItemPress,
  noRecordLocalisedString,
}) => {
  return (
    <MainButtonOutlineImage
      onPress={() => onFlatListItemPress(itemData)}
      style={{
        ...styles.otherProfileCard,
        height: itemData.item.remark ? 150 : 100,
      }}
    >
      <View style={styles.dateContainer}>
        {itemData.item.id ? (
          <Text style={styles.title}>
            {moment(itemData.item.id).format('lll')}
          </Text>
        ) : (
          <Text style={styles.title}>{noRecordLocalisedString}</Text>
        )}
      </View>
      <View style={styles.dataContainer}>
        <View style={styles.digitContainer}>
          {itemData.item.systolic_blood_pressure !== undefined ? (
            <Text
              style={{
                ...styles.digit,
                ...bloodPressureColorStyle(
                  itemData.item.systolic_blood_pressure,
                  itemData.item.diastolic_blood_pressure,
                ).customFontStyle,
              }}
            >
              {itemData.item.systolic_blood_pressure}
            </Text>
          ) : (
            <Text style={styles.digit}>--</Text>
          )}
        </View>
        <View style={styles.digitContainer}>
          {itemData.item.diastolic_blood_pressure !== undefined ? (
            <Text
              style={{
                ...styles.digit,
                ...bloodPressureColorStyle(
                  itemData.item.systolic_blood_pressure,
                  itemData.item.diastolic_blood_pressure,
                ).customFontStyle,
              }}
            >
              {itemData.item.diastolic_blood_pressure}
            </Text>
          ) : (
            <Text style={styles.digit}>--</Text>
          )}
        </View>
        <View style={styles.digitContainer}>
          {itemData.item.pulse !== undefined ? (
            <Text style={styles.digit}>{itemData.item.pulse}</Text>
          ) : (
            <Text style={styles.digit}>--</Text>
          )}
        </View>
      </View>
      {itemData.item.remark && (
        <View style={styles.dateContainer}>
          <Text style={styles.remark}>{itemData.item.remark}</Text>
        </View>
      )}
    </MainButtonOutlineImage>
  );
};

type Props = StackScreenProps<BloodPressureStackParamList, 'BloodPressure'>;

export const BloodPressureScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t, locale2 } = useLocalisation();

  const bloodPressuresUpdateIndicator = useAppSelector(
    (state) => state.bloodPressure.update,
  );
  const fromdate = useAppSelector((state) => state.bloodPressure.fromdate);
  const todate = useAppSelector((state) => state.bloodPressure.todate);

  const isFiltered = !!route.params?.filtered;
  moment.locale(locale2);

  const fetchPage = useCallback(
    (limit: number, offset: number) =>
      bloodPressureActions.fetchBloodPressure(
        limit,
        offset,
        fromdate || '1970-01-01T00:00:00.000Z',
        todate || new Date().toISOString(),
        null,
      ),
    [fromdate, todate],
  );
  const {
    records: bloodPressures,
    isLoading,
    error,
    clearError,
    loadMore: onEndReached,
  } = usePaginatedRecords(
    fetchPage,
    `${bloodPressuresUpdateIndicator}:${route.params?.feedbackTimestamp ?? ''}`,
  );

  useEffect(() => {
    if (error) {
      Alert.alert(t('error_occur'), error.message, [
        { text: t('okay'), onPress: clearError },
      ]);
    }
  }, [error, t, clearError]);

  const onFlatListItemPress = useCallback(
    (itemData: { item: BloodPressureItem }) => {
      navigation.navigate('BloodPressureInputModal', {
        id: itemData.item.id,
        systolic: itemData.item.systolic_blood_pressure,
        diastolic: itemData.item.diastolic_blood_pressure,
        pulse: itemData.item.pulse,
        remark: itemData.item.remark ?? '',
      });
    },
    [navigation],
  );

  const onAddBloodPressurePress = useCallback(() => {
    const latestBloodPressure = bloodPressures[0];

    if (latestBloodPressure) {
      navigation.navigate('BloodPressureInputModal', {
        systolic: latestBloodPressure.systolic_blood_pressure,
        diastolic: latestBloodPressure.diastolic_blood_pressure,
        pulse: latestBloodPressure.pulse,
      });
      return;
    }

    navigation.navigate('BloodPressureInputModal');
  }, [bloodPressures, navigation]);

  const listContent = useMemo(() => {
    if (bloodPressures.length > 0) {
      return (
        <FlatList
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          data={bloodPressures}
          keyExtractor={(item) => item.id.toString()}
          renderItem={(itemData) => (
            <FlatListItem
              itemData={itemData}
              onFlatListItemPress={onFlatListItemPress}
              noRecordLocalisedString={t('no_record')}
            />
          )}
        />
      );
    }

    if (isLoading) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={Colors.focus} />
        </View>
      );
    }

    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.LowerBtnsText}>
          {t('press')}{' '}
          <AntDesign name="plus-circle" size={24} color={Colors.focus} />{' '}
          {t('health_parameters_description')}
        </Text>
      </View>
    );
  }, [bloodPressures, isLoading, onEndReached, onFlatListItemPress, t]);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isFiltered ? Colors.secondary : 'white' },
      ]}
    >
      <View style={styles.titleContainer}>
        <View style={styles.titleTextContainter}>
          <Text style={styles.title}>{t('blood_pressure_long')}</Text>
        </View>
        <View style={styles.titleDataContainer}>
          <View style={styles.digitContainer}>
            <Text style={styles.LowerBtnsText}>{t('systolic')}</Text>
            <Text style={styles.unitText}>mmHg</Text>
          </View>
          <View style={styles.digitContainer}>
            <Text style={styles.LowerBtnsText}>{t('diastolic')}</Text>
            <Text style={styles.unitText}>mmHg</Text>
          </View>
          <View style={styles.digitContainer}>
            <Text style={styles.LowerBtnsText}>{t('heartbeat')}</Text>
            <Text style={styles.unitText}>bpm</Text>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate('BloodPressurePeriodModal')}
          style={styles.titleToggleButton}
        >
          <Text style={styles.titleToggleButtonText}>
            {isFiltered ? t('filter_in_use') : t('filter')}
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.flatListContainer,
          { backgroundColor: isFiltered ? Colors.secondary : 'white' },
        ]}
      >
        {listContent}
      </View>

      <TouchableOpacity onPress={onAddBloodPressurePress} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
