import type {
  AuthChangeEvent,
  AuthResponse,
  OAuthResponse,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { mapAuthError } from './errors';
import type {
  AuthAdapter,
  AuthAdapterResult,
  AuthErrorCode,
  AuthEvent,
  AuthEventHandler,
  AuthSession,
  CredentialsInput,
  OAuthInput,
  PasswordResetInput,
  PasswordUpdateInput,
  SignUpInput,
} from './types';

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

  public signUp(input: SignUpInput): Promise<AuthAdapterResult> {
    const credentials = {
      email: input.email,
      options: { emailRedirectTo: buildRedirectUrl(input.path) },
      password: input.password,
    };
    return this.client.auth.signUp(credentials).then(handleSignUpResult);
  }

  public signInWithOAuth(input: OAuthInput): Promise<AuthAdapterResult> {
    // The page owns the navigation: without `skipBrowserRedirect` the SDK
    // navigates on its own and the page navigates too.
    const options = { redirectTo: buildRedirectUrl(input.path), skipBrowserRedirect: true };
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
    user: {
      email: session.user.email ?? null,
      id: session.user.id,
      provider: readProvider(session.user),
    },
  };
}

/**
 * The provider of the identity that owns the session.
 *
 * Supabase records it in the application metadata of the user: `email` for an
 * account with a password, `google` for an account that entered through
 * Google. The client needs it to know whether a session may merge with a
 * password account.
 */
function readProvider(user: User): string | null {
  const metadata: unknown = user.app_metadata;
  if (typeof metadata !== 'object' || metadata === null) {
    return null;
  }
  const provider = (metadata as { provider?: unknown }).provider;
  return typeof provider === 'string' ? provider : null;
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
  // No session means the account exists but the e-mail still has to be
  // confirmed: the project may have the automatic confirmation turned off.
  // That is a legitimate outcome of the signup, not a failure.
  if (result.data.session === null) {
    return { code: readPendingConfirmationCode(result.data.user), ok: false };
  }
  return { ok: true };
}

/**
 * The code of a signup that came back without a session.
 *
 * The server hides whether an account exists: for an e-mail that is already
 * registered it answers with a user without identities, and for a new account
 * it answers with the user and no session, waiting for the confirmation of
 * the e-mail.
 */
function readPendingConfirmationCode(user: User | null): AuthErrorCode {
  if (user !== null && Array.isArray(user.identities) && user.identities.length === 0) {
    return 'email_already_exists';
  }
  return 'email_confirmation_required';
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
