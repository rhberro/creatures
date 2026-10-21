import type { Creature } from '@creatures/contracts/creature';
import type { PlayerState, TeamSlot } from '@creatures/contracts/player';

import type { TeamRoster } from './team.types';

/**
 * The part of the state of the player that a team command changes.
 *
 * The team and the storage are two sides of the same coin: a creature is
 * either in the team or stored away.
 */
export function readRoster(state: PlayerState | null): TeamRoster {
  return {
    storage: readStorage(state?.storage ?? []),
    team: readTeamSlots(state?.team ?? []),
  };
}

/**
 * The storage is the captured creatures outside the team.
 *
 * The server already sends them filtered, and the filter is repeated here so a
 * state that carries a creature in both places never shows it twice.
 */
export function readStorage(storage: Creature[]): Creature[] {
  return storage.filter(function notInTeam(creature: Creature): boolean {
    return !creature.isInTeam;
  });
}

/**
 * The team in the order of its slots, which is the order that decides who
 * enters the field.
 */
export function readTeamSlots(team: TeamSlot[]): TeamSlot[] {
  const ordered: TeamSlot[] = [];
  for (const entry of team) {
    insertBySlot(ordered, entry);
  }
  return ordered;
}

/**
 * The insertion by slot.
 *
 * The array is sorted without `sort`, which would need a library the target
 * of the client does not have yet.
 */
function insertBySlot(ordered: TeamSlot[], entry: TeamSlot): void {
  let index = ordered.length;
  while (index > 0 && ordered[index - 1].slot > entry.slot) {
    index -= 1;
  }
  ordered.splice(index, 0, entry);
}
