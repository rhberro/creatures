import { expect, test } from 'bun:test';

import {
  HEALTH_PATH,
  NO_CONTENT,
  NOT_FOUND,
  PLAYER_STATE_PATH,
  SESSION_PATH,
  STARTERS_PATH,
  TRAINERS_PATH,
  UNAUTHORIZED,
  USER_ID,
  USER_TOKEN,
  buildDependencies,
  buildHandler,
  buildJsonRequest,
  buildRequest,
  readError,
  readJson,
  send,
} from './support';

const STARTER_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const VALID_NAME = 'Rafael';

function expectUnauthenticated(method: string, path: string, body?: unknown): Promise<void> {
  const handler = buildHandler();
  const request =
    body === undefined
      ? buildRequest(method, path, null)
      : buildJsonRequest(method, path, body, null);
  return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
    expect(response.status).toBe(UNAUTHORIZED);
    return readError(response).then(assertUnauthenticatedCode);
  });
}

function assertUnauthenticatedCode(error: { error: string }): void {
  expect(error.error).toBe('unauthenticated');
}

function trainerListRequiresAuth(): Promise<void> {
  return expectUnauthenticated('GET', TRAINERS_PATH);
}

function trainerCreationRequiresAuth(): Promise<void> {
  return expectUnauthenticated('POST', TRAINERS_PATH, {
    gender: 'male',
    name: VALID_NAME,
    starterSpeciesId: STARTER_ID,
  });
}

function startersRequireAuth(): Promise<void> {
  return expectUnauthenticated('GET', STARTERS_PATH);
}

function sessionRequiresAuth(): Promise<void> {
  return expectUnauthenticated('POST', SESSION_PATH, { trainerId: STARTER_ID });
}

function sessionDeletionRequiresAuth(): Promise<void> {
  return expectUnauthenticated('DELETE', SESSION_PATH);
}

/**
 * Deleting the session of the trainer disconnects the trainer of the account:
 * the state of the player is not served anymore.
 */
function sessionDeletionClearsTheTrainer(): Promise<void> {
  const deps = buildDependencies();
  deps.sessions.set(USER_ID, 'trainer-1');
  const handler = buildHandler(deps);
  const deletion = buildRequest('DELETE', SESSION_PATH, USER_TOKEN);
  return send(handler, deletion).then(function assertNoContent(response: Response): Promise<void> {
    expect(response.status).toBe(NO_CONTENT);
    const state = buildRequest('GET', PLAYER_STATE_PATH, USER_TOKEN);
    return send(handler, state).then(function assertStatus(stateResponse: Response): Promise<void> {
      expect(stateResponse.status).toBe(NOT_FOUND);
      return readError(stateResponse).then(assertTrainerNotFound);
    });
  });
}

function playerStateRequiresAuth(): Promise<void> {
  return expectUnauthenticated('GET', PLAYER_STATE_PATH);
}

function abilitySlotsRequireAuth(): Promise<void> {
  return expectUnauthenticated(
    'PUT',
    '/api/creatures/11111111-1111-4111-8111-111111111111/ability-slots',
    {
      abilityIds: [],
    },
  );
}

function gearSlotRequiresAuth(): Promise<void> {
  return expectUnauthenticated('PUT', '/api/gear-slots/4', {
    itemId: '11111111-1111-4111-8111-111111111111',
  });
}

function gearSlotDeletionRequiresAuth(): Promise<void> {
  return expectUnauthenticated('DELETE', '/api/gear-slots/6');
}

function teamSwapRequiresAuth(): Promise<void> {
  return expectUnauthenticated('POST', '/api/team/swap', {
    creatureId: '11111111-1111-4111-8111-111111111111',
  });
}

function healthIsPublic(): Promise<void> {
  const handler = buildHandler();
  const request = buildRequest('GET', HEALTH_PATH, null);
  return send(handler, request).then(function assertHealth(response: Response): Promise<void> {
    expect(response.status).toBe(200);
    return readJson(response).then(assertHealthBody);
  });
}

function assertHealthBody(body: unknown): void {
  expect(body).toEqual({ status: 'ok' });
}

function playerStateWithoutSessionIsNotFound(): Promise<void> {
  const handler = buildHandler();
  const request = buildRequest('GET', PLAYER_STATE_PATH, USER_TOKEN);
  return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
    expect(response.status).toBe(404);
    return readError(response).then(assertTrainerNotFound);
  });
}

function assertTrainerNotFound(error: { error: string }): void {
  expect(error.error).toBe('trainer_not_found');
}

test('GET /api/trainers without bearer returns 401', trainerListRequiresAuth);
test('POST /api/trainers without bearer returns 401', trainerCreationRequiresAuth);
test('GET /api/starters without bearer returns 401', startersRequireAuth);
test('POST /api/session/trainer without bearer returns 401', sessionRequiresAuth);
test('DELETE /api/session/trainer without bearer returns 401', sessionDeletionRequiresAuth);
test(
  'DELETE /api/session/trainer disconnects the trainer of the account',
  sessionDeletionClearsTheTrainer,
);
test('GET /api/player/state without bearer returns 401', playerStateRequiresAuth);
test('PUT /api/creatures/:id/ability-slots without bearer returns 401', abilitySlotsRequireAuth);
test('PUT /api/gear-slots/:slot without bearer returns 401', gearSlotRequiresAuth);
test('DELETE /api/gear-slots/:slot without bearer returns 401', gearSlotDeletionRequiresAuth);
test('POST /api/team/swap without bearer returns 401', teamSwapRequiresAuth);
test('GET /api/health is public', healthIsPublic);
test(
  'GET /api/player/state without an active trainer returns 404',
  playerStateWithoutSessionIsNotFound,
);
