import { afterEach, beforeEach, expect, test } from 'bun:test';

import type {
  AuthChangeEvent,
  AuthResponse,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { SupabaseAuthAdapter } from './supabaseAdapter';
import type { AuthSession } from './types';

const EMAIL = 'player@example.com';
const PASSWORD = 'password-1';
const PATH = '/trainers';
const ORIGIN = 'https://creatures.example.com';

type SignUpCredentials = {
  email: string;
  options: { emailRedirectTo: string };
  password: string;
};

type AuthChangeHandler = (event: AuthChangeEvent, session: Session | null) => void;

type SubscriptionResult = {
  data: { subscription: { unsubscribe: () => void } };
};

type SessionFixture = {
  adapter: SupabaseAuthAdapter;
  emit(session: Session): void;
};

let calls: SignUpCredentials[] = [];

beforeEach(setupFixture);
afterEach(teardownFixture);

function setupFixture(): void {
  calls = [];
  globalThis.location = buildLocation();
}

function teardownFixture(): void {
  Reflect.deleteProperty(globalThis, 'location');
}

function buildLocation(): Location {
  return { origin: ORIGIN } as Location;
}

function buildIdentity(): NonNullable<User['identities']>[number] {
  return {
    id: 'identity-1',
    identity_id: 'identity-1',
    provider: 'email',
    user_id: 'user-1',
  } as unknown as NonNullable<User['identities']>[number];
}

function buildUser(identities: NonNullable<User['identities']>): User {
  return {
    app_metadata: {},
    aud: 'authenticated',
    confirmed_at: undefined,
    created_at: '2024-01-01T00:00:00.000Z',
    email: EMAIL,
    email_confirmed_at: undefined,
    id: 'user-1',
    identities,
    is_anonymous: false,
    last_sign_in_at: undefined,
    phone: '',
    role: 'authenticated',
    updated_at: '2024-01-01T00:00:00.000Z',
    user_metadata: {},
  } as unknown as User;
}

function buildAdapter(response: AuthResponse): SupabaseAuthAdapter {
  const client = {
    auth: {
      signUp: function signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
        calls.push(credentials);
        return Promise.resolve(response);
      },
    },
  } as unknown as SupabaseClient;
  return new SupabaseAuthAdapter(client);
}

function theRedirectIsThePostAuthRoute(): Promise<void> {
  const adapter = buildAdapter(
    buildResponse({ session: null, user: buildUser([buildIdentity()]) }),
  );
  return adapter
    .signUp({ email: EMAIL, password: PASSWORD, path: PATH })
    .then(function assertRedirect(): void {
      expect(calls[0]?.options.emailRedirectTo).toBe(`${ORIGIN}${PATH}`);
    });
}

function theSignupWithoutSessionAsksForTheConfirmation(): Promise<void> {
  const adapter = buildAdapter(
    buildResponse({ session: null, user: buildUser([buildIdentity()]) }),
  );
  return adapter
    .signUp({ email: EMAIL, password: PASSWORD, path: PATH })
    .then(function assertCode(result): void {
      expect(result).toEqual({ code: 'email_confirmation_required', ok: false });
    });
}

function theSignupWithoutSessionOfAKnownAccountFails(): Promise<void> {
  const adapter = buildAdapter(buildResponse({ session: null, user: buildUser([]) }));
  return adapter
    .signUp({ email: EMAIL, password: PASSWORD, path: PATH })
    .then(function assertCode(result): void {
      expect(result).toEqual({ code: 'email_already_exists', ok: false });
    });
}

function theSignupWithSessionSucceeds(): Promise<void> {
  const adapter = buildAdapter(
    buildResponse({ session: buildSession(), user: buildUser([buildIdentity()]) }),
  );
  return adapter
    .signUp({ email: EMAIL, password: PASSWORD, path: PATH })
    .then(function assertResult(result): void {
      expect(result).toEqual({ ok: true });
    });
}

test(
  'the signup points the confirmation link to the post-auth route',
  theRedirectIsThePostAuthRoute,
);
test(
  'the signup without session asks for the e-mail confirmation',
  theSignupWithoutSessionAsksForTheConfirmation,
);
test(
  'the signup without session of a known account fails',
  theSignupWithoutSessionOfAKnownAccountFails,
);
test('the signup with session succeeds', theSignupWithSessionSucceeds);

function buildResponse(data: {
  session: AuthResponse['data']['session'];
  user: User | null;
}): AuthResponse {
  return { data: { session: data.session, user: data.user }, error: null } as AuthResponse;
}

function buildSession(): AuthResponse['data']['session'] {
  return {
    access_token: 'access-token',
    expires_at: 0,
    refresh_token: 'refresh-token',
    token_type: 'bearer',
    user: buildUser([buildIdentity()]),
  } as AuthResponse['data']['session'];
}

/**
 * A client that only answers the subscription of the adapter.
 */
function buildSessionFixture(): SessionFixture {
  const holder: { handler: AuthChangeHandler | null } = { handler: null };
  const client = {
    auth: {
      onAuthStateChange: function onAuthStateChange(next: AuthChangeHandler): SubscriptionResult {
        holder.handler = next;
        return { data: { subscription: { unsubscribe: buildNoop } } };
      },
    },
  } as unknown as SupabaseClient;
  return {
    adapter: new SupabaseAuthAdapter(client),
    emit: function emit(session: Session): void {
      if (holder.handler === null) {
        throw new Error('the adapter did not subscribe to the auth changes');
      }
      holder.handler('INITIAL_SESSION', session);
    },
  };
}

function buildProviderSession(provider: string | null): Session {
  return {
    access_token: 'access-token',
    expires_at: 0,
    refresh_token: 'refresh-token',
    token_type: 'bearer',
    user: buildUserWithProvider(provider),
  } as unknown as Session;
}

function buildUserWithProvider(provider: string | null): User {
  const user = buildUser([buildIdentity()]);
  user.app_metadata = provider === null ? {} : { provider };
  return user;
}

function buildNoop(): void {
  void 0;
}

function theSessionCarriesTheEmailProvider(): void {
  const sessions = collectSession('email');
  expect(sessions[0]?.user.provider).toBe('email');
}

function theSessionCarriesTheGoogleProvider(): void {
  const sessions = collectSession('google');
  expect(sessions[0]?.user.provider).toBe('google');
}

function theSessionWithoutAProviderHasNone(): void {
  const sessions = collectSession(null);
  expect(sessions[0]?.user.provider).toBeNull();
}

function collectSession(provider: string | null): AuthSession[] {
  const fixture = buildSessionFixture();
  const sessions: AuthSession[] = [];
  fixture.adapter.subscribe(function collect(_event, session): void {
    if (session !== null) {
      sessions.push(session);
    }
  });
  fixture.emit(buildProviderSession(provider));
  return sessions;
}

test('the session carries the provider of a password account', theSessionCarriesTheEmailProvider);
test('the session carries the provider of a google account', theSessionCarriesTheGoogleProvider);
test('the session without a provider carries none', theSessionWithoutAProviderHasNone);
