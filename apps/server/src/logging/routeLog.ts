import type { Logger } from 'pino';

import type { RequestContext } from '~/router';

import { sanitizeLogFields } from './sanitize';

export type RouteLogFields = Record<string, unknown>;

const EMPTY_FIELDS: RouteLogFields = {};

/**
 * What a route did, with the fields that are specific to it.
 *
 * The fields go through the sanitizer: a route that logs a field it should not
 * log still cannot leak a secret.
 */
export function logRouteEvent(
  logger: Logger,
  ctx: RequestContext,
  event: string,
  fields?: RouteLogFields,
): void {
  logger.info(buildEntry(ctx, fields), event);
}

/**
 * What a route refused, with the code of the refusal.
 */
export function logRouteFailure(
  logger: Logger,
  ctx: RequestContext,
  event: string,
  code: string,
  fields?: RouteLogFields,
): void {
  const entry = buildEntry(ctx, fields);
  const payload: Record<string, unknown> = { ...entry, code };
  logger.warn(payload, event);
}

function buildEntry(ctx: RequestContext, fields?: RouteLogFields): Record<string, unknown> {
  const identity: Record<string, unknown> = { requestId: ctx.requestId };
  if (ctx.userId !== null) {
    identity.userId = ctx.userId;
  }
  return { ...identity, ...sanitizeLogFields(fields ?? EMPTY_FIELDS) };
}
