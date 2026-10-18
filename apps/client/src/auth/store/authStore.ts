import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import type {
  AuthAdapter,
  AuthErrorCode,
  AuthEventHandler,
  AuthEvent,
  AuthResult,
  AuthSession,
  AuthState,
  AuthStatus,
  AuthUser,
  CredentialsInput,
  OAuthInput,
  PasswordResetInput,
  PasswordUpdateInput,
} from '~/auth/store/types';
import { PASSWORD_MAX, PASSWORD_MIN } from '~/auth/store/types';

const INITIAL_STATUS: AuthStatus = 'INITIALIZING';
const OAUTH_PATH = '/trainers';
const RECOVERY_PATH = '/reset-password';

export type AuthActions = {
  dispose(): void;
  requestPasswordReset(email: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  signInWithPassword(input: CredentialsInput): Promise<AuthResult>;
  signOut(): Promise<void>;
  signUp(input: CredentialsInput): Promise<AuthResult>;
  updatePassword(newPassword: string): Promise<AuthResult>;
};

export type AuthStoreState = AuthState & AuthActions;

export type AuthStore = StoreApi<AuthStoreState>;

export function createAuthStore(adapter: AuthAdapter): AuthStore {
  return createStore<AuthStoreState>(buildInitializer(adapter));
}

export function selectStatus(state: AuthState): AuthStatus {
  return state.status;
}

export function selectUser(state: AuthState): AuthUser | null {
  return state.user;
}

function buildInitializer(adapter: AuthAdapter): StateCreator<AuthStoreState> {
  return function initialize(_set, _get, store): AuthStoreState {
    const unsubscribe = adapter.subscribe(buildAuthEventHandler(store));
    return {
      ...buildInitialState(),
      ...buildActions(adapter, unsubscribe),
    };
  };
}

function buildInitialState(): AuthState {
  return { status: INITIAL_STATUS, user: null };
}

function buildAuthEventHandler(store: AuthStore): AuthEventHandler {
  return function handleAuthEvent(event, session): void {
    const current = store.getState();
    const next = computeNextState(event, session, current);
    if (isUnchanged(current, next)) {
      return;
    }
    store.setState(next);
  };
}

function computeNextState(
  event: AuthEvent,
  session: AuthSession | null,
  current: AuthState,
): AuthState {
  return {
    status: computeNextStatus(event, session),
    user: computeNextUser(event, session, current.user),
  };
}

function computeNextStatus(event: AuthEvent, session: AuthSession | null): AuthStatus {
  if (event === 'PASSWORD_RECOVERY') {
    return 'RECOVERING';
  }
  if (event === 'SIGNED_OUT') {
    return 'UNAUTHENTICATED';
  }
  if (session === null) {
    return 'UNAUTHENTICATED';
  }
  return 'AUTHENTICATED';
}

function computeNextUser(
  event: AuthEvent,
  session: AuthSession | null,
  currentUser: AuthUser | null,
): AuthUser | null {
  if (event === 'SIGNED_OUT') {
    return null;
  }
  if (session === null) {
    if (event === 'PASSWORD_RECOVERY') {
      return currentUser;
    }
    return null;
  }
  return session.user;
}

function isUnchanged(current: AuthState, next: AuthState): boolean {
  return next.status === current.status && readUserId(next.user) === readUserId(current.user);
}

function readUserId(user: AuthUser | null): string | null {
  if (user === null) {
    return null;
  }
  return user.id;
}

function buildActions(adapter: AuthAdapter, unsubscribe: () => void): AuthActions {
  return {
    dispose: buildDispose(unsubscribe),
    requestPasswordReset: buildRequestPasswordReset(adapter),
    signInWithGoogle: buildSignInWithGoogle(adapter),
    signInWithPassword: buildSignInWithPassword(adapter),
    signOut: buildSignOut(adapter),
    signUp: buildSignUp(adapter),
    updatePassword: buildUpdatePassword(adapter),
  };
}

function buildDispose(unsubscribe: () => void): () => void {
  return function dispose(): void {
    unsubscribe();
  };
}

function buildSignInWithPassword(
  adapter: AuthAdapter,
): (input: CredentialsInput) => Promise<AuthResult> {
  return function signInWithPassword(input): Promise<AuthResult> {
    return adapter.signInWithPassword(input);
  };
}

function buildSignUp(adapter: AuthAdapter): (input: CredentialsInput) => Promise<AuthResult> {
  return function signUp(input): Promise<AuthResult> {
    if (!isValidPassword(input.password)) {
      return Promise.resolve(failure('weak_password'));
    }
    return adapter.signUp(input);
  };
}

function buildSignInWithGoogle(adapter: AuthAdapter): () => Promise<AuthResult> {
  return function signInWithGoogle(): Promise<AuthResult> {
    const input: OAuthInput = { path: OAUTH_PATH, provider: 'google' };
    return adapter.signInWithOAuth(input);
  };
}

function buildSignOut(adapter: AuthAdapter): () => Promise<void> {
  return function signOut(): Promise<void> {
    return adapter.signOut();
  };
}

function buildRequestPasswordReset(adapter: AuthAdapter): (email: string) => Promise<AuthResult> {
  return function requestPasswordReset(email): Promise<AuthResult> {
    const input: PasswordResetInput = { email, path: RECOVERY_PATH };
    return adapter.resetPasswordForEmail(input);
  };
}

function buildUpdatePassword(adapter: AuthAdapter): (newPassword: string) => Promise<AuthResult> {
  return function updatePassword(newPassword): Promise<AuthResult> {
    if (!isValidPassword(newPassword)) {
      return Promise.resolve(failure('weak_password'));
    }
    const input: PasswordUpdateInput = { password: newPassword };
    return adapter.updateUser(input);
  };
}

function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX;
}

function failure(code: AuthErrorCode): AuthResult {
  return { code, ok: false };
}
