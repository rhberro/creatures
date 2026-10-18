import type { NewTrainerInput, Trainer, TrainerErrorCode } from '@creatures/contracts/trainer';
import type { ZodError } from 'zod';

import { newTrainerSchema } from '~/validation/trainer';

const TRAINERS_PATH = '/api/trainers';
const MIN_SUCCESS_STATUS = 200;
const MAX_SUCCESS_STATUS = 300;
const UNAUTHORIZED_STATUS = 401;
const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;
const UNAUTHENTICATED: TrainerErrorCode = 'unauthenticated';
const INVALID_INPUT: TrainerErrorCode = 'invalid_name';

const TRAINER_ERROR_CODES: TrainerErrorCode[] = [
  'invalid_gender',
  'invalid_name',
  'invalid_starter',
  'max_trainers_reached',
  'name_taken',
  'trainer_not_found',
  'unauthenticated',
];

export type TrainerClientErrorCode = TrainerErrorCode | 'unknown';

export type TrainerListResult =
  | { ok: true; trainers: Trainer[] }
  | { ok: false; code: TrainerClientErrorCode };

export type TrainerCreateResult =
  | { ok: true; trainer: Trainer }
  | { ok: false; code: TrainerClientErrorCode };

export type DeleteTrainerResult = { ok: true } | { ok: false; code: TrainerClientErrorCode };

export type TrainersControllerDeps = {
  baseUrl: string;
  getAccessToken(): Promise<string | null>;
};

export function requestTrainerList(deps: TrainersControllerDeps): Promise<TrainerListResult> {
  return deps.getAccessToken().then(buildListRequester(deps));
}

export function requestCreateTrainer(
  deps: TrainersControllerDeps,
  input: NewTrainerInput,
): Promise<TrainerCreateResult> {
  return deps.getAccessToken().then(buildCreateRequester(deps, input));
}

export function requestDeleteTrainer(
  deps: TrainersControllerDeps,
  trainerId: string,
): Promise<DeleteTrainerResult> {
  return deps.getAccessToken().then(buildDeleteRequester(deps, trainerId));
}

export function readValidationCode(error: ZodError): TrainerClientErrorCode {
  const [issue] = error.issues;
  const field = issue?.path[0];
  if (field === 'gender') {
    return 'invalid_gender';
  }
  if (field === 'starterCreatureId') {
    return 'invalid_starter';
  }
  return INVALID_INPUT;
}

export function validateNewTrainer(input: NewTrainerInput): TrainerClientErrorCode | null {
  const result = newTrainerSchema.safeParse(input);
  return result.success ? null : readValidationCode(result.error);
}

function buildListRequester(
  deps: TrainersControllerDeps,
): (token: string | null) => Promise<TrainerListResult> {
  return function listWithToken(token: string | null): Promise<TrainerListResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    return sendListRequest(deps, token).then(readListResponse).catch(readListNetworkFailure);
  };
}

function buildCreateRequester(
  deps: TrainersControllerDeps,
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

function buildDeleteRequester(
  deps: TrainersControllerDeps,
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

function sendListRequest(deps: TrainersControllerDeps, token: string): Promise<Response> {
  const headers = buildHeaders(token);
  const init = { headers, method: 'GET' };
  return globalThis.fetch(buildTrainersUrl(deps.baseUrl), init);
}

function sendCreateRequest(
  deps: TrainersControllerDeps,
  token: string,
  input: NewTrainerInput,
): Promise<Response> {
  const headers = buildHeaders(token);
  const init = { body: JSON.stringify(input), headers, method: 'POST' };
  return globalThis.fetch(buildTrainersUrl(deps.baseUrl), init);
}

function sendDeleteRequest(
  deps: TrainersControllerDeps,
  token: string,
  trainerId: string,
): Promise<Response> {
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

function readDeleteNetworkFailure(): DeleteTrainerResult {
  return { code: 'unknown', ok: false };
}

export function resolveErrorCode(status: number, body: unknown): TrainerClientErrorCode {
  const bodyCode = readBodyErrorCode(body);
  if (bodyCode !== null) {
    return bodyCode;
  }
  if (status === UNAUTHORIZED_STATUS) {
    return UNAUTHENTICATED;
  }
  if (status === BAD_REQUEST_STATUS) {
    return INVALID_INPUT;
  }
  if (status === NOT_FOUND_STATUS) {
    return 'trainer_not_found';
  }
  if (status === CONFLICT_STATUS) {
    return 'name_taken';
  }
  return 'unknown';
}

function readBodyErrorCode(body: unknown): TrainerErrorCode | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const error = (body as { error?: unknown }).error;
  return isTrainerErrorCode(error) ? error : null;
}

function isTrainerErrorCode(value: unknown): value is TrainerErrorCode {
  return typeof value === 'string' && (TRAINER_ERROR_CODES as string[]).includes(value);
}

export function isSuccessStatus(status: number): boolean {
  return status >= MIN_SUCCESS_STATUS && status < MAX_SUCCESS_STATUS;
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

function isTrainer(value: unknown): value is Trainer {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const trainer = value as Partial<Trainer>;
  return typeof trainer.id === 'string' && typeof trainer.name === 'string';
}

export function buildHeaders(token: string): Headers {
  const headers = new globalThis.Headers();
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');
  return headers;
}

function buildTrainersUrl(baseUrl: string): string {
  return `${baseUrl}${TRAINERS_PATH}`;
}

function buildTrainerUrl(baseUrl: string, trainerId: string): string {
  return `${baseUrl}${TRAINERS_PATH}/${trainerId}`;
}
