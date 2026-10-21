import type { PlayerState } from '@creatures/contracts/player';
import type { SkillSlot } from '@creatures/contracts/skill';

import { buildAbilitySlotPayloadFrom, readEquippedConsumable } from './skillPanelCommands';
import type { PendingLoadout } from './skillPanelPrediction';
import {
  predictAbilityEquip,
  predictConsumableEquip,
  predictDeviceEquip,
  predictTrigger,
  readLoadout,
} from './skillPanelPrediction';
import type { PendingCommand, PendingCommandList } from './skillPanelQueue';
import { createCommandId, isItemBusy, isSlotBusy, readPendingLoadout } from './skillPanelQueue';

/**
 * The choice of an ability, ready to be sent to the server.
 */
export type AbilityChoice = {
  /** The four slots of the loadout, as the server reads them. */
  abilityIds: string[];
  command: PendingCommand;
};

/**
 * The choice of a consumable, ready to be sent to the server.
 */
export type ConsumableChoice = {
  /** Whether the choice empties the slot. */
  clear: boolean;
  command: PendingCommand;
  itemId: string;
  triggerHpPercent: number;
};

/**
 * The choice of a capture device, ready to be sent to the server.
 */
export type DeviceChoice = {
  /** Whether the choice empties the slot. */
  clear: boolean;
  command: PendingCommand;
  itemId: string;
};

/**
 * The choice of the life that triggers a consumable, ready to be sent.
 */
export type TriggerChoice = {
  command: PendingCommand;
  itemId: string;
  percent: number;
};

/**
 * The choice of an ability in a slot.
 *
 * The choice is refused when the slot is waiting for the server or when the
 * same ability is on its way: the slot of another command is free, so the
 * player can change two slots in a row without waiting for the first answer.
 */
export function planAbilityChoice(
  state: PlayerState | null,
  commands: PendingCommandList,
  slot: SkillSlot,
  abilityId: string,
): AbilityChoice | null {
  if (isSlotBusy(commands, slot) || isItemBusy(commands, abilityId)) {
    return null;
  }
  const prediction = predictAbilityEquip(readBaseLoadout(state, commands), state, slot, abilityId);
  const command = createCommand('ability', slot, abilityId, prediction);
  return { abilityIds: buildAbilitySlotPayloadFrom(prediction), command };
}

/**
 * The choice of a consumable in a slot.
 */
export function planConsumableChoice(
  state: PlayerState | null,
  commands: PendingCommandList,
  slot: SkillSlot,
  itemId: string,
  triggerHpPercent: number,
): ConsumableChoice | null {
  if (isSlotBusy(commands, slot) || isItemBusy(commands, itemId)) {
    return null;
  }
  const equipped = readEquippedConsumable(state, slot);
  const clear = equipped !== null && equipped.itemId === itemId;
  const prediction = predictConsumableEquip(
    readBaseLoadout(state, commands),
    state,
    slot,
    itemId,
    triggerHpPercent,
  );
  const command = createCommand('consumable', slot, itemId, prediction);
  return { clear, command, itemId, triggerHpPercent };
}

/**
 * The choice of a capture device in the device slot.
 */
export function planDeviceChoice(
  state: PlayerState | null,
  commands: PendingCommandList,
  slot: SkillSlot,
  itemId: string,
): DeviceChoice | null {
  if (isSlotBusy(commands, slot) || isItemBusy(commands, itemId)) {
    return null;
  }
  const equipped = state?.equippedDevice ?? null;
  const clear = equipped !== null && equipped.itemId === itemId;
  const prediction = predictDeviceEquip(readBaseLoadout(state, commands), state, itemId);
  const command = createCommand('device', slot, itemId, prediction);
  return { clear, command, itemId };
}

/**
 * The choice of the life that triggers the consumable of a slot.
 *
 * The life is a value and not an equipment: it does not hold the slot, so the
 * player can keep moving it while the command of the previous value is on its
 * way. The commands go out in the order the player made them.
 */
export function planTriggerChoice(
  state: PlayerState | null,
  commands: PendingCommandList,
  slot: SkillSlot,
  percent: number,
): TriggerChoice | null {
  const equipped = readEquippedConsumable(state, slot);
  if (equipped === null) {
    return null;
  }
  const prediction = predictTrigger(readBaseLoadout(state, commands), slot, percent);
  const command = createCommand('trigger', slot, equipped.itemId, prediction);
  return { command, itemId: equipped.itemId, percent };
}

/**
 * The loadout the choice is built over: the prediction of the commands that
 * are on their way, or the state of the server when there is none.
 */
function readBaseLoadout(state: PlayerState | null, commands: PendingCommandList): PendingLoadout {
  return readPendingLoadout(commands) ?? readLoadout(state);
}

function createCommand(
  kind: PendingCommand['kind'],
  slot: SkillSlot,
  itemId: string,
  prediction: PendingLoadout,
): PendingCommand {
  return { id: createCommandId(), itemId, kind, prediction, slot };
}
