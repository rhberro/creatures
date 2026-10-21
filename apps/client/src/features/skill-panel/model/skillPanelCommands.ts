import type { PlayerState } from '@creatures/contracts/player';
import type { SkillSlot } from '@creatures/contracts/skill';

import type { PendingLoadout } from './skillPanelPrediction';
import type { TriggerOverride } from './skillPanelStore';

const DEFAULT_TRIGGER_HP_PERCENT = 30;
const MIN_TRIGGER_HP_PERCENT = 5;
const MAX_TRIGGER_HP_PERCENT = 95;

/**
 * The loadout of the four ability slots, in the order of the slots.
 *
 * The payload is the whole loadout: the server replaces the four slots with
 * it, so it has to carry the changes of the commands that are still on their
 * way. A command built over an old loadout would take a slot back.
 */
export function buildAbilitySlotPayloadFrom(loadout: PendingLoadout): string[] {
  const payload = ['', '', '', ''];
  for (const equipped of loadout.abilities) {
    const index = equipped.slot;
    if (index >= 0 && index < payload.length) {
      payload[index] = equipped.abilityId;
    }
  }
  return payload;
}

export function readEquippedConsumable(
  state: PlayerState | null,
  slot: SkillSlot,
): { itemId: string; triggerHpPercent: number } | null {
  const equipped = (state?.equippedConsumables ?? []).find(matchesSlot(slot));
  if (equipped === undefined) {
    return null;
  }
  return { itemId: equipped.itemId, triggerHpPercent: equipped.triggerHpPercent };
}

/**
 * The life that triggers the consumable of the slot.
 *
 * The trigger comes with the consumable that is equipped: without one, the
 * panel shows the trigger the player starts from.
 */
export function readTriggerPercent(state: PlayerState | null, slot: SkillSlot | null): number {
  if (state === null || slot === null) {
    return DEFAULT_TRIGGER_HP_PERCENT;
  }
  const equipped = (state.equippedConsumables ?? []).find(matchesSlot(slot));
  return equipped?.triggerHpPercent ?? DEFAULT_TRIGGER_HP_PERCENT;
}

export function clampTrigger(percent: number): number {
  if (percent < MIN_TRIGGER_HP_PERCENT) {
    return MIN_TRIGGER_HP_PERCENT;
  }
  if (percent > MAX_TRIGGER_HP_PERCENT) {
    return MAX_TRIGGER_HP_PERCENT;
  }
  return percent;
}

/**
 * The life of the trigger of a slot, as the panel shows it.
 *
 * The life the player chose comes first: it is the answer of the click, and
 * the state of the server takes it back when it arrives.
 */
export function readTriggerChoice(
  state: PlayerState | null,
  slot: SkillSlot | null,
  override: TriggerOverride | null,
): number {
  if (override !== null && override.slot === slot) {
    return override.percent;
  }
  return readTriggerPercent(state, slot);
}

function matchesSlot(slot: SkillSlot): (entry: { slot: SkillSlot }) => boolean {
  return function matches(entry): boolean {
    return entry.slot === slot;
  };
}
