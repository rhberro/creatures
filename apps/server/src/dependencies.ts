import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from 'pino';

import type { AttemptLimiter } from '~/ratelimit/attemptLimiter';
import type { TrainerSessionStore } from '~/session/trainerSession';
import type { ClaimsReader, UserReader } from '~/supabase';
import type { StateBroadcaster } from '~/ws/stateBroadcaster';

export type ServerDependencies = {
  admin: SupabaseClient;
  broadcaster: StateBroadcaster;
  claims: ClaimsReader;
  /** The failed attempts of the accounts and of the addresses, per process. */
  limiter: AttemptLimiter;
  logger: Logger;
  sessions: TrainerSessionStore;
  users: UserReader;
};
