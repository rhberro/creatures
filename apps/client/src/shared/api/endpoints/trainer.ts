import type { Gender, NewTrainerInput, Trainer } from '@creatures/contracts/trainer';

import type { ApiDeps } from '~/shared/api/client';
import { buildHeaders, isSuccessStatus, resolveErrorCode } from '~/shared/api/http';
import type { TrainerClientErrorCode } from '~/shared/api/http';

const TRAINERS_PATH = '/api/trainers';
const UNAUTHENTICATED: TrainerClientErrorCode = 'unauthenticated';

/**
 * The fields a trainer can have changed. Both are optional: the answer of the
 * server carries the whole trainer.
 */
export type TrainerUpdateInput = {
  gender?: Gender;
  name?: string;
};

export type TrainerListResult =
  | { ok: true; trainers: Trainer[] }
  | { ok: false; code: TrainerClientErrorCode };

export type TrainerCreateResult =
  | { ok: true; trainer: Trainer }
  | { ok: false; code: TrainerClientErrorCode };

export type TrainerUpdateResult =
  | { ok: true; trainer: Trainer }
  | { ok: false; code: TrainerClientErrorCode };

export type DeleteTrainerResult = { ok: true } | { ok: false; code: TrainerClientErrorCode };

export function requestTrainerList(deps: ApiDeps): Promise<TrainerListResult> {
  return deps.getAccessToken().then(buildListRequester(deps));
}

export function requestCreateTrainer(
  deps: ApiDeps,
  input: NewTrainerInput,
): Promise<TrainerCreateResult> {
  return deps.getAccessToken().then(buildCreateRequester(deps, input));
}

export function requestUpdateTrainer(
  deps: ApiDeps,
  trainerId: string,
  input: TrainerUpdateInput,
): Promise<TrainerUpdateResult> {
  return deps.getAccessToken().then(buildUpdateRequester(deps, trainerId, input));
}

export function requestDeleteTrainer(
  deps: ApiDeps,
  trainerId: string,
): Promise<DeleteTrainerResult> {
  return deps.getAccessToken().then(buildDeleteRequester(deps, trainerId));
}

function buildListRequester(deps: ApiDeps): (token: string | null) => Promise<TrainerListResult> {
  return function listWithToken(token: string | null): Promise<TrainerListResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    return sendListRequest(deps, token).then(readListResponse).catch(readListNetworkFailure);
  };
}

function buildCreateRequester(
  deps: ApiDeps,
  input: NewTrainerInput,
): (token: string | null) => Promise<TrainerCreateResult> {
  return function createWithToken(token: string | null): Promise<TrainerCreateResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    return sendCreateRequest(deps, token, input)
      .then(readCreateResponse)
      .catch(readCreateNetworkFailure);
  };
}

function buildUpdateRequester(
  deps: ApiDeps,
  trainerId: string,
  input: TrainerUpdateInput,
): (token: string | null) => Promise<TrainerUpdateResult> {
  return function updateWithToken(token: string | null): Promise<TrainerUpdateResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    return sendUpdateRequest(deps, token, trainerId, input)
      .then(readUpdateResponse)
      .catch(readUpdateNetworkFailure);
  };
}

function buildDeleteRequester(
  deps: ApiDeps,
  trainerId: string,
): (token: string | null) => Promise<DeleteTrainerResult> {
  return function deleteWithToken(token: string | null): Promise<DeleteTrainerResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    return sendDeleteRequest(deps, token, trainerId)
      .then(readDeleteResponse)
      .catch(readDeleteNetworkFailure);
  };
}

function sendListRequest(deps: ApiDeps, token: string): Promise<Response> {
  const headers = buildHeaders(token);
  const init = { headers, method: 'GET' };
  return globalThis.fetch(buildTrainersUrl(deps.baseUrl), init);
}

function sendCreateRequest(
  deps: ApiDeps,
  token: string,
  input: NewTrainerInput,
): Promise<Response> {
  const headers = buildHeaders(token);
  const init = { body: JSON.stringify(input), headers, method: 'POST' };
  return globalThis.fetch(buildTrainersUrl(deps.baseUrl), init);
}

function sendUpdateRequest(
  deps: ApiDeps,
  token: string,
  trainerId: string,
  input: TrainerUpdateInput,
): Promise<Response> {
  const headers = buildHeaders(token);
  const init = { body: JSON.stringify(input), headers, method: 'PATCH' };
  return globalThis.fetch(buildTrainerUrl(deps.baseUrl, trainerId), init);
}

