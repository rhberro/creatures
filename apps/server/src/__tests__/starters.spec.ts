import { beforeEach, expect, test } from 'bun:test';

import type { Starter } from '@creatures/contracts/trainer';

import {
  OK,
  STARTERS_PATH,
  STARTER_COUNT,
  UNAUTHORIZED,
  USER_TOKEN,
  buildHandler,
  buildRequest,
  buildStatusErrorAsserter,
  clearStore,
  readJson,
  send,
} from './support';

beforeEach(clearStore);

function listStartersReturnsAll(): Promise<void> {
  const handler = buildHandler();
  const request = buildRequest('GET', STARTERS_PATH, USER_TOKEN);
  return send(handler, request).then(buildStartersAsserter());
}

function listStartersWithoutTokenFails(): Promise<void> {
  const handler = buildHandler();
  const request = buildRequest('GET', STARTERS_PATH, null);
  return send(handler, request).then(buildStatusErrorAsserter(UNAUTHORIZED, 'unauthenticated'));
}

function buildStartersAsserter(): (response: Response) => Promise<void> {
  return function assertStarters(response: Response): Promise<void> {
    expect(response.status).toBe(OK);
    return readJson(response).then(assertStarterBody);
  };
}

function assertStarterBody(body: unknown): void {
  const starters = (body as { starters: Starter[] }).starters;
  expect(starters).toHaveLength(STARTER_COUNT);
}

test('GET /api/starters returns three starters', listStartersReturnsAll);
test('GET /api/starters without bearer returns 401', listStartersWithoutTokenFails);
