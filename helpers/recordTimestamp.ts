export const combineRecordTimestamp = (
  dateValue: string,
  timeValue: string,
) => {
  const date = new Date(dateValue);
  const time = new Date(timeValue);
  date.setHours(time.getHours(), time.getMinutes());
  if (!Number.isFinite(date.valueOf())) {
    throw new Error('Invalid record date or time.');
  }
  return date.valueOf();
};

export const saveRecordTimestamp = async (
  timestamp: number,
  originalTimestamp: number | undefined,
  save: (timestamp: number) => Promise<unknown>,
  remove: (timestamp: number) => Promise<unknown>,
) => {
  await save(timestamp);
  if (originalTimestamp !== undefined && originalTimestamp !== timestamp) {
    await remove(originalTimestamp);
  }
};
