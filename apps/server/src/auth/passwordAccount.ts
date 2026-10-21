import type { SupabaseClient } from '@supabase/supabase-js';

import type { AuthUser, AuthUserIdentity } from '~/supabase';

const GOOGLE_PROVIDER = 'google';
const PASSWORD_PROVIDER = 'email';
const USERS_PER_PAGE = 100;
const MAX_PAGES = 20;

/**
 * The password account of an e-mail, when there is one.
 *
 * The lookup goes through the list of users because the Auth server has no
 * query by e-mail. The account that is signed in is never returned: the merge
 * needs a *different* account that holds the password.
 */
export function findPasswordAccount(
  admin: SupabaseClient,
  email: string,
  currentUserId: string,
): Promise<AuthUser | null> {
  return listPasswordAccounts(admin).then(function pick(accounts: AuthUser[]): AuthUser | null {
    return findPasswordUser(accounts, email, currentUserId);
  });
}

export function readUser(admin: SupabaseClient, userId: string): Promise<AuthUser | null> {
  return admin.auth.admin.getUserById(userId).then(function read(result: {
    data: { user: AuthUser | null };
    error: unknown;
  }): AuthUser | null {
    if (result.error !== null) {
      return null;
    }
    return result.data.user;
  });
}

export function findIdentity(user: AuthUser, provider: string): AuthUserIdentity | null {
  const identities = user.identities ?? [];
  for (const identity of identities) {
    if (identity.provider === provider) {
      return identity;
    }
  }
  return null;
}

export function isEmailVerified(identity: AuthUserIdentity): boolean {
  const data = identity.identity_data;
  if (data === undefined) {
    return false;
  }
  return data.email_verified === true;
}

export function findGoogleIdentity(user: AuthUser): AuthUserIdentity | null {
  return findIdentity(user, GOOGLE_PROVIDER);
}

function listPasswordAccounts(admin: SupabaseClient): Promise<AuthUser[]> {
  const accounts: AuthUser[] = [];
  return listUserPages(admin, 1).then(function collect(pages: AuthUser[][]): AuthUser[] {
    for (const page of pages) {
      accounts.push(...page);
    }
    return accounts;
  });
}

function listUserPages(admin: SupabaseClient, page: number): Promise<AuthUser[][]> {
  if (page > MAX_PAGES) {
    return Promise.resolve([]);
  }
  return admin.auth.admin
    .listUsers({ page, perPage: USERS_PER_PAGE })
    .then(function readPage(result: {
      data: { users: AuthUser[] };
      error: { message: string } | null;
    }): AuthUser[][] | Promise<AuthUser[][]> {
      if (result.error !== null) {
        throw new Error(`Auth user listing failed: ${result.error.message}`);
      }
      const users = result.data.users;
      if (users.length < USERS_PER_PAGE) {
        return [users];
      }
      return listUserPages(admin, page + 1).then(function append(
        nextPages: AuthUser[][],
      ): AuthUser[][] {
        return [users, ...nextPages];
      });
    });
}

function findPasswordUser(
  users: AuthUser[],
  email: string,
  currentUserId: string,
): AuthUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  for (const user of users) {
    if (user.id === currentUserId) {
      continue;
    }
    if ((user.email ?? '').toLowerCase() !== normalizedEmail) {
      continue;
    }
    if (findIdentity(user, PASSWORD_PROVIDER) !== null) {
      return user;
    }
  }
  return null;
}
