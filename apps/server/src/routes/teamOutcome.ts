import { mapTeamOperationError } from '~/db/errors';
import type { TeamOperationOutcome } from '~/db/teamRepository';
import type { ServerDependencies } from '~/dependencies';
import { logRouteEvent } from '~/logging/routeLog';
import type { RouteLogFields } from '~/logging/routeLog';
import { errorResponse } from '~/router';
import type { RequestContext } from '~/router';

const NO_CONTENT = 204;

/**
 * The answer of a command that writes the time.
 *
 * A command that changed the time pushes the new state to the channel of the
 * account, so the client applies it without asking for the state again.
 */
export function readTeamOutcome(
  ctx: RequestContext,
  deps: ServerDependencies,
  userId: string,
  trainerId: string,
  outcome: TeamOperationOutcome,
  event: string,
  fields: RouteLogFields,
): Response {
  if (outcome.error !== null) {
    const mapped = mapTeamOperationError(outcome.error);
    return errorResponse(mapped.status, mapped.code, mapped.message);
  }
  deps.broadcaster.pushState(userId, trainerId);
  logRouteEvent(deps.logger, ctx, event, fields);
  const init = { status: NO_CONTENT };
  return new globalThis.Response(null, init);
}
