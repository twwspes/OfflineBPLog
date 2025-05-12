import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import { AntDesign } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { BloodPressureStackParamList } from 'types/navigation';

import * as bloodPressureActions from '../../store/actions/bloodPressure';
import { MainButtonOutlineImage } from '../../components/UI/MainButtonOutlineImage';
import { Colors } from '../../constants/Colors';
import { useLocalisation } from '../../hooks/useLocalisation';
import { FontSize } from '../../constants/FontSize';
import { useAppSelector } from '../../hooks/useRedux';

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
            <Text style={{ ...styles.digit }}>
              {itemData.item.systolic_blood_pressure}
            </Text>
          ) : (
            <Text style={styles.digit}>--</Text>
          )}
        </View>
        <View style={styles.digitContainer}>
          {itemData.item.diastolic_blood_pressure !== undefined ? (
            <Text style={{ ...styles.digit }}>
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale2 } = useLocalisation();

  const bloodPressuresUpdateIndicator = useAppSelector(
    (state) => state.bloodPressure.update,
  );
  const fromdate = useAppSelector((state) => state.bloodPressure.fromdate);
  const todate = useAppSelector((state) => state.bloodPressure.todate);

  const [bloodPressures, setBloodPressures] = useState<BloodPressureItem[]>([]);
  const [bloodPressuresReverse, setBloodPressuresReverse] = useState<
    BloodPressureItem[]
  >([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [latestBloodPressures, setLatestBloodPressures] = useState<
    BloodPressureItem[]
  >([]);
  const [isFiltered, setIsFiltered] = useState(false);

  moment.locale(locale2);

  const flatListPaginationIncrement = 100;

  useEffect(() => {
    if (error) {
      Alert.alert(t('error_occur'), error, [
        { text: t('okay'), onPress: () => setError(null) },
      ]);
    }
  }, [error, t]);

  useEffect(() => {
    if (route.params?.filtered) {
      setBloodPressures([]);
      setIsFiltered(true);
    } else {
      setIsFiltered(false);
    }
  }, [route.params?.filtered, route.params?.feedbackTimestamp]);

  useEffect(() => {
    setBloodPressures([]);
  }, [bloodPressuresUpdateIndicator]);

  const downloadItems = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const nowISO = new Date().toISOString();
      const longAgoISO = '1970-01-01T00:00:00.000Z';

      const newPressures = await bloodPressureActions.fetchBloodPressure(
        flatListPaginationIncrement,
        currentOffset,
        fromdate || longAgoISO,
        todate || nowISO,
        null,
      );

      setLatestBloodPressures(newPressures);

      setBloodPressures((prev) => {
        const merged = [...prev, ...newPressures];
        merged.sort((a, b) => b.id - a.id);
        return merged.filter(
          (v, i, a) =>
            a.findIndex((mergedItem) => mergedItem.id === v.id) === i,
        );
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error_occur'));
      }
    }
    setIsLoading(false);
  }, [currentOffset, fromdate, t, todate]);

  useEffect(() => {
    void downloadItems();
  }, [downloadItems]);

  const onEndReached = useCallback(() => {
    if (latestBloodPressures.length >= flatListPaginationIncrement) {
      setCurrentOffset((prev) => prev + flatListPaginationIncrement);
    }
  }, [latestBloodPressures.length]);

  useEffect(() => {
    setBloodPressuresReverse(bloodPressures);
  }, [bloodPressures]);

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

  const listContent = useMemo(() => {
    if (bloodPressuresReverse.length > 0) {
      return (
        <FlatList
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          data={bloodPressuresReverse}
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
          <AntDesign name="pluscircle" size={24} color={Colors.focus} />{' '}
          {t('health_parameters_description')}
        </Text>
      </View>
    );
  }, [bloodPressuresReverse, isLoading, onEndReached, onFlatListItemPress, t]);

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

      <TouchableOpacity
        onPress={() => navigation.navigate('BloodPressureInputModal')}
        style={styles.fab}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
