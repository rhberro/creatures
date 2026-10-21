import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import {
  NO_CONTENT,
  OK,
  PLAYER_STATE_PATH,
  SESSION_PATH,
  STARTERS_PATH,
  buildHandler,
  buildJsonRequest,
  buildRequest,
  send,
} from '~/__tests__/support';

import {
  buildTestName,
  buildTrainerBody,
  cleanupEnvironment,
  prepareEnvironment,
  readToken,
} from './environment';
import type { IntegrationEnvironment, TrainerPayload } from './environment';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';

let env: IntegrationEnvironment;

describe.skipIf(!ENABLED)('player session against the real database', describeSession);

function describeSession(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the starters come from the database', listsStarters);
  test('the session selects the trainer and the state is read from it', selectsTrainer);
  test('the state is not found without an active trainer', stateWithoutSession);
}

function prepareSuite(): Promise<void> {
  return prepareEnvironment().then(function store(environment: IntegrationEnvironment): void {
    env = environment;
  });
}

function cleanupSuite(): Promise<unknown> {
  if (env === undefined) {
    return Promise.resolve();
  }
  return cleanupEnvironment(env);
}

function listsStarters(): Promise<void> {
  return readToken(env, env.ownerEmail).then(function request(token: string): Promise<void> {
    return sendRequest('GET', STARTERS_PATH, token).then(function assertStatus(
      response: Response,
    ): Promise<void> {
      expect(response.status).toBe(OK);
      return response.json().then(function assertBody(body: unknown): void {
        const starters = (body as { starters: { abilities: unknown[]; isStarter: boolean }[] })
          .starters;
        expect(starters.length).toBeGreaterThan(0);
        expect(starters.every(readIsStarter)).toBe(true);
        expect(starters.every(readHasAbilities)).toBe(true);
      });
    });
  });
}

function selectsTrainer(): Promise<void> {
  return readToken(env, env.ownerEmail).then(function request(token: string): Promise<void> {
    return sendJson('POST', '/api/trainers', buildTrainerBody(buildTestName()), token).then(
      function readTrainer(response: Response): Promise<void> {
        return response.json().then(function select(body: unknown): Promise<void> {
          const trainer = body as TrainerPayload;
          return sendJson('POST', SESSION_PATH, { trainerId: trainer.id }, token).then(
            function assertSession(session: Response): Promise<void> {
              expect(session.status).toBe(NO_CONTENT);
              return sendRequest('GET', PLAYER_STATE_PATH, token).then(function assertState(
                state: Response,
              ): Promise<void> {
                expect(state.status).toBe(OK);
                return state.json().then(assertPlayerState);
              });
            },
          );
        });
      },
    );
  });
}

function stateWithoutSession(): Promise<void> {
  return readToken(env, env.otherEmail).then(function request(token: string): Promise<void> {
    return sendRequest('GET', PLAYER_STATE_PATH, token).then(function assertStatus(
      response: Response,
    ): Promise<void> {
      expect(response.status).toBe(404);
      return response.json().then(function assertCode(body: unknown): void {
        expect((body as { error: string }).error).toBe('trainer_not_found');
      });
    });
  });
}

function assertPlayerState(body: unknown): void {
  const state = body as {
    gold: number;
    maxStaminaMinutes: number;
    staminaMinutes: number;
    team: { slot: number }[];
  };
  expect(state.team).toHaveLength(1);
  expect(state.team[0]?.slot).toBe(1);
  expect(state.maxStaminaMinutes).toBe(720);
  expect(state.staminaMinutes).toBe(720);
  expect(state.gold).toBe(0);
}

function readIsStarter(starter: { isStarter: boolean }): boolean {
  return starter.isStarter;
}

function readHasAbilities(starter: { abilities: unknown[] }): boolean {
  return starter.abilities.length > 0;
}

function sendRequest(method: string, path: string, token: string): Promise<Response> {
  return send(buildHandler(env.deps), buildRequest(method, path, token));
}

function sendJson(method: string, path: string, body: unknown, token: string): Promise<Response> {
  return send(buildHandler(env.deps), buildJsonRequest(method, path, body, token));
}
