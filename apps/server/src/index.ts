import { serve } from 'bun';
import pino from 'pino';

import { createCorsMiddleware } from '~/middleware/cors';
import { createLoggingMiddleware, createResponseLogger } from '~/middleware/logging';
import { buildHttpHandler, composeMiddleware, createRequestContext } from '~/router';
import type { RouteHandler } from '~/router';
import { createStarterRoutes } from '~/routes/starters';
import { createTrainerRoutes } from '~/routes/trainers';
import { createSupabaseServer, readSupabaseEnv } from '~/supabase';

const DEFAULT_PORT = 3001;

const logger = pino();
const supabase = createSupabaseServer(readSupabaseEnv(globalThis.process.env));
const routes = createTrainerRoutes(supabase.claims).concat(createStarterRoutes(supabase.claims));
const middlewares = [
  createLoggingMiddleware(),
  createCorsMiddleware(globalThis.process.env.CLIENT_ORIGIN),
];
const handler = composeMiddleware(
  middlewares,
  buildHttpHandler(routes, createResponseLogger(logger)),
);
const port = Number(globalThis.process.env.PORT ?? DEFAULT_PORT);
const serverConfig = { fetch: buildFetchHandler(handler), port };

serve(serverConfig);

logger.info({ port }, 'creatures server listening');

function buildFetchHandler(routeHandler: RouteHandler): (req: Request) => Promise<Response> {
  return function fetchHandler(req: Request): Promise<Response> {
    const params: Record<string, string> = {};
    return routeHandler(req, params, createRequestContext());
  };
}
