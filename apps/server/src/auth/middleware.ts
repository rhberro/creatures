import type { Middleware, RequestContext } from '~/router';
import { errorResponse } from '~/router';
import type { AuthClaims, ClaimsReader } from '~/supabase';

const BEARER_PREFIX = 'Bearer ';
const UNAUTHORIZED_ERROR = 'unauthenticated';
const UNAUTHORIZED_MESSAGE = 'Token inválido ou ausente.';

export function createAuthMiddleware(claims: ClaimsReader): Middleware {
  return function authenticate(req, ctx): Promise<Response | null> {
    const token = readBearerToken(req);
    if (token === null) {
      return Promise.resolve(unauthenticatedResponse());
    }
    return claims.readClaims(token).then(buildIdentityAttachment(ctx));
  };
}

function buildIdentityAttachment(
  ctx: RequestContext,
): (claims: AuthClaims | null) => Response | null {
  return function attachIdentity(claims: AuthClaims | null): Response | null {
    if (claims === null) {
      return unauthenticatedResponse();
    }
    ctx.userId = claims.userId;
    ctx.email = claims.email;
    return null;
  };
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (header === null || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = header.slice(BEARER_PREFIX.length).trim();
  return token === '' ? null : token;
}

function unauthenticatedResponse(): Response {
  return errorResponse(401, UNAUTHORIZED_ERROR, UNAUTHORIZED_MESSAGE);
}
