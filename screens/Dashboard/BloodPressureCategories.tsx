import React from 'react';
import { View } from 'react-native';

import { Text } from '../../components/UI/Text';
import { useLocalisation } from '../../hooks/useLocalisation';
import { Colors } from '../../constants/Colors';
import { styles } from './dashboardStyles';

const categories = [
  {
    color: Colors.green,
    systolic: 'less_than_120',
    operator: 'and',
    diastolic: 'less_than_80',
    label: 'normal',
    lightText: false,
  },
  {
    color: Colors.yellow,
    systolic: 'm120_129',
    operator: 'and',
    diastolic: 'less_than_80',
    label: 'elevated',
    lightText: false,
  },
  {
    color: Colors.orange,
    systolic: 'm130_139',
    operator: 'or',
    diastolic: 'm80_89',
    label: 'high_blood_pressure_stage_1',
    lightText: false,
  },
  {
    color: Colors.salmon,
    systolic: 'm140_or_higher',
    operator: 'or',
    diastolic: 'm90_or_higher',
    label: 'high_blood_pressure_stage_2',
    lightText: true,
  },
  {
    color: Colors.red,
    systolic: 'higher_than_180',
    operator: 'and_or',
    diastolic: 'higher_than_120',
    label: 'hypertensive_crisis',
    lightText: true,
  },
];

export const BloodPressureCategories: React.FC<{ counts: number[] }> = ({
  counts,
}) => {
  const { t } = useLocalisation();
  return (
    <View
      style={[
        styles.bloodPressureRangeTable,
        { backgroundColor: Colors.lightGrey },
      ]}
    >
      <View
        style={[
          styles.bloodPressureRangeTableTitleContainer,
          { backgroundColor: Colors.blur },
        ]}
      >
        {['systolic', 'diastolic'].map((label) => (
          <View
            key={label}
            style={[
              styles.bloodPressureRangeTableTitleTextContainer,
              { backgroundColor: Colors.blur },
            ]}
          >
            <Text style={styles.bloodPressureRangeTableTitleText}>
              {t(label)}
            </Text>
          </View>
        ))}
      </View>
      {categories.map((category, index) => {
        const background = { backgroundColor: category.color };
        const foreground = category.lightText ? { color: 'white' } : undefined;
        return (
          <View
            key={category.label}
            style={[styles.bloodPressureRangeTableRowContainer, background]}
          >
            <View
              style={[
                styles.bloodPressureRangeTableRowDescContainer,
                background,
              ]}
            >
              {[category.systolic, category.operator, category.diastolic].map(
                (label, column) => (
                  <View
                    key={`${column}:${label}`}
                    style={[
                      styles.bloodPressureRangeTableRowDescTextContainer,
                      column === 1 && { width: '20%' },
                      background,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bloodPressureRangeTableRowDescText,
                        foreground,
                      ]}
                    >
                      {t(label)}
                    </Text>
                  </View>
                ),
              )}
            </View>
            <View
              style={[
                styles.bloodPressureRangeTableRowContentContainer,
                background,
              ]}
            >
              <View
                style={[
                  styles.bloodPressureRangeTableRowContentTextContainer,
                  background,
                ]}
              >
                <Text
                  style={[
                    styles.bloodPressureRangeTableRowContentText,
                    foreground,
                  ]}
                >
                  {t(category.label)}
                </Text>
              </View>
              <View
                style={[
                  styles.bloodPressureRangeTableRowContentDigitContainer,
                  background,
                ]}
              >
                <Text
                  style={[
                    styles.bloodPressureRangeTableRowContentDigit,
                    foreground,
                  ]}
                >
                  {counts[index]}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
