import type { Logger } from 'pino';

import type { Middleware, RequestContext, ResponseObserver } from '~/router';

/**
 * The entry of a request: what arrived, before anything is answered.
 *
 * The body of the request is never logged. A route that needs to say what it
 * received logs the fields it cares about, one by one.
 */
export function createLoggingMiddleware(logger: Logger): Middleware {
  return function markRequestStart(req, ctx): Promise<Response | null> {
    ctx.startedAt = globalThis.performance.now();
    if (ctx.requestId === '') {
      ctx.requestId = globalThis.crypto.randomUUID();
    }
    logger.info(buildEntry(req, ctx), 'request started');
    return Promise.resolve(null);
  };
}

/**
 * The exit of a request: the status, the duration and the identity that made
 * it, correlated by the request id.
 */
export function createResponseLogger(logger: Logger): ResponseObserver {
  return function logResponse(req, ctx, response): void {
    const entry = buildEntry(req, ctx);
    const payload: Record<string, unknown> = {
      ...entry,
      durationMs: Math.round(globalThis.performance.now() - ctx.startedAt),
      status: response.status,
    };
    logger.info(payload, 'request completed');
  };
}

function buildEntry(req: Request, ctx: RequestContext): Record<string, unknown> {
  const entry: Record<string, unknown> = {
    method: req.method,
    path: new globalThis.URL(req.url).pathname,
    requestId: ctx.requestId,
  };
  if (ctx.clientIp !== null) {
    entry.clientIp = ctx.clientIp;
  }
  if (ctx.userId !== null) {
    entry.userId = ctx.userId;
  }
  return entry;
}
