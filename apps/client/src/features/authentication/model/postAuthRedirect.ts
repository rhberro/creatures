import { createApiDeps, requestTrainerList } from '~/shared/api';
import type { GoogleMergeResult, TrainerListResult } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';
import type { AuthUser } from '~/shared/auth';

import { createGoogleMergeRequest, mergeGoogleAccount } from './googleMerge';

const TRAINERS_PATH = '/trainers';
const NEW_TRAINER_PATH = '/trainers/new';

export type PostAuthDeps = {
  decideDestination(): Promise<string>;
  requestGoogleMerge(email: string): Promise<GoogleMergeResult>;
};

export type PostAuthResolution = {
  destination: string;
  merge: GoogleMergeResult;
};

/**
 * Where the player goes after an authentication.
 *
 * An account without a trainer goes to the screen that creates one; an
 * account with trainers goes to the list.
 */
export function decideDestinationAfterAuth(): Promise<string> {
  return requestTrainerList(createApiDeps(getAccessToken)).then(
    readDestination,
    readFallbackDestination,
  );
}

/**
 * The dependencies of the post-authentication resolution.
 */
export function createPostAuthDeps(): PostAuthDeps {
  return {
    decideDestination: decideDestinationAfterAuth,
    requestGoogleMerge: createGoogleMergeRequest(),
  };
}

/**
 * Where the player goes after an authentication that came from outside.
 *
 * The merge comes first, on purpose: it moves the trainers of the password
 * account to the Google account, and the destination reads the list of
 * trainers. Deciding before the merge would send a player that had trainers
 * to the screen that creates one.
 *
 * A merge that fails does not keep the player out of the game: the session is
 * already valid, so the resolution goes on and only carries the reason of the
 * failure.
 */
export function resolvePostAuth(
  user: AuthUser | null,
  deps: PostAuthDeps,
): Promise<PostAuthResolution> {
  return mergeGoogleAccount(user, deps.requestGoogleMerge).then(function decide(
    merge: GoogleMergeResult,
  ): Promise<PostAuthResolution> {
    return deps.decideDestination().then(function resolve(destination: string): PostAuthResolution {
      return { destination, merge };
    });
  });
}

function readDestination(result: TrainerListResult): string {
  if (!result.ok) {
    return readFallbackDestination();
  }
  return result.trainers.length === 0 ? NEW_TRAINER_PATH : TRAINERS_PATH;
}

/**
 * The fallback of a list that could not be read.
 *
 * The list of trainers is the screen that shows the error of a failed
 * request, so the player lands there and sees what happened. It does not
 * loop: the screen does not redirect back to the authentication.
 */
function readFallbackDestination(): string {
  return TRAINERS_PATH;
}
