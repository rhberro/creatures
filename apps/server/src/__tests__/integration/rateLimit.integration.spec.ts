import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import {
  BAD_REQUEST,
  TRAINERS_PATH,
  buildHandler,
  buildJsonRequest,
  send,
} from '~/__tests__/support';

import { cleanupEnvironment, prepareEnvironment, readToken } from './environment';
import type { IntegrationEnvironment } from './environment';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';
const TOO_MANY_REQUESTS = 429;
const RATE_LIMIT_MESSAGE = 'Muitas tentativas. Tente novamente em alguns minutos.';
const INVALID_BODY = { gender: 'male', name: 'a', starterSpeciesId: 'not-a-uuid' };

let env: IntegrationEnvironment;

describe.skipIf(!ENABLED)('the rate limit against the real database', describeRateLimit);

function describeRateLimit(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the failed attempts block the account', blocksTheAccount);
  test('the failures of an account do not block another account', isolatesAccounts);
  test('the database is left without trainers', leavesEmptyDatabase);
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

function blocksTheAccount(): Promise<void> {
  return readToken(env, env.otherEmail).then(function request(token: string): Promise<void> {
    return sendFailures(token, 5).then(function assertLimited(): Promise<void> {
      return sendJson(token).then(function assertStatus(response: Response): Promise<void> {
        expect(response.status).toBe(TOO_MANY_REQUESTS);
        return response.json().then(function assertBody(body: unknown): void {
          const error = body as { error: string; message: string };
          expect(error.error).toBe('rate_limited');
          expect(error.message).toBe(RATE_LIMIT_MESSAGE);
        });
      });
    });
  });
}

function isolatesAccounts(): Promise<void> {
  return readToken(env, env.ownerEmail).then(function request(token: string): Promise<void> {
    return sendJson(token).then(function assertStatus(response: Response): void {
      expect(response.status).toBe(BAD_REQUEST);
    });
  });
}

function leavesEmptyDatabase(): Promise<void> {
  const trainers = env.admin
    .from('trainers')
    .select('id')
    .in('owner_id', [env.ownerId, env.otherId]);
  return Promise.resolve(trainers.then(readRows)).then(function assertRows(result: {
    data: unknown[] | null;
  }): void {
    expect(result.data ?? []).toHaveLength(0);
  });
}

function sendFailures(token: string, times: number): Promise<void> {
  if (times === 0) {
    return Promise.resolve();
  }
  return sendJson(token).then(function assertFailure(response: Response): Promise<void> {
    expect(response.status).toBe(BAD_REQUEST);
    return sendFailures(token, times - 1);
  });
}

function sendJson(token: string): Promise<Response> {
  const request = buildJsonRequest('POST', TRAINERS_PATH, INVALID_BODY, token);
  return send(buildHandler(env.deps), request);
}

function readRows(result: { data: unknown[] | null }): { data: unknown[] | null } {
  return result;
}
