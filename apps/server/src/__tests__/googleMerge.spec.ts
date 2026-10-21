import { expect, test } from 'bun:test';

import type { SupabaseClient } from '@supabase/supabase-js';

import {
  BAD_REQUEST,
  OK,
  USER_ID,
  USER_TOKEN,
  buildDependencies,
  buildHandler,
  buildJsonRequest,
  readError,
  readJson,
  send,
} from './support';

const GOOGLE_MERGE_PATH = '/api/auth/google-merge';
const PLAYER_EMAIL = 'player@example.com';
const VICTIM_EMAIL = 'victim@example.com';
const PASSWORD_USER_ID = 'password-user';
const VICTIM_USER_ID = 'victim-user';

type StubUser = {
  email: string;
  id: string;
  identities: {
    identity_data: { email_verified: boolean };
    provider: string;
  }[];
};

type StubState = {
  deleted: string[];
  transfers: { owner_id: string }[];
};

type TrainerTable = {
  update: (values: { owner_id: string }) => { eq: () => Promise<unknown> };
};

function buildSignedUser(provider: string): StubUser {
  return {
    email: PLAYER_EMAIL,
    id: USER_ID,
    identities: [{ identity_data: { email_verified: true }, provider }],
  };
}

function buildPasswordUser(): StubUser {
  return {
    email: PLAYER_EMAIL,
    id: PASSWORD_USER_ID,
    identities: [{ identity_data: { email_verified: false }, provider: 'email' }],
  };
}

function buildVictimUser(): StubUser {
  return {
    email: VICTIM_EMAIL,
    id: VICTIM_USER_ID,
    identities: [{ identity_data: { email_verified: false }, provider: 'email' }],
  };
}

function findUser(users: StubUser[], id: string): StubUser | null {
  for (const user of users) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
}

function readUserById(users: StubUser[], id: string): Promise<unknown> {
  return Promise.resolve({ data: { user: findUser(users, id) }, error: null });
}

function listStubUsers(users: StubUser[]): Promise<unknown> {
  return Promise.resolve({ data: { users }, error: null });
}

function deleteStubUser(state: StubState, id: string): Promise<unknown> {
  state.deleted.push(id);
  return Promise.resolve({ error: null });
}

function updateStubTrainers(
  state: StubState,
  values: { owner_id: string },
): { eq: () => Promise<unknown> } {
  state.transfers.push(values);
  return { eq: buildEmptyQuery };
}

function buildEmptyQuery(): Promise<unknown> {
  return Promise.resolve({ data: [], error: null });
}

function buildTrainerTable(state: StubState): TrainerTable {
  return { update: updateStubTrainers.bind(null, state) };
}

function buildAdminStub(provider = 'google'): { admin: SupabaseClient; state: StubState } {
  const state: StubState = { deleted: [], transfers: [] };
  const users = [buildSignedUser(provider), buildPasswordUser(), buildVictimUser()];
  const admin = {
    auth: {
      admin: {
        deleteUser: deleteStubUser.bind(null, state),
        getUserById: readUserById.bind(null, users),
        listUsers: listStubUsers.bind(null, users),
      },
    },
    from: buildTrainerTable.bind(null, state),
  };
  return { admin: admin as unknown as SupabaseClient, state };
}

function buildMergeHandler(provider = 'google'): {
  handler: ReturnType<typeof buildHandler>;
  state: StubState;
} {
  const stub = buildAdminStub(provider);
  const deps = buildDependencies();
  deps.admin = stub.admin;
  return { handler: buildHandler(deps), state: stub.state };
}

/**
 * The e-mail that comes in the body is never the e-mail of the search: a
 * Google user that asks for the merge with the e-mail of somebody else is
 * refused, and no account is touched.
 */
function aDivergentEmailIsRefused(): Promise<void> {
  const { handler, state } = buildMergeHandler();
  const request = buildJsonRequest('POST', GOOGLE_MERGE_PATH, { email: VICTIM_EMAIL }, USER_TOKEN);
  return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
    expect(response.status).toBe(BAD_REQUEST);
    return readError(response).then(function assertCode(error: { error: string }): void {
      expect(error.error).toBe('invalid_email');
      expect(state.deleted).toEqual([]);
      expect(state.transfers).toEqual([]);
    });
  });
}

/**
 * The search uses the e-mail of the identity: the account of the password that
 * matches it is the one that is merged.
 */
function theIdentityEmailIsTheOneOfTheSearch(): Promise<void> {
  const { handler, state } = buildMergeHandler();
  const request = buildJsonRequest('POST', GOOGLE_MERGE_PATH, {}, USER_TOKEN);
  return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
    expect(response.status).toBe(OK);
    return readJson(response).then(function assertMerged(body: unknown): void {
      expect(body).toEqual({ merged: true, userId: USER_ID });
      expect(state.deleted).toEqual([PASSWORD_USER_ID]);
      expect(state.transfers).toEqual([{ owner_id: USER_ID }]);
    });
  });
}

function theSameEmailOfTheIdentityIsAccepted(): Promise<void> {
  const { handler, state } = buildMergeHandler();
  const request = buildJsonRequest('POST', GOOGLE_MERGE_PATH, { email: PLAYER_EMAIL }, USER_TOKEN);
  return send(handler, request).then(function assertStatus(response: Response): void {
    expect(response.status).toBe(OK);
    expect(state.deleted).toEqual([PASSWORD_USER_ID]);
  });
}

/**
 * The e-mail of the body is checked before anything else: the answer does not
 * depend on the way the account signed in.
 */
function aDivergentEmailIsRefusedForEveryAccount(): Promise<void> {
  const { handler, state } = buildMergeHandler('email');
  const request = buildJsonRequest('POST', GOOGLE_MERGE_PATH, { email: VICTIM_EMAIL }, USER_TOKEN);
  return send(handler, request).then(function assertStatus(response: Response): Promise<void> {
    expect(response.status).toBe(BAD_REQUEST);
    return readError(response).then(function assertCode(error: { error: string }): void {
      expect(error.error).toBe('invalid_email');
      expect(state.deleted).toEqual([]);
    });
  });
}

test('the merge refuses an e-mail that is not the one of the identity', aDivergentEmailIsRefused);
test(
  'the merge refuses the divergent e-mail of an account that did not sign in with Google',
  aDivergentEmailIsRefusedForEveryAccount,
);
test(
  'the merge looks for the account of the e-mail of the identity',
  theIdentityEmailIsTheOneOfTheSearch,
);
test('the merge accepts the e-mail of the identity', theSameEmailOfTheIdentityIsAccepted);
