import type { PlayerState } from '@creatures/contracts/player';
import { useEffect } from 'react';

import { isTriggerConfirmed, matchesPending } from './skillPanelPrediction';
import type { PendingLoadout } from './skillPanelPrediction';
import { readPendingLoadout } from './skillPanelQueue';
import { skillPanelStore } from './skillPanelStore';

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
 * The reconciliation of the local change with the state of the server.
 *
 * The push of the server is the truth: when the state it carries is the
 * change the client predicted, the prediction has nothing left to say. The
 * request over REST is the reserve of the moments in which the push does not
 * come.
 */
export function useSkillPanelReconciliation(
  state: PlayerState | null,
  pending: PendingLoadout | null,
  refresh: () => void,
): void {
  useReconciliation(state);
  useFallbackRefresh(pending, refresh);
  usePendingExpiry(pending);
  useResetOnUnmount();
}

/**
 * The state of the server confirms — or undoes — the change of the client.
 *
 * The prediction of the last command is the one that carries the changes of
 * all of them: it is the loadout the server ends up with when every command
 * lands.
 */
function useReconciliation(state: PlayerState | null): void {
  useEffect(
    function reconcile(): void {
      const current = readPendingLoadout(skillPanelStore.getState().commands);
      if (current !== null && matchesPending(state, current)) {
        skillPanelStore.getState().clearCommands();
      }
      const override = skillPanelStore.getState().triggerOverride;
      if (override !== null && isTriggerConfirmed(state, override.slot, override.percent)) {
        skillPanelStore.getState().clearTriggerOverride();
      }
    },
    [state],
  );
}

/**
 * The reserve of the state: the request over REST when the push does not come.
 */
function useFallbackRefresh(pending: PendingLoadout | null, refresh: () => void): void {
  useEffect(
    function schedule(): () => void {
      if (pending === null) {
        return noop;
      }
      const timer = setTimeout(function askForState(): void {
        refresh();
      }, FALLBACK_REFRESH_DELAY_MS);
      return function cancel(): void {
        clearTimeout(timer);
      };
    },
    [pending, refresh],
  );
}

/**
 * A change that the server never confirms is a change the server refused.
 */
function usePendingExpiry(pending: PendingLoadout | null): void {
  useEffect(
    function schedule(): () => void {
      if (pending === null) {
        return noop;
      }
      const timer = setTimeout(function expire(): void {
        skillPanelStore.getState().clearCommands();
      }, PENDING_EXPIRY_MS);
      return function cancel(): void {
        clearTimeout(timer);
      };
    },
    [pending],
  );
}

/**
 * The panels belong to the screen of the game: leaving it closes them.
 */
function useResetOnUnmount(): void {
  useEffect(function reset(): () => void {
    return function onUnmount(): void {
      skillPanelStore.getState().reset();
    };
  }, []);
}

function noop(): void {
  void 0;
}
