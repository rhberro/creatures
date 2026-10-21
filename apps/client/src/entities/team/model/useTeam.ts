import type { PlayerState } from '@creatures/contracts/player';
import { useCallback, useEffect, useMemo } from 'react';

import {
  requestAddToTeam,
  requestRemoveFromTeam,
  requestReorderTeam,
} from '~/entities/team/api/team';
import { isTeamErrorCode } from '~/entities/team/model/team.errors';
import { readTeamErrorMessage } from '~/entities/team/model/team.messages';
import type {
  TeamCommand,
  TeamCommandResult,
  TeamErrorCode,
  TeamRoster,
  TeamView,
} from '~/entities/team/model/team.types';
import { applyCommands } from '~/entities/team/model/teamPrediction';
import { readRoster } from '~/entities/team/model/teamRoster';
import { teamStore, useTeamState } from '~/entities/team/model/teamStore';
import type { TeamStoreState } from '~/entities/team/model/teamStore';
import type { ApiDeps, PlayerStateResult } from '~/shared/api';
import { createApiDeps, requestPlayerState } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';

/**
 * How long the client waits for the state of the server before asking for it
 * again over REST.
 *
 * The channel of the game is the normal path: the server pushes the state it
 * changed. The request over REST is the reserve of the moments in which the
 * channel is not there — and it only happens when the push did not arrive.
 */
const FALLBACK_REFRESH_DELAY_MS = 600;

/**
 * How long a local change waits for the confirmation of the server.
 *
 * A change that is never confirmed is a change the server did not accept: the
 * client goes back to the state it has.
 */
const PENDING_EXPIRY_MS = 8000;

/**
 * The team of the player, as the game screens read it.
 *
 * The team is the state of the server plus the change the client predicts: the
 * creature enters the team in the same instant of the click, and the state the
 * server pushes takes the place of the prediction when it arrives. The read
 * over REST only happens when the channel of the game is not there.
 *
 * `enabled` keeps the read from running while the screen is closed, and the
 * optional `deps` lets a test point the transport somewhere else.
 */
export function useTeam(deps?: ApiDeps, enabled = true): TeamView {
  const resolvedDeps = useTeamDeps(deps);
  const commands = useTeamState(selectCommands);
  const error = useTeamState(selectError);
  const isLoading = useTeamState(selectIsLoading);
  const isPushed = useTeamState(selectIsPushed);
  const state = useTeamState(selectState);
  const roster = useMemo(
    function predict(): TeamRoster {
      return applyCommands(readRoster(state), commands);
    },
    [commands, state],
  );
  useTeamRead(resolvedDeps, enabled);
  useTeamFallback(resolvedDeps, commands, isPushed);
  useTeamExpiry(commands);
  const teamCommands = useTeamCommands(resolvedDeps);
  return {
    activeCreatureId: state?.activeCreatureId ?? null,
    addToTeam: teamCommands.addToTeam,
    backpack: state?.backpack ?? [],
    error: readTeamErrorMessage(error),
    isLoading,
    removeFromTeam: teamCommands.removeFromTeam,
    reorderTeam: teamCommands.reorderTeam,
    storage: roster.storage,
    team: roster.team,
  };
}

/**
 * The read of the state of the server.
 *
 * The read happens when the screen opens and the state was never read. The
 * screen that opens again finds the state it had, and the read that follows
 * only refreshes it — without the loading, because the screen already shows
 * the team.
 */
function useTeamRead(deps: ApiDeps, enabled: boolean): void {
  useEffect(
    function read(): void {
      if (!enabled) {
        return;
      }
      const store = teamStore.getState();
      store.clearError();
      if (!store.isLoaded) {
        store.setLoading(true);
        readState(deps);
        return;
      }
      if (!store.isPushed) {
        readState(deps);
      }
    },
    [deps, enabled],
  );
}

/**
 * The reserve of the state: the request over REST when the push does not come.
 *
 * The read never turns on the loading: the change the client predicted is
 * already on the screen, and the read only confirms it.
 */
