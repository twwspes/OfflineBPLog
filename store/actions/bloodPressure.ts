import {
  bloodPressureUpdate,
  setFromDate,
  setToDate,
} from '../slices/bloodPressure';
import {
  replaceBloodPressureFromSQL,
  fetchBloodPressureFromSQLBtwDateMilli,
  deleteBloodPressureFromLocal,
  deleteBloodPressuresFromLocal,
  fetchBloodPressureFromSQLBtwDateMilliForStats,
  fetchBloodPressureFromSQLBtwDateMilliForChart,
} from '../../helpers/dbBloodPressure';
import {
  replaceMessageFromSQL,
  fetchMessageFromSQLBtwDateMilli,
  deleteMessageFromLocal,
  deleteMessagesFromLocal,
} from '../../helpers/dbMessage';
import { store } from '../store';

export const SET_BLOODPRESSURE = 'SET_BLOODPRESSURE';
export const BLOODPRESSURE_UPDATE = 'BLOODPRESSURE_UPDATE';
export const SET_TODATE = 'SET_TODATE';
export const SET_FROMDATE = 'SET_FROMDATE';

export const fetchBloodPressure = async (
  limit: number,
  offset: number,
  start_date: string,
  end_date: string,
  num_of_sample: number | null | undefined,
) => {
  let untilDateMilli = 0;
  let fromDateMilli = 0;

  if (start_date) {
    fromDateMilli = new Date(start_date).valueOf();
  }

  if (end_date) {
    untilDateMilli = new Date(end_date).valueOf();
  }

  const rowsObject = await fetchBloodPressureFromSQLBtwDateMilli(
    untilDateMilli,
    fromDateMilli,
    limit,
    offset,
  );

  if (rowsObject.typename !== 'BloodPressureType') {
    return rowsObject.array;
  }
  const loadedBloodPressures = rowsObject.array;
  if (num_of_sample === null) {
    const messageRows = await fetchMessageFromSQLBtwDateMilli(
      untilDateMilli,
      fromDateMilli,
      limit,
      offset,
    );

    const loadedMessages = messageRows;
    loadedMessages.forEach((messageJson) => {
      const index = loadedBloodPressures.findIndex(
        (bloodPressureJson) => bloodPressureJson.id === messageJson.id,
      );
      // console.log("messageJson in fetchBloodPressure");
      // console.log(messageJson);
      if (index !== -1) {
        loadedBloodPressures[index].remark = messageJson.remark;
      }
    });
  }
  return loadedBloodPressures;
};

export const fetchBloodPressureForChart = async (
  limit: number,
  offset: number,
  start_date: string,
  end_date: string,
  num_of_sample: number | null | undefined,
) => {
  let untilDateMilli = 0;
  let fromDateMilli = 0;

  if (start_date) {
    fromDateMilli = new Date(start_date).valueOf();
  }

  if (end_date) {
    untilDateMilli = new Date(end_date).valueOf();
  }

  const rowsObject = await fetchBloodPressureFromSQLBtwDateMilliForChart(
    untilDateMilli,
    fromDateMilli,
    limit,
    offset,
    num_of_sample,
  );

  return rowsObject;
};

export const fetchBloodPressureForStatistics = async (
  limit: number,
  offset: number,
  start_date: string,
  end_date: string,
) => {
  let untilDateMilli = 0;
  let fromDateMilli = 0;

  if (start_date) {
    fromDateMilli = new Date(start_date).valueOf();
  }

  if (end_date) {
    untilDateMilli = new Date(end_date).valueOf();
  }

  const rowsObject = await fetchBloodPressureFromSQLBtwDateMilliForStats(
    untilDateMilli,
    fromDateMilli,
    limit,
    offset,
  );

  return rowsObject;
};

export const addBloodPressure = async (
  timestamp: string,
  systolic_blood_pressure: number,
  diastolic_blood_pressure: number,
  pulse: number,
  withRemark: boolean,
  shouldStopInstantUpdate: boolean,
  remark?: string,
) => {
  const timestampMilli = new Date(timestamp).valueOf();

  await replaceBloodPressureFromSQL(
    timestampMilli,
    systolic_blood_pressure,
    diastolic_blood_pressure,
    pulse,
  );

  // if someone tries to create / update a remark on a new / existing record.
  if (!(remark === null || remark === undefined)) {
    // console.log("saving remark for record ", new Date(timestamp));
    await replaceMessageFromSQL(timestampMilli, remark);
  } else {
    await replaceMessageFromSQL(timestampMilli, '');
  }

  if (!shouldStopInstantUpdate) {
    store.dispatch(bloodPressureUpdate());
  }
};

export const deleteBloodPressure = async (
  timestamp: string,
  withRemark: boolean,
) => {
  const timestampMilli = new Date(timestamp).valueOf();

  await deleteBloodPressureFromLocal(timestampMilli);

  if (withRemark) {
    await deleteMessageFromLocal(timestampMilli);
  }

  store.dispatch(bloodPressureUpdate());
};

export const forceUpdateBPState = () => {
  store.dispatch(bloodPressureUpdate());
};

export const deleteAllBloodPressures = async () => {
  await deleteBloodPressuresFromLocal();
  await deleteMessagesFromLocal();
  store.dispatch(bloodPressureUpdate());
};

export const setFromdate = (dateISOString: string) => {
  store.dispatch(setFromDate(dateISOString));
};

export const setTodate = (dateISOString: string) => {
  store.dispatch(setToDate(dateISOString));
};
