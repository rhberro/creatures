import type { RateLimitErrorCode } from '@creatures/contracts/rateLimit';

import type { ServerDependencies } from '~/dependencies';
import { logRouteFailure } from '~/logging/routeLog';
import { errorResponse } from '~/router';
import type { RequestContext, RouteHandler } from '~/router';

import type { AttemptLimiter } from './attemptLimiter';
import { buildRateLimitKeys, isRateLimited } from './policy';

const RATE_LIMIT_ERROR: RateLimitErrorCode = 'rate_limited';
const RATE_LIMIT_MESSAGE = 'Muitas tentativas. Tente novamente em alguns minutos.';
const RATE_LIMIT_STATUS = 429;
const RETRY_AFTER_SECONDS = 900;
const SERVER_ERROR_STATUS = 500;
const IGNORED_FAILURE_CODES = ['max_trainers_reached'];

/**
 * The guard of a route: the rate limit and the log of the refusal.
 *
 * The limit counts the failed attempts of the account and of the address, and
 * the count lives in the memory of the process. With more than one instance
 * each one counts its own attempts, and the limit weakens in proportion to the
 * number of instances.
 */
export function protectRoute(deps: ServerDependencies, handler: RouteHandler): RouteHandler {
  return function protectedHandler(
    req: Request,
    params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const pathname = readPathname(req);
    const limited = isRateLimited(req.method, pathname);
    const keys = buildRateLimitKeys(ctx);
    if (limited && isBlocked(deps.limiter, keys)) {
      logRouteFailure(deps.logger, ctx, 'route refused', RATE_LIMIT_ERROR, { path: pathname });
      return Promise.resolve(rateLimitedResponse());
    }
    return handler(req, params, ctx).then(function readOutcome(
      response: Response,
    ): Promise<Response> {
      return readErrorCode(response).then(function afterCode(code: string | null): Response {
        if (limited) {
          recordFailure(deps.limiter, keys, response.status, code);
        }
        logRefusal(deps, ctx, response, code);
        return response;
      });
    });
  };
}

function isBlocked(limiter: AttemptLimiter, keys: string[]): boolean {
  return keys.some(function isKeyBlocked(key: string): boolean {
    return limiter.isBlocked(key);
  });
}

function recordFailure(
  limiter: AttemptLimiter,
  keys: string[],
  status: number,
  code: string | null,
): void {
  if (!isFailedAttempt(status, code)) {
    return;
  }
  for (const key of keys) {
    limiter.recordFailure(key);
  }
}

/**
 * A failed attempt is a refusal of the client: the request was understood and
 * the answer was no. A full account is not a failed attempt — nothing the
 * player retries can change it.
 */
function isFailedAttempt(status: number, code: string | null): boolean {
  if (status < 400 || status >= 500 || status === RATE_LIMIT_STATUS) {
    return false;
  }
  return code === null || !IGNORED_FAILURE_CODES.includes(code);
}

function logRefusal(
  deps: ServerDependencies,
  ctx: RequestContext,
  response: Response,
  code: string | null,
): void {
  if (response.status < 400) {
    return;
  }
  logRouteFailure(deps.logger, ctx, 'route refused', code ?? 'unknown', {
    status: response.status,
  });
}

/**
 * The code of the error, read from the body of the answer.
 */
function readErrorCode(response: Response): Promise<string | null> {
  if (response.status < 400 || response.status >= SERVER_ERROR_STATUS) {
    return Promise.resolve(null);
  }
  return response.clone().json().then(readCode, readMissingCode);
}

function readCode(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const code = (body as { error?: unknown }).error;
  return typeof code === 'string' ? code : null;
}

function readMissingCode(): string | null {
  return null;
}

function rateLimitedResponse(): Response {
  const response = errorResponse(RATE_LIMIT_STATUS, RATE_LIMIT_ERROR, RATE_LIMIT_MESSAGE);
  response.headers.set('Retry-After', String(RETRY_AFTER_SECONDS));
  return response;
}

function readPathname(req: Request): string {
  return new globalThis.URL(req.url).pathname;
}
