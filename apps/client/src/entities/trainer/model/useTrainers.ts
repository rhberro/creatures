import type { NewTrainerInput } from '@creatures/contracts/trainer';
import { useEffect, useRef, useState } from 'react';

import { createApiDeps } from '~/shared/api';
import type { DeleteTrainerResult, TrainerCreateResult } from '~/shared/api';
import { getAccessToken, useAuth } from '~/shared/auth';

import { createTrainersController } from './trainersController';
import type { TrainersController, TrainersSnapshot } from './trainersController';

const AUTHENTICATED_STATUS = 'AUTHENTICATED';

export type TrainersHook = TrainersSnapshot & {
  create(input: NewTrainerInput): Promise<TrainerCreateResult>;
  refresh(): Promise<void>;
  remove(id: string): Promise<DeleteTrainerResult>;
};

export function useTrainers(): TrainersHook {
  const controller = useTrainersController();
  const [snapshot, setSnapshot] = useState<TrainersSnapshot>(controller.getSnapshot);
  const auth = useAuth();
  const isAuthenticated = auth.status === AUTHENTICATED_STATUS;

  useEffect(subscribeToController(controller, setSnapshot), [controller]);
  useEffect(refreshWhenAuthenticated(controller, isAuthenticated), [controller, isAuthenticated]);

  return {
    create: controller.create,
    error: snapshot.error,
    isLoading: snapshot.isLoading,
    refresh: controller.refresh,
    remove: controller.remove,
    trainers: snapshot.trainers,
  };
}

function useTrainersController(): TrainersController {
  const ref = useRef<TrainersController | null>(null);
  if (ref.current === null) {
    ref.current = createDefaultController();
  }
  return ref.current;
}

function createDefaultController(): TrainersController {
  return createTrainersController(createApiDeps(getAccessToken));
}

function subscribeToController(
  controller: TrainersController,
  setSnapshot: (snapshot: TrainersSnapshot) => void,
): () => void {
  return controller.subscribe(function forwardSnapshot(): void {
    setSnapshot(controller.getSnapshot());
  });
}

function refreshWhenAuthenticated(
  controller: TrainersController,
  isAuthenticated: boolean,
): () => void {
  return function loadTrainers(): () => void {
    if (isAuthenticated) {
      controller.refresh().catch(ignoreError);
    }
    return noop;
  };
}

function ignoreError(): void {
  void 0;
}

function noop(): void {
  void 0;
}
