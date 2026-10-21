import { expect, test } from 'bun:test';

import { resolvePostAuth } from '~/features/authentication/model/postAuthRedirect';
import type { PostAuthDeps } from '~/features/authentication/model/postAuthRedirect';
import type { GoogleMergeResult } from '~/shared/api';
import type { AuthUser } from '~/shared/auth';

const GOOGLE_USER: AuthUser = { email: 'player@example.com', id: 'user-1', provider: 'google' };
const EMAIL_USER: AuthUser = { email: 'player@example.com', id: 'user-1', provider: 'email' };
const GOOGLE_USER_WITHOUT_EMAIL: AuthUser = {
  email: null,
  id: 'user-1',
  provider: 'google',
};
const DESTINATION = '/trainers';

type Fixture = {
  calls: string[];
  deps: PostAuthDeps;
};

function buildFixture(merge: GoogleMergeResult): Fixture {
  const calls: string[] = [];
  const deps: PostAuthDeps = {
    decideDestination: function decideDestination(): Promise<string> {
      calls.push('destination');
      return Promise.resolve(DESTINATION);
    },
    requestGoogleMerge: function requestGoogleMerge(_email: string): Promise<GoogleMergeResult> {
      calls.push('merge');
      return Promise.resolve(merge);
    },
  };
  return { calls, deps };
}

function theMergeRunsBeforeTheDestination(): Promise<void> {
  const fixture = buildFixture({ merged: true, ok: true });
  return resolvePostAuth(GOOGLE_USER, fixture.deps).then(function assertOrder(result): void {
    expect(fixture.calls).toEqual(['merge', 'destination']);
    expect(result.destination).toBe(DESTINATION);
    expect(result.merge).toEqual({ merged: true, ok: true });
  });
}

function aFailedMergeDoesNotKeepThePlayerOut(): Promise<void> {
  const fixture = buildFixture({ code: 'email_unverified', ok: false });
  return resolvePostAuth(GOOGLE_USER, fixture.deps).then(function assertEntry(result): void {
    expect(fixture.calls).toEqual(['merge', 'destination']);
    expect(result.destination).toBe(DESTINATION);
    expect(result.merge.ok).toBe(false);
  });
}

function aSessionThatIsNotGoogleDoesNotMerge(): Promise<void> {
  const fixture = buildFixture({ merged: false, ok: true });
  return resolvePostAuth(EMAIL_USER, fixture.deps).then(function assertNoMerge(result): void {
    expect(fixture.calls).toEqual(['destination']);
    expect(result.destination).toBe(DESTINATION);
  });
}

function aGoogleSessionWithoutAnEmailDoesNotMerge(): Promise<void> {
  const fixture = buildFixture({ merged: false, ok: true });
  return resolvePostAuth(GOOGLE_USER_WITHOUT_EMAIL, fixture.deps).then(
    function assertNoMerge(result): void {
      expect(fixture.calls).toEqual(['destination']);
      expect(result.destination).toBe(DESTINATION);
    },
  );
}

test('the merge runs before the destination is decided', theMergeRunsBeforeTheDestination);
test('a failed merge does not keep the player out', aFailedMergeDoesNotKeepThePlayerOut);
test('a session that is not google does not merge', aSessionThatIsNotGoogleDoesNotMerge);
test('a google session without an e-mail does not merge', aGoogleSessionWithoutAnEmailDoesNotMerge);