function useTeamFallback(deps: ApiDeps, commands: TeamCommand[], isPushed: boolean): void {
  useEffect(
    function schedule(): () => void {
      if (commands.length === 0 || isPushed) {
        return noop;
      }
      const timer = setTimeout(function askForState(): void {
        readState(deps);
      }, FALLBACK_REFRESH_DELAY_MS);
      return function cancel(): void {
        clearTimeout(timer);
      };
    },
    [commands, deps, isPushed],
  );
}

/**
 * A change that the server never confirms is a change the server refused.
 */
function useTeamExpiry(commands: TeamCommand[]): void {
  useEffect(
    function schedule(): () => void {
      if (commands.length === 0) {
        return noop;
      }
      const timer = setTimeout(function expire(): void {
        teamStore.getState().clearCommands();
      }, PENDING_EXPIRY_MS);
      return function cancel(): void {
        clearTimeout(timer);
      };
    },
    [commands],
  );
}

type TeamCommands = {
  addToTeam(creatureId: string): Promise<void>;
  removeFromTeam(creatureId: string): Promise<void>;
  reorderTeam(order: string[]): Promise<void>;
};

/**
 * The three commands that change the team.
 *
 * Every one of them predicts the change in the same instant of the click and
 * sends the command to the server. The prediction is what the screen shows
 * while the command is on its way; the state the server pushes is what the
 * screen shows after.
 */
function useTeamCommands(deps: ApiDeps): TeamCommands {
  const addToTeam = useCallback(
    function addToTeam(creatureId: string): Promise<void> {
      const command: TeamCommand = { creatureId, kind: 'add' };
      teamStore.getState().addCommand(command);
      return requestAddToTeam(deps, creatureId).then(handleCommandResult(command));
    },
    [deps],
  );

  const removeFromTeam = useCallback(
    function removeFromTeam(creatureId: string): Promise<void> {
      const command: TeamCommand = { creatureId, kind: 'remove' };
      teamStore.getState().addCommand(command);
      return requestRemoveFromTeam(deps, creatureId).then(handleCommandResult(command));
    },
    [deps],
  );

  const reorderTeam = useCallback(
    function reorderTeam(order: string[]): Promise<void> {
      const command: TeamCommand = { kind: 'reorder', order };
      teamStore.getState().addCommand(command);
      return requestReorderTeam(deps, order).then(handleCommandResult(command));
    },
    [deps],
  );

  return { addToTeam, removeFromTeam, reorderTeam };
}

/**
 * The refusal of the server takes the prediction back.
 *
 * The change leaves the list of the changes that are on their way and the team
 * of the server shows again. The message of the refusal goes to the screen.
 */
function handleCommandResult(command: TeamCommand): (result: TeamCommandResult) => void {
  return function handleResult(result: TeamCommandResult): void {
    if (result.ok) {
      return;
    }
    const store = teamStore.getState();
    store.removeCommand(command);
    store.setError(result.code);
  };
}

/**
 * The read of the state of the server over REST.
 *
 * The read is silent: the loading belongs to the first read, when the screen
 * has nothing to show yet.
 */
function readState(deps: ApiDeps): void {
  requestPlayerState(deps).then(handleReadResult);
}

function handleReadResult(result: PlayerStateResult): void {
  const store = teamStore.getState();
  if (result.ok) {
    store.applyRestState(result.state);
    return;
  }
  store.setLoading(false);
  store.setError(readTeamErrorCode(result.code));
}

/**
 * One deps object for the life of the hook.
 *
 * The deps hold the base URL and the token reader, neither of which changes:
 * building a new object every render would rebuild the effect every render.
 */
function useTeamDeps(deps?: ApiDeps): ApiDeps {
  const fallback = useMemo(function buildFallback(): ApiDeps {
    return createApiDeps(getAccessToken);
  }, []);
  return deps ?? fallback;
}

function readTeamErrorCode(code: string): TeamErrorCode {
  return isTeamErrorCode(code) ? code : 'unknown';
}

function selectCommands(state: TeamStoreState): TeamCommand[] {
  return state.commands;
}

function selectError(state: TeamStoreState): TeamErrorCode | null {
  return state.error;
}

function selectIsLoading(state: TeamStoreState): boolean {
  return state.isLoading;
}

function selectIsPushed(state: TeamStoreState): boolean {
  return state.isPushed;
}

function selectState(state: TeamStoreState): PlayerState | null {
  return state.state;
}

function noop(): void {
  void 0;
}
