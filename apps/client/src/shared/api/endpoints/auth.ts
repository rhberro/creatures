import type { ApiDeps } from '~/shared/api/client';
import { buildHeaders, isSuccessStatus, resolveErrorCode } from '~/shared/api/http';

const GOOGLE_MERGE_PATH = '/api/auth/google-merge';
const UNAUTHORIZED_STATUS = 401;

/**
 * Every code the merge endpoint can answer with.
 *
 * The map is exhaustive by construction: a code that is not here is never read
 * from the body of the answer.
 */
const SERVER_ERROR_CODES: Record<GoogleMergeServerErrorCode, true> = {
  email_unverified: true,
  invalid_email: true,
  no_password_account: true,
  not_google_account: true,
  unauthenticated: true,
};

export type GoogleMergeServerErrorCode =
  | 'email_unverified'
  | 'invalid_email'
  | 'no_password_account'
  | 'not_google_account'
  | 'unauthenticated';

export type GoogleMergeErrorCode = GoogleMergeServerErrorCode | 'network' | 'unknown';

export type GoogleMergeResult =
  | { merged: boolean; ok: true }
  | { code: GoogleMergeErrorCode; ok: false };

/**
 * Merges the Google identity with the account that has the same e-mail.
 *
 * The server answers with the outcome of the merge. Two of its answers are
 * not failures for the client: `no_password_account` means there was nothing
 * to merge (the normal case of a player who enters through Google for the
 * first time) and `not_google_account` means the session is not a Google one.
 * Both become `ok: true` with `merged: false`.
 */
export function requestGoogleMerge(deps: ApiDeps, email: string): Promise<GoogleMergeResult> {
  return deps.getAccessToken().then(buildMergeRequester(deps, email));
}

function buildMergeRequester(
  deps: ApiDeps,
  email: string,
): (token: string | null) => Promise<GoogleMergeResult> {
  return function mergeWithToken(token: string | null): Promise<GoogleMergeResult> {
    if (token === null) {
      return Promise.resolve({ code: 'unauthenticated', ok: false });
    }
    return sendMergeRequest(deps, token, email)
      .then(readMergeResponse)
      .catch(readMergeNetworkFailure);
  };
}

function sendMergeRequest(deps: ApiDeps, token: string, email: string): Promise<Response> {
  const headers = buildHeaders(token);
  const body = { email };
  const init = { body: JSON.stringify(body), headers, method: 'POST' };
  return globalThis.fetch(`${deps.baseUrl}${GOOGLE_MERGE_PATH}`, init);
}

function readMergeResponse(response: Response): Promise<GoogleMergeResult> {
  return safeJson(response).then(buildMergeResult(response.status));
}

function safeJson(response: Response): Promise<unknown> {
  return response.json().catch(readUnparseableBody);
}

function readUnparseableBody(): null {
  return null;
}

function buildMergeResult(status: number): (body: unknown) => GoogleMergeResult {
  return function toMergeResult(body: unknown): GoogleMergeResult {
    if (isSuccessStatus(status)) {
      return { merged: readMerged(body), ok: true };
    }
    return readMergeFailure(status, body);
  };
}

function readMergeFailure(status: number, body: unknown): GoogleMergeResult {
  const code = readBodyCode(body);
  if (code === 'no_password_account' || code === 'not_google_account') {
    return { merged: false, ok: true };
  }
  if (code === 'email_unverified' || code === 'invalid_email') {
    return { code, ok: false };
  }
  if (status === UNAUTHORIZED_STATUS) {
    return { code: readUnauthenticatedCode(status, body), ok: false };
  }
  return { code: 'unknown', ok: false };
}

/**
 * The code of an answer without a session.
 *
 * The shared status mapping already knows that a 401 is an unauthenticated
 * request, so the merge does not carry a second truth about it.
 */
function readUnauthenticatedCode(status: number, body: unknown): GoogleMergeErrorCode {
  const code = resolveErrorCode(status, body);
  return code === 'unauthenticated' ? 'unauthenticated' : 'unknown';
}

function readBodyCode(body: unknown): GoogleMergeServerErrorCode | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const error = (body as { error?: unknown }).error;
  if (typeof error !== 'string') {
    return null;
  }
  return Object.hasOwn(SERVER_ERROR_CODES, error) ? (error as GoogleMergeServerErrorCode) : null;
}

function readMerged(body: unknown): boolean {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  return (body as { merged?: unknown }).merged === true;
}

function readMergeNetworkFailure(): GoogleMergeResult {
  return { code: 'network', ok: false };
}
