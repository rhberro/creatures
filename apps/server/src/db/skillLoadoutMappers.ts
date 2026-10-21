import type {
  EquippedAbility,
  EquippedConsumable,
  EquippedDevice,
  SkillSlot,
} from '@creatures/contracts/skill';

import { calculateMaxHp, resolveCurrentHp } from '~/db/creatureAttributes';
import { readEmbedded } from '~/db/embedded';
import type { CreatureAbilitySlotRow, CreatureVitalsRow, TrainerGearSlotRow } from '~/db/types';

const CONSUMABLE_KIND = 'consumable';

/**
 * The translation of the loadout rows into the contract of the skill bar.
 *
 * The mappers are pure: the row comes from the database and the contract goes
 * to the client, and nothing else happens in between.
 */
export function mapEquippedAbilities(rows: CreatureAbilitySlotRow[]): EquippedAbility[] {
  const abilities: EquippedAbility[] = [];
  const sorted = rows.toSorted(compareSlots);
  for (const row of sorted) {
    const fields = readEmbedded(row.abilities);
    if (fields === null) {
      continue;
    }
    abilities.push({
      abilityId: fields.id,
      cooldownMs: fields.cooldown_ms,
      damage: fields.damage,
      element: fields.element,
      name: fields.name,
      slot: row.slot as SkillSlot,
      slug: fields.slug,
    });
  }
  return abilities;
}

/**
 * The consumables of the trainer, in the order of the slots.
 */
export function mapEquippedConsumables(
  rows: TrainerGearSlotRow[],
  quantities: Map<string, number>,
): EquippedConsumable[] {
  const consumables: EquippedConsumable[] = [];
  const sorted = rows.toSorted(compareSlots);
  for (const row of sorted) {
    if (row.kind !== CONSUMABLE_KIND) {
      continue;
    }
    const item = readEmbedded(row.items);
    if (item === null || row.trigger_hp_percent === null) {
      continue;
    }
    consumables.push({
      itemId: item.id,
      name: item.name,
      quantity: readQuantity(quantities, item.id),
      slot: row.slot as SkillSlot,
      triggerHpPercent: row.trigger_hp_percent,
    });
  }
  return consumables;
}

/**
 * The capture device of the trainer, in the device slot.
 */
export function mapEquippedDevice(
  rows: TrainerGearSlotRow[],
  quantities: Map<string, number>,
): EquippedDevice | null {
  const sorted = rows.toSorted(compareSlots);
  for (const row of sorted) {
    if (row.kind === CONSUMABLE_KIND) {
      continue;
    }
    const item = readEmbedded(row.items);
    if (item === null) {
      continue;
    }
    return {
      itemId: item.id,
      name: item.name,
      quantity: readQuantity(quantities, item.id),
      slot: row.slot as SkillSlot,
    };
  }
  return null;
}

/**
 * The life of the creature in the field.
 *
 * The maximum life is the vitality attribute of the creature, and the life left
 * is what is stored: a null life means the creature never took a hit.
 */
export function mapCreatureVitals(row: CreatureVitalsRow): {
  currentHp: number;
  maxHp: number;
} | null {
  const species = readEmbedded(row.species);
  if (species === null) {
    return null;
  }
  const potential = readVitalityPotential(row.potential);
  const maxHp = calculateMaxHp(species.base_vitality, potential, row.level);
  return { currentHp: resolveCurrentHp(row.current_hp, maxHp), maxHp };
}

function readQuantity(quantities: Map<string, number>, itemId: string): number {
  return quantities.get(itemId) ?? 0;
}

function readVitalityPotential(value: unknown): number {
  if (typeof value !== 'object' || value === null) {
    return 50;
  }
  const potential = (value as { vitality?: unknown }).vitality;
  return typeof potential === 'number' && Number.isFinite(potential) ? potential : 50;
}

function compareSlots(first: { slot: number }, second: { slot: number }): number {
  return first.slot - second.slot;
}
