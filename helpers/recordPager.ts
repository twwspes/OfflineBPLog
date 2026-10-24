export interface RecordPageState<T> {
  records: T[];
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
}

export const createRecordPager = <T extends { id: number }>(
  fetchPage: (limit: number, offset: number) => Promise<T[]>,
  publish: (state: RecordPageState<T>) => void,
  pageSize = 100,
) => {
  let state: RecordPageState<T> = {
    records: [],
    isLoading: false,
    hasMore: true,
    error: null,
  };
  let offset = 0;
  let generation = 0;
  let disposed = false;
  const update = (next: RecordPageState<T>) => {
    state = next;
    if (!disposed) publish(state);
  };
  const loadMore = async () => {
    if (disposed || state.isLoading || !state.hasMore) return;
    const requestGeneration = generation;
    update({ ...state, isLoading: true, error: null });
    try {
      const rows = await fetchPage(pageSize, offset);
      if (disposed || requestGeneration !== generation) return;
      const byId = new Map(state.records.map((record) => [record.id, record]));
      rows.forEach((record) => byId.set(record.id, record));
      offset += rows.length;
      update({
        records: [...byId.values()].sort((a, b) => b.id - a.id),
        isLoading: false,
        hasMore: rows.length === pageSize,
        error: null,
      });
    } catch (error) {
      if (disposed || requestGeneration !== generation) return;
      update({
        ...state,
        isLoading: false,
        error:
          error instanceof Error
            ? error
            : new Error('An unknown error occurred.'),
      });
    }
  };
  return {
    loadMore,
    reset: () => {
      generation += 1;
      offset = 0;
      update({ records: [], isLoading: false, hasMore: true, error: null });
      return loadMore();
    },
    clearError: () => update({ ...state, error: null }),
    dispose: () => {
      disposed = true;
      generation += 1;
    },
  };
};
