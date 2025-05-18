/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BloodPressureState {
  bloodPressures: unknown[]; // Remplace `any[]` par un type spécifique si possible
  update: number;
  todate: string; // ISOString ou chaîne vide
  fromdate: string; // ISOString ou chaîne vide
}

const initialState: BloodPressureState = {
  bloodPressures: [],
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

// Export des actions générées automatiquement
export const { bloodPressureUpdate, setToDate, setFromDate } =
  bloodPressureSlice.actions;
