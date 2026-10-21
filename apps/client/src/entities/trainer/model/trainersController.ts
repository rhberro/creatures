import type { NewTrainerInput, Trainer } from '@creatures/contracts/trainer';

import type { ApiDeps } from '~/shared/api';
import {
  requestCreateTrainer,
  requestDeleteTrainer,
  requestTrainerList,
  requestUpdateTrainer,
} from '~/shared/api';
import type {
  DeleteTrainerResult,
  TrainerClientErrorCode,
  TrainerCreateResult,
  TrainerListResult,
  TrainerUpdateInput,
  TrainerUpdateResult,
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
  reset(): void;
  subscribe(listener: () => void): () => void;
  update(id: string, input: TrainerUpdateInput): Promise<TrainerUpdateResult>;
};

type ControllerState = {
  getSnapshot(): TrainersSnapshot;
  setSnapshot(next: TrainersSnapshot): void;
  subscribe(listener: () => void): () => void;
};

export function createTrainersController(deps: ApiDeps): TrainersController {
  const state = createControllerState();

  function refresh(): Promise<void> {
    state.setSnapshot(buildLoadingSnapshot(state.getSnapshot()));
    return requestTrainerList(deps).then(buildListApplier(state.setSnapshot, state.getSnapshot));
  }

  function create(input: NewTrainerInput): Promise<TrainerCreateResult> {
    const validationCode = validateNewTrainer(input);
    if (validationCode !== null) {
      return Promise.resolve({ code: validationCode, ok: false });
    }
    return requestCreateTrainer(deps, input).then(
      buildCreateApplier(state.setSnapshot, state.getSnapshot),
    );
  }

  function update(id: string, input: TrainerUpdateInput): Promise<TrainerUpdateResult> {
    return updateTrainer(deps, id, input, state.setSnapshot, state.getSnapshot);
  }

  function remove(id: string): Promise<DeleteTrainerResult> {
    return removeTrainer(deps, id, state.setSnapshot, state.getSnapshot);
  }

  function reset(): void {
    resetSnapshot(state.getSnapshot(), state.setSnapshot);
  }

  return {
    create,
    getSnapshot: state.getSnapshot,
    refresh,
    remove,
    reset,
    subscribe: state.subscribe,
    update,
  };
}

/**
 * The state of the controller: the snapshot and the listeners of it.
 */
function createControllerState(): ControllerState {
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

  return { getSnapshot, setSnapshot, subscribe };
}

function updateTrainer(
  deps: ApiDeps,
  id: string,
  input: TrainerUpdateInput,
  setSnapshot: (snapshot: TrainersSnapshot) => void,
  getSnapshot: () => TrainersSnapshot,
): Promise<TrainerUpdateResult> {
  const current = getSnapshot();
  if (!current.trainers.some(buildTrainerIdMatcher(id))) {
    return Promise.resolve({ code: 'trainer_not_found', ok: false });
  }
  setSnapshot(buildLoadingSnapshot(current));
  const applyUpdate = buildUpdateApplier(setSnapshot, getSnapshot, id);
  return requestUpdateTrainer(deps, id, input).then(applyUpdate, applyUpdate);
}

function removeTrainer(
  deps: ApiDeps,
  id: string,
  setSnapshot: (snapshot: TrainersSnapshot) => void,
  getSnapshot: () => TrainersSnapshot,
): Promise<DeleteTrainerResult> {
  const current = getSnapshot();
  if (!current.trainers.some(buildTrainerIdMatcher(id))) {
    return Promise.resolve({ code: 'trainer_not_found', ok: false });
  }
  setSnapshot(buildLoadingSnapshot(current));
  const applyDelete = buildDeleteApplier(setSnapshot, getSnapshot, id);
  return requestDeleteTrainer(deps, id).then(applyDelete, applyDelete);
}

/**
 * The list of the trainers of the account goes away with the session: the
 * next account that signs in on the same browser starts with an empty list.
 */
function resetSnapshot(
  current: TrainersSnapshot,
  setSnapshot: (snapshot: TrainersSnapshot) => void,
): void {
  if (current.isLoading || current.error !== null || current.trainers.length > 0) {
    setSnapshot(buildInitialSnapshot());
  }
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

function buildUpdateApplier(
  setSnapshot: (snapshot: TrainersSnapshot) => void,
  getSnapshot: () => TrainersSnapshot,
  id: string,
): (result: TrainerUpdateResult | undefined) => TrainerUpdateResult {
  return function applyUpdate(result: TrainerUpdateResult | undefined): TrainerUpdateResult {
    const resolved = result ?? buildUnknownUpdateResult();
    if (resolved.ok) {
      const trainers = getSnapshot().trainers.map(buildTrainerReplacer(id, resolved.trainer));
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

function buildUnknownUpdateResult(): TrainerUpdateResult {
  return { code: 'unknown', ok: false };
}

function buildTrainerReplacer(id: string, updated: Trainer): (trainer: Trainer) => Trainer {
  return function replaceTrainer(trainer: Trainer): Trainer {
    return trainer.id === id ? updated : trainer;
  };
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
