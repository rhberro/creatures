import type { SupabaseClient } from '@supabase/supabase-js';

import type { DatabaseError } from '~/db/types';

const ADD_CREATURE_FUNCTION = 'add_creature_to_team';
const REMOVE_CREATURE_FUNCTION = 'remove_creature_from_team';
const REORDER_TEAM_FUNCTION = 'reorder_team';
const SWAP_ACTIVE_CREATURE_FUNCTION = 'swap_active_creature';

export type TeamOperationOutcome = {
  error: DatabaseError | null;
  slot: number | null;
};

type QueryResult<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

/**
 * Puts a creature of the trainer in the first free slot of the team.
 *
 * The slot is decided by the database, in the same transaction that writes
 * the creature, so two simultaneous additions cannot take the same slot.
 */
export function addCreatureToTeam(
  admin: SupabaseClient,
  trainerId: string,
  ownerId: string,
  creatureId: string,
): Promise<TeamOperationOutcome> {
  const args = { p_creature_id: creatureId, p_owner_id: ownerId, p_trainer_id: trainerId };
  return Promise.resolve(admin.rpc(ADD_CREATURE_FUNCTION, args).then(readSlotOutcome));
}

/**
 * Takes a creature out of the team. The creature goes back to the storage.
 */
export function removeCreatureFromTeam(
  admin: SupabaseClient,
  trainerId: string,
  ownerId: string,
  creatureId: string,
): Promise<TeamOperationOutcome> {
  const args = { p_creature_id: creatureId, p_owner_id: ownerId, p_trainer_id: trainerId };
  return Promise.resolve(admin.rpc(REMOVE_CREATURE_FUNCTION, args).then(readFlagOutcome));
}

/**
 * Rewrites the order of the team. The ids are the creatures of the team, in
 * the order the player wants them.
 */
export function reorderTeam(
  admin: SupabaseClient,
  trainerId: string,
  ownerId: string,
  creatureIds: string[],
): Promise<TeamOperationOutcome> {
  const args = {
    p_creature_ids: creatureIds,
    p_owner_id: ownerId,
    p_trainer_id: trainerId,
  };
  return Promise.resolve(admin.rpc(REORDER_TEAM_FUNCTION, args).then(readFlagOutcome));
}

/**
 * Exchanges the chosen creature with the one in the field.
 *
 * The chosen creature takes the first slot of the team, which is the slot of
 * the creature in the field, and the one in the field takes the slot the
 * chosen one had. The creatures in between do not move.
 */
export function swapActiveCreature(
  admin: SupabaseClient,
  trainerId: string,
  ownerId: string,
  creatureId: string,
): Promise<TeamOperationOutcome> {
  const args = { p_creature_id: creatureId, p_owner_id: ownerId, p_trainer_id: trainerId };
  return Promise.resolve(admin.rpc(SWAP_ACTIVE_CREATURE_FUNCTION, args).then(readSlotOutcome));
}

function readSlotOutcome(result: QueryResult<number>): TeamOperationOutcome {
  if (result.error !== null) {
    return readErrorOutcome(result.error);
  }
  return { error: null, slot: typeof result.data === 'number' ? result.data : null };
}

function readFlagOutcome(result: QueryResult<boolean>): TeamOperationOutcome {
  if (result.error !== null) {
    return readErrorOutcome(result.error);
  }
  return { error: null, slot: null };
}

function readErrorOutcome(error: { code: string; message: string }): TeamOperationOutcome {
  return { error: { code: error.code, message: error.message }, slot: null };
}
