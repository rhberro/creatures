import type { Gender, Trainer } from '@creatures/contracts/trainer';
import type { SupabaseClient } from '@supabase/supabase-js';

import { mapTrainerRow } from '~/db/mappers';
import type { DatabaseError, TrainerRow } from '~/db/types';

const TRAINER_COLUMNS =
  'id, owner_id, name, gender, level, gold, diamonds, stamina_minutes, starter_species_id, created_at';
const CREATE_TRAINER_FUNCTION = 'create_trainer_with_starter';
const CREATE_TRAINER_SEEDED_FUNCTION = 'create_trainer_with_starter_seeded';
const MAX_TRAINERS = 5;

export type CreateTrainerInput = {
  gender: Gender;
  name: string;
  normalizedName: string;
  ownerId: string;
  /**
   * The seed of the draw of the backpack of the new trainer.
   *
   * The same seed always gives the same backpack, and without a seed the
   * backpack is drawn from the id of the new trainer.
   */
  seed?: number;
  starterSpeciesId: string;
};

export type CreateTrainerOutcome = {
  error: DatabaseError | null;
  trainerId: string | null;
};

export type UpdateTrainerInput = {
  gender?: Gender;
  name?: string;
  normalizedName?: string;
};

export type UpdateTrainerOutcome = {
  error: DatabaseError | null;
  trainer: Trainer | null;
};

type QueryResult<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

export function createTrainerWithStarter(
  admin: SupabaseClient,
  input: CreateTrainerInput,
): Promise<CreateTrainerOutcome> {
  if (input.seed === undefined) {
    const args = {
      p_gender: input.gender,
      p_name: input.name,
      p_normalized_name: input.normalizedName,
      p_owner_id: input.ownerId,
      p_starter_species_id: input.starterSpeciesId,
    };
    return Promise.resolve(admin.rpc(CREATE_TRAINER_FUNCTION, args).then(readCreateOutcome));
  }
  const args = {
    p_gender: input.gender,
    p_name: input.name,
    p_normalized_name: input.normalizedName,
    p_owner_id: input.ownerId,
    p_seed: input.seed,
    p_starter_species_id: input.starterSpeciesId,
  };
  return Promise.resolve(admin.rpc(CREATE_TRAINER_SEEDED_FUNCTION, args).then(readCreateOutcome));
}

export function listTrainers(admin: SupabaseClient, ownerId: string): Promise<Trainer[]> {
  const query = admin
    .from('trainers')
    .select(TRAINER_COLUMNS)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(MAX_TRAINERS);
  return Promise.resolve(query.then(readTrainerList));
}

export function findTrainerById(
  admin: SupabaseClient,
  trainerId: string,
  ownerId: string,
): Promise<Trainer | null> {
  const query = admin
    .from('trainers')
    .select(TRAINER_COLUMNS)
    .eq('id', trainerId)
    .eq('owner_id', ownerId)
    .maybeSingle();
  return Promise.resolve(query.then(readSingleTrainer));
}

export function updateTrainer(
  admin: SupabaseClient,
  trainerId: string,
  ownerId: string,
  input: UpdateTrainerInput,
): Promise<UpdateTrainerOutcome> {
  const patch = buildPatch(input);
  const query = admin
    .from('trainers')
    .update(patch)
    .eq('id', trainerId)
    .eq('owner_id', ownerId)
    .select(TRAINER_COLUMNS)
    .maybeSingle();
  return Promise.resolve(query.then(readUpdateOutcome));
}

export function deleteTrainer(
  admin: SupabaseClient,
  trainerId: string,
  ownerId: string,
): Promise<boolean> {
  const query = admin
    .from('trainers')
    .delete()
    .eq('id', trainerId)
    .eq('owner_id', ownerId)
    .select('id');
  return Promise.resolve(query.then(readDeleteOutcome));
}

export function readRows<T>(data: T[] | null, error: { message: string } | null): T[] {
  if (error !== null) {
    throw new Error(`Database query failed: ${error.message}`);
  }
  return data ?? [];
}

function readCreateOutcome(result: QueryResult<unknown>): CreateTrainerOutcome {
  if (result.error !== null) {
    return { error: { code: result.error.code, message: result.error.message }, trainerId: null };
  }
  return { error: null, trainerId: readTrainerId(result.data) };
}

function readTrainerList(result: QueryResult<TrainerRow[]>): Trainer[] {
  const rows = readRows<TrainerRow>(result.data, result.error);
  return rows.map(mapTrainerRow);
}

function readSingleTrainer(result: QueryResult<TrainerRow>): Trainer | null {
  if (result.error !== null) {
    throw new Error(`Trainer lookup failed: ${result.error.message}`);
  }
  return result.data === null ? null : mapTrainerRow(result.data);
}

function readUpdateOutcome(result: QueryResult<TrainerRow>): UpdateTrainerOutcome {
  if (result.error !== null) {
    return { error: { code: result.error.code, message: result.error.message }, trainer: null };
  }
  return {
    error: null,
    trainer: result.data === null ? null : mapTrainerRow(result.data),
  };
}

function readDeleteOutcome(result: QueryResult<{ id: string }[]>): boolean {
  const rows = readRows<{ id: string }>(result.data, result.error);
  return rows.length > 0;
}

function buildPatch(input: UpdateTrainerInput): Record<string, string> {
  const patch: Record<string, string> = {};
  if (input.name !== undefined && input.normalizedName !== undefined) {
    patch.name = input.name;
    patch.normalized_name = input.normalizedName;
  }
  if (input.gender !== undefined) {
    patch.gender = input.gender;
  }
  return patch;
}

function readTrainerId(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const trainerId = (data as { trainer_id?: unknown }).trainer_id;
  return typeof trainerId === 'string' ? trainerId : null;
}
