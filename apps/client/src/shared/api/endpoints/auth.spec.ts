import { afterEach, beforeEach, expect, test } from 'bun:test';

import type { ApiDeps } from '~/shared/api/client';

import { requestGoogleMerge } from './auth';

const BASE_URL = 'http://localhost:3001';
const EMAIL = 'player@example.com';
const MERGE_PATH = '/api/auth/google-merge';

type FakeResponse = {
  json(): Promise<unknown>;
  status: number;
};

const DEPS: ApiDeps = {
  baseUrl: BASE_URL,
  getAccessToken: function getAccessToken(): Promise<string | null> {
    return Promise.resolve('access-token');
  },
};

let originalFetch: typeof globalThis.fetch;

beforeEach(saveOriginalFetch);
afterEach(restoreOriginalFetch);

function saveOriginalFetch(): void {
  originalFetch = globalThis.fetch;
}

function restoreOriginalFetch(): void {
  globalThis.fetch = originalFetch;
}

function stubFetch(answer: (url: string) => FakeResponse): void {
  globalThis.fetch = function fetchStub(input: RequestInfo | URL): Promise<Response> {
    return Promise.resolve(answer(String(input)) as unknown as Response);
  } as unknown as typeof globalThis.fetch;
}

function buildJson(status: number, body: unknown): FakeResponse {
  return {
    json: function json(): Promise<unknown> {
      return Promise.resolve(body);
    },
    status,
  };
}

function theMergeIsConfirmed(): Promise<void> {
  stubFetch(buildMergedAnswer);
  return requestGoogleMerge(DEPS, EMAIL).then(function assertResult(result): void {
    expect(result).toEqual({ merged: true, ok: true });
  });
}

function buildMergedAnswer(): FakeResponse {
  return buildJson(200, { merged: true, userId: 'user-1' });
}

function anAccountWithoutPasswordIsNotAMerge(): Promise<void> {
  stubFetch(buildNoPasswordAccountAnswer);
  return requestGoogleMerge(DEPS, EMAIL).then(function assertResult(result): void {
    expect(result).toEqual({ merged: false, ok: true });
  });
}

function buildNoPasswordAccountAnswer(): FakeResponse {
  return buildJson(409, { error: 'no_password_account' });
}

function aSessionThatIsNotGoogleIsNotAMerge(): Promise<void> {
  stubFetch(buildNotGoogleAnswer);
  return requestGoogleMerge(DEPS, EMAIL).then(function assertResult(result): void {
    expect(result).toEqual({ merged: false, ok: true });
  });
}

function buildNotGoogleAnswer(): FakeResponse {
  return buildJson(409, { error: 'not_google_account' });
}

function anUnverifiedEmailIsAFailure(): Promise<void> {
  stubFetch(buildUnverifiedAnswer);
  return requestGoogleMerge(DEPS, EMAIL).then(function assertResult(result): void {
    expect(result).toEqual({ code: 'email_unverified', ok: false });
  });
}

function buildUnverifiedAnswer(): FakeResponse {
  return buildJson(409, { error: 'email_unverified' });
}

function aMalformedEmailIsAFailure(): Promise<void> {
  stubFetch(buildInvalidEmailAnswer);
  return requestGoogleMerge(DEPS, EMAIL).then(function assertResult(result): void {
    expect(result).toEqual({ code: 'invalid_email', ok: false });
  });
}

function buildInvalidEmailAnswer(): FakeResponse {
  return buildJson(400, { error: 'invalid_email' });
}

function aMissingSessionIsAFailure(): Promise<void> {
  stubFetch(buildUnauthenticatedAnswer);
  return requestGoogleMerge(DEPS, EMAIL).then(function assertResult(result): void {
    expect(result).toEqual({ code: 'unauthenticated', ok: false });
  });
}

function buildUnauthenticatedAnswer(): FakeResponse {
  return buildJson(401, { error: 'unauthenticated' });
}

function aNetworkFailureIsAFailure(): Promise<void> {
  globalThis.fetch = fetchThatFails as unknown as typeof globalThis.fetch;
  return requestGoogleMerge(DEPS, EMAIL).then(function assertResult(result): void {
    expect(result).toEqual({ code: 'network', ok: false });
  });
}

function fetchThatFails(): Promise<Response> {
  return Promise.reject(new Error('the server is unreachable'));
}

function theRequestGoesToTheMergeEndpoint(): Promise<void> {
  const urls: string[] = [];
  globalThis.fetch = function fetchStub(input: RequestInfo | URL): Promise<Response> {
    urls.push(String(input));
    return Promise.resolve(buildMergedAnswer() as unknown as Response);
  } as unknown as typeof globalThis.fetch;
  return requestGoogleMerge(DEPS, EMAIL).then(function assertUrl(): void {
    expect(urls[0]).toBe(`${BASE_URL}${MERGE_PATH}`);
  });
}

test('the merge of a google account is confirmed', theMergeIsConfirmed);
test('an account without password is not a merge', anAccountWithoutPasswordIsNotAMerge);
test('a session that is not google is not a merge', aSessionThatIsNotGoogleIsNotAMerge);
test('an unverified e-mail is a failure', anUnverifiedEmailIsAFailure);
test('a malformed e-mail is a failure', aMalformedEmailIsAFailure);
test('a missing session is a failure', aMissingSessionIsAFailure);
test('a network failure is a failure', aNetworkFailureIsAFailure);
test('the request goes to the merge endpoint', theRequestGoesToTheMergeEndpoint);
