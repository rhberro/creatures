import { expect, test } from 'bun:test';

import type { PendingLoadout } from '~/features/skill-panel/model/skillPanelPrediction';
import type { PendingCommand } from '~/features/skill-panel/model/skillPanelQueue';
import {
  appendCommand,
  isItemBusy,
  isSlotBusy,
  readPendingItemIds,
  readPendingLoadout,
  removeCommandFrom,
} from '~/features/skill-panel/model/skillPanelQueue';

const BRASA_ID = 'b1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const IGNEA_ID = 'c2b3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

function buildLoadout(abilityId: string, slot: number): PendingLoadout {
  return {
    abilities: [
      {
        abilityId,
        cooldownMs: 4000,
        damage: 10,
        element: 'fire',
        name: 'Brasa',
        slot: slot as PendingLoadout['abilities'][number]['slot'],
        slug: 'brasa',
      },
    ],
    consumables: [],
    device: null,
  };
}

function buildCommand(
  id: string,
  itemId: string,
  slot: number,
  kind: PendingCommand['kind'] = 'ability',
): PendingCommand {
  return {
    id,
    itemId,
    kind,
    prediction: buildLoadout(itemId, slot),
    slot: slot as PendingCommand['slot'],
  };
}

/**
 * The loadout the client shows is the prediction of the last command.
 */
function showsThePredictionOfTheLastCommand(): void {
  const first = buildCommand('first', BRASA_ID, 0);
  const second = buildCommand('second', IGNEA_ID, 1);
  const commands = appendCommand(appendCommand([], first), second);
  expect(readPendingLoadout(commands)?.abilities.at(0)?.abilityId).toBe(IGNEA_ID);
}

test(
  'the loadout the client shows is the prediction of the last command',
  showsThePredictionOfTheLastCommand,
);

/**
 * A command the server refused takes the commands that came after it: their
 * prediction was built over a change that never happened.
 */
function removesTheRefusedCommandAndTheOnesAfterIt(): void {
  const first = buildCommand('first', BRASA_ID, 0);
  const second = buildCommand('second', IGNEA_ID, 1);
  const third = buildCommand('third', 'd3c4e5f6-a7b8-4c9d-8e0f-2a3b4c5d6e7f', 2);
  const commands = appendCommand(appendCommand(appendCommand([], first), second), third);
  const remaining = removeCommandFrom(commands, second.id);
  expect(remaining.length).toBe(1);
  expect(remaining.at(0)?.id).toBe('first');
}

test(
  'a command the server refused takes the commands that came after it',
  removesTheRefusedCommandAndTheOnesAfterIt,
);

/**
 * A slot waits only for its own command: the command of another slot does
 * not hold it.
 */
function holdsOnlyItsOwnSlot(): void {
  const first = buildCommand('first', BRASA_ID, 0);
  expect(isSlotBusy([first], 0)).toBe(true);
  expect(isSlotBusy([first], 1)).toBe(false);
}

test('a slot waits only for its own command', holdsOnlyItsOwnSlot);

/**
 * The life that triggers a consumable does not hold the slot: the player can
 * keep moving it while the command of the previous value is on its way.
 */
function doesNotHoldTheSlotWithTheTrigger(): void {
  const trigger = buildCommand('trigger', BRASA_ID, 4, 'trigger');
  expect(isSlotBusy([trigger], 4)).toBe(false);
  expect(isItemBusy([trigger], BRASA_ID)).toBe(false);
}

test(
  'the life that triggers a consumable does not hold the slot',
  doesNotHoldTheSlotWithTheTrigger,
);

/**
 * The items that are on their way are the ones that cannot be clicked again.
 */
function readsTheItemsOnTheirWay(): void {
  const first = buildCommand('first', BRASA_ID, 0);
  const second = buildCommand('second', IGNEA_ID, 1);
  const commands = appendCommand(appendCommand([], first), second);
  expect(readPendingItemIds(commands)).toEqual([BRASA_ID, IGNEA_ID]);
  expect(isItemBusy(commands, BRASA_ID)).toBe(true);
  expect(isItemBusy(commands, 'd3c4e5f6-a7b8-4c9d-8e0f-2a3b4c5d6e7f')).toBe(false);
}

test('the items that are on their way cannot be clicked again', readsTheItemsOnTheirWay);
