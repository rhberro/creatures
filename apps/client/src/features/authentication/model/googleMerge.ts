import { createApiDeps, requestGoogleMerge } from '~/shared/api';
import type { GoogleMergeResult } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';
import type { AuthUser } from '~/shared/auth';

const GOOGLE_PROVIDER = 'google';

export type GoogleMergeRequest = (email: string) => Promise<GoogleMergeResult>;

/**
 * The request the client makes to the server to merge the accounts.
 */
export function createGoogleMergeRequest(): GoogleMergeRequest {
  const deps = createApiDeps(getAccessToken);
  return function requestMerge(email: string): Promise<GoogleMergeResult> {
    return requestGoogleMerge(deps, email);
  };
}

/**
 * Merges the Google session with the account that has the same e-mail.
 *
 * Only a Google session that carries an e-mail has something to merge: any
 * other session returns "nothing to merge" without asking the server. The
 * failure of a merge is not fatal — the player is already authenticated — so
 * the reason comes back in the result instead of an exception.
 */
export function mergeGoogleAccount(
  user: AuthUser | null,
  request: GoogleMergeRequest,
): Promise<GoogleMergeResult> {
  const email = readGoogleEmail(user);
  if (email === null) {
    return Promise.resolve({ merged: false, ok: true });
  }
  return Promise.resolve()
    .then(function askForMerge(): Promise<GoogleMergeResult> {
      return request(email);
    })
    .catch(readMergeNetworkFailure);
}

function readGoogleEmail(user: AuthUser | null): string | null {
  if (user === null || user.provider !== GOOGLE_PROVIDER) {
    return null;
  }
  return user.email;
}

function readMergeNetworkFailure(): GoogleMergeResult {
  return { code: 'network', ok: false };
}
