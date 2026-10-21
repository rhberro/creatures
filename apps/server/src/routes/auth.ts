import type { SupabaseClient } from '@supabase/supabase-js';

import {
  findGoogleIdentity,
  findPasswordAccount,
  isEmailVerified,
  readUser,
} from '~/auth/passwordAccount';
import type { ServerDependencies } from '~/dependencies';
import { logRouteEvent } from '~/logging/routeLog';
import { defineRoute, errorResponse, jsonResponse } from '~/router';
import type { RequestContext, Route, RouteHandler } from '~/router';
import { composeProtectedRoute } from '~/routes/routeChain';
import type { AuthUser } from '~/supabase';

const GOOGLE_MERGE_PATH = '/api/auth/google-merge';
const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const CONFLICT = 409;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

type MergeStep = Response | GoogleSession;

type GoogleSession = {
  email: string;
  userId: string;
};

/**
 * The e-mail the client sent, when it sent one.
 *
 * It is not trusted: the merge always looks for the password account of the
 * e-mail that belongs to the signed in identity. The value sent by the client
 * is only checked against it, so a wrong one is refused instead of silently
 * moving someone else's account.
 */
type RequestedEmail = string | null;

type PasswordAccount = {
  email: string;
  passwordUserId: string;
};

export function createAuthRoutes(deps: ServerDependencies): Route[] {
  return [
    defineRoute('POST', GOOGLE_MERGE_PATH, composeProtectedRoute(deps, handleGoogleMerge(deps))),
  ];
}

function handleGoogleMerge(deps: ServerDependencies): RouteHandler {
  return function mergeGoogleAccount(
    req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const userId = ctx.userId;
    if (userId === null) {
      return Promise.resolve(unauthenticatedResponse());
    }
    return readJsonBody(req)
      .then(readEmail)
      .then(checkIdentity(deps, userId))
      .then(readPasswordAccount(deps, userId))
      .then(mergeAccounts(deps, userId))
      .then(function toResponse(result: Response | { userId: string }): Response {
        if (result instanceof globalThis.Response) {
          return result;
        }
        logRouteEvent(deps.logger, ctx, 'google account merged', { userId: result.userId });
        return jsonResponse({ merged: true, userId: result.userId }, OK);
      });
  };
}

/**
 * The password account is discarded: its trainers move to the account that is
 * signed in through Google, the password identity disappears with the deleted
 * user and every session of the old account ends with it.
 */
function mergeAccounts(
  deps: ServerDependencies,
  currentUserId: string,
): (
  passwordAccount: Response | PasswordAccount,
) => Response | Promise<Response | { userId: string }> {
  return function merge(
    passwordAccount: Response | PasswordAccount,
  ): Response | Promise<Response | { userId: string }> {
    if (passwordAccount instanceof globalThis.Response) {
      return passwordAccount;
    }
    return transferTrainers(deps.admin, passwordAccount.passwordUserId, currentUserId).then(
      function remove(removed: boolean): Response | { userId: string } {
        if (!removed) {
          return errorResponse(
            500,
            'internal_error',
            'Não foi possível concluir a fusão das contas.',
          );
        }
        return { userId: currentUserId };
      },
    );
  };
}

function transferTrainers(
  admin: SupabaseClient,
  passwordUserId: string,
  currentUserId: string,
): Promise<boolean> {
  const ownership = { owner_id: currentUserId };
  const transfer = admin.from('trainers').update(ownership).eq('owner_id', passwordUserId);
  return Promise.resolve(
    transfer.then(function removePasswordAccount(): Promise<boolean> {
      return admin.auth.admin.deleteUser(passwordUserId).then(readRemoval);
    }),
  );
}

function readRemoval(result: { error: { message: string } | null }): boolean {
  if (result.error !== null) {
    throw new Error(`Password account removal failed: ${result.error.message}`);
  }
  return true;
}

function checkIdentity(
  deps: ServerDependencies,
  userId: string,
): (email: RequestedEmail | Response) => MergeStep | Promise<MergeStep> {
  return function check(email: RequestedEmail | Response): MergeStep | Promise<MergeStep> {
    if (email instanceof globalThis.Response) {
      return email;
    }
    return readUser(deps.admin, userId).then(function verifyIdentity(
      user: AuthUser | null,
    ): MergeStep {
      if (user === null) {
        return unauthenticatedResponse();
      }
      const ownEmail = (user.email ?? '').trim().toLowerCase();
      if (!EMAIL_PATTERN.test(ownEmail)) {
        return invalidEmailResponse();
      }
      // The e-mail of the body is only a conference: the search of the
      // password account always uses the e-mail of the identity. A different
      // e-mail is refused instead of merging somebody else's account.
      if (email !== null && email !== ownEmail) {
        return errorResponse(
          BAD_REQUEST,
          'invalid_email',
          'O e-mail enviado não é o da conta autenticada.',
        );
      }
      const googleIdentity = findGoogleIdentity(user);
      if (googleIdentity === null) {
        return errorResponse(
          CONFLICT,
          'not_google_account',
          'A conta atual não entrou pelo Google.',
        );
      }
      if (!isEmailVerified(googleIdentity)) {
        return errorResponse(
          CONFLICT,
          'email_unverified',
          'O e-mail do Google não está verificado.',
        );
      }
      return { email: ownEmail, userId };
    });
  };
}

function readPasswordAccount(
  deps: ServerDependencies,
  currentUserId: string,
): (session: MergeStep) => Response | Promise<Response | PasswordAccount> {
  return function search(session: MergeStep): Response | Promise<Response | PasswordAccount> {
    if (session instanceof globalThis.Response) {
      return session;
    }
    return findPasswordAccount(deps.admin, session.email, currentUserId).then(function pick(
      found: AuthUser | null,
    ): Response | PasswordAccount {
      if (found === null) {
        return errorResponse(
          CONFLICT,
          'no_password_account',
          'Não existe conta de e-mail e senha com esse e-mail.',
        );
      }
      return { email: session.email, passwordUserId: found.id };
    });
  };
}

function readJsonBody(req: Request): Promise<unknown> {
  return req.json().then(readBody, readMissingBody);
}

function readBody(value: unknown): unknown {
  return value;
}

function readMissingBody(): null {
  return null;
}

function readEmail(body: unknown): RequestedEmail | Response {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const email = (body as { email?: unknown }).email;
  if (email === undefined || email === null) {
    return null;
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    return invalidEmailResponse();
  }
  return email.trim().toLowerCase();
}

function invalidEmailResponse(): Response {
  return errorResponse(BAD_REQUEST, 'invalid_email', 'E-mail inválido.');
}

function unauthenticatedResponse(): Response {
  return errorResponse(UNAUTHORIZED, 'unauthenticated', 'Token inválido ou ausente.');
}