function sendDeleteRequest(deps: ApiDeps, token: string, trainerId: string): Promise<Response> {
  const headers = buildHeaders(token);
  const init = { headers, method: 'DELETE' };
  return globalThis.fetch(buildTrainerUrl(deps.baseUrl, trainerId), init);
}

function readListResponse(response: Response): Promise<TrainerListResult> {
  return safeJson(response).then(buildListResult(response.status));
}

function readCreateResponse(response: Response): Promise<TrainerCreateResult> {
  return safeJson(response).then(buildCreateResult(response.status));
}

function readUpdateResponse(response: Response): Promise<TrainerUpdateResult> {
  return safeJson(response).then(buildUpdateResult(response.status));
}

function readDeleteResponse(response: Response): Promise<DeleteTrainerResult> {
  if (isSuccessStatus(response.status)) {
    return Promise.resolve({ ok: true });
  }
  return safeJson(response).then(buildDeleteResult(response.status));
}

function safeJson(response: Response): Promise<unknown> {
  return response.json().catch(readUnparseableBody);
}

function readUnparseableBody(): null {
  return null;
}

function buildListResult(status: number): (body: unknown) => TrainerListResult {
  return function toListResult(body: unknown): TrainerListResult {
    if (isSuccessStatus(status)) {
      return { ok: true, trainers: readTrainers(body) };
    }
    return { code: resolveErrorCode(status, body), ok: false };
  };
}

function buildCreateResult(status: number): (body: unknown) => TrainerCreateResult {
  return function toCreateResult(body: unknown): TrainerCreateResult {
    if (!isSuccessStatus(status)) {
      return { code: resolveErrorCode(status, body), ok: false };
    }
    const trainer = readTrainer(body);
    return trainer === null ? { code: 'unknown', ok: false } : { ok: true, trainer };
  };
}

function buildUpdateResult(status: number): (body: unknown) => TrainerUpdateResult {
  return function toUpdateResult(body: unknown): TrainerUpdateResult {
    if (!isSuccessStatus(status)) {
      return { code: resolveErrorCode(status, body), ok: false };
    }
    const trainer = readTrainer(body);
    return trainer === null ? { code: 'unknown', ok: false } : { ok: true, trainer };
  };
}

function buildDeleteResult(status: number): (body: unknown) => DeleteTrainerResult {
  return function toDeleteResult(body: unknown): DeleteTrainerResult {
    return { code: resolveErrorCode(status, body), ok: false };
  };
}

function readListNetworkFailure(): TrainerListResult {
  return { code: 'unknown', ok: false };
}

function readCreateNetworkFailure(): TrainerCreateResult {
  return { code: 'unknown', ok: false };
}

function readUpdateNetworkFailure(): TrainerUpdateResult {
  return { code: 'unknown', ok: false };
}

function readDeleteNetworkFailure(): DeleteTrainerResult {
  return { code: 'unknown', ok: false };
}

function readTrainers(body: unknown): Trainer[] {
  if (typeof body !== 'object' || body === null) {
    return [];
  }
  const trainers = (body as { trainers?: unknown }).trainers;
  return Array.isArray(trainers) ? trainers.filter(isTrainer) : [];
}

function readTrainer(body: unknown): Trainer | null {
  return isTrainer(body) ? body : null;
}

/**
 * The shape of a trainer the client accepts.
 *
 * The wallet and the stamina came with the persistence of the trainer, so they
 * are numbers when they are there. The rest is what the contract requires.
 */
function isTrainer(value: unknown): value is Trainer {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const trainer = value as Partial<Trainer>;
  return (
    typeof trainer.id === 'string' &&
    typeof trainer.name === 'string' &&
    isGender(trainer.gender) &&
    typeof trainer.level === 'number' &&
    typeof trainer.starterSpeciesId === 'string' &&
    typeof trainer.createdAt === 'string' &&
    isOptionalNumber(trainer.gold) &&
    isOptionalNumber(trainer.diamonds) &&
    isOptionalNumber(trainer.staminaMinutes)
  );
}

function isGender(value: unknown): value is Gender {
  return value === 'male' || value === 'female';
}

function isOptionalNumber(value: unknown): boolean {
  return value === undefined || typeof value === 'number';
}

function buildTrainersUrl(baseUrl: string): string {
  return `${baseUrl}${TRAINERS_PATH}`;
}

function buildTrainerUrl(baseUrl: string, trainerId: string): string {
  return `${baseUrl}${TRAINERS_PATH}/${trainerId}`;
}
