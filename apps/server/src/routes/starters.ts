import { createAuthMiddleware } from '~/auth/middleware';
import { STARTERS } from '~/data/starters';
import { composeMiddleware, defineRoute, errorResponse, jsonResponse } from '~/router';
import type { RequestContext, Route } from '~/router';
import type { ClaimsReader } from '~/supabase';

const STARTERS_PATH = '/api/starters';
const OK = 200;
const UNAUTHENTICATED_ERROR = 'unauthenticated';
const UNAUTHENTICATED_MESSAGE = 'Token inválido ou ausente.';

export function createStarterRoutes(claims: ClaimsReader): Route[] {
  const authMiddleware = createAuthMiddleware(claims);
  const middlewares = [authMiddleware];
  return [defineRoute('GET', STARTERS_PATH, composeMiddleware(middlewares, listStarters))];
}

function listStarters(
  _req: Request,
  _params: Record<string, string>,
  ctx: RequestContext,
): Promise<Response> {
  if (ctx.userId === null) {
    return Promise.resolve(errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE));
  }
  const body = { starters: STARTERS };
  return Promise.resolve(jsonResponse(body, OK));
}
