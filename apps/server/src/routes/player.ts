import { findTrainerById } from '~/db/trainerRepository';
import type { ServerDependencies } from '~/dependencies';
import { logRouteEvent } from '~/logging/routeLog';
import { defineRoute, errorResponse, jsonResponse } from '~/router';
import type { RequestContext, Route, RouteHandler } from '~/router';
import { composeProtectedRoute } from '~/routes/routeChain';
import { loadPlayerState } from '~/state/playerState';
import { isUuid } from '~/validation/trainer';

const SESSION_PATH = '/api/session/trainer';
const PLAYER_STATE_PATH = '/api/player/state';
const NO_CONTENT = 204;
const OK = 200;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const UNAUTHENTICATED_ERROR = 'unauthenticated';
const UNAUTHENTICATED_MESSAGE = 'Token inválido ou ausente.';
const TRAINER_NOT_FOUND_ERROR = 'trainer_not_found';
const TRAINER_NOT_FOUND_MESSAGE = 'Treinador não encontrado.';
const INVALID_TRAINER_ERROR = 'invalid_trainer';
const INVALID_TRAINER_MESSAGE = 'Identificador de treinador inválido.';

export function createPlayerRoutes(deps: ServerDependencies): Route[] {
  return [
    defineRoute(
      'POST',
      SESSION_PATH,
      composeProtectedRoute(deps, handleSelectSessionTrainer(deps)),
    ),
    defineRoute(
      'DELETE',
      SESSION_PATH,
      composeProtectedRoute(deps, handleClearSessionTrainer(deps)),
    ),
    defineRoute('GET', PLAYER_STATE_PATH, composeProtectedRoute(deps, handleReadPlayerState(deps))),
  ];
}

function handleSelectSessionTrainer(deps: ServerDependencies): RouteHandler {
  return function selectSessionTrainer(
    req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE));
    }
    return readJsonBody(req)
      .then(readTrainerId)
      .then(checkTrainerOwnership(deps, userId))
      .then(function toResponse(result: Response | string): Response {
        if (typeof result === 'string') {
          deps.sessions.set(userId, result);
          logRouteEvent(deps.logger, ctx, 'trainer session opened', { trainerId: result });
          const init = { status: NO_CONTENT };
          return new globalThis.Response(null, init);
        }
        return result;
      });
  };
}

/**
 * Disconnects the trainer of the account.
 *
 * The session of the account stays alive: only the trainer is disconnected, so
 * the player goes back to the list of trainers without signing out.
 */
function handleClearSessionTrainer(deps: ServerDependencies): RouteHandler {
  return function clearSessionTrainer(
    _req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE));
    }
    deps.sessions.clear(userId);
    const init = { status: NO_CONTENT };
    return Promise.resolve(new globalThis.Response(null, init));
  };
}

function handleReadPlayerState(deps: ServerDependencies): RouteHandler {
  return function readPlayerState(
    _req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE));
    }
    const trainerId = deps.sessions.get(userId);
    if (trainerId === null) {
      return Promise.resolve(notFoundResponse());
    }
    return loadPlayerState(deps.admin, trainerId, userId).then(function toBody(
      state: unknown,
    ): Response {
      if (state === null) {
        return notFoundResponse();
      }
      return jsonResponse(state, OK);
    });
  };
}

function checkTrainerOwnership(
  deps: ServerDependencies,
  userId: string,
): (trainerId: string | Response) => Promise<string | Response> {
  return function checkOwnership(trainerId: string | Response): Promise<string | Response> {
    if (typeof trainerId !== 'string') {
      return Promise.resolve(trainerId);
    }
    return findTrainerById(deps.admin, trainerId, userId).then(function readTrainer(
      trainer: { id: string } | null,
    ): string | Response {
      if (trainer === null) {
        return notFoundResponse();
      }
      return trainer.id;
    });
  };
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

function readTrainerId(body: unknown): string | Response {
  if (typeof body !== 'object' || body === null) {
    return errorResponse(BAD_REQUEST, INVALID_TRAINER_ERROR, INVALID_TRAINER_MESSAGE);
  }
  const trainerId = (body as { trainerId?: unknown }).trainerId;
  if (typeof trainerId !== 'string' || !isUuid(trainerId)) {
    return errorResponse(BAD_REQUEST, INVALID_TRAINER_ERROR, INVALID_TRAINER_MESSAGE);
  }
  return trainerId;
}

function notFoundResponse(): Response {
  return errorResponse(NOT_FOUND, TRAINER_NOT_FOUND_ERROR, TRAINER_NOT_FOUND_MESSAGE);
}
