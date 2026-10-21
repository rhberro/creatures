import { createAuthMiddleware } from '~/auth/middleware';
import type { ServerDependencies } from '~/dependencies';
import { protectRoute } from '~/ratelimit/protectedRoute';
import { composeMiddleware } from '~/router';
import type { RouteHandler } from '~/router';

/**
 * The chain of a route that needs a signed in account: the token is validated
 * first, and the route runs inside the guard of the rate limit.
 */
export function composeProtectedRoute(
  deps: ServerDependencies,
  handler: RouteHandler,
): RouteHandler {
  return composeMiddleware([createAuthMiddleware(deps.claims)], protectRoute(deps, handler));
}
