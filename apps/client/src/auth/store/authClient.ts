import { type AuthStore, createAuthStore } from '~/auth/store/authStore';
import { SupabaseAuthAdapter } from '~/auth/store/supabaseAdapter';
import { supabase } from '~/supabase/client';

let store: AuthStore | null = null;

export function getAuthStore(): AuthStore {
  if (store !== null) {
    return store;
  }
  const adapter = new SupabaseAuthAdapter(supabase);
  store = createAuthStore(adapter);
  return store;
}

export { selectStatus, selectUser } from '~/auth/store/authStore';
