import { buildHeaders, createApiDeps } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';

const SESSION_TRAINER_PATH = '/api/session/trainer';

export type SwitchTrainerResult = { ok: true } | { ok: false };

/**
 * Disconnects the trainer of the account from the server.
 *
 * Only the trainer is disconnected: the session of the account stays alive, so
 * the player goes back to the list of trainers without signing out.
 */
export function switchTrainer(): Promise<SwitchTrainerResult> {
  const deps = createApiDeps(getAccessToken);
  return deps.getAccessToken().then(function deleteSession(
    token: string | null,
  ): SwitchTrainerResult | Promise<SwitchTrainerResult> {
    if (token === null) {
      return { ok: false };
    }
    const headers = buildHeaders(token);
    const init = { headers, method: 'DELETE' };
    return globalThis
      .fetch(`${deps.baseUrl}${SESSION_TRAINER_PATH}`, init)
      .then(readDeleteResponse, readNetworkFailure);
  });
}

function readDeleteResponse(response: Response): SwitchTrainerResult {
  if (!response.ok) {
    return { ok: false };
  }
  return { ok: true };
}

function readNetworkFailure(): SwitchTrainerResult {
  return { ok: false };
}
