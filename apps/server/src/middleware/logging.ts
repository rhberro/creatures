import type { Logger } from 'pino';

import type { Middleware, ResponseObserver } from '~/router';

export function createLoggingMiddleware(): Middleware {
  return function markRequestStart(_req, ctx): Promise<Response | null> {
    ctx.startedAt = globalThis.performance.now();
    return Promise.resolve(null);
  };
}

export function createResponseLogger(logger: Logger): ResponseObserver {
  return function logResponse(req, ctx, response): void {
    const entry = {
      durationMs: Math.round(globalThis.performance.now() - ctx.startedAt),
      method: req.method,
      path: new globalThis.URL(req.url).pathname,
      status: response.status,
    };
    logger.info(entry, 'request completed');
  };
}
