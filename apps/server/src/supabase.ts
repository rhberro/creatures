import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'SUPABASE_URL';
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY';
const SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

type ClaimsResult = Awaited<ReturnType<SupabaseClient['auth']['getClaims']>>;

export type SupabaseEnv = {
  anonKey: string;
  serviceRoleKey: string;
  url: string;
};

export type ClaimsReader = {
  readUserId(token: string): Promise<string | null>;
};

export type SupabaseServer = {
  admin: SupabaseClient;
  claims: ClaimsReader;
  user: SupabaseClient;
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
  };
}

export function createClaimsReader(client: SupabaseClient): ClaimsReader {
  return { readUserId: buildUserIdReader(client) };
}

function buildUserIdReader(client: SupabaseClient): (token: string) => Promise<string | null> {
  return function readUserId(token: string): Promise<string | null> {
    return client.auth.getClaims(token).then(readSubject);
  };
}

function readSubject(result: ClaimsResult): string | null {
  if (result.error !== null || result.data === null) {
    return null;
  }
  const subject = result.data.claims.sub;
  return typeof subject === 'string' ? subject : null;
}

function readRequiredEnv(source: Record<string, string | undefined>, name: string): string {
  const value = source[name];
  if (value === undefined || value === '') {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}
