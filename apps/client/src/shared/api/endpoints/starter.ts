import type { Starter } from '@creatures/contracts/trainer';

import type { ApiDeps } from '~/shared/api/client';
import { buildHeaders, isSuccessStatus, resolveErrorCode } from '~/shared/api/http';
import type { TrainerClientErrorCode } from '~/shared/api/http';

const STARTERS_PATH = '/api/starters';
const UNAUTHENTICATED: TrainerClientErrorCode = 'unauthenticated';

export type StarterListResult =
  | { ok: true; starters: Starter[] }
  | { ok: false; code: TrainerClientErrorCode };

export function requestStarterList(deps: ApiDeps): Promise<StarterListResult> {
  return deps.getAccessToken().then(buildStarterListRequester(deps));
}

function buildStarterListRequester(
  deps: ApiDeps,
): (token: string | null) => Promise<StarterListResult> {
  return function listStartersWithToken(token: string | null): Promise<StarterListResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const init = { headers, method: 'GET' };
    return globalThis
      .fetch(buildStartersUrl(deps.baseUrl), init)
      .then(readStarterListResponse)
      .catch(readStarterListNetworkFailure);
  };
}

function readStarterListResponse(response: Response): Promise<StarterListResult> {
  return response
    .json()
    .then(
      buildStarterListResult(response.status),
      buildUnreadableStarterListResult(response.status),
    );
}

function buildStarterListResult(status: number): (body: unknown) => StarterListResult {
  return function toStarterListResult(body: unknown): StarterListResult {
    if (isSuccessStatus(status)) {
      return { ok: true, starters: readStarters(body) };
    }
    return { code: resolveErrorCode(status, body), ok: false };
  };
}

function buildUnreadableStarterListResult(status: number): () => StarterListResult {
  return function toUnreadableStarterListResult(): StarterListResult {
    return { code: resolveErrorCode(status, null), ok: false };
  };
}

function readStarterListNetworkFailure(): StarterListResult {
  return { code: 'unknown', ok: false };
}

function readStarters(body: unknown): Starter[] {
  if (typeof body !== 'object' || body === null) {
    return [];
  }
  const starters = (body as { starters?: unknown }).starters;
  return Array.isArray(starters) ? starters.filter(isStarter) : [];
}

function isStarter(value: unknown): value is Starter {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const starter = value as Partial<Starter>;
  return typeof starter.id === 'string' && typeof starter.name === 'string';
}

function buildStartersUrl(baseUrl: string): string {
  return `${baseUrl}${STARTERS_PATH}`;
}
