import type { PlayerState } from '@creatures/contracts/player';
import { useRef } from 'react';
import { useStore } from 'zustand/react';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import { createApiDeps, requestPlayerState } from '~/shared/api';
import type { PlayerStateResult, TrainerClientErrorCode } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';

const FAILURE_MESSAGE = 'Não foi possível carregar o estado do jogador.';
const NO_TRAINER_MESSAGE = 'Esta conta ainda não tem um treinador ativo.';
const TIMEOUT_MESSAGE = 'O servidor não respondeu a tempo.';
const LOAD_TIMEOUT_MS = 15000;

export type PlayerStateStatus = 'error' | 'idle' | 'loading' | 'ready';

/**
 * The outcome of a load: the player state arrived, the account has no active
 * trainer, or the request failed.
 */
export type PlayerStateLoadResult = 'failed' | 'no-trainer' | 'ready';

export type PlayerStateSnapshot = {
  error: string | null;
  state: PlayerState | null;
  status: PlayerStateStatus;
};

export type PlayerStateActions = {
  applySnapshot(state: PlayerState): void;
  load(): Promise<PlayerStateLoadResult>;
  refresh(): Promise<PlayerStateLoadResult>;
};

export type PlayerStateStoreState = PlayerStateSnapshot & PlayerStateActions;

export type PlayerStateStore = StoreApi<PlayerStateStoreState>;

export type PlayerStateStoreOptions = {
  requestState?: () => Promise<PlayerStateResult>;
  timeoutMs?: number;
};

export type PlayerStateView = {
  applySnapshot: (state: PlayerState) => void;
  error: string | null;
  load: () => Promise<PlayerStateLoadResult>;
  refresh: () => Promise<PlayerStateLoadResult>;
  state: PlayerState | null;
  status: PlayerStateStatus;
};

export function createPlayerStateStore(options: PlayerStateStoreOptions = {}): PlayerStateStore {
  const timeoutMs = options.timeoutMs ?? LOAD_TIMEOUT_MS;
  const requestState = options.requestState ?? buildStateRequester();
  return createStore<PlayerStateStoreState>(buildInitializer(timeoutMs, requestState));
}

function buildStateRequester(): () => Promise<PlayerStateResult> {
  return function requestState(): Promise<PlayerStateResult> {
    return requestPlayerState(createApiDeps(getAccessToken));
  };
}

/**
 * One store per page.
 *
 * The store lives in the page because the player state belongs to the screen
 * of the game: it is loaded when the screen opens and thrown away with it.
 */
export function usePlayerStateStore(): PlayerStateStore {
  const ref = useRef<PlayerStateStore | null>(null);
  if (ref.current === null) {
    ref.current = createPlayerStateStore();
  }
  return ref.current;
}

/**
 * The state of the player, as the screen reads it.
 *
 * The state carries the team, the storage, the backpack, the creature in the
 * field and its abilities, and the wallet and the stamina of the trainer. The
 * signature of the hook does not change: the state is the contract, and the
 * contract grew.
 */
export function usePlayerState(store: PlayerStateStore): PlayerStateView {
  const applySnapshot = useStore(store, selectApplySnapshot);
  const error = useStore(store, selectError);
  const load = useStore(store, selectLoad);
  const refresh = useStore(store, selectRefresh);
  const state = useStore(store, selectState);
  const status = useStore(store, selectStatus);
  return { applySnapshot, error, load, refresh, state, status };
}

function buildInitializer(
  timeoutMs: number,
  requestState: () => Promise<PlayerStateResult>,
): StateCreator<PlayerStateStoreState> {
  return function initialize(set): PlayerStateStoreState {
    return {
      ...buildInitialSnapshot(),
      ...buildActions(set, timeoutMs, requestState),
    };
  };
}

function buildInitialSnapshot(): PlayerStateSnapshot {
  return { error: null, state: null, status: 'idle' };
}

