import { afterEach, beforeEach, expect, test } from 'bun:test';

import type { Trainer } from '@creatures/contracts/trainer';

import { createTrainersController } from '~/entities/trainer/model/trainersController';
import {
  createTrainersStore,
  selectError,
  selectIsLoading,
  selectTrainers,
} from '~/entities/trainer/model/trainersStore';

const BASE_URL = 'http://localhost:3001';
const TOKEN = 'access-token';
const STARTER_ID = '11111111-1111-4111-8111-111111111111';
const OK = 200;

type FetchHandler = (url: string, init: RequestInit | undefined) => Promise<Response>;
type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const originalFetch = globalThis.fetch;

let fetchCalls = 0;
let fetchHandler: FetchHandler = failUnexpectedFetch;
let store: ReturnType<typeof createTrainersStore>;

beforeEach(setupFixture);
afterEach(teardownFixture);

function setupFixture(): void {
  fetchCalls = 0;
  fetchHandler = failUnexpectedFetch;
  globalThis.fetch = buildFetchSpy() as typeof globalThis.fetch;
  const deps = { baseUrl: BASE_URL, getAccessToken: buildTokenReader(TOKEN) };
  store = createTrainersStore(createTrainersController(deps));
}

function teardownFixture(): void {
  globalThis.fetch = originalFetch;
}

function buildFetchSpy(): FetchFunction {
  return function spy(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    fetchCalls += 1;
    return fetchHandler(readInputUrl(input), init);
  };
}

function readInputUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof globalThis.URL) {
    return input.toString();
  }
  return input.url;
}

function failUnexpectedFetch(): Promise<Response> {
  return Promise.reject(new Error('unexpected fetch call'));
}

function buildTokenReader(token: string): () => Promise<string | null> {
  return function readToken(): Promise<string | null> {
    return Promise.resolve(token);
  };
}

function buildStatusHandler(status: number, body: unknown): FetchHandler {
  return function respond(): Promise<Response> {
    const init = { headers: buildJsonHeaders(), status };
    return Promise.resolve(new globalThis.Response(JSON.stringify(body), init));
  };
}

function buildJsonHeaders(): Headers {
  const headers = new globalThis.Headers();
  headers.set('Content-Type', 'application/json');
  return headers;
}

function buildTrainer(name: string): Trainer {
  return {
    createdAt: '2024-01-01T00:00:00.000Z',
    gender: 'male',
    id: 'trainer-1',
    level: 1,
    name,
    starterSpeciesId: STARTER_ID,
  };
}

function theStoreStartsEmpty(): void {
  expect(selectTrainers(store.getState())).toEqual([]);
  expect(selectIsLoading(store.getState())).toBe(false);
  expect(selectError(store.getState())).toBeNull();
}

function theStoreFollowsTheController(): Promise<void> {
  fetchHandler = buildStatusHandler(OK, { trainers: [buildTrainer('Ana')] });
  return store
    .getState()
    .refresh()
    .then(function assertPublished(): void {
      expect(selectTrainers(store.getState())).toHaveLength(1);
      expect(selectTrainers(store.getState())[0]?.name).toBe('Ana');
    });
}

function twoRefreshesShareTheRequestInFlight(): Promise<void> {
  fetchHandler = buildStatusHandler(OK, { trainers: [] });
  const first = store.getState().refresh();
  const second = store.getState().refresh();
  return Promise.all([first, second]).then(function assertSettled(): void {
    expect(fetchCalls).toBe(1);
  });
}

function theResetEmptiesTheList(): Promise<void> {
  fetchHandler = buildStatusHandler(OK, { trainers: [buildTrainer('Ana')] });
  return store
    .getState()
    .refresh()
    .then(function resetList(): void {
      store.getState().reset();
      expect(selectTrainers(store.getState())).toEqual([]);
      expect(selectIsLoading(store.getState())).toBe(false);
      expect(selectError(store.getState())).toBeNull();
    });
}

test('the store starts empty', theStoreStartsEmpty);
test('the store publishes the list of the controller', theStoreFollowsTheController);
test('two refreshes share the request in flight', twoRefreshesShareTheRequestInFlight);
test('the reset empties the list', theResetEmptiesTheList);
