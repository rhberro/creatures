import type {
  AuthAdapter,
  AuthAdapterResult,
  AuthEvent,
  AuthEventHandler,
  AuthSession,
  AuthUser,
  CredentialsInput,
  OAuthInput,
  PasswordResetInput,
  PasswordUpdateInput,
  SignUpInput,
} from './types';

const DEFAULT_USER: AuthUser = { email: 'test@example.com', id: 'test-user', provider: 'email' };
const TEST_OAUTH_URL = 'https://accounts.google.com/test';

export type AuthTestDoubleBehavior = () => Promise<AuthAdapterResult>;

export type AuthTestDoubleConfig = {
  initialSession: AuthSession | null;
  requestPasswordReset?: AuthTestDoubleBehavior;
  signInWithGoogle?: AuthTestDoubleBehavior;
  signInWithPassword?: AuthTestDoubleBehavior;
  signUp?: AuthTestDoubleBehavior;
  updateUser?: AuthTestDoubleBehavior;
  user?: AuthUser;
};

type AuthTestDoubleBehaviors = {
  requestPasswordReset: AuthTestDoubleBehavior | undefined;
  signInWithGoogle: AuthTestDoubleBehavior | undefined;
  signInWithPassword: AuthTestDoubleBehavior | undefined;
  signUp: AuthTestDoubleBehavior | undefined;
  updateUser: AuthTestDoubleBehavior | undefined;
};

export class AuthTestDoubleAdapter implements AuthAdapter {
  private readonly behaviors: AuthTestDoubleBehaviors;
  private readonly handlers: Set<AuthEventHandler> = new Set();
  private readonly user: AuthUser;
  private session: AuthSession | null;

  public constructor(config: AuthTestDoubleConfig) {
    this.behaviors = readBehaviors(config);
    this.session = config.initialSession;
    this.user = config.user ?? DEFAULT_USER;
  }

  public subscribe(handler: AuthEventHandler): () => void {
    this.handlers.add(handler);
    if (this.session !== null) {
      emitInitialSession(handler, this.session);
    }
    return buildUnsubscribe(this.handlers, handler);
  }

  public emitAuthEvent(event: AuthEvent, session: AuthSession | null): void {
    for (const handler of this.handlers) {
      handler(event, session);
    }
  }

  public setSession(session: AuthSession | null): void {
    this.session = session;
    this.emitAuthEvent('INITIAL_SESSION', session);
  }

  public signInWithPassword(
    _input: CredentialsInput,
    behavior?: AuthTestDoubleBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.signInWithPassword;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve(this.applySignIn());
  }

  public signUp(
    _input: SignUpInput,
    behavior?: AuthTestDoubleBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.signUp;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve(this.applySignIn());
  }

  public signInWithOAuth(
    _input: OAuthInput,
    behavior?: AuthTestDoubleBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.signInWithGoogle;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve({ ok: true, redirectUrl: TEST_OAUTH_URL });
  }

  public signOut(): Promise<void> {
    this.session = null;
    this.emitAuthEvent('SIGNED_OUT', null);
    return Promise.resolve();
  }

  public resetPasswordForEmail(
    _input: PasswordResetInput,
    behavior?: AuthTestDoubleBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.requestPasswordReset;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve({ ok: true });
  }

  public updateUser(
    _input: PasswordUpdateInput,
    behavior?: AuthTestDoubleBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.updateUser;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve(this.applyUserUpdated());
  }

  private applySignIn(): AuthAdapterResult {
    const session = buildSession(this.user);
    this.session = session;
    this.emitAuthEvent('SIGNED_IN', session);
    return { ok: true };
  }

  private applyUserUpdated(): AuthAdapterResult {
    const session = this.session ?? buildSession(this.user);
    this.session = session;
    this.emitAuthEvent('USER_UPDATED', session);
    return { ok: true };
  }
}

function readBehaviors(config: AuthTestDoubleConfig): AuthTestDoubleBehaviors {
  return {
    requestPasswordReset: config.requestPasswordReset,
    signInWithGoogle: config.signInWithGoogle,
    signInWithPassword: config.signInWithPassword,
    signUp: config.signUp,
    updateUser: config.updateUser,
  };
}

function buildUnsubscribe(handlers: Set<AuthEventHandler>, handler: AuthEventHandler): () => void {
  return function unsubscribe(): void {
    handlers.delete(handler);
  };
}

function buildSession(user: AuthUser): AuthSession {
  return { access_token: globalThis.crypto.randomUUID(), user };
}

// The Supabase delivers the first INITIAL_SESSION asynchronously. The double
// does the same: emitting it right away would overwrite the initial state of
// the store, which does not even exist yet when the initializer runs.
function emitInitialSession(handler: AuthEventHandler, session: AuthSession): void {
  setTimeout(function deliver(): void {
    handler('INITIAL_SESSION', session);
  }, 0);
}
