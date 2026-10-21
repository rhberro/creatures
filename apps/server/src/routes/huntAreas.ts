import { findHuntAreaById, listHuntAreas } from '~/db/huntAreaRepository';
import type { ServerDependencies } from '~/dependencies';
import { defineRoute, errorResponse, jsonResponse } from '~/router';
import type { RequestContext, Route, RouteHandler } from '~/router';
import { composeProtectedRoute } from '~/routes/routeChain';
import { isUuid } from '~/validation/trainer';

const HUNT_AREAS_PATH = '/api/hunt-areas';
const HUNT_AREA_PATH = '/api/hunt-areas/:id';
const OK = 200;
const NOT_FOUND = 404;
const UNAUTHENTICATED_ERROR = 'unauthenticated';
const UNAUTHENTICATED_MESSAGE = 'Token inválido ou ausente.';
const AREA_NOT_FOUND_ERROR = 'trainer_not_found';
const AREA_NOT_FOUND_MESSAGE = 'Área de caça não encontrada.';

export function createHuntAreaRoutes(deps: ServerDependencies): Route[] {
  return [
    defineRoute('GET', HUNT_AREAS_PATH, composeProtectedRoute(deps, handleListAreas(deps))),
    defineRoute('GET', HUNT_AREA_PATH, composeProtectedRoute(deps, handleFindArea(deps))),
  ];
}

function handleListAreas(deps: ServerDependencies): RouteHandler {
  return function listAreas(
    _req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    if (ctx.userId === null) {
      return Promise.resolve(errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE));
    }
    return listHuntAreas(deps.admin).then(function toBody(areas: unknown[]): Response {
      return jsonResponse({ areas }, OK);
    });
  };
}

function handleFindArea(deps: ServerDependencies): RouteHandler {
  return function findArea(
    _req: Request,
    params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    if (ctx.userId === null) {
      return Promise.resolve(errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE));
    }
    const huntAreaId = params.id ?? '';
    if (!isUuid(huntAreaId)) {
      return Promise.resolve(notFoundResponse());
    }
    return findHuntAreaById(deps.admin, huntAreaId).then(function toBody(
      area: unknown | null,
    ): Response {
      if (area === null) {
        return notFoundResponse();
      }
      return jsonResponse(area, OK);
    });
  };
}

function notFoundResponse(): Response {
  return errorResponse(NOT_FOUND, AREA_NOT_FOUND_ERROR, AREA_NOT_FOUND_MESSAGE);
}
