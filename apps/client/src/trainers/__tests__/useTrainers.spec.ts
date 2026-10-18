import { afterEach, beforeEach, expect, test } from 'bun:test';

import type { NewTrainerInput, Trainer } from '@creatures/contracts/trainer';

import { createTrainersController } from '~/trainers/trainersClient';
import type {
  DeleteTrainerResult,
  TrainerClientErrorCode,
  TrainerCreateResult,
  TrainersController,
  TrainersSnapshot,
} from '~/trainers/trainersClient';

const BASE_URL = 'http://localhost:3001';
const TOKEN = 'access-token';
const STARTER_ID = '11111111-1111-4111-8111-111111111111';
const VALID_NAME = 'Rafael';
const SHORT_NAME = 'ab';
const CREATED = 201;
const OK = 200;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const CONFLICT = 409;

type FetchHandler = (url: string, init: RequestInit | undefined) => Promise<Response>;
type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type CodedResult = { ok: true } | { ok: false; code: TrainerClientErrorCode };

const originalFetch = globalThis.fetch;

let fetchCalls = 0;
let fetchHandler: FetchHandler = failUnexpectedFetch;

beforeEach(setupFetch);
afterEach(restoreFetch);

function setupFetch(): void {
  fetchCalls = 0;
  fetchHandler = failUnexpectedFetch;
  globalThis.fetch = buildFetchSpy() as typeof globalThis.fetch;
}

