import type { NewTrainerInput, Trainer } from '@creatures/contracts/trainer';

import type { ApiDeps } from '~/shared/api';
import { requestCreateTrainer, requestDeleteTrainer, requestTrainerList } from '~/shared/api';
import type {
  DeleteTrainerResult,
  TrainerClientErrorCode,
  TrainerCreateResult,
  TrainerListResult,
} from '~/shared/api';

import { validateNewTrainer } from './trainer.schema';

export type TrainersSnapshot = {
  error: TrainerClientErrorCode | null;
  isLoading: boolean;
  trainers: Trainer[];
};

export type TrainersController = {
  create(input: NewTrainerInput): Promise<TrainerCreateResult>;
  getSnapshot(): TrainersSnapshot;
  refresh(): Promise<void>;
  remove(id: string): Promise<DeleteTrainerResult>;
  subscribe(listener: () => void): () => void;
};

export function createTrainersController(deps: ApiDeps): TrainersController {
  let snapshot = buildInitialSnapshot();
  const listeners = new Set<() => void>();

  function getSnapshot(): TrainersSnapshot {
    return snapshot;
  }

  function setSnapshot(next: TrainersSnapshot): void {
    snapshot = next;
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return buildUnsubscribe(listeners, listener);
  }

  function refresh(): Promise<void> {
    setSnapshot(buildLoadingSnapshot(snapshot));
    return requestTrainerList(deps).then(buildListApplier(setSnapshot, getSnapshot));
  }

  function create(input: NewTrainerInput): Promise<TrainerCreateResult> {
    const validationCode = validateNewTrainer(input);
    if (validationCode !== null) {
      return Promise.resolve({ code: validationCode, ok: false });
    }
    return requestCreateTrainer(deps, input).then(buildCreateApplier(setSnapshot, getSnapshot));
  }

  function remove(id: string): Promise<DeleteTrainerResult> {
    const current = snapshot;
    if (!current.trainers.some(buildTrainerIdMatcher(id))) {
      return Promise.resolve({ code: 'trainer_not_found', ok: false });
    }
    setSnapshot(buildLoadingSnapshot(current));
    const applyDelete = buildDeleteApplier(setSnapshot, getSnapshot, id);
    return requestDeleteTrainer(deps, id).then(applyDelete, applyDelete);
  }

  return { create, getSnapshot, refresh, remove, subscribe };
}

function buildInitialSnapshot(): TrainersSnapshot {
  return { error: null, isLoading: false, trainers: [] };
}

function buildLoadingSnapshot(current: TrainersSnapshot): TrainersSnapshot {
  return { error: null, isLoading: true, trainers: current.trainers };
}

function buildUnsubscribe(listeners: Set<() => void>, listener: () => void): () => void {
  return function unsubscribe(): void {
    listeners.delete(listener);
  };
}

function buildListApplier(
  setSnapshot: (snapshot: TrainersSnapshot) => void,
  getSnapshot: () => TrainersSnapshot,
): (result: TrainerListResult) => void {
  return function applyList(result: TrainerListResult): void {
    if (result.ok) {
      setSnapshot({ error: null, isLoading: false, trainers: result.trainers });
      return;
    }
    setSnapshot({ error: result.code, isLoading: false, trainers: getSnapshot().trainers });
  };
}

function buildCreateApplier(
  setSnapshot: (snapshot: TrainersSnapshot) => void,
  getSnapshot: () => TrainersSnapshot,
): (result: TrainerCreateResult) => TrainerCreateResult {
  return function applyCreate(result: TrainerCreateResult): TrainerCreateResult {
    if (result.ok) {
      const trainers = getSnapshot().trainers.concat(result.trainer);
      setSnapshot({ error: null, isLoading: false, trainers });
    }
    return result;
  };
}

function buildDeleteApplier(
  setSnapshot: (snapshot: TrainersSnapshot) => void,
  getSnapshot: () => TrainersSnapshot,
  id: string,
): (result: DeleteTrainerResult | undefined) => DeleteTrainerResult {
  return function applyDelete(result: DeleteTrainerResult | undefined): DeleteTrainerResult {
    const resolved = result ?? buildUnknownDeleteResult();
    if (resolved.ok) {
      const trainers = getSnapshot().trainers.filter(buildTrainerIdRejector(id));
      setSnapshot({ error: null, isLoading: false, trainers });
      return resolved;
    }
    setSnapshot({ error: resolved.code, isLoading: false, trainers: getSnapshot().trainers });
    return resolved;
  };
}

function buildUnknownDeleteResult(): DeleteTrainerResult {
  return { code: 'unknown', ok: false };
}

function buildTrainerIdMatcher(id: string): (trainer: Trainer) => boolean {
  return function matchesId(trainer: Trainer): boolean {
    return trainer.id === id;
  };
}

function buildTrainerIdRejector(id: string): (trainer: Trainer) => boolean {
  return function rejectsId(trainer: Trainer): boolean {
    return trainer.id !== id;
  };
}
