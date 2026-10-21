import { listStarterSpecies } from '~/db/speciesRepository';
import type { ServerDependencies } from '~/dependencies';
import { defineRoute, errorResponse, jsonResponse } from '~/router';
import type { RequestContext, Route, RouteHandler } from '~/router';
import { composeProtectedRoute } from '~/routes/routeChain';

const STARTERS_PATH = '/api/starters';
const OK = 200;
const UNAUTHENTICATED_ERROR = 'unauthenticated';
const UNAUTHENTICATED_MESSAGE = 'Token inválido ou ausente.';

export function createStarterRoutes(deps: ServerDependencies): Route[] {
  return [defineRoute('GET', STARTERS_PATH, composeProtectedRoute(deps, handleListStarters(deps)))];
}

function handleListStarters(deps: ServerDependencies): RouteHandler {
  return function listStarters(
    _req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    if (ctx.userId === null) {
      return Promise.resolve(errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE));
    }
    return listStarterSpecies(deps.admin).then(function toBody(starters: unknown[]): Response {
      return jsonResponse({ starters }, OK);
    });
  };
}
