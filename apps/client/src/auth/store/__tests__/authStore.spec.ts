import { afterEach, beforeEach, expect, test } from 'bun:test';

import { type AuthStore, createAuthStore, selectStatus, selectUser } from '~/auth/store/authStore';
import {
  MockAuthAdapter,
  type MockAuthAdapterConfig,
  type MockAuthBehavior,
} from '~/auth/store/mockAdapter';
import type {
  AuthErrorCode,
  AuthResult,
  AuthSession,
  AuthUser,
  CredentialsInput,
} from '~/auth/store/types';

const TEST_USER: AuthUser = { email: 'test@example.com', id: 'user-1' };
const CREDENTIALS: CredentialsInput = { email: 'test@example.com', password: 'password-1' };
const NO_SESSION_CONFIG: MockAuthAdapterConfig = { initialSession: null };
const INVALID_CREDENTIALS_CONFIG: MockAuthAdapterConfig = {
  initialSession: null,
  signInWithPassword: alwaysFails('invalid_credentials'),
};
const NETWORK_FAILURE_CONFIG: MockAuthAdapterConfig = {
  initialSession: null,
  signInWithPassword: alwaysFails('network'),
};
const SIGN_IN_ATTEMPTS = 5;
const NO_ATTEMPTS_LEFT = 0;
const EXPECTED_CHANGES = 1;
const NO_CHANGES = 0;

let adapter: MockAuthAdapter;
let store: AuthStore;

beforeEach(setupFixture);
afterEach(teardownFixture);

function setupFixture(): void {
  const fixture = buildFixture(NO_SESSION_CONFIG);
  adapter = fixture.adapter;
  store = fixture.store;
}

function teardownFixture(): void {
  store.getState().dispose();
}

type Fixture = {
  adapter: MockAuthAdapter;
  store: AuthStore;
};

type StoreProbe = {
  read(): number;
  stop(): void;
};

function buildFixture(config: MockAuthAdapterConfig): Fixture {
  const mockAdapter = new MockAuthAdapter(config);
  const authStore = createAuthStore(mockAdapter);
  return { adapter: mockAdapter, store: authStore };
}

function buildSession(user: AuthUser): AuthSession {
  return { access_token: 'test-token', user };
}

function alwaysFails(code: AuthErrorCode): MockAuthBehavior {
  return function fail(): Promise<AuthResult> {
    return Promise.resolve({ code, ok: false });
  };
}

function probeStore(target: AuthStore): StoreProbe {
  const counter = { changes: NO_CHANGES };
  function countChanges(): void {
    counter.changes += 1;
  }
  const unsubscribe = target.subscribe(countChanges);
  return {
    read: buildChangeReader(counter),
    stop: unsubscribe,
  };
}

function buildChangeReader(counter: { changes: number }): () => number {
  return function read(): number {
    return counter.changes;
  };
}

function initialSessionWithoutUser(): void {
  adapter.emitAuthEvent('INITIAL_SESSION', null);
  expect(selectStatus(store.getState())).toBe('UNAUTHENTICATED');
  expect(selectUser(store.getState())).toBeNull();
}

function initialSessionWithUser(): void {
  adapter.emitAuthEvent('INITIAL_SESSION', buildSession(TEST_USER));
  expect(selectStatus(store.getState())).toBe('AUTHENTICATED');
  expect(selectUser(store.getState())).toEqual(TEST_USER);
}

function signInSucceeds(): Promise<void> {
  adapter.emitAuthEvent('INITIAL_SESSION', null);
  return store.getState().signInWithPassword(CREDENTIALS).then(assertAuthenticated);
}

function assertAuthenticated(result: AuthResult): void {
  expect(result).toEqual({ ok: true });
  expect(selectStatus(store.getState())).toBe('AUTHENTICATED');
}

function signInWithInvalidCredentials(): Promise<void> {
  const fixture = buildFixture(INVALID_CREDENTIALS_CONFIG);
  fixture.adapter.emitAuthEvent('INITIAL_SESSION', null);
  return fixture.store
    .getState()
    .signInWithPassword(CREDENTIALS)
    .then(buildFailureAsserter(fixture.store, 'invalid_credentials'));
}

