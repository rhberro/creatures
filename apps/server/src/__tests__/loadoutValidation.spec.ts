import { expect, test } from 'bun:test';

import {
  isTrainerGearSlot,
  readGearSlotNumber,
  validateAbilitySlots,
  validateGearSlot,
} from '~/validation/loadout';

const ABILITY_ID = '55555555-5555-4555-8555-555555555555';
const OTHER_ABILITY_ID = '66666666-6666-4666-8666-666666666666';

function acceptsTheLoadoutOfTheFourSlots(): void {
  const validation = validateAbilitySlots({ abilityIds: ['', ABILITY_ID, '', OTHER_ABILITY_ID] });
  expect(validation.ok).toBe(true);
  if (!validation.ok) {
    return;
  }
  expect(validation.value.abilityIds).toEqual([null, ABILITY_ID, null, OTHER_ABILITY_ID]);
}

function acceptsAShorterLoadout(): void {
  const validation = validateAbilitySlots({ abilityIds: [ABILITY_ID] });
  expect(validation.ok).toBe(true);
  if (!validation.ok) {
    return;
  }
  expect(validation.value.abilityIds).toEqual([ABILITY_ID]);
}

function acceptsAnEmptyLoadout(): void {
  const validation = validateAbilitySlots({ abilityIds: [] });
  expect(validation.ok).toBe(true);
}

function refusesMoreThanFourSlots(): void {
  const validation = validateAbilitySlots({
    abilityIds: [ABILITY_ID, ABILITY_ID, ABILITY_ID, ABILITY_ID, ABILITY_ID],
  });
  expect(validation.ok).toBe(false);
}

function refusesARepeatedAbility(): void {
  const validation = validateAbilitySlots({ abilityIds: ['', ABILITY_ID, '', ABILITY_ID] });
  expect(validation.ok).toBe(false);
}

function refusesAnEntryThatIsNotAnAbility(): void {
  const validation = validateAbilitySlots({ abilityIds: ['nao-e-um-uuid'] });
  expect(validation.ok).toBe(false);
}

function refusesABodyThatIsNotALoadout(): void {
  expect(validateAbilitySlots(null).ok).toBe(false);
  expect(validateAbilitySlots({}).ok).toBe(false);
  expect(validateAbilitySlots({ abilityIds: 'brasa' }).ok).toBe(false);
}

function readsTheGearSlotOfThePath(): void {
  expect(readGearSlotNumber('4')).toBe(4);
  expect(readGearSlotNumber('6')).toBe(6);
  expect(readGearSlotNumber('x')).toBeNull();
  expect(readGearSlotNumber()).toBeNull();
}

function onlyTheSlotsOfTheTrainerAreGearSlots(): void {
  expect(isTrainerGearSlot(4)).toBe(true);
  expect(isTrainerGearSlot(5)).toBe(true);
  expect(isTrainerGearSlot(6)).toBe(true);
  expect(isTrainerGearSlot(3)).toBe(false);
  expect(isTrainerGearSlot(7)).toBe(false);
}

function readsTheItemOfTheGearSlot(): void {
  const validation = validateGearSlot({ itemId: ABILITY_ID, triggerHpPercent: 30 });
  expect(validation.ok).toBe(true);
  const withoutTrigger = validateGearSlot({ itemId: ABILITY_ID });
  expect(withoutTrigger.ok).toBe(true);
  expect(validateGearSlot({ itemId: 'nao-e-um-uuid' }).ok).toBe(false);
  expect(validateGearSlot({ itemId: ABILITY_ID, triggerHpPercent: 0 }).ok).toBe(false);
  expect(validateGearSlot({ itemId: ABILITY_ID, triggerHpPercent: 101 }).ok).toBe(false);
}

test('the loadout of the four slots is accepted', acceptsTheLoadoutOfTheFourSlots);
test('a shorter loadout is accepted', acceptsAShorterLoadout);
test('an empty loadout is accepted', acceptsAnEmptyLoadout);
test('more than four slots are refused', refusesMoreThanFourSlots);
test('a repeated ability is refused', refusesARepeatedAbility);
test('an entry that is not an ability is refused', refusesAnEntryThatIsNotAnAbility);
test('a body that is not a loadout is refused', refusesABodyThatIsNotALoadout);
test('the gear slot of the path is read', readsTheGearSlotOfThePath);
test('only the slots of the trainer are gear slots', onlyTheSlotsOfTheTrainerAreGearSlots);
test('the item of the gear slot is read', readsTheItemOfTheGearSlot);
