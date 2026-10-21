import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'SUPABASE_URL';
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY';
const SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

type ClaimsResult = Awaited<ReturnType<SupabaseClient['auth']['getClaims']>>;

export type AuthUser = NonNullable<
  Awaited<ReturnType<SupabaseClient['auth']['admin']['getUserById']>>['data']['user']
>;

export type AuthUserIdentity = NonNullable<NonNullable<AuthUser>['identities']>[number];

export type SupabaseEnv = {
  anonKey: string;
  serviceRoleKey: string;
  url: string;
};

export type ClaimsReader = {
  /** The identity of the token, or null when the token does not hold one. */
  readClaims(token: string): Promise<AuthClaims | null>;
};

/**
 * The identity the token carries.
 *
 * The e-mail is the one of the account: it comes from the signed token, so it
 * is the e-mail of the account that is signed in, and never the one the client
 * asked for.
 */
export type AuthClaims = {
  email: string | null;
  userId: string;
};

/**
 * Reads the user from the Auth server (network call), which is the only way to
 * detect a revoked session while the token itself is still valid.
 */
export type UserReader = {
  readUserId(token: string): Promise<string | null>;
};

export type SupabaseServer = {
  admin: SupabaseClient;
  claims: ClaimsReader;
  user: SupabaseClient;
  users: UserReader;
};

export function readSupabaseEnv(source: Record<string, string | undefined>): SupabaseEnv {
  return {
    anonKey: readRequiredEnv(source, SUPABASE_ANON_KEY),
    serviceRoleKey: readRequiredEnv(source, SUPABASE_SERVICE_ROLE_KEY),
    url: readRequiredEnv(source, SUPABASE_URL),
  };
}

export function createSupabaseServer(env: SupabaseEnv): SupabaseServer {
  const user = createClient(env.url, env.anonKey);
  const admin = createClient(env.url, env.serviceRoleKey);
  return {
    admin,
    claims: createClaimsReader(user),
    user,
    users: createUserReader(user),
  };
}

export function createClaimsReader(client: SupabaseClient): ClaimsReader {
  return { readClaims: buildClaimsReader(client) };
}

export function createUserReader(client: SupabaseClient): UserReader {
  return { readUserId: buildAuthUserIdReader(client) };
}

function buildClaimsReader(client: SupabaseClient): (token: string) => Promise<AuthClaims | null> {
  return function readClaims(token: string): Promise<AuthClaims | null> {
    return client.auth.getClaims(token).then(readClaimsFromResponse);
  };
}

function buildAuthUserIdReader(client: SupabaseClient): (token: string) => Promise<string | null> {
  return function readUserId(token: string): Promise<string | null> {
    return client.auth.getUser(token).then(readUserIdFromResponse);
  };
}

function readUserIdFromResponse(result: {
  data: { user: { id: string } | null };
  error: unknown;
}): string | null {
  if (result.error !== null) {
    return null;
  }
  const user = result.data.user;
  return user === null ? null : user.id;
}

function readClaimsFromResponse(result: ClaimsResult): AuthClaims | null {
  if (result.error !== null || result.data === null) {
    return null;
  }
  const subject = result.data.claims.sub;
  if (typeof subject !== 'string') {
    return null;
  }
  const email = result.data.claims.email;
  return {
    email: typeof email === 'string' ? email.toLowerCase() : null,
    userId: subject,
  };
}

function readRequiredEnv(source: Record<string, string | undefined>, name: string): string {
  const value = source[name];
  if (value === undefined || value === '') {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}
