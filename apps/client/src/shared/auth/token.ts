import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from './supabase/client';

export function getAccessToken(): Promise<string | null> {
  return getSupabaseClient().auth.getSession().then(readSessionToken);
}

function readSessionToken(result: { data: { session: Session | null } }): string | null {
  return result.data.session?.access_token ?? null;
}
