import type { CreatureAbility } from '@creatures/contracts/creature';
import type { InventoryItem } from '@creatures/contracts/inventory';
import type { PlayerState } from '@creatures/contracts/player';
import type {
  EquippedAbility,
  EquippedConsumable,
  EquippedDevice,
  SkillSlot,
} from '@creatures/contracts/skill';
import { DEVICE_SLOT } from '@creatures/contracts/skill';

import { CONSUMABLE_CATALOG, DEVICE_CATALOG } from './catalog';
import type { CatalogItem } from './catalog';

/**
 * The loadout of the bar: what the creature and the trainer have equipped.
 *
 * The client predicts this loadout the instant the player clicks, and the
 * server confirms it with the state it pushes. The prediction is always
 * built from the state the client already has — the state of the server, plus
 * the changes that are still on their way — never from a parallel truth.
 */
export type PendingLoadout = {
  abilities: EquippedAbility[];
  consumables: EquippedConsumable[];
  device: EquippedDevice | null;
};

/**
 * The loadout of a state of the player.
 */
export function readLoadout(state: PlayerState | null): PendingLoadout {
  return {
    abilities: state?.equippedAbilities ?? [],
    consumables: state?.equippedConsumables ?? [],
    device: state?.equippedDevice ?? null,
  };
}

/**
 * The state of the player with the loadout the client predicts.
 *
 * The rest of the state is the one of the server: the prediction only touches
 * what the player is changing.
 */
export function applyPending(
  state: PlayerState | null,
  pending: PendingLoadout | null,
): PlayerState | null {
  if (state === null || pending === null) {
    return state;
  }
  return {
    ...state,
    equippedAbilities: pending.abilities,
    equippedConsumables: pending.consumables,
    equippedDevice: pending.device,
  };
}

/**
 * The loadout with an ability in a slot.
 *
 * The base is the loadout the client already predicts: the prediction of a
 * command carries the changes of the ones before it, so the loadout the
 * server ends up with is the one the client showed.
 *
 * The same ability cannot take two slots: the slot it came from is emptied.
 * The ability that is clicked again leaves its slot.
 */
export function predictAbilityEquip(
  loadout: PendingLoadout,
  state: PlayerState | null,
  slot: SkillSlot,
  abilityId: string,
): PendingLoadout {
  const ability = findAbility(state, abilityId);
  if (ability === null) {
    return loadout;
  }
  if (hasAbilityAt(loadout, slot, abilityId)) {
    return buildLoadout(removeSlot(loadout.abilities, slot), loadout.consumables, loadout.device);
  }
  const others = loadout.abilities.filter(function keepOther(entry: EquippedAbility): boolean {
    return entry.abilityId !== abilityId && entry.slot !== slot;
  });
  const equipped = buildEquippedAbility(ability, slot);
  return buildLoadout([...others, equipped], loadout.consumables, loadout.device);
}

/**
 * The loadout with a consumable in a slot.
 *
 * The consumable that is clicked again leaves its slot.
 */
export function predictConsumableEquip(
  loadout: PendingLoadout,
  state: PlayerState | null,
  slot: SkillSlot,
  itemId: string,
  triggerHpPercent: number,
): PendingLoadout {
  const current = readConsumableAt(loadout, slot);
  if (current !== null && current.itemId === itemId) {
    return buildLoadout(loadout.abilities, removeSlot(loadout.consumables, slot), loadout.device);
  }
  const consumable = buildEquippedConsumable(state, itemId, slot, triggerHpPercent);
  const others = loadout.consumables.filter(function keepOther(entry: EquippedConsumable): boolean {
    return entry.slot !== slot;
  });
  return buildLoadout(loadout.abilities, [...others, consumable], loadout.device);
}

/**
 * The loadout with a capture device in the device slot.
 *
 * The device that is clicked again leaves its slot.
 */
export function predictDeviceEquip(
  loadout: PendingLoadout,
  state: PlayerState | null,
  itemId: string,
): PendingLoadout {
  const current = loadout.device;
  if (current !== null && current.itemId === itemId) {
    return buildLoadout(loadout.abilities, loadout.consumables, null);
  }
  const device = buildEquippedDevice(state, itemId);
  return buildLoadout(loadout.abilities, loadout.consumables, device);
}

/**
 * The loadout with the life that triggers the consumable of a slot moved.
 *
 * A slot without consumable keeps no trigger: there is nothing to watch yet.
 */
export function predictTrigger(
  loadout: PendingLoadout,
  slot: SkillSlot,
  triggerHpPercent: number,
): PendingLoadout {
  const consumables = loadout.consumables.map(function moveTrigger(
    entry: EquippedConsumable,
  ): EquippedConsumable {
    if (entry.slot !== slot) {
      return entry;
    }
    return { ...entry, triggerHpPercent };
  });
  return buildLoadout(loadout.abilities, consumables, loadout.device);
}

