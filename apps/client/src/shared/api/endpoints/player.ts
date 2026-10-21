import type { PlayerState } from '@creatures/contracts/player';

import type { ApiDeps } from '~/shared/api/client';
import { buildHeaders, isSuccessStatus, resolveErrorCode } from '~/shared/api/http';
import type { TrainerClientErrorCode } from '~/shared/api/http';

const PLAYER_STATE_PATH = '/api/player/state';
const SESSION_TRAINER_PATH = '/api/session/trainer';
const UNAUTHENTICATED: TrainerClientErrorCode = 'unauthenticated';

export type PlayerStateResult =
  | { ok: true; state: PlayerState }
  | { ok: false; code: TrainerClientErrorCode };

export type SessionTrainerResult = { ok: true } | { ok: false; code: TrainerClientErrorCode };

export function requestPlayerState(deps: ApiDeps): Promise<PlayerStateResult> {
  return deps.getAccessToken().then(buildPlayerStateRequester(deps));
}

export function requestSessionTrainer(
  deps: ApiDeps,
  trainerId: string,
): Promise<SessionTrainerResult> {
  return deps.getAccessToken().then(buildSessionTrainerRequester(deps, trainerId));
}

function buildPlayerStateRequester(
  deps: ApiDeps,
): (token: string | null) => Promise<PlayerStateResult> {
  return function readStateWithToken(token: string | null): Promise<PlayerStateResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const init = { headers, method: 'GET' };
    return globalThis
      .fetch(buildPlayerStateUrl(deps.baseUrl), init)
      .then(readPlayerStateResponse)
      .catch(readPlayerStateNetworkFailure);
  };
}

function buildSessionTrainerRequester(
  deps: ApiDeps,
  trainerId: string,
): (token: string | null) => Promise<SessionTrainerResult> {
  return function openSessionWithToken(token: string | null): Promise<SessionTrainerResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const body = JSON.stringify({ trainerId });
    const init = { body, headers, method: 'POST' };
    return globalThis
      .fetch(buildSessionTrainerUrl(deps.baseUrl), init)
      .then(readSessionTrainerResponse)
      .catch(readSessionTrainerNetworkFailure);
  };
}

function readPlayerStateResponse(response: Response): Promise<PlayerStateResult> {
  return response
    .json()
    .then(
      buildPlayerStateResult(response.status),
      buildUnreadablePlayerStateResult(response.status),
    );
}

function readSessionTrainerResponse(response: Response): Promise<SessionTrainerResult> {
  if (isSuccessStatus(response.status)) {
    return Promise.resolve({ ok: true });
  }
  return response
    .json()
    .then(
      buildSessionTrainerResult(response.status),
      buildUnreadableSessionTrainerResult(response.status),
    );
}

function buildPlayerStateResult(status: number): (body: unknown) => PlayerStateResult {
  return function toPlayerStateResult(body: unknown): PlayerStateResult {
    if (!isSuccessStatus(status)) {
      return { code: resolveErrorCode(status, body), ok: false };
    }
    const state = readPlayerState(body);
    return state === null ? { code: 'unknown', ok: false } : { ok: true, state };
  };
}

function buildUnreadablePlayerStateResult(status: number): () => PlayerStateResult {
  return function toUnreadablePlayerStateResult(): PlayerStateResult {
    return { code: resolveErrorCode(status, null), ok: false };
  };
}

function buildSessionTrainerResult(status: number): (body: unknown) => SessionTrainerResult {
  return function toSessionTrainerResult(body: unknown): SessionTrainerResult {
    return { code: resolveErrorCode(status, body), ok: false };
  };
}

function buildUnreadableSessionTrainerResult(status: number): () => SessionTrainerResult {
  return function toUnreadableSessionTrainerResult(): SessionTrainerResult {
    return { code: resolveErrorCode(status, null), ok: false };
  };
}

function readPlayerStateNetworkFailure(): PlayerStateResult {
  return { code: 'unknown', ok: false };
}

function readSessionTrainerNetworkFailure(): SessionTrainerResult {
  return { code: 'unknown', ok: false };
}

function readPlayerState(body: unknown): PlayerState | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const state = body as Partial<PlayerState>;
  if (typeof state.trainer !== 'object' || state.trainer === null) {
    return null;
  }
  if (!Array.isArray(state.team)) {
    return null;
  }
  if (
    typeof state.gold !== 'number' ||
    typeof state.diamonds !== 'number' ||
    typeof state.staminaMinutes !== 'number' ||
    typeof state.maxStaminaMinutes !== 'number'
  ) {
    return null;
  }
  return body as PlayerState;
}

function buildPlayerStateUrl(baseUrl: string): string {
  return `${baseUrl}${PLAYER_STATE_PATH}`;
}

function buildSessionTrainerUrl(baseUrl: string): string {
  return `${baseUrl}${SESSION_TRAINER_PATH}`;
}
