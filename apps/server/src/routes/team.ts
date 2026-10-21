import { mapTeamOperationError } from '~/db/errors';
import {
  addCreatureToTeam,
  removeCreatureFromTeam,
  reorderTeam,
  swapActiveCreature,
} from '~/db/teamRepository';
import type { TeamOperationOutcome } from '~/db/teamRepository';
import type { ServerDependencies } from '~/dependencies';
import { logRouteEvent } from '~/logging/routeLog';
import { defineRoute, errorResponse, isResponse } from '~/router';
import type { RequestContext, Route, RouteHandler } from '~/router';
import { composeProtectedRoute } from '~/routes/routeChain';
import { readTeamOutcome } from '~/routes/teamOutcome';
import { isSwapBlocked } from '~/state/swapCooldown';
import { validateAddTeamMember, validateSwapCreature, validateTeamOrder } from '~/validation/team';
import type { AddTeamMemberCommand, SwapTeamCommand, TeamOrderCommand } from '~/validation/team';
import { readTrainerErrorMessage } from '~/validation/trainer';
const TEAM_PATH = '/api/team';
const TEAM_MEMBER_PATH = '/api/team/:creatureId';
const TEAM_SWAP_PATH = '/api/team/swap';
const NO_CONTENT = 204;
const NOT_FOUND = 404;
const TOO_MANY_REQUESTS = 429;

type TeamStep<T> = Response | T;

export function createTeamRoutes(deps: ServerDependencies): Route[] {
  return [
    defineRoute('POST', TEAM_PATH, composeProtectedRoute(deps, handleAddTeamMember(deps))),
    defineRoute('PUT', TEAM_PATH, composeProtectedRoute(deps, handleReorderTeam(deps))),
    defineRoute(
      'DELETE',
      TEAM_MEMBER_PATH,
      composeProtectedRoute(deps, handleRemoveTeamMember(deps)),
    ),
    defineRoute('POST', TEAM_SWAP_PATH, composeProtectedRoute(deps, handleSwapActive(deps))),
  ];
}

function handleAddTeamMember(deps: ServerDependencies): RouteHandler {
  return function addTeamMember(
    req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(unauthenticatedResponse());
    }
    const trainerId = readSessionTrainer(deps, userId);
    if (isResponse(trainerId)) {
      return Promise.resolve(trainerId);
    }
    return readJsonBody(req)
      .then(readAddCommand)
      .then(function withCommand(
        command: TeamStep<AddTeamMemberCommand>,
      ): Response | Promise<Response> {
        if (isResponse(command)) {
          return command;
        }
        return addCreatureToTeam(deps.admin, trainerId, userId, command.creatureId).then(
          function readOutcome(outcome: TeamOperationOutcome): Response {
            return readTeamOutcome(
              ctx,
              deps,
              userId,
              trainerId,
              outcome,
              'creature added to team',
              {
                creatureId: command.creatureId,
              },
            );
          },
        );
      });
  };
}

function handleRemoveTeamMember(deps: ServerDependencies): RouteHandler {
  return function removeTeamMember(
    _req: Request,
    params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(unauthenticatedResponse());
    }
    const trainerId = readSessionTrainer(deps, userId);
    if (isResponse(trainerId)) {
      return Promise.resolve(trainerId);
    }
    const creatureId = params.creatureId;
    if (creatureId === undefined) {
      return Promise.resolve(notFoundResponse());
    }
    return removeCreatureFromTeam(deps.admin, trainerId, userId, creatureId).then(
      function readOutcome(outcome: TeamOperationOutcome): Response {
        return readTeamOutcome(
          ctx,
          deps,
          userId,
          trainerId,
          outcome,
          'creature removed from team',
          {
            creatureId,
          },
        );
      },
    );
  };
}

function handleReorderTeam(deps: ServerDependencies): RouteHandler {
  return function reorderTeamRoute(
    req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(unauthenticatedResponse());
    }
    const trainerId = readSessionTrainer(deps, userId);
    if (isResponse(trainerId)) {
      return Promise.resolve(trainerId);
    }
    return readJsonBody(req)
      .then(readOrderCommand)
      .then(function withCommand(
        command: TeamStep<TeamOrderCommand>,
      ): Response | Promise<Response> {
        if (isResponse(command)) {
          return command;
        }
        return reorderTeam(deps.admin, trainerId, userId, command.order).then(function readOutcome(
          outcome: TeamOperationOutcome,
        ): Response {
          return readTeamOutcome(ctx, deps, userId, trainerId, outcome, 'team reordered', {
            size: command.order.length,
          });
        });
      });
  };
}

/**
 * The manual swap of the creature in the field.
 *
 * The chosen creature exchanges places with the one in the field: it takes the
 * first slot of the team, and the one in the field takes the slot the chosen
 * one had. The creatures in between keep their places.
 *
 * Two manual swaps cannot happen in a row: the first one starts a wait of five
 * seconds, and the wait belongs to the session of the trainer.
 */
function handleSwapActive(deps: ServerDependencies): RouteHandler {
  return function swapActive(
    req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(unauthenticatedResponse());
    }
    const trainerId = readSessionTrainer(deps, userId);
    if (isResponse(trainerId)) {
      return Promise.resolve(trainerId);
    }
    return readJsonBody(req)
      .then(readSwapCommand)
      .then(function withCommand(command: TeamStep<SwapTeamCommand>): Response | Promise<Response> {
        if (isResponse(command)) {
          return command;
        }
        if (isSwapBlocked(deps.sessions.getLastSwapAt(userId), Date.now())) {
          return swapCooldownResponse();
        }
        return swapActiveCreature(deps.admin, trainerId, userId, command.creatureId).then(
          function readOutcome(outcome: TeamOperationOutcome): Response {
            if (outcome.error !== null) {
              const mapped = mapTeamOperationError(outcome.error);
              return errorResponse(mapped.status, mapped.code, mapped.message);
            }
            deps.sessions.registerSwap(userId, Date.now());
            deps.broadcaster.pushState(userId, trainerId);
            logRouteEvent(deps.logger, ctx, 'active creature swapped', {
              creatureId: command.creatureId,
            });
            const init = { status: NO_CONTENT };
            return new globalThis.Response(null, init);
          },
        );
      });
  };
}

function readAddCommand(body: unknown): TeamStep<AddTeamMemberCommand> {
  const validation = validateAddTeamMember(body);
  if (!validation.ok) {
    return invalidCommandResponse();
  }
  return validation.value;
}

function readOrderCommand(body: unknown): TeamStep<TeamOrderCommand> {
  const validation = validateTeamOrder(body);
  if (!validation.ok) {
    return invalidCommandResponse();
  }
  return validation.value;
}

function readSwapCommand(body: unknown): TeamStep<SwapTeamCommand> {
  const validation = validateSwapCreature(body);
  if (!validation.ok) {
    return invalidCommandResponse();
  }
  return validation.value;
}

/**
 * The team belongs to the trainer the session points at: the player does not
 * send the trainer with the command.
 */
function readSessionTrainer(deps: ServerDependencies, userId: string): string | Response {
  const trainerId = deps.sessions.get(userId);
  if (trainerId === null) {
    return notFoundResponse();
  }
  return trainerId;
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

function invalidCommandResponse(): Response {
  return errorResponse(
    400,
    'invalid_team_command',
    readTrainerErrorMessage('invalid_team_command'),
  );
}

function swapCooldownResponse(): Response {
  return errorResponse(
    TOO_MANY_REQUESTS,
    'swap_cooldown',
    readTrainerErrorMessage('swap_cooldown'),
  );
}
