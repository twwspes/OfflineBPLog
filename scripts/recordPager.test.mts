import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  createRecordPager,
  type RecordPageState,
} from '../helpers/recordPager.ts';

interface Record {
  id: number;
}
const deferred = () => Promise.withResolvers<Record[]>();

await test('refresh resets offset after pagination; overlapping load-more calls cannot skip pages', async () => {
  const requests: number[] = [];
  const updates: RecordPageState<Record>[] = [];
  const pager = createRecordPager(
    (limit, offset) => {
      assert.equal(limit, 2);
      requests.push(offset);
      return Promise.resolve([{ id: 10 - offset }, { id: 9 - offset }]);
    },
    (state) => updates.push(state),
    2,
  );
  await pager.reset();
  await Promise.all([pager.loadMore(), pager.loadMore(), pager.loadMore()]);
  assert.deepEqual(requests, [0, 2]);
  assert.deepEqual(
    updates.at(-1)?.records.map(({ id }) => id),
    [10, 9, 8, 7],
  );
  await pager.reset();
  assert.deepEqual(requests, [0, 2, 0]);
  assert.deepEqual(
    updates.at(-1)?.records.map(({ id }) => id),
    [10, 9],
  );
});

await test('filter/reset discards old responses without clearing the new request loading state', async () => {
  const old = deferred();
  const fresh = deferred();
  const updates: RecordPageState<Record>[] = [];
  let calls = 0;
  const pager = createRecordPager(
    () => (++calls === 1 ? old.promise : fresh.promise),
    (state) => updates.push(state),
  );
  const oldRequest = pager.reset();
  const freshRequest = pager.reset();
  old.resolve([{ id: 1 }]);
  await oldRequest;
  assert.equal(updates.at(-1)?.isLoading, true);
  assert.deepEqual(updates.at(-1)?.records, []);
  fresh.resolve([{ id: 2 }]);
  await freshRequest;
  assert.deepEqual(updates.at(-1)?.records, [{ id: 2 }]);
  assert.equal(updates.at(-1)?.isLoading, false);
});

await test('failure preserves loaded rows and retries the same offset; short final pages stop loading', async () => {
  const requests: number[] = [];
  const updates: RecordPageState<Record>[] = [];
  let fail = true;
  const pager = createRecordPager(
    (_limit, offset) => {
      requests.push(offset);
      if (offset === 0) return Promise.resolve([{ id: 3 }, { id: 2 }]);
      if (fail) {
        fail = false;
        return Promise.reject(new Error('read failed'));
      }
      return Promise.resolve([{ id: 1 }]);
    },
    (state) => updates.push(state),
    2,
  );
  await pager.reset();
  await pager.loadMore();
  assert.deepEqual(updates.at(-1)?.records, [{ id: 3 }, { id: 2 }]);
  assert.equal(updates.at(-1)?.error?.message, 'read failed');
  assert.equal(updates.at(-1)?.isLoading, false);
  pager.clearError();
  assert.equal(updates.at(-1)?.error, null);
  await pager.loadMore();
  await pager.loadMore();
  assert.deepEqual(requests, [0, 2, 2]);
  assert.equal(updates.at(-1)?.hasMore, false);
  assert.deepEqual(updates.at(-1)?.records, [{ id: 3 }, { id: 2 }, { id: 1 }]);
});

await test('late errors after disposal cannot publish into an unmounted screen', async () => {
  const request = deferred();
  const updates: RecordPageState<Record>[] = [];
  const pager = createRecordPager(
    () => request.promise,
    (state) => updates.push(state),
  );
  const pending = pager.reset();
  pager.dispose();
  const count = updates.length;
  request.reject(new Error('late failure'));
  await pending;
  assert.equal(updates.length, count);
  await pager.loadMore();
  assert.equal(updates.length, count);
});

await test('overlapping pages deduplicate IDs and keep records sorted; an empty first page stops pagination', async () => {
  const updates: RecordPageState<Record>[] = [];
  const pager = createRecordPager(
    (_limit, offset) =>
      Promise.resolve(
        offset === 0 ? [{ id: 2 }, { id: 3 }] : [{ id: 2 }, { id: 1 }],
      ),
    (state) => updates.push(state),
    2,
  );
  await pager.reset();
  await pager.loadMore();
  assert.deepEqual(updates.at(-1)?.records, [{ id: 3 }, { id: 2 }, { id: 1 }]);
  const empty = createRecordPager<Record>(
    () => Promise.resolve([]),
    (state) => updates.push(state),
  );
  await empty.reset();
  assert.equal(updates.at(-1)?.hasMore, false);
});
