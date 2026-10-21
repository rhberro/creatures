import type { TeamSlot } from '@creatures/contracts/player';

import type { Creature, CreatureSlot } from '~/widgets/game-hud';

const MAX_TEAM_SIZE = 5;

/**
 * The tabs of the team show the creatures of the trainer, up to five, and the
 * empty slots of the team that still has room.
 */
export function buildTeamSlots(team: TeamSlot[]): CreatureSlot[] {
  const slots: CreatureSlot[] = Array.from<CreatureSlot>({ length: MAX_TEAM_SIZE }).fill(null);
  // The client targets es2022, where `toSorted` is not in the standard library.
  // oxlint-disable-next-line unicorn/no-array-sort
  const ordered = [...team].sort(compareTeamSlot);
  if (ordered.length === 0) {
    return slots;
  }
  const offset = ordered[0].slot >= 1 ? 1 : 0;
  for (const entry of ordered) {
    const index = entry.slot - offset;
    if (index >= 0 && index < MAX_TEAM_SIZE) {
      slots[index] = entry.creature;
    }
  }
  return slots;
}

function compareTeamSlot(left: TeamSlot, right: TeamSlot): number {
  return left.slot - right.slot;
}

/**
 * The creature in the field.
 *
 * The server says which one it is, and the local selection only takes over
 * while the server has not answered yet. Without either of them, the first
 * creature of the team is the one in the field.
 */
export function resolveActiveId(slots: CreatureSlot[], activeId: string | null): string | null {
  if (activeId !== null && slots.some(matchesCreatureId(activeId))) {
    return activeId;
  }
  const first = findFirstCreature(slots);
  return first === null ? null : first.id;
}

function matchesCreatureId(id: string): (slot: CreatureSlot) => boolean {
  return function matches(slot: CreatureSlot): boolean {
    return slot !== null && slot.id === id;
  };
}

function findFirstCreature(slots: CreatureSlot[]): Creature | null {
  for (const slot of slots) {
    if (slot !== null) {
      return slot;
    }
  }
  return null;
}
