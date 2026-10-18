import type { NewTrainerInput, Trainer } from '@creatures/contracts/trainer';

import { createAuthMiddleware } from '~/auth/middleware';
import { composeMiddleware, defineRoute, errorResponse, jsonResponse } from '~/router';
import type { RequestContext, Route } from '~/router';
import type { ClaimsReader } from '~/supabase';
import {
  normalizeTrainerName,
  readTrainerErrorMessage,
  validateNewTrainer,
} from '~/validation/trainer';

const TRAINERS_PATH = '/api/trainers';
const TRAINER_PATH = '/api/trainers/:id';
const MAX_TRAINERS = 5;
const CREATED = 201;
const OK = 200;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;

// Persistence stays in memory until the database schema lands.
export const trainerStore: Map<string, Trainer[]> = new Map();

export function createTrainerRoutes(claims: ClaimsReader): Route[] {
  const authMiddleware = createAuthMiddleware(claims);
  const middlewares = [authMiddleware];
  return [
    defineRoute('POST', TRAINERS_PATH, composeMiddleware(middlewares, createTrainer)),
    defineRoute('GET', TRAINERS_PATH, composeMiddleware(middlewares, listTrainers)),
    defineRoute('DELETE', TRAINER_PATH, composeMiddleware(middlewares, deleteTrainer)),
  ];
}

function createTrainer(
  req: Request,
  _params: Record<string, string>,
  ctx: RequestContext,
): Promise<Response> {
  const userId = ctx.userId;
  if (userId === null) {
    return Promise.resolve(unauthenticatedResponse());
  }
  return readJsonBody(req).then(buildTrainerCreator(userId));
}

function buildTrainerCreator(userId: string): (body: unknown) => Response {
  return function createFromBody(body: unknown): Response {
    const validation = validateNewTrainer(body);
    if (!validation.ok) {
      return errorResponse(BAD_REQUEST, validation.code, validation.message);
    }
    const existing = trainerStore.get(userId) ?? [];
    if (existing.length >= MAX_TRAINERS) {
      return errorResponse(
        CONFLICT,
        'max_trainers_reached',
        readTrainerErrorMessage('max_trainers_reached'),
      );
    }
    if (hasTrainerName(existing, validation.value.name)) {
      return errorResponse(CONFLICT, 'name_taken', readTrainerErrorMessage('name_taken'));
    }
    const trainer = buildTrainer(validation.value);
    const next = existing.concat(trainer);
    trainerStore.set(userId, next);
    return jsonResponse(trainer, CREATED);
  };
}

function listTrainers(
  _req: Request,
  _params: Record<string, string>,
  ctx: RequestContext,
): Promise<Response> {
  const userId = ctx.userId;
  if (userId === null) {
    return Promise.resolve(unauthenticatedResponse());
  }
  const trainers = trainerStore.get(userId) ?? [];
  const sorted = trainers.toSorted(compareTrainersByCreatedAt);
  const body = { trainers: sorted };
  return Promise.resolve(jsonResponse(body, OK));
}

function deleteTrainer(
  _req: Request,
  params: Record<string, string>,
  ctx: RequestContext,
): Promise<Response> {
  const userId = ctx.userId;
  if (userId === null) {
    return Promise.resolve(unauthenticatedResponse());
  }
  const trainerId = params.id;
  if (trainerId === undefined) {
    return Promise.resolve(notFoundResponse());
  }
  const existing = trainerStore.get(userId) ?? [];
  if (!existing.some(buildTrainerIdMatcher(trainerId))) {
    return Promise.resolve(notFoundResponse());
  }
  const next = existing.filter(buildTrainerIdRejector(trainerId));
  trainerStore.set(userId, next);
  const init = { status: NO_CONTENT };
  return Promise.resolve(new globalThis.Response(null, init));
}

function readJsonBody(req: Request): Promise<unknown> {
  return req.json().then(readBody, readMissingBody);
}

function readBody(value: unknown): unknown {
  return value;
}

function readMissingBody(): null {
  return null;
}

function buildTrainer(input: NewTrainerInput): Trainer {
  return {
    createdAt: new Date().toISOString(),
    gender: input.gender,
    id: globalThis.crypto.randomUUID(),
    level: 1,
    name: input.name,
    starterCreatureId: input.starterCreatureId,
  };
}

function hasTrainerName(trainers: Trainer[], name: string): boolean {
  const normalizedName = normalizeTrainerName(name);
  return trainers.some(buildNameMatcher(normalizedName));
}

function buildNameMatcher(normalizedName: string): (trainer: Trainer) => boolean {
  return function matchesName(trainer: Trainer): boolean {
    return normalizeTrainerName(trainer.name) === normalizedName;
  };
}

function buildTrainerIdMatcher(trainerId: string): (trainer: Trainer) => boolean {
  return function matchesId(trainer: Trainer): boolean {
    return trainer.id === trainerId;
  };
}

function buildTrainerIdRejector(trainerId: string): (trainer: Trainer) => boolean {
  return function rejectsId(trainer: Trainer): boolean {
    return trainer.id !== trainerId;
  };
}

function compareTrainersByCreatedAt(first: Trainer, second: Trainer): number {
  return first.createdAt.localeCompare(second.createdAt);
}

function unauthenticatedResponse(): Response {
  return errorResponse(401, 'unauthenticated', readTrainerErrorMessage('unauthenticated'));
}

function notFoundResponse(): Response {
  return errorResponse(
    NOT_FOUND,
    'trainer_not_found',
    readTrainerErrorMessage('trainer_not_found'),
  );
}
