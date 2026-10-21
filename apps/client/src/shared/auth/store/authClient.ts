import { getSupabaseClient } from '~/shared/auth/supabase/client';

import { createAuthStore, type AuthStore } from './authStore';
import { SupabaseAuthAdapter } from './supabaseAdapter';

let store: AuthStore | null = null;

export function getAuthStore(): AuthStore {
  if (store !== null) {
    return store;
  }
  const adapter = new SupabaseAuthAdapter(getSupabaseClient());
  store = createAuthStore(adapter);
  return store;
}

export { selectStatus, selectUser } from './authStore';
