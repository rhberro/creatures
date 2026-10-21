import { createApiDeps, requestSessionTrainer } from '~/shared/api';
import type { SessionTrainerResult } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';

/**
 * Tells the server which trainer the account is playing with.
 *
 * The screen of the game only opens when the server accepts it.
 */
export function requestEnterTrainer(trainerId: string): Promise<SessionTrainerResult> {
  return requestSessionTrainer(createApiDeps(getAccessToken), trainerId);
}
