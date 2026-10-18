import type { Middleware, RequestContext } from '~/router';
import { errorResponse } from '~/router';
import type { ClaimsReader } from '~/supabase';

const BEARER_PREFIX = 'Bearer ';
const UNAUTHENTICATED_ERROR = 'unauthenticated';
const UNAUTHENTICATED_MESSAGE = 'Token inválido ou ausente.';

export function createAuthMiddleware(claims: ClaimsReader): Middleware {
  return function authenticate(req, ctx): Promise<Response | null> {
    const token = readBearerToken(req);
    if (token === null) {
      return Promise.resolve(unauthenticatedResponse());
    }
    return claims.readUserId(token).then(buildUserAttachment(ctx));
  };
}

function buildUserAttachment(ctx: RequestContext): (userId: string | null) => Response | null {
  return function attachUser(userId: string | null): Response | null {
    if (userId === null) {
      return unauthenticatedResponse();
    }
    ctx.userId = userId;
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
  return errorResponse(401, UNAUTHENTICATED_ERROR, UNAUTHENTICATED_MESSAGE);
}
