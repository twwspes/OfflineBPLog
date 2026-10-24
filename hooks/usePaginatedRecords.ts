import { useCallback, useEffect, useRef, useState } from 'react';

import { createRecordPager, RecordPageState } from '../helpers/recordPager';

export const usePaginatedRecords = <T extends { id: number }>(
  fetchPage: (limit: number, offset: number) => Promise<T[]>,
  refreshKey: string,
) => {
  const [state, setState] = useState<RecordPageState<T>>({
    records: [],
    isLoading: true,
    hasMore: true,
    error: null,
  });
  const pagerRef = useRef<ReturnType<typeof createRecordPager<T>> | null>(null);
  useEffect(() => {
    const pager = createRecordPager(fetchPage, setState);
    pagerRef.current = pager;
    void pager.reset();
    return () => {
      pager.dispose();
      pagerRef.current = null;
    };
  }, [fetchPage, refreshKey]);
  const loadMore = useCallback(() => {
    void pagerRef.current?.loadMore();
  }, []);
  const clearError = useCallback(() => pagerRef.current?.clearError(), []);
  return { ...state, loadMore, clearError };
};
