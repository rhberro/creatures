import { beforeEach, expect, test } from 'bun:test';

import type { Trainer } from '@creatures/contracts/trainer';

import { trainerStore } from '~/routes/trainers';

import {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  FIRST_DAY,
  MAX_TRAINERS,
  NOT_FOUND,
  OTHER_USER_ID,
  SECOND_DAY,
  SHORT_NAME,
  STARTER_ID,
  TRAINERS_PATH,
  UNAUTHORIZED,
  UNKNOWN_STARTER_ID,
  USER_ID,
  USER_TOKEN,
  VALID_NAME,
  buildHandler,
  buildJsonRequest,
  buildRequest,
  buildStatusErrorAsserter,
  buildStoredTrainer,
  buildTrainerBody,
  buildTrainerList,
  buildTrainerListAsserter,
  clearStore,
  readError,
  readJson,
  send,
  type ErrorBody,
  type TrainerListBody,
} from './support';

beforeEach(clearStore);

function createTrainerSucceeds(): Promise<void> {
  const handler = buildHandler();
  const body = buildTrainerBody(VALID_NAME);
  const request = buildJsonRequest('POST', TRAINERS_PATH, body, USER_TOKEN);
  return send(handler, request).then(buildCreatedTrainerAsserter());
}

function createTrainerWithoutTokenFails(): Promise<void> {
  const handler = buildHandler();
  const body = buildTrainerBody(VALID_NAME);
  const request = buildJsonRequest('POST', TRAINERS_PATH, body, null);
  return send(handler, request).then(buildStatusErrorAsserter(UNAUTHORIZED, 'unauthenticated'));
}

function createTrainerWithShortNameFails(): Promise<void> {
  const handler = buildHandler();
  const body = buildTrainerBody(SHORT_NAME);
  const request = buildJsonRequest('POST', TRAINERS_PATH, body, USER_TOKEN);
  return send(handler, request).then(buildStatusErrorAsserter(BAD_REQUEST, 'invalid_name'));
}

function createTrainerWithInvalidGenderFails(): Promise<void> {
  const handler = buildHandler();
  const body = { gender: 'other', name: VALID_NAME, starterCreatureId: STARTER_ID };
  const request = buildJsonRequest('POST', TRAINERS_PATH, body, USER_TOKEN);
  return send(handler, request).then(buildStatusErrorAsserter(BAD_REQUEST, 'invalid_gender'));
}

function createTrainerWithUnknownStarterFails(): Promise<void> {
  const handler = buildHandler();
  const body = { gender: 'male', name: VALID_NAME, starterCreatureId: UNKNOWN_STARTER_ID };
  const request = buildJsonRequest('POST', TRAINERS_PATH, body, USER_TOKEN);
  return send(handler, request).then(buildStatusErrorAsserter(BAD_REQUEST, 'invalid_starter'));
}

function createTrainerAtLimitFails(): Promise<void> {
  const handler = buildHandler();
  trainerStore.set(USER_ID, buildTrainerList(MAX_TRAINERS));
  const body = buildTrainerBody(VALID_NAME);
  const request = buildJsonRequest('POST', TRAINERS_PATH, body, USER_TOKEN);
  return send(handler, request).then(buildStatusErrorAsserter(CONFLICT, 'max_trainers_reached'));
}

function createTrainerWithTakenNameFails(): Promise<void> {
  const handler = buildHandler();
  const stored = [buildStoredTrainer('José', FIRST_DAY)];
  trainerStore.set(USER_ID, stored);
  const body = buildTrainerBody('JOSE');
  const request = buildJsonRequest('POST', TRAINERS_PATH, body, USER_TOKEN);
  return send(handler, request).then(buildStatusErrorAsserter(CONFLICT, 'name_taken'));
}

function listTrainersWithoutTokenFails(): Promise<void> {
  const handler = buildHandler();
  const request = buildRequest('GET', TRAINERS_PATH, null);
  return send(handler, request).then(buildStatusErrorAsserter(UNAUTHORIZED, 'unauthenticated'));
}

function listTrainersReturnsEmptyList(): Promise<void> {
  const handler = buildHandler();
  const request = buildRequest('GET', TRAINERS_PATH, USER_TOKEN);
  return send(handler, request).then(buildTrainerListAsserter(assertEmptyList));
}

function listTrainersReturnsCreationOrder(): Promise<void> {
  const handler = buildHandler();
  const older = buildStoredTrainer('Primeiro', FIRST_DAY);
  const newer = buildStoredTrainer('Segundo', SECOND_DAY);
  trainerStore.set(USER_ID, [newer, older]);
  const request = buildRequest('GET', TRAINERS_PATH, USER_TOKEN);
  return send(handler, request).then(buildTrainerListAsserter(assertCreationOrder));
}

