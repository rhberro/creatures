import type { SkillSlot } from '@creatures/contracts/skill';

import type { PendingLoadout } from './skillPanelPrediction';

/**
 * The kind of a command of the panel.
 */
export type PendingCommandKind = 'ability' | 'consumable' | 'device' | 'trigger';

/**
 * A command of the panel that is on its way to the server.
 *
 * The client keeps the commands in the order the player made them: the
 * prediction of the last one is the loadout the interface shows, and each
 * command knows the slot and the item it holds while it flies.
 */
export type PendingCommand = {
  /** The identifier of the command: it is what the failure of it carries. */
  id: string;
  /** The item the command carries: it cannot be clicked again while it flies. */
  itemId: string;
  /** The kind of the command. */
  kind: PendingCommandKind;
  /** The loadout the client predicts once this command lands. */
  prediction: PendingLoadout;
  /** The slot the command changes. */
  slot: SkillSlot;
};

/**
 * The commands of the panel that are on their way, in the order of the clicks.
 */
export type PendingCommandList = PendingCommand[];

let commandCounter = 0;

/**
 * The identifier of a command: it tells one command from another.
 */
export function createCommandId(): string {
  commandCounter += 1;
  return `skill-panel-command-${commandCounter}`;
}

/**
 * Puts a command at the end of the queue.
 */
export function appendCommand(
  commands: PendingCommandList,
  command: PendingCommand,
): PendingCommandList {
  return [...commands, command];
}

/**
 * The loadout the client predicts: the one of the last command.
 *
 * Every prediction is built over the prediction of the command before it, so
 * the last one carries the changes of all of them.
 */
export function readPendingLoadout(commands: PendingCommandList): PendingLoadout | null {
  const last = commands.at(-1);
  if (last === undefined) {
    return null;
  }
  return last.prediction;
}

/**
 * The items that are on their way: none of them can be clicked again.
 */
export function readPendingItemIds(commands: PendingCommandList): string[] {
  return commands.map(function readItemId(command: PendingCommand): string {
    return command.itemId;
  });
}

/**
 * Whether a command is still in the queue.
 */
export function hasCommand(commands: PendingCommandList, id: string): boolean {
  return commands.some(function matches(command: PendingCommand): boolean {
    return command.id === id;
  });
}

/**
 * Whether the slot is waiting for the server.
 *
 * The life that triggers a consumable is a value and not an equipment: it
 * does not hold the slot, so the player can keep moving it while the command
 * of the previous value is on its way.
 */
export function isSlotBusy(commands: PendingCommandList, slot: SkillSlot): boolean {
  return commands.some(function matches(command: PendingCommand): boolean {
    return command.slot === slot && command.kind !== 'trigger';
  });
}

/**
 * Whether the item is waiting for the server.
 *
 * The same item cannot be chosen twice while the first command is on its way:
 * the player would not know which one of the two wins. The life that triggers
 * a consumable is not an item: it does not hold the one it watches.
 */
export function isItemBusy(commands: PendingCommandList, itemId: string): boolean {
  return commands.some(function matches(command: PendingCommand): boolean {
    return command.kind !== 'trigger' && command.itemId === itemId;
  });
}

/**
 * Forgets a command the server refused, and the ones that came after it.
 *
 * The prediction of a command that came after the refused one was built over
 * the change that never happened: keeping it would put the loadout of the
 * client further away from the state of the server.
 */
export function removeCommandFrom(commands: PendingCommandList, id: string): PendingCommandList {
  const index = commands.findIndex(function matches(command: PendingCommand): boolean {
    return command.id === id;
  });
  if (index < 0) {
    return commands;
  }
  return commands.slice(0, index);
}