function buildActions(
  set: (partial: Partial<PlayerStateStoreState>) => void,
  timeoutMs: number,
  requestState: () => Promise<PlayerStateResult>,
): PlayerStateActions {
  return {
    applySnapshot: buildApplySnapshot(set),
    load: buildLoader(set, true, timeoutMs, requestState),
    refresh: buildLoader(set, false, timeoutMs, requestState),
  };
}

function buildApplySnapshot(
  set: (partial: Partial<PlayerStateStoreState>) => void,
): (state: PlayerState) => void {
  return function applySnapshot(state: PlayerState): void {
    set({ error: null, state, status: 'ready' });
  };
}

/**
 * The load clears the state it replaces, the refresh keeps it: the game keeps
 * showing the last known state while the server answers.
 *
 * A request that never answers cannot leave the screen loading forever: the
 * guard gives up on it and the screen falls into the state of the lost
 * connection.
 */
function buildLoader(
  set: (partial: Partial<PlayerStateStoreState>) => void,
  clearState: boolean,
  timeoutMs: number,
  requestState: () => Promise<PlayerStateResult>,
): () => Promise<PlayerStateLoadResult> {
  return function load(): Promise<PlayerStateLoadResult> {
    set(
      clearState
        ? { error: null, state: null, status: 'loading' }
        : { error: null, status: 'loading' },
    );
    const guard = buildTimeoutGuard(set, clearState, timeoutMs);
    return requestState().then(
      buildSettledResult(guard, buildResultApplier(set)),
      buildSettledResult(guard, buildUnexpectedFailure(set)),
    );
  };
}

type TimeoutGuard = {
  cancel: () => void;
};

function buildTimeoutGuard(
  set: (partial: Partial<PlayerStateStoreState>) => void,
  clearState: boolean,
  timeoutMs: number,
): TimeoutGuard {
  const timer = setTimeout(function giveUp(): void {
    const partial: Partial<PlayerStateStoreState> = { error: TIMEOUT_MESSAGE, status: 'error' };
    if (clearState) {
      partial.state = null;
    }
    set(partial);
  }, timeoutMs);
  return {
    cancel: function cancel(): void {
      clearTimeout(timer);
    },
  };
}

function buildSettledResult<T>(
  guard: TimeoutGuard,
  apply: (value: T) => PlayerStateLoadResult,
): (value: T) => PlayerStateLoadResult {
  return function settle(value: T): PlayerStateLoadResult {
    guard.cancel();
    return apply(value);
  };
}

function buildResultApplier(
  set: (partial: Partial<PlayerStateStoreState>) => void,
): (result: PlayerStateResult) => PlayerStateLoadResult {
  return function applyResult(result): PlayerStateLoadResult {
    if (result.ok) {
      set({ error: null, state: result.state, status: 'ready' });
      return 'ready';
    }
    return applyFailure(set, result.code);
  };
}

function buildUnexpectedFailure(
  set: (partial: Partial<PlayerStateStoreState>) => void,
): () => PlayerStateLoadResult {
  return function applyUnexpectedFailure(): PlayerStateLoadResult {
    return applyFailure(set, 'unknown');
  };
}

function applyFailure(
  set: (partial: Partial<PlayerStateStoreState>) => void,
  code: TrainerClientErrorCode,
): PlayerStateLoadResult {
  if (code === 'trainer_not_found') {
    set({ error: NO_TRAINER_MESSAGE, state: null, status: 'error' });
    return 'no-trainer';
  }
  set({ error: FAILURE_MESSAGE, status: 'error' });
  return 'failed';
}

function selectApplySnapshot(state: PlayerStateStoreState): PlayerStateActions['applySnapshot'] {
  return state.applySnapshot;
}

function selectError(state: PlayerStateStoreState): string | null {
  return state.error;
}

function selectLoad(state: PlayerStateStoreState): PlayerStateActions['load'] {
  return state.load;
}

function selectRefresh(state: PlayerStateStoreState): PlayerStateActions['refresh'] {
  return state.refresh;
}

function selectState(state: PlayerStateStoreState): PlayerState | null {
  return state.state;
}

function selectStatus(state: PlayerStateStoreState): PlayerStateStatus {
  return state.status;
}
