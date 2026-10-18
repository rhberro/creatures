import { expect } from 'bun:test';

import type { NewTrainerInput, Trainer } from '@creatures/contracts/trainer';

import { createCorsMiddleware } from '~/middleware/cors';
import { createLoggingMiddleware } from '~/middleware/logging';
import { buildHttpHandler, composeMiddleware, createRequestContext } from '~/router';
import type { RouteHandler } from '~/router';
import { createStarterRoutes } from '~/routes/starters';
import { createTrainerRoutes, trainerStore } from '~/routes/trainers';
import type { ClaimsReader } from '~/supabase';

export const BASE_URL = 'http://localhost';
export const TRAINERS_PATH = '/api/trainers';
export const STARTERS_PATH = '/api/starters';
export const USER_ID = 'user-1';
export const OTHER_USER_ID = 'user-2';
export const USER_TOKEN = 'token-1';
export const OTHER_TOKEN = 'token-2';
export const STARTER_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
export const UNKNOWN_STARTER_ID = '99999999-9999-4999-8999-999999999999';
export const VALID_NAME = 'Rafael';
export const SHORT_NAME = 'ab';
export const STARTER_COUNT = 3;
export const MAX_TRAINERS = 5;
export const CREATED = 201;
export const OK = 200;
export const NO_CONTENT = 204;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const FIRST_DAY = '2024-01-01T00:00:00.000Z';
export const SECOND_DAY = '2024-01-02T00:00:00.000Z';

export type ErrorBody = { error: string; message: string };

export type TrainerListBody = { trainers: Trainer[] };

const TOKEN_ENTRIES: [string, string][] = [
  [USER_TOKEN, USER_ID],
  [OTHER_TOKEN, OTHER_USER_ID],
];

const TOKENS: Map<string, string> = new Map(TOKEN_ENTRIES);

const CLAIMS: ClaimsReader = { readUserId };

function readUserId(token: string): Promise<string | null> {
  return Promise.resolve(TOKENS.get(token) ?? null);
}

export function clearStore(): void {
  trainerStore.clear();
}

export function buildHandler(): RouteHandler {
  const routes = createTrainerRoutes(CLAIMS).concat(createStarterRoutes(CLAIMS));
  const middlewares = [createLoggingMiddleware(), createCorsMiddleware()];
  return composeMiddleware(middlewares, buildHttpHandler(routes));
}

export function buildTrainerBody(name: string): NewTrainerInput {
  return { gender: 'male', name, starterCreatureId: STARTER_ID };
}

export function buildStoredTrainer(name: string, createdAt: string): Trainer {
  return {
    createdAt,
    gender: 'male',
    id: globalThis.crypto.randomUUID(),
    level: 1,
    name,
    starterCreatureId: STARTER_ID,
  };
}

export function buildTrainerList(count: number): Trainer[] {
  const trainers: Trainer[] = [];
  for (let index = 0; index < count; index += 1) {
    const createdAt = new Date(Date.UTC(2024, 0, index + 1)).toISOString();
    trainers.push(buildStoredTrainer(`Seed ${index}`, createdAt));
  }
  return trainers;
}

export function buildJsonRequest(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Request {
  const headers = buildHeaders(token);
  headers.set('Content-Type', 'application/json');
  const init = { body: JSON.stringify(body), headers, method };
  return new globalThis.Request(buildUrl(path), init);
}

export function buildRequest(method: string, path: string, token: string | null): Request {
  const headers = buildHeaders(token);
  const init = { headers, method };
  return new globalThis.Request(buildUrl(path), init);
}

export function send(handler: RouteHandler, request: Request): Promise<Response> {
  const params: Record<string, string> = {};
  return handler(request, params, createRequestContext());
}

export function readJson(response: Response): Promise<unknown> {
  return response.json();
}

export function readError(response: Response): Promise<ErrorBody> {
  return readJson(response).then(readErrorBody);
}

export function buildStatusErrorAsserter(
  status: number,
  code: string,
): (response: Response) => Promise<void> {
  return function assertStatusError(response: Response): Promise<void> {
    expect(response.status).toBe(status);
    return readError(response).then(buildErrorCodeAsserter(code));
  };
}

export function buildErrorCodeAsserter(code: string): (error: ErrorBody) => void {
  return function assertErrorCode(error: ErrorBody): void {
    expect(error.error).toBe(code);
  };
}

export function buildTrainerListAsserter(
  assertBody: (body: TrainerListBody) => void,
): (response: Response) => Promise<void> {
  return function assertListResponse(response: Response): Promise<void> {
    expect(response.status).toBe(OK);
    return readJson(response).then(buildListBodyReader(assertBody));
  };
}

function buildHeaders(token: string | null): Headers {
  const headers = new globalThis.Headers();
  if (token !== null) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

function buildUrl(path: string): string {
  return new globalThis.URL(path, BASE_URL).toString();
}

function buildListBodyReader(assertBody: (body: TrainerListBody) => void): (body: unknown) => void {
  return function readListBody(body: unknown): void {
    assertBody(body as TrainerListBody);
  };
}

function readErrorBody(body: unknown): ErrorBody {
  return body as ErrorBody;
}
