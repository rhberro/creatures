import type { TrainerErrorCode } from '@creatures/contracts/trainer';

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

export function buildHeaders(token: string): Headers {
  const headers = new globalThis.Headers();
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');
  return headers;
}

export function isSuccessStatus(status: number): boolean {
  return status >= MIN_SUCCESS_STATUS && status < MAX_SUCCESS_STATUS;
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
