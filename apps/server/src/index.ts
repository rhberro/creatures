import { serve, type Server } from 'bun';

import type { ServerDependencies } from '~/dependencies';
import { createServerLogger } from '~/logging/logger';
import { createCorsMiddleware } from '~/middleware/cors';
import { createLoggingMiddleware, createResponseLogger } from '~/middleware/logging';
import { createAttemptLimiter } from '~/ratelimit/attemptLimiter';
import {
  buildHttpHandler,
  composeMiddleware,
  createErrorBoundary,
  createRequestContext,
  errorResponse,
} from '~/router';
import { createAuthRoutes } from '~/routes/auth';
import { createGearSlotRoutes } from '~/routes/gearSlots';
import { createHealthRoutes } from '~/routes/health';
import { createHuntAreaRoutes } from '~/routes/huntAreas';
import { createLoadoutRoutes } from '~/routes/loadout';
import { createPlayerRoutes } from '~/routes/player';
import { createStarterRoutes } from '~/routes/starters';
import { createStoreRoutes } from '~/routes/store';
import { createTeamRoutes } from '~/routes/team';
import { createTrainerRoutes } from '~/routes/trainers';
import { createTrainerSessionStore } from '~/session/trainerSession';
import { createSupabaseServer, readSupabaseEnv } from '~/supabase';
import { createConnectionRegistry } from '~/ws/connections';
import type { SocketData } from '~/ws/connections';
import { createGameSocketHandler } from '~/ws/gameSocket';
import { createStateBroadcaster } from '~/ws/stateBroadcaster';

const DEFAULT_PORT = 3001;
const WS_PATH = '/ws';
const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;
const TRUSTED_PROXY = '1';

const logger = createServerLogger();
const supabase = createSupabaseServer(readSupabaseEnv(globalThis.process.env));
const connections = createConnectionRegistry();
const deps: ServerDependencies = {
  admin: supabase.admin,
  broadcaster: createStateBroadcaster(supabase.admin, connections, logger),
  claims: supabase.claims,
  limiter: createAttemptLimiter(),
  logger,
  sessions: createTrainerSessionStore(),
  users: supabase.users,
};
const routes = createTrainerRoutes(deps)
  .concat(createStarterRoutes(deps))
  .concat(createPlayerRoutes(deps))
  .concat(createTeamRoutes(deps))
  .concat(createAuthRoutes(deps))
  .concat(createHuntAreaRoutes(deps))
  .concat(createLoadoutRoutes(deps))
  .concat(createGearSlotRoutes(deps))
  .concat(createStoreRoutes(deps))
  .concat(createHealthRoutes());
const middlewares = [
  createLoggingMiddleware(logger),
  createCorsMiddleware(globalThis.process.env.CLIENT_ORIGIN),
];
const routeHandler = createErrorBoundary(
  logger,
  composeMiddleware(middlewares, buildHttpHandler(routes, createResponseLogger(logger))),
);
const port = Number(globalThis.process.env.PORT ?? DEFAULT_PORT);
const trustProxy = globalThis.process.env.TRUST_PROXY === TRUSTED_PROXY;

serve({
  fetch: fetchHandler,
  port,
  websocket: createGameSocketHandler(deps, connections),
});

logger.info({ port }, 'creatures server listening');

function fetchHandler(req: Request, bunServer: Server<SocketData>): Promise<Response | undefined> {
  const url = new globalThis.URL(req.url);
  if (url.pathname === WS_PATH) {
    return handleWebSocketUpgrade(req, bunServer);
  }
  const params: Record<string, string> = {};
  const ctx = createRequestContext();
  ctx.clientIp = readClientIp(req, bunServer);
  return routeHandler(req, params, ctx);
}

/**
 * The address the request came from.
 *
 * The header of the proxy is only read when the server is told to trust it: a
 * client that reaches the server directly could invent any address it wanted,
 * and the limit of the address would not hold.
 */
function readClientIp(req: Request, bunServer: Server<SocketData>): string | null {
  if (trustProxy) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded !== null) {
      const first = forwarded.split(',')[0]?.trim();
      if (first !== undefined && first !== '') {
        return first;
      }
    }
  }
  const address = bunServer.requestIP(req);
  return address?.address ?? null;
}

/**
 * The channel is only opened for a token the Auth server still recognises, so a
 * revoked session never reaches the game. The token itself is never logged.
 */
function handleWebSocketUpgrade(
  req: Request,
  bunServer: Server<SocketData>,
): Promise<Response | undefined> {
  const url = new globalThis.URL(req.url);
  const token = url.searchParams.get('token');
  if (token === null || token === '') {
    return Promise.resolve(
      errorResponse(UNAUTHORIZED, 'unauthenticated', 'Token inválido ou ausente.'),
    );
  }
  return deps.users.readUserId(token).then(function openChannel(
    userId: string | null,
  ): Response | undefined {
    if (userId === null) {
      return errorResponse(UNAUTHORIZED, 'unauthenticated', 'Token inválido ou ausente.');
    }
    const data: SocketData = { userId };
    const options = { data };
    const upgraded = bunServer.upgrade(req, options);
    if (!upgraded) {
      return errorResponse(BAD_REQUEST, 'upgrade_failed', 'Não foi possível abrir o canal.');
    }
    logger.info({ userId }, 'websocket channel opened');
    return undefined;
  });
}
