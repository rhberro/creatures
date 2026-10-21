import { expect, test } from 'bun:test';

import {
  mapCreatureVitals,
  mapEquippedAbilities,
  mapEquippedConsumables,
  mapEquippedDevice,
} from '~/db/skillLoadoutMappers';
import type { CreatureAbilitySlotRow, CreatureVitalsRow, TrainerGearSlotRow } from '~/db/types';

const ABILITY_FIELDS = {
  cooldown_ms: 4000,
  damage: 12,
  element: 'fire',
  id: '55555555-5555-4555-8555-555555555555',
  name: 'Brasa',
  slug: 'brasa',
} as const;

const CONSUMABLE_SLOT: TrainerGearSlotRow = {
  item_id: '99999999-9999-4999-8999-999999999999',
  items: { id: '99999999-9999-4999-8999-999999999999', name: 'Poção de Cura' },
  kind: 'consumable',
  slot: 4,
  trigger_hp_percent: 30,
};

const DEVICE_SLOT: TrainerGearSlotRow = {
  item_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  items: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Prisma Simples' },
  kind: 'device',
  slot: 6,
  trigger_hp_percent: null,
};

function mapsTheAbilitiesOfTheSlots(): void {
  const rows: CreatureAbilitySlotRow[] = [
    { abilities: ABILITY_FIELDS, slot: 0 },
    { abilities: { ...ABILITY_FIELDS, id: 'slot-1', name: 'Ígnea', slug: 'ignea' }, slot: 1 },
  ];
  const abilities = mapEquippedAbilities(rows);
  expect(abilities).toHaveLength(2);
  expect(abilities[0]).toEqual({
    abilityId: ABILITY_FIELDS.id,
    cooldownMs: 4000,
    damage: 12,
    element: 'fire',
    name: 'Brasa',
    slot: 0,
    slug: 'brasa',
  });
  expect(abilities[1]?.slot).toBe(1);
}

function keepsTheOrderOfTheSlots(): void {
  const rows: CreatureAbilitySlotRow[] = [
    { abilities: { ...ABILITY_FIELDS, id: 'slot-2' }, slot: 2 },
    { abilities: { ...ABILITY_FIELDS, id: 'slot-0' }, slot: 0 },
  ];
  const abilities = mapEquippedAbilities(rows);
  expect(abilities.map(readSlot)).toEqual([0, 2]);
}

function mapsTheConsumablesWithTheQuantityOfTheBackpack(): void {
  const quantities = new Map<string, number>([['99999999-9999-4999-8999-999999999999', 7]]);
  const consumables = mapEquippedConsumables([CONSUMABLE_SLOT], quantities);
  expect(consumables).toEqual([
    {
      itemId: '99999999-9999-4999-8999-999999999999',
      name: 'Poção de Cura',
      quantity: 7,
      slot: 4,
      triggerHpPercent: 30,
    },
  ]);
}

function readsTheQuantityOfAConsumableTheTrainerDoesNotHave(): void {
  const consumables = mapEquippedConsumables([CONSUMABLE_SLOT], new Map<string, number>());
  expect(consumables[0]?.quantity).toBe(0);
}

function mapsTheDeviceOfTheDeviceSlot(): void {
  const quantities = new Map<string, number>([['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2]]);
  const device = mapEquippedDevice([DEVICE_SLOT], quantities);
  expect(device).toEqual({
    itemId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Prisma Simples',
    quantity: 2,
    slot: 6,
  });
}

function hasNoDeviceWithoutTheDeviceSlot(): void {
  const device = mapEquippedDevice([CONSUMABLE_SLOT], new Map<string, number>());
  expect(device).toBeNull();
}

function readsAFullLifeWhenTheCreatureNeverTookAHit(): void {
  const row: CreatureVitalsRow = {
    current_hp: null,
    level: 1,
    potential: { vitality: 50 },
    species: { base_vitality: 22 },
  };
  expect(mapCreatureVitals(row)).toEqual({ currentHp: 22, maxHp: 22 });
}

function readsTheLifeLeftOfTheCreature(): void {
  const row: CreatureVitalsRow = {
    current_hp: 9,
    level: 1,
    potential: { vitality: 50 },
    species: { base_vitality: 22 },
  };
  expect(mapCreatureVitals(row)).toEqual({ currentHp: 9, maxHp: 22 });
}

function readsTheMaximumLifeFromThePotential(): void {
  const row: CreatureVitalsRow = {
    current_hp: null,
    level: 1,
    potential: { vitality: 100 },
    species: { base_vitality: 22 },
  };
  expect(mapCreatureVitals(row)).toEqual({ currentHp: 28, maxHp: 28 });
}

test('the abilities of the slots are mapped to the contract', mapsTheAbilitiesOfTheSlots);
test('the abilities keep the order of the slots', keepsTheOrderOfTheSlots);
test(
  'the consumables carry the quantity of the backpack',
  mapsTheConsumablesWithTheQuantityOfTheBackpack,
);
test(
  'a consumable the trainer does not have has no quantity',
  readsTheQuantityOfAConsumableTheTrainerDoesNotHave,
);
test('the device of the device slot is mapped to the contract', mapsTheDeviceOfTheDeviceSlot);
test('there is no device without the device slot', hasNoDeviceWithoutTheDeviceSlot);
test('a creature that never took a hit has full life', readsAFullLifeWhenTheCreatureNeverTookAHit);
test('the life left of the creature is the stored one', readsTheLifeLeftOfTheCreature);
test('the maximum life comes from the potential', readsTheMaximumLifeFromThePotential);

function readSlot(ability: { slot: number }): number {
  return ability.slot;
}
