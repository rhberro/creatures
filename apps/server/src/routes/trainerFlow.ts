import type { Gender, NewTrainerInput, Trainer } from '@creatures/contracts/trainer';

import { mapTrainerWriteError } from '~/db/errors';
import {
  createTrainerWithStarter,
  findTrainerById,
  listTrainers,
  updateTrainer,
} from '~/db/trainerRepository';
import type { UpdateTrainerInput } from '~/db/trainerRepository';
import type { ServerDependencies } from '~/dependencies';
import { errorResponse } from '~/router';
import {
  normalizeTrainerName,
  readTrainerErrorMessage,
  validateNewTrainer,
  validateTrainerUpdate,
} from '~/validation/trainer';

const MAX_TRAINERS = 5;
const BAD_REQUEST = 400;
const CONFLICT = 409;
const INTERNAL_ERROR_CODE = 'internal_error';
const INTERNAL_ERROR_MESSAGE = 'Erro interno do servidor.';

export type TrainerUpdateBody = {
  gender?: Gender;
  name?: string;
};

export type CreatedTrainer = {
  trainerId: string;
};

export type TrainerStep<T> = Response | T;

export function validateTrainerBody(body: unknown): TrainerStep<NewTrainerInput> {
  const validation = validateNewTrainer(body);
  if (!validation.ok) {
    return errorResponse(BAD_REQUEST, validation.code, validation.message);
  }
  return validation.value;
}

export function validateTrainerUpdateBody(body: unknown): TrainerStep<TrainerUpdateBody> {
  const validation = validateTrainerUpdate(body);
  if (!validation.ok) {
    return errorResponse(BAD_REQUEST, validation.code, validation.message);
  }
  return validation.value;
}

export function checkTrainerLimit(
  deps: ServerDependencies,
  userId: string,
): (value: TrainerStep<NewTrainerInput>) => Promise<TrainerStep<NewTrainerInput>> {
  return function checkLimit(
    value: TrainerStep<NewTrainerInput>,
  ): Promise<TrainerStep<NewTrainerInput>> {
    if (isStepResponse(value)) {
      return Promise.resolve(value);
    }
    return listTrainers(deps.admin, userId).then(function readCount(
      existing: Trainer[],
    ): TrainerStep<NewTrainerInput> {
      if (existing.length >= MAX_TRAINERS) {
        return readLimitError();
      }
      return value;
    });
  };
}

export function createTrainerRecord(
  deps: ServerDependencies,
  userId: string,
): (value: TrainerStep<NewTrainerInput>) => Promise<TrainerStep<CreatedTrainer>> {
  return function createRecord(
    value: TrainerStep<NewTrainerInput>,
  ): Promise<TrainerStep<CreatedTrainer>> {
    if (isStepResponse(value)) {
      return Promise.resolve(value);
    }
    return createTrainerWithStarter(deps.admin, buildCreateInput(userId, value)).then(
      function readOutcome(outcome: {
        error: { code: string; message: string } | null;
        trainerId: string | null;
      }): TrainerStep<CreatedTrainer> {
        if (outcome.error !== null) {
          return readWriteError(outcome.error);
        }
        if (outcome.trainerId === null) {
          return readInternalError();
        }
        return { trainerId: outcome.trainerId };
      },
    );
  };
}

export function readCreatedTrainer(
  deps: ServerDependencies,
  userId: string,
): (value: TrainerStep<CreatedTrainer>) => Promise<TrainerStep<Trainer>> {
  return function readTrainer(value: TrainerStep<CreatedTrainer>): Promise<TrainerStep<Trainer>> {
    if (isStepResponse(value)) {
      return Promise.resolve(value);
    }
    return findTrainerById(deps.admin, value.trainerId, userId).then(function withTrainer(
      trainer: Trainer | null,
    ): TrainerStep<Trainer> {
      if (trainer === null) {
        return readInternalError();
      }
      return trainer;
    });
  };
}

export function applyTrainerUpdate(
  deps: ServerDependencies,
  trainerId: string,
  userId: string,
): (value: TrainerStep<TrainerUpdateBody>) => Promise<TrainerStep<Trainer>> {
  return function update(value: TrainerStep<TrainerUpdateBody>): Promise<TrainerStep<Trainer>> {
    if (isStepResponse(value)) {
      return Promise.resolve(value);
    }
    return updateTrainer(deps.admin, trainerId, userId, buildUpdateInput(value)).then(
      function readOutcome(outcome: {
        error: { code: string; message: string } | null;
        trainer: Trainer | null;
      }): TrainerStep<Trainer> {
        if (outcome.error !== null) {
          return readWriteError(outcome.error);
        }
        if (outcome.trainer === null) {
          return errorResponse(
            404,
            'trainer_not_found',
            readTrainerErrorMessage('trainer_not_found'),
          );
        }
        return outcome.trainer;
      },
    );
  };
}

export function buildCreateInput(
  userId: string,
  input: NewTrainerInput,
): {
  gender: Gender;
  name: string;
  normalizedName: string;
  ownerId: string;
  starterSpeciesId: string;
} {
  return {
    gender: input.gender,
    name: input.name,
    normalizedName: normalizeTrainerName(input.name),
    ownerId: userId,
    starterSpeciesId: input.starterSpeciesId,
  };
}

export function buildUpdateInput(input: TrainerUpdateBody): UpdateTrainerInput {
  const patch: UpdateTrainerInput = {};
  if (input.name !== undefined) {
    patch.name = input.name;
    patch.normalizedName = normalizeTrainerName(input.name);
  }
  if (input.gender !== undefined) {
    patch.gender = input.gender;
  }
  return patch;
}

export function isStepResponse(value: unknown): value is Response {
  return value instanceof globalThis.Response;
}

export function readLimitError(): Response {
  return errorResponse(
    CONFLICT,
    'max_trainers_reached',
    readTrainerErrorMessage('max_trainers_reached'),
  );
}

export function readWriteError(error: { code: string; message: string }): Response {
  const mapped = mapTrainerWriteError(error);
  return errorResponse(mapped.status, mapped.code, mapped.message);
}

export function readInternalError(): Response {
  return errorResponse(500, INTERNAL_ERROR_CODE, INTERNAL_ERROR_MESSAGE);
}
