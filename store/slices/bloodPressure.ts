import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BloodPressureState {
  update: number;
  todate: string;
  fromdate: string;
}

const initialState: BloodPressureState = {
  update: 0,
  todate: '',
  fromdate: '',
};

export const bloodPressureSlice = createSlice({
  name: 'bloodPressure',
  initialState,
  reducers: {
    bloodPressureUpdate: (state) => {
      state.update += 1;
    },
    setToDate: (state, action: PayloadAction<string>) => {
      state.todate = action.payload;
    },
    setFromDate: (state, action: PayloadAction<string>) => {
      state.fromdate = action.payload;
    },
  },
});

export const { bloodPressureUpdate, setToDate, setFromDate } =
  bloodPressureSlice.actions;