function listTrainersFiltersByAccount(): Promise<void> {
  const handler = buildHandler();
  const own = buildStoredTrainer('Meu', FIRST_DAY);
  const foreign = buildStoredTrainer('Alheio', SECOND_DAY);
  trainerStore.set(USER_ID, [own]);
  trainerStore.set(OTHER_USER_ID, [foreign]);
  const request = buildRequest('GET', TRAINERS_PATH, USER_TOKEN);
  return send(handler, request).then(buildTrainerListAsserter(buildFilterAsserter(own.id)));
}

function deleteTrainerRemovesIt(): Promise<void> {
  const handler = buildHandler();
  const trainer = buildStoredTrainer('Meu', FIRST_DAY);
  trainerStore.set(USER_ID, [trainer]);
  const request = buildRequest('DELETE', buildTrainerPath(trainer.id), USER_TOKEN);
  return send(handler, request).then(buildDeleteAsserter());
}

function deleteForeignTrainerFails(): Promise<void> {
  const handler = buildHandler();
  const foreign = buildStoredTrainer('Alheio', FIRST_DAY);
  trainerStore.set(OTHER_USER_ID, [foreign]);
  const request = buildRequest('DELETE', buildTrainerPath(foreign.id), USER_TOKEN);
  return send(handler, request).then(buildDeleteNotFoundAsserter());
}

function deleteTrainerWithoutTokenFails(): Promise<void> {
  const handler = buildHandler();
  const request = buildRequest('DELETE', buildTrainerPath('trainer-1'), null);
  return send(handler, request).then(buildStatusErrorAsserter(UNAUTHORIZED, 'unauthenticated'));
}

function buildCreatedTrainerAsserter(): (response: Response) => Promise<void> {
  return function assertCreatedResponse(response: Response): Promise<void> {
    expect(response.status).toBe(CREATED);
    return readJson(response).then(assertCreatedTrainer);
  };
}

function assertCreatedTrainer(body: unknown): void {
  const trainer = body as Trainer;
  expect(trainer.name).toBe(VALID_NAME);
  expect(trainer.gender).toBe('male');
  expect(trainer.level).toBe(1);
  expect(trainer.starterCreatureId).toBe(STARTER_ID);
  expect(trainer.id.length).toBeGreaterThan(0);
  expect(trainerStore.get(USER_ID)).toHaveLength(1);
}

function buildDeleteAsserter(): (response: Response) => void {
  return function assertDeleted(response: Response): void {
    expect(response.status).toBe(204);
    expect(trainerStore.get(USER_ID) ?? []).toHaveLength(0);
  };
}

function buildDeleteNotFoundAsserter(): (response: Response) => Promise<void> {
  return function assertNotFound(response: Response): Promise<void> {
    expect(response.status).toBe(NOT_FOUND);
    expect(trainerStore.get(OTHER_USER_ID)).toHaveLength(1);
    return readError(response).then(buildErrorCodeAsserter('trainer_not_found'));
  };
}

function buildErrorCodeAsserter(code: string): (error: ErrorBody) => void {
  return function assertErrorCode(error: ErrorBody): void {
    expect(error.error).toBe(code);
  };
}

function assertEmptyList(body: TrainerListBody): void {
  expect(body.trainers).toEqual([]);
}

function assertCreationOrder(body: TrainerListBody): void {
  const names = body.trainers.map(readTrainerName);
  const expectedNames = ['Primeiro', 'Segundo'];
  expect(names).toEqual(expectedNames);
}

function buildFilterAsserter(ownId: string): (body: TrainerListBody) => void {
  return function assertOnlyOwnTrainers(body: TrainerListBody): void {
    expect(body.trainers).toHaveLength(1);
    expect(body.trainers[0]?.id).toBe(ownId);
  };
}

function readTrainerName(trainer: Trainer): string {
  return trainer.name;
}

function buildTrainerPath(trainerId: string): string {
  return `${TRAINERS_PATH}/${trainerId}`;
}

test('POST creates a trainer', createTrainerSucceeds);
test('POST without bearer returns 401', createTrainerWithoutTokenFails);
test('POST with short name returns invalid_name', createTrainerWithShortNameFails);
test('POST with invalid gender returns invalid_gender', createTrainerWithInvalidGenderFails);
test('POST with unknown starter returns invalid_starter', createTrainerWithUnknownStarterFails);
test('POST at limit returns max_trainers_reached', createTrainerAtLimitFails);
test('POST with taken name returns name_taken', createTrainerWithTakenNameFails);
test('GET without bearer returns 401', listTrainersWithoutTokenFails);
test('GET returns an empty list', listTrainersReturnsEmptyList);
test('GET returns creation order', listTrainersReturnsCreationOrder);
test('GET filters by account', listTrainersFiltersByAccount);
test('DELETE removes an existing trainer', deleteTrainerRemovesIt);
test('DELETE of a foreign trainer returns 404', deleteForeignTrainerFails);
test('DELETE without bearer returns 401', deleteTrainerWithoutTokenFails);