function signInWithNetworkFailure(): Promise<void> {
  const fixture = buildFixture(NETWORK_FAILURE_CONFIG);
  fixture.adapter.emitAuthEvent('INITIAL_SESSION', null);
  return fixture.store
    .getState()
    .signInWithPassword(CREDENTIALS)
    .then(buildFailureAsserter(fixture.store, 'network'));
}

function buildFailureAsserter(
  target: AuthStore,
  code: AuthErrorCode,
): (result: AuthResult) => void {
  return function assertFailure(result): void {
    expect(result).toEqual({ code, ok: false });
    expect(selectStatus(target.getState())).toBe('UNAUTHENTICATED');
    target.getState().dispose();
  };
}

function signOutMovesToUnauthenticated(): Promise<void> {
  adapter.emitAuthEvent('INITIAL_SESSION', buildSession(TEST_USER));
  return store.getState().signOut().then(assertSignedOut);
}

function assertSignedOut(): void {
  expect(selectStatus(store.getState())).toBe('UNAUTHENTICATED');
  expect(selectUser(store.getState())).toBeNull();
}

function tokenRefreshedKeepsIdentity(): void {
  adapter.emitAuthEvent('INITIAL_SESSION', buildSession(TEST_USER));
  const probe = probeStore(store);
  adapter.emitAuthEvent('TOKEN_REFRESHED', buildSession(TEST_USER));
  adapter.emitAuthEvent('USER_UPDATED', buildSession(TEST_USER));
  expect(selectStatus(store.getState())).toBe('AUTHENTICATED');
  expect(probe.read()).toBe(NO_CHANGES);
  probe.stop();
}

function passwordRecoveryMovesToRecovering(): void {
  adapter.emitAuthEvent('PASSWORD_RECOVERY', buildSession(TEST_USER));
  expect(selectStatus(store.getState())).toBe('RECOVERING');
  expect(selectUser(store.getState())).toEqual(TEST_USER);
}

function signInThrottlesSubscriber(): Promise<void> {
  adapter.emitAuthEvent('INITIAL_SESSION', null);
  const probe = probeStore(store);
  return runSignInAttempts(SIGN_IN_ATTEMPTS).then(buildThrottleAsserter(probe));
}

function runSignInAttempts(remaining: number): Promise<void> {
  if (remaining <= NO_ATTEMPTS_LEFT) {
    return Promise.resolve();
  }
  return store.getState().signInWithPassword(CREDENTIALS).then(buildNextAttempt(remaining));
}

function buildNextAttempt(remaining: number): () => Promise<void> {
  return function continueAttempts(): Promise<void> {
    return runSignInAttempts(remaining - 1);
  };
}

function buildThrottleAsserter(probe: StoreProbe): () => void {
  return function assertThrottled(): void {
    probe.stop();
    expect(selectStatus(store.getState())).toBe('AUTHENTICATED');
    expect(probe.read()).toBe(EXPECTED_CHANGES);
  };
}

function disposeRemovesListener(): void {
  const fixture = buildFixture(NO_SESSION_CONFIG);
  fixture.store.getState().dispose();
  fixture.adapter.emitAuthEvent('INITIAL_SESSION', buildSession(TEST_USER));
  expect(selectStatus(fixture.store.getState())).toBe('INITIALIZING');
}

test('initial session without user moves to UNAUTHENTICATED', initialSessionWithoutUser);
test('initial session with user moves to AUTHENTICATED', initialSessionWithUser);
test('signin success moves to AUTHENTICATED', signInSucceeds);
test('signin with invalid credentials keeps status unchanged', signInWithInvalidCredentials);
test('signin with network failure keeps status unchanged', signInWithNetworkFailure);
test('signout moves to UNAUTHENTICATED', signOutMovesToUnauthenticated);
test('token refresh keeps identity without extra update', tokenRefreshedKeepsIdentity);
test('password recovery moves to RECOVERING', passwordRecoveryMovesToRecovering);
test('signin throttle limits observable changes', signInThrottlesSubscriber);
test('dispose removes the adapter listener', disposeRemovesListener);
