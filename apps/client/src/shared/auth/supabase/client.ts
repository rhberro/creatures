import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { readSupabaseEnv } from './env';

let client: SupabaseClient | null = null;

// The client is created on first use: importing the auth module must not
// require the Supabase environment variables, otherwise every consumer of the
// module (including the tests) would depend on the local environment setup.
export function getSupabaseClient(): SupabaseClient {
  if (client === null) {
    const env = readSupabaseEnv();
    client = createClient(env.url, env.anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
        storage: globalThis.localStorage,
      },
    });
  }
  return client;
}
