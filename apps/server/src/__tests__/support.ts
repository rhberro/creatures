import type { SupabaseClient } from '@supabase/supabase-js';
import pino from 'pino';

import type { ServerDependencies } from '~/dependencies';
import { createCorsMiddleware } from '~/middleware/cors';
import { createLoggingMiddleware } from '~/middleware/logging';
import { createAttemptLimiter } from '~/ratelimit/attemptLimiter';
import { buildHttpHandler, composeMiddleware, createRequestContext } from '~/router';
import type { RouteHandler } from '~/router';
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
import type { AuthClaims, ClaimsReader, UserReader } from '~/supabase';
import type { StateBroadcaster } from '~/ws/stateBroadcaster';

export const BASE_URL = 'http://localhost';
export const TRAINERS_PATH = '/api/trainers';
export const STARTERS_PATH = '/api/starters';
export const SESSION_PATH = '/api/session/trainer';
export const PLAYER_STATE_PATH = '/api/player/state';
export const TEAM_PATH = '/api/team';
export const TEAM_MEMBER_PATH = '/api/team/:creatureId';
export const TEAM_SWAP_PATH = '/api/team/swap';
export const CREATURE_ABILITY_SLOTS_PATH = '/api/creatures/:id/ability-slots';
export const GEAR_SLOT_PATH = '/api/gear-slots/:slot';
export const HUNT_AREAS_PATH = '/api/hunt-areas';
export const HUNT_AREA_PATH = '/api/hunt-areas/:id';
export const STORE_PATH = '/api/store';
export const STORE_BUY_PATH = '/api/store/buy';
export const STORE_SELL_PATH = '/api/store/sell';
export const HEALTH_PATH = '/api/health';
export const USER_ID = 'user-1';
export const OTHER_USER_ID = 'user-2';
export const USER_TOKEN = 'token-1';
export const OTHER_TOKEN = 'token-2';
export const VALID_NAME = 'Rafael';
export const OK = 200;
export const CREATED = 201;
export const NO_CONTENT = 204;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const SERVER_ERROR = 500;

export type ErrorBody = { error: string; message: string };

type TokenIdentity = {
  email: string;
  userId: string;
};

const TOKEN_ENTRIES: [string, TokenIdentity][] = [
  [USER_TOKEN, { email: 'user-1@example.com', userId: USER_ID }],
  [OTHER_TOKEN, { email: 'user-2@example.com', userId: OTHER_USER_ID }],
];

const TOKENS: Map<string, TokenIdentity> = new Map(TOKEN_ENTRIES);

const CLAIMS: ClaimsReader = { readClaims };

const USERS: UserReader = { readUserId };

function readClaims(token: string): Promise<AuthClaims | null> {
  const identity = TOKENS.get(token);
  if (identity === undefined) {
    return Promise.resolve(null);
  }
  return Promise.resolve({ email: identity.email, userId: identity.userId });
}

function readUserId(token: string): Promise<string | null> {
  return Promise.resolve(TOKENS.get(token)?.userId ?? null);
}

/**
 * The pushes the server made, as the test sees them.
 */
export type RecordedPush = {
  trainerId: string;
  userId: string;
};

export type BroadcastRecorder = {
  broadcaster: StateBroadcaster;
  pushes: RecordedPush[];
};

/**
 * A broadcaster that only records the pushes: the unit tests never reach the
 * database, so the state cannot be loaded.
 */
export function buildRecordingBroadcaster(): BroadcastRecorder {
  const pushes: RecordedPush[] = [];
  return {
    broadcaster: {
      pushState: function pushState(userId: string, trainerId: string): void {
        pushes.push({ trainerId, userId });
      },
    },
    pushes,
  };
}

/**
 * The unit tests never reach the database: the repositories are only used by
 * the routes that require a real Postgres, covered by the integration suite.
 */
export function buildDependencies(): ServerDependencies {
  return {
    admin: {} as unknown as SupabaseClient,
    broadcaster: buildRecordingBroadcaster().broadcaster,
    claims: CLAIMS,
    limiter: createAttemptLimiter(),
    logger: pino({ level: 'silent' }),
    sessions: createTrainerSessionStore(),
    users: USERS,
  };
}

export function buildHandler(deps: ServerDependencies = buildDependencies()): RouteHandler {
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
  const middlewares = [createLoggingMiddleware(deps.logger), createCorsMiddleware()];
  return composeMiddleware(middlewares, buildHttpHandler(routes));
}

export function buildJsonRequest(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Request {
  const headers = buildHeaders(token);
  headers.set('Content-Type', 'application/json');
  const init = { body: JSON.stringify(body), headers, method };
  return new globalThis.Request(buildUrl(path), init);
}

export function buildRequest(method: string, path: string, token: string | null): Request {
  const headers = buildHeaders(token);
  const init = { headers, method };
  return new globalThis.Request(buildUrl(path), init);
}

export function send(handler: RouteHandler, request: Request): Promise<Response> {
  const params: Record<string, string> = {};
  return handler(request, params, createRequestContext());
}

export function readJson(response: Response): Promise<unknown> {
  return response.json();
}

export function readError(response: Response): Promise<ErrorBody> {
  return response.json().then(readErrorBody);
}

export function buildHeaders(token: string | null): Headers {
  const headers = new globalThis.Headers();
  if (token !== null) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export function buildUrl(path: string): string {
  return new globalThis.URL(path, BASE_URL).toString();
}

function readErrorBody(body: unknown): ErrorBody {
  return body as ErrorBody;
}