/**
 * Whether the state of the server is the loadout the client predicted.
 *
 * The signature is what the two have in common: the slots, the items and the
 * trigger. The quantity of an item is not part of it: the server counts the
 * items the player uses on its own.
 */
export function matchesPending(state: PlayerState | null, pending: PendingLoadout): boolean {
  return readSignature(readLoadout(state)) === readSignature(pending);
}

/**
 * Whether the state of the server already carries the life of a trigger.
 */
export function isTriggerConfirmed(
  state: PlayerState | null,
  slot: SkillSlot,
  triggerHpPercent: number,
): boolean {
  const consumable = readConsumableAt(readLoadout(state), slot);
  if (consumable === null) {
    return false;
  }
  return consumable.triggerHpPercent === triggerHpPercent;
}

function buildLoadout(
  abilities: EquippedAbility[],
  consumables: EquippedConsumable[],
  device: EquippedDevice | null,
): PendingLoadout {
  return { abilities, consumables, device };
}

function readSignature(loadout: PendingLoadout): string {
  const abilities = readSorted(
    loadout.abilities.map(function readAbility(entry: EquippedAbility): string {
      return `${entry.slot}:${entry.abilityId}`;
    }),
  );
  const consumables = readSorted(
    loadout.consumables.map(function readConsumable(entry: EquippedConsumable): string {
      return `${entry.slot}:${entry.itemId}@${entry.triggerHpPercent}`;
    }),
  );
  const device = loadout.device === null ? '-' : loadout.device.itemId;
  return `${abilities.join(',')}|${consumables.join(',')}|${device}`;
}

/**
 * The signature does not care about the order of the slots: the two loadouts
 * are the same loadout in any order.
 */
function readSorted(entries: string[]): string[] {
  // The client targets es2022, where `toSorted` is not in the standard library.
  // oxlint-disable-next-line unicorn/no-array-sort
  return [...entries].sort();
}

function hasAbilityAt(loadout: PendingLoadout, slot: SkillSlot, abilityId: string): boolean {
  return loadout.abilities.some(function matches(entry: EquippedAbility): boolean {
    return entry.slot === slot && entry.abilityId === abilityId;
  });
}

function readConsumableAt(loadout: PendingLoadout, slot: SkillSlot): EquippedConsumable | null {
  const found = loadout.consumables.find(function matches(entry: EquippedConsumable): boolean {
    return entry.slot === slot;
  });
  return found ?? null;
}

function removeSlot<T extends { slot: SkillSlot }>(entries: T[], slot: SkillSlot): T[] {
  return entries.filter(function keepOther(entry: T): boolean {
    return entry.slot !== slot;
  });
}

function findAbility(state: PlayerState | null, abilityId: string): CreatureAbility | null {
  const abilities = state?.activeAbilities ?? [];
  const found = abilities.find(function matches(ability: CreatureAbility): boolean {
    return ability.abilityId === abilityId;
  });
  return found ?? null;
}

function buildEquippedAbility(ability: CreatureAbility, slot: SkillSlot): EquippedAbility {
  return {
    abilityId: ability.abilityId,
    cooldownMs: ability.cooldownMs,
    damage: ability.damage,
    element: ability.element,
    name: ability.name,
    slot,
    slug: ability.slug,
  };
}

function buildEquippedConsumable(
  state: PlayerState | null,
  itemId: string,
  slot: SkillSlot,
  triggerHpPercent: number,
): EquippedConsumable {
  const owned = findBackpackItem(state, itemId, 'consumable');
  return {
    itemId,
    name: readItemName(owned, CONSUMABLE_CATALOG, itemId),
    quantity: owned?.quantity ?? 0,
    slot,
    triggerHpPercent,
  };
}

function buildEquippedDevice(state: PlayerState | null, itemId: string): EquippedDevice {
  const owned = findBackpackItem(state, itemId, 'device');
  return {
    itemId,
    name: readItemName(owned, DEVICE_CATALOG, itemId),
    quantity: owned?.quantity ?? 0,
    slot: DEVICE_SLOT,
  };
}

function readItemName(owned: InventoryItem | null, catalog: CatalogItem[], itemId: string): string {
  if (owned !== null) {
    return owned.name;
  }
  const found = catalog.find(function matches(item: CatalogItem): boolean {
    return item.itemId === itemId;
  });
  return found?.name ?? '';
}

function findBackpackItem(
  state: PlayerState | null,
  itemId: string,
  category: 'consumable' | 'device',
): InventoryItem | null {
  const backpack = state?.backpack ?? [];
  const found = backpack.find(function matches(item: InventoryItem): boolean {
    return item.itemId === itemId && item.category === category;
  });
  return found ?? null;
}
