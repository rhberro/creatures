import type {
  AuthChangeEvent,
  AuthResponse,
  OAuthResponse,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';

import { mapAuthError } from '~/auth/store/errors';
import type {
  AuthAdapter,
  AuthAdapterResult,
  AuthEventHandler,
  AuthEvent,
  AuthSession,
  CredentialsInput,
  OAuthInput,
  PasswordResetInput,
  PasswordUpdateInput,
} from '~/auth/store/types';

type AuthErrorResult = {
  error: unknown;
};

export class SupabaseAuthAdapter implements AuthAdapter {
  private readonly client: SupabaseClient;

  public constructor(client: SupabaseClient) {
    this.client = client;
  }

  public subscribe(handler: AuthEventHandler): () => void {
    const { data } = this.client.auth.onAuthStateChange(buildAuthChangeHandler(handler));
    return buildUnsubscribe(data.subscription.unsubscribe);
  }

  public signInWithPassword(input: CredentialsInput): Promise<AuthAdapterResult> {
    return this.client.auth.signInWithPassword(input).then(handleErrorResult);
  }

  public signUp(input: CredentialsInput): Promise<AuthAdapterResult> {
    return this.client.auth.signUp(input).then(handleSignUpResult);
  }

  public signInWithOAuth(input: OAuthInput): Promise<AuthAdapterResult> {
    const options = { redirectTo: buildRedirectUrl(input.path) };
    return this.client.auth
      .signInWithOAuth({ options, provider: input.provider })
      .then(handleOAuthResult);
  }

  public signOut(): Promise<void> {
    return this.client.auth.signOut().then(ignoreResult, ignoreResult);
  }

  public resetPasswordForEmail(input: PasswordResetInput): Promise<AuthAdapterResult> {
    const options = { redirectTo: buildRedirectUrl(input.path) };
    return this.client.auth.resetPasswordForEmail(input.email, options).then(handleErrorResult);
  }

  public updateUser(input: PasswordUpdateInput): Promise<AuthAdapterResult> {
    return this.client.auth.updateUser({ password: input.password }).then(handleErrorResult);
  }
}

function buildAuthChangeHandler(
  handler: AuthEventHandler,
): (event: AuthChangeEvent, session: Session | null) => void {
  return function handleAuthChange(event, session): void {
    const mappedEvent = mapEvent(event);
    if (mappedEvent === null) {
      return;
    }
    handler(mappedEvent, mapSession(session));
  };
}

function mapEvent(event: AuthChangeEvent): AuthEvent | null {
  switch (event) {
    case 'INITIAL_SESSION':
    case 'PASSWORD_RECOVERY':
    case 'SIGNED_IN':
    case 'SIGNED_OUT':
    case 'TOKEN_REFRESHED':
    case 'USER_UPDATED':
      return event;
    default:
      return null;
  }
}

function mapSession(session: Session | null): AuthSession | null {
  if (session === null) {
    return null;
  }
  return {
    access_token: session.access_token,
    user: { email: session.user.email ?? null, id: session.user.id },
  };
}

function handleErrorResult(result: AuthErrorResult): AuthAdapterResult {
  if (result.error === null) {
    return { ok: true };
  }
  return { code: mapAuthError(result.error), ok: false };
}

function handleSignUpResult(result: AuthResponse): AuthAdapterResult {
  if (result.error !== null) {
    return { code: mapAuthError(result.error), ok: false };
  }
  if (result.data.session === null) {
    return { code: 'unknown', ok: false };
  }
  return { ok: true };
}

function handleOAuthResult(result: OAuthResponse): AuthAdapterResult {
  if (result.error !== null) {
    return { code: mapAuthError(result.error), ok: false };
  }
  return { ok: true, redirectUrl: result.data.url };
}

function buildRedirectUrl(path: string): string {
  return `${globalThis.location.origin}${path}`;
}

function buildUnsubscribe(unsubscribe: () => void): () => void {
  return function teardown(): void {
    unsubscribe();
  };
}

function ignoreResult(): void {
  void 0;
}
