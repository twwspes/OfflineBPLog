import { NavigatorScreenParams } from '@react-navigation/native';

export type BloodPressureStackParamList = {
  BloodPressure: {
    filtered?: boolean;
    feedbackTimestamp?: number;
  };
  BloodPressureInputModal:
    | {
        id: number;
        systolic: number;
        diastolic: number;
        pulse: number;
        remark?: string;
      }
    | undefined;
  BloodPressurePeriodModal: undefined;
};

// Bottom bar screens
export type BottomTabsParamList = {
  BloodPressureStack: NavigatorScreenParams<BloodPressureStackParamList>;
  Dashboard: undefined;
  RecordOutput: undefined;
};
