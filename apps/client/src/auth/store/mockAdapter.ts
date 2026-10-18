import type {
  AuthAdapter,
  AuthAdapterResult,
  AuthEventHandler,
  AuthEvent,
  AuthSession,
  AuthUser,
  CredentialsInput,
  OAuthInput,
  PasswordResetInput,
  PasswordUpdateInput,
} from '~/auth/store/types';

const DEFAULT_USER: AuthUser = { email: 'mock@example.com', id: 'mock-user' };
const MOCK_OAUTH_URL = 'https://accounts.google.com/mock';

export type MockAuthBehavior = () => Promise<AuthAdapterResult>;

export type MockAuthAdapterConfig = {
  initialSession: AuthSession | null;
  requestPasswordReset?: MockAuthBehavior;
  signInWithGoogle?: MockAuthBehavior;
  signInWithPassword?: MockAuthBehavior;
  signUp?: MockAuthBehavior;
  updateUser?: MockAuthBehavior;
  user?: AuthUser;
};

type MockBehaviors = {
  requestPasswordReset: MockAuthBehavior | undefined;
  signInWithGoogle: MockAuthBehavior | undefined;
  signInWithPassword: MockAuthBehavior | undefined;
  signUp: MockAuthBehavior | undefined;
  updateUser: MockAuthBehavior | undefined;
};

export class MockAuthAdapter implements AuthAdapter {
  private readonly behaviors: MockBehaviors;
  private readonly handlers: Set<AuthEventHandler> = new Set();
  private readonly user: AuthUser;
  private session: AuthSession | null;

  public constructor(config: MockAuthAdapterConfig) {
    this.behaviors = readBehaviors(config);
    this.session = config.initialSession;
    this.user = config.user ?? DEFAULT_USER;
  }

  public subscribe(handler: AuthEventHandler): () => void {
    this.handlers.add(handler);
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
    behavior?: MockAuthBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.signInWithPassword;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve(this.applySignIn());
  }

  public signUp(_input: CredentialsInput, behavior?: MockAuthBehavior): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.signUp;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve(this.applySignIn());
  }

  public signInWithOAuth(
    _input: OAuthInput,
    behavior?: MockAuthBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.signInWithGoogle;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve({ ok: true, redirectUrl: MOCK_OAUTH_URL });
  }

  public signOut(): Promise<void> {
    this.session = null;
    this.emitAuthEvent('SIGNED_OUT', null);
    return Promise.resolve();
  }

  public resetPasswordForEmail(
    _input: PasswordResetInput,
    behavior?: MockAuthBehavior,
  ): Promise<AuthAdapterResult> {
    const resolved = behavior ?? this.behaviors.requestPasswordReset;
    if (resolved !== undefined) {
      return resolved();
    }
    return Promise.resolve({ ok: true });
  }

  public updateUser(
    _input: PasswordUpdateInput,
    behavior?: MockAuthBehavior,
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

function readBehaviors(config: MockAuthAdapterConfig): MockBehaviors {
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
