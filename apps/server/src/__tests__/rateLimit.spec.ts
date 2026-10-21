import { expect, test } from 'bun:test';

import { createAttemptLimiter } from '~/ratelimit/attemptLimiter';

import {
  BAD_REQUEST,
  NOT_FOUND,
  OTHER_TOKEN,
  PLAYER_STATE_PATH,
  TRAINERS_PATH,
  USER_TOKEN,
  buildDependencies,
  buildHandler,
  buildJsonRequest,
  buildRequest,
  readError,
  send,
} from './support';

const TOO_MANY_REQUESTS = 429;
const RATE_LIMIT_MESSAGE = 'Muitas tentativas. Tente novamente em alguns minutos.';
const INVALID_BODY = { gender: 'male', name: 'a', starterSpeciesId: 'not-a-uuid' };
const WINDOW_MS = 15 * 60 * 1000;

function failedAttemptsAreLimited(): Promise<void> {
  const deps = buildDependencies();
  const handler = buildHandler(deps);
  return sendFailures(handler, 5).then(function assertLimited(): Promise<void> {
    const request = buildJsonRequest('POST', TRAINERS_PATH, INVALID_BODY, USER_TOKEN);
    return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
      expect(response.status).toBe(TOO_MANY_REQUESTS);
      return readError(response).then(assertRateLimited);
    });
  });
}

function anotherAccountIsNotLimited(): Promise<void> {
  const deps = buildDependencies();
  const handler = buildHandler(deps);
  return sendFailures(handler, 5).then(function requestOtherAccount(): Promise<void> {
    const request = buildJsonRequest('POST', TRAINERS_PATH, INVALID_BODY, OTHER_TOKEN);
    return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
      expect(response.status).toBe(BAD_REQUEST);
      return readError(response).then(assertInvalidName);
    });
  });
}

/**
 * The state of the player is read on every command: a read that is refused
 * because of the attempts of a write breaks the game loop.
 */
function readsAreNotLimited(): Promise<void> {
  const deps = buildDependencies();
  const handler = buildHandler(deps);
  return sendFailures(handler, 5).then(function readState(): Promise<void> {
    const request = buildRequest('GET', PLAYER_STATE_PATH, USER_TOKEN);
    return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
      expect(response.status).toBe(NOT_FOUND);
      return readError(response).then(assertTrainerNotFound);
    });
  });
}

/**
 * The counter of the failures forgets on its own: the attempts that left the
 * window of fifteen minutes do not count anymore.
 */
function theCounterForgetsAfterTheWindow(): void {
  let clock = 1000;
  const limiter = createAttemptLimiter({
    now: function readClock(): number {
      return clock;
    },
  });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    limiter.recordFailure('email:player@example.com');
  }
  expect(limiter.isBlocked('email:player@example.com')).toBe(true);
  clock = 1000 + WINDOW_MS;
  expect(limiter.isBlocked('email:player@example.com')).toBe(false);
}

function sendFailures(handler: ReturnType<typeof buildHandler>, times: number): Promise<void> {
  if (times === 0) {
    return Promise.resolve();
  }
  const request = buildJsonRequest('POST', TRAINERS_PATH, INVALID_BODY, USER_TOKEN);
  return send(handler, request).then(function assertFailure(response: Response): Promise<void> {
    expect(response.status).toBe(BAD_REQUEST);
    return sendFailures(handler, times - 1);
  });
}

function assertRateLimited(error: { error: string; message: string }): void {
  expect(error.error).toBe('rate_limited');
  expect(error.message).toBe(RATE_LIMIT_MESSAGE);
}

function assertInvalidName(error: { error: string }): void {
  expect(error.error).toBe('invalid_name');
}

function assertTrainerNotFound(error: { error: string }): void {
  expect(error.error).toBe('trainer_not_found');
}

test('five failed attempts block the next attempt with 429', failedAttemptsAreLimited);
test('the failures of an account do not block another account', anotherAccountIsNotLimited);
test('the read of the player state is never limited', readsAreNotLimited);
test('the counter of the failures forgets after fifteen minutes', theCounterForgetsAfterTheWindow);