function restoreFetch(): void {
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

function refreshReturnsEmptyList(): Promise<void> {
  const controller = buildController(TOKEN);
  fetchHandler = buildStatusHandler(OK, { trainers: [] });
  return controller.refresh().then(buildSnapshotAsserter(controller, assertEmptySnapshot));
}

function refreshReturnsPopulatedList(): Promise<void> {
  const controller = buildController(TOKEN);
  const trainers = [buildTrainer('Ana', 'trainer-1'), buildTrainer('Bia', 'trainer-2')];
  fetchHandler = buildStatusHandler(OK, { trainers });
  return controller.refresh().then(buildSnapshotAsserter(controller, assertTwoTrainers));
}

function refreshWithUnauthorizedSetsError(): Promise<void> {
  const controller = buildController(TOKEN);
  fetchHandler = buildStatusHandler(UNAUTHORIZED, { error: 'unauthenticated', message: 'no' });
  return controller.refresh().then(buildErrorSnapshotAsserter(controller, 'unauthenticated'));
}

function createWithShortNameFailsLocally(): Promise<void> {
  const controller = buildController(TOKEN);
  const input = buildInput(SHORT_NAME);
  return controller.create(input).then(buildCodedErrorAsserter('invalid_name', 0));
}

function createAddsTrainerToList(): Promise<void> {
  const controller = buildController(TOKEN);
  const created = buildTrainer('Novo', 'trainer-9');
  fetchHandler = buildStatusHandler(CREATED, created);
  const input = buildInput(VALID_NAME);
  return controller.create(input).then(buildCreateSuccessAsserter(controller, created));
}

function createWithTakenNameFails(): Promise<void> {
  const controller = buildController(TOKEN);
  fetchHandler = buildStatusHandler(CONFLICT, { error: 'name_taken', message: 'taken' });
  const input = buildInput(VALID_NAME);
  return controller.create(input).then(buildCodedErrorAsserter('name_taken', 1));
}

function createAtLimitFails(): Promise<void> {
  const controller = buildController(TOKEN);
  const body = { error: 'max_trainers_reached', message: 'limit' };
  fetchHandler = buildStatusHandler(CONFLICT, body);
  const input = buildInput(VALID_NAME);
  return controller.create(input).then(buildCodedErrorAsserter('max_trainers_reached', 1));
}

function removeDeletesTrainerFromList(): Promise<void> {
  const controller = buildController(TOKEN);
  const trainers = [buildTrainer('Ana', 'trainer-1'), buildTrainer('Bia', 'trainer-2')];
  fetchHandler = buildStatusHandler(OK, { trainers });
  return controller.refresh().then(buildRemoveRunner(controller, 'trainer-1'));
}

function removeUnknownIdSkipsFetch(): Promise<void> {
  const controller = buildController(TOKEN);
  return controller.remove('missing').then(buildCodedErrorAsserter('trainer_not_found', 0));
}

function removeMissingOnServerFails(): Promise<void> {
  const controller = buildController(TOKEN);
  const trainers = [buildTrainer('Ana', 'trainer-1')];
  fetchHandler = buildStatusHandler(OK, { trainers });
  return controller.refresh().then(buildServer404RemoveRunner(controller));
}

function removeRejectionResetsLoading(): Promise<void> {
  const controller = buildController(TOKEN);
  const trainers = [buildTrainer('Ana', 'trainer-1')];
  fetchHandler = buildStatusHandler(OK, { trainers });
  return controller.refresh().then(buildRemoveRejectionRunner(controller));
}
function refreshRejectionResetsLoading(): Promise<void> {
  const controller = buildController(TOKEN);
  fetchHandler = failUnexpectedFetch;
  return controller.refresh().then(function assertRefreshReset(): void {
    const snapshot = controller.getSnapshot();
    expect(snapshot.isLoading).toBe(false);
    expect(snapshot.error).toBe('unknown');
  });
}
function buildRemoveRejectionRunner(controller: TrainersController): () => Promise<void> {
  return function runRemove(): Promise<void> {
    fetchHandler = failUnexpectedFetch;
    return controller.remove('trainer-1').then(function assertLoadingReset(
      result: DeleteTrainerResult,
    ): void {
      expect(result.ok).toBe(false);
      expect(controller.getSnapshot().isLoading).toBe(false);
    });
  };
}
function buildRemoveRunner(controller: TrainersController, trainerId: string): () => Promise<void> {
  return function runRemove(): Promise<void> {
    fetchHandler = buildNoContentHandler();
    return controller.remove(trainerId).then(buildRemoveSuccessAsserter(controller));
  };
}
function buildServer404RemoveRunner(controller: TrainersController): () => Promise<void> {
  return function runRemove(): Promise<void> {
    const body = { error: 'trainer_not_found', message: 'gone' };
    fetchHandler = buildStatusHandler(NOT_FOUND, body);
    fetchCalls = 0;
    return controller.remove('trainer-1').then(buildCodedErrorAsserter('trainer_not_found', 1));
  };
}
function buildController(token: string | null): TrainersController {
  const deps = { baseUrl: BASE_URL, getAccessToken: buildTokenReader(token) };
  return createTrainersController(deps);
}

function buildTokenReader(token: string | null): () => Promise<string | null> {
  return function readToken(): Promise<string | null> {
    return Promise.resolve(token);
  };
}

function buildStatusHandler(status: number, body: unknown): FetchHandler {
  return function respond(): Promise<Response> {
    return Promise.resolve(buildJsonResponse(body, status));
  };
}

function buildNoContentHandler(): FetchHandler {
  return function respondNoContent(): Promise<Response> {
    const init = { status: 204 };
    return Promise.resolve(new globalThis.Response(null, init));
  };
}

function buildJsonResponse(body: unknown, status: number): Response {
  const init = { headers: buildJsonHeaders(), status };
  return new globalThis.Response(JSON.stringify(body), init);
}

function buildJsonHeaders(): Headers {
  const headers = new globalThis.Headers();
  headers.set('Content-Type', 'application/json');
  return headers;
}

function buildSnapshotAsserter(
  controller: TrainersController,
  assertSnapshot: (snapshot: TrainersSnapshot) => void,
): () => void {
  return function assertRefresh(): void {
    assertSnapshot(controller.getSnapshot());
  };
}

function buildErrorSnapshotAsserter(
  controller: TrainersController,
  code: TrainerClientErrorCode,
): () => void {
  return function assertErrorSnapshot(): void {
    const snapshot = controller.getSnapshot();
    expect(snapshot.error).toBe(code);
    expect(snapshot.isLoading).toBe(false);
  };
}

function buildCreateSuccessAsserter(
  controller: TrainersController,
  created: Trainer,
): (result: TrainerCreateResult) => void {
  return function assertCreateSuccess(result: TrainerCreateResult): void {
    const trainer = result.ok ? result.trainer : null;
    expect(trainer?.id).toBe(created.id);
    const snapshot = controller.getSnapshot();
    expect(snapshot.trainers).toHaveLength(1);
    expect(snapshot.trainers[0]?.id).toBe(created.id);
  };
}

function buildCodedErrorAsserter(
  code: TrainerClientErrorCode,
  expectedCalls: number,
): (result: CodedResult) => void {
  return function assertCodedError(result: CodedResult): void {
    const resultCode = result.ok ? null : result.code;
    expect(resultCode).toBe(code);
    expect(fetchCalls).toBe(expectedCalls);
  };
}

function buildRemoveSuccessAsserter(
  controller: TrainersController,
): (result: DeleteTrainerResult) => void {
  return function assertRemoved(result: DeleteTrainerResult): void {
    expect(result.ok).toBe(true);
    const snapshot = controller.getSnapshot();
    expect(snapshot.trainers).toHaveLength(1);
    expect(snapshot.trainers[0]?.id).toBe('trainer-2');
    expect(snapshot.isLoading).toBe(false);
  };
}

function assertEmptySnapshot(snapshot: TrainersSnapshot): void {
  expect(snapshot.trainers).toEqual([]);
  expect(snapshot.error).toBeNull();
  expect(snapshot.isLoading).toBe(false);
}
function assertTwoTrainers(snapshot: TrainersSnapshot): void {
  expect(snapshot.trainers).toHaveLength(2);
  expect(snapshot.isLoading).toBe(false);
}
function buildInput(name: string): NewTrainerInput {
  return { gender: 'male', name, starterCreatureId: STARTER_ID };
}
function buildTrainer(name: string, id: string): Trainer {
  return {
    createdAt: '2024-01-01T00:00:00.000Z',
    gender: 'male',
    id,
    level: 1,
    name,
    starterCreatureId: STARTER_ID,
  };
}

test('refresh with empty list sets trainers to []', refreshReturnsEmptyList);
test('refresh with two trainers fills the list', refreshReturnsPopulatedList);
test('refresh returning 401 sets unauthenticated error', refreshWithUnauthorizedSetsError);
test('create with short name fails locally without fetching', createWithShortNameFailsLocally);
test('create success adds the trainer to the list', createAddsTrainerToList);
test('create with taken name returns name_taken', createWithTakenNameFails);
test('create at limit returns max_trainers_reached', createAtLimitFails);
test('remove deletes the trainer from the list', removeDeletesTrainerFromList);
test('remove of an unknown id skips fetch', removeUnknownIdSkipsFetch);
test('remove of a server-missing trainer returns trainer_not_found', removeMissingOnServerFails);
test('remove rejection resets isLoading', removeRejectionResetsLoading);
test('refresh rejection resets isLoading', refreshRejectionResetsLoading);
