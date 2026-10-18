import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { readSupabaseEnv } from '~/supabase/env';

const env = readSupabaseEnv();

export const supabase: SupabaseClient = createClient(env.url, env.anonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    persistSession: true,
    storage: globalThis.localStorage,
  },
});
