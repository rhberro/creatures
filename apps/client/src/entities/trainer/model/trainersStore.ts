import type { NewTrainerInput, Trainer } from '@creatures/contracts/trainer';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import { createApiDeps } from '~/shared/api';
import type {
  DeleteTrainerResult,
  TrainerClientErrorCode,
  TrainerCreateResult,
  TrainerUpdateInput,
  TrainerUpdateResult,
} from '~/shared/api';
import { getAccessToken } from '~/shared/auth';

import { createTrainersController } from './trainersController';
import type { TrainersController, TrainersSnapshot } from './trainersController';

export type TrainersStoreState = TrainersSnapshot & {
  create(input: NewTrainerInput): Promise<TrainerCreateResult>;
  refresh(): Promise<void>;
  remove(id: string): Promise<DeleteTrainerResult>;
  reset(): void;
  update(id: string, input: TrainerUpdateInput): Promise<TrainerUpdateResult>;
};

export type TrainersStore = StoreApi<TrainersStoreState>;

/**
 * The store of the trainers of the account.
 *
 * The controller holds the rule and the snapshot; the store holds the
 * snapshot the screens read. There is a single store for the whole client:
 * two screens that show trainers see the same list, and one of them loading
 * the list is enough.
 */
export function createTrainersStore(controller: TrainersController): TrainersStore {
  const store = createStore<TrainersStoreState>(buildInitializer(controller));
  controller.subscribe(function syncSnapshot(): void {
    store.setState(controller.getSnapshot());
  });
  return store;
}

function buildInitializer(controller: TrainersController): StateCreator<TrainersStoreState> {
  return function initialize(): TrainersStoreState {
    return {
      ...controller.getSnapshot(),
      ...buildActions(controller),
    };
  };
}

export function getTrainersStore(): TrainersStore {
  if (store !== null) {
    return store;
  }
  store = createTrainersStore(createTrainersController(createApiDeps(getAccessToken)));
  return store;
}

export function selectTrainers(state: TrainersStoreState): Trainer[] {
  return state.trainers;
}

export function selectIsLoading(state: TrainersStoreState): boolean {
  return state.isLoading;
}

export function selectError(state: TrainersStoreState): TrainerClientErrorCode | null {
  return state.error;
}

export function selectCreate(state: TrainersStoreState): TrainersStoreState['create'] {
  return state.create;
}

export function selectRefresh(state: TrainersStoreState): TrainersStoreState['refresh'] {
  return state.refresh;
}

export function selectRemove(state: TrainersStoreState): TrainersStoreState['remove'] {
  return state.remove;
}

export function selectUpdate(state: TrainersStoreState): TrainersStoreState['update'] {
  return state.update;
}

let store: TrainersStore | null = null;

function buildActions(controller: TrainersController): TrainersStoreActions {
  return {
    create: buildCreateAction(controller),
    refresh: buildRefreshAction(controller),
    remove: buildRemoveAction(controller),
    reset: buildResetAction(controller),
    update: buildUpdateAction(controller),
  };
}

type TrainersStoreActions = Pick<
  TrainersStoreState,
  'create' | 'refresh' | 'remove' | 'reset' | 'update'
>;

function buildCreateAction(
  controller: TrainersController,
): (input: NewTrainerInput) => Promise<TrainerCreateResult> {
  return function create(input): Promise<TrainerCreateResult> {
    return controller.create(input);
  };
}

/**
 * Two screens can ask for the list at the same time. The second one waits
 * for the request that is already running instead of starting another one.
 */
function buildRefreshAction(controller: TrainersController): () => Promise<void> {
  let pending: Promise<void> | null = null;
  return function refresh(): Promise<void> {
    if (pending !== null) {
      return pending;
    }
    const request = controller.refresh().finally(function releaseRequest(): void {
      pending = null;
    });
    pending = request;
    return request;
  };
}

function buildRemoveAction(
  controller: TrainersController,
): (id: string) => Promise<DeleteTrainerResult> {
  return function remove(id): Promise<DeleteTrainerResult> {
    return controller.remove(id);
  };
}

function buildResetAction(controller: TrainersController): () => void {
  return function reset(): void {
    controller.reset();
  };
}

function buildUpdateAction(
  controller: TrainersController,
): (id: string, input: TrainerUpdateInput) => Promise<TrainerUpdateResult> {
  return function update(id, input): Promise<TrainerUpdateResult> {
    return controller.update(id, input);
  };
}
