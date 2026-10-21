import type { NewTrainerInput, Trainer } from '@creatures/contracts/trainer';
import { useEffect } from 'react';
import { useStore } from 'zustand/react';

import type {
  DeleteTrainerResult,
  TrainerClientErrorCode,
  TrainerCreateResult,
  TrainerUpdateInput,
  TrainerUpdateResult,
} from '~/shared/api';
import { useAuth } from '~/shared/auth';

import {
  getTrainersStore,
  selectCreate,
  selectError,
  selectIsLoading,
  selectRefresh,
  selectRemove,
  selectTrainers,
  selectUpdate,
} from './trainersStore';
import type { TrainersStore } from './trainersStore';

const AUTHENTICATED_STATUS = 'AUTHENTICATED';

export type TrainersHook = {
  create(input: NewTrainerInput): Promise<TrainerCreateResult>;
  error: TrainerClientErrorCode | null;
  isLoading: boolean;
  refresh(): Promise<void>;
  remove(id: string): Promise<DeleteTrainerResult>;
  trainers: Trainer[];
  update(id: string, input: TrainerUpdateInput): Promise<TrainerUpdateResult>;
};

/**
 * The trainers of the account.
 *
 * The state lives in a store shared by the whole client: the list of trainers
 * is the same everywhere, and the screen that asks for it does not ask the
 * server again while another screen is waiting for the answer.
 */
export function useTrainers(): TrainersHook {
  const store = getTrainersStore();
  const trainers = useStore(store, selectTrainers);
  const isLoading = useStore(store, selectIsLoading);
  const error = useStore(store, selectError);
  const create = useStore(store, selectCreate);
  const refresh = useStore(store, selectRefresh);
  const remove = useStore(store, selectRemove);
  const update = useStore(store, selectUpdate);
  const auth = useAuth();
  const isAuthenticated = auth.status === AUTHENTICATED_STATUS;

  useEffect(
    function syncWithSession(): void {
      syncStoreWithSession(store, isAuthenticated);
    },
    [store, isAuthenticated],
  );

  return {
    create,
    error,
    isLoading,
    refresh,
    remove,
    trainers,
    update,
  };
}

/**
 * The list follows the session: it is loaded when there is a session, and it
 * goes away when the session ends, so that the next account that signs in on
 * the same browser starts with an empty list.
 */
function syncStoreWithSession(store: TrainersStore, isAuthenticated: boolean): void {
  if (isAuthenticated) {
    store.getState().refresh().catch(ignoreError);
    return;
  }
  store.getState().reset();
}

function ignoreError(): void {
  void 0;
}
