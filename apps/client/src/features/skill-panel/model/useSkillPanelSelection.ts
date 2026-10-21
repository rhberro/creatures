import type { PlayerState } from '@creatures/contracts/player';
import type { SkillSlot } from '@creatures/contracts/skill';

import type { TrainerClientErrorCode } from '~/shared/api';

import { planAbilityChoice, planConsumableChoice, planDeviceChoice } from './skillPanelChoice';
import { planTriggerChoice } from './skillPanelChoice';
import { clampTrigger, readTriggerChoice } from './skillPanelCommands';
import { isAbilitySlot, isConsumableSlot, isDeviceSlot } from './skillPanelModel';
import type { PendingCommand, PendingCommandList } from './skillPanelQueue';
import { skillPanelStore, useSkillPanelState } from './skillPanelStore';
import type { SkillPanelStoreState, TriggerOverride } from './skillPanelStore';
import { useSkillCommands } from './useSkillCommands';
import type { SkillCommandsView } from './useSkillCommands';

export type SkillPanelSelection = {
  selectAbility: (abilityId: string) => void;
  selectConsumable: (itemId: string) => void;
  selectDevice: (itemId: string) => void;
  setTriggerHpPercent: (percent: number) => void;
};

/**
 * The choices the player makes in the panels of the skill bar.
 *
 * Every choice is applied locally at once: the card of the panel and the slot
 * of the bar show the change before the server answers. The server is the
 * authority — the state it pushes is the one that stays, and a command it
 * refuses undoes the change.
 *
 * A slot waits only for its own command: a command that is on its way in one
 * slot does not stop the player from changing another one.
 */
export function useSkillPanelSelection(
  state: PlayerState | null,
  triggerOverride: TriggerOverride | null,
  onCommandFailed: (code: TrainerClientErrorCode) => void,
): SkillPanelSelection {
  const openSlot = useSkillPanelState(selectOpenSlot);
  const commands = useSkillCommands({
    onCommandFailed: buildCommandFailure(onCommandFailed),
    state,
  });
  return {
    selectAbility: buildAbilitySelection(state, openSlot, commands),
    selectConsumable: buildConsumableSelection(state, openSlot, triggerOverride, commands),
    selectDevice: buildDeviceSelection(state, openSlot, commands),
    setTriggerHpPercent: buildTriggerSelection(state, openSlot, triggerOverride, commands),
  };
}

/**
 * The choice of an ability.
 */
function buildAbilitySelection(
  state: PlayerState | null,
  openSlot: SkillSlot | null,
  commands: SkillCommandsView,
): (abilityId: string) => void {
  return function selectAbility(abilityId: string): void {
    const slot = openSlot;
    if (slot === null || !isAbilitySlot(slot)) {
      return;
    }
    const choice = planAbilityChoice(state, readCommands(), slot, abilityId);
    if (choice === null) {
      return;
    }
    applyLocalChange(choice.command);
    commands.equipAbility(choice.command, choice.abilityIds);
    closePanel();
  };
}

/**
 * The choice of a consumable.
 */
function buildConsumableSelection(
  state: PlayerState | null,
  openSlot: SkillSlot | null,
  triggerOverride: TriggerOverride | null,
  commands: SkillCommandsView,
): (itemId: string) => void {
  return function selectConsumable(itemId: string): void {
    const slot = openSlot;
    if (slot === null || !isConsumableSlot(slot)) {
      return;
    }
    const trigger = readTriggerChoice(state, slot, triggerOverride);
    const choice = planConsumableChoice(state, readCommands(), slot, itemId, trigger);
    if (choice === null) {
      return;
    }
    applyLocalChange(choice.command);
    commands.equipConsumable(choice.command, choice.itemId, choice.triggerHpPercent, choice.clear);
    closePanel();
  };
}

/**
 * The choice of a capture device.
 */
function buildDeviceSelection(
  state: PlayerState | null,
  openSlot: SkillSlot | null,
  commands: SkillCommandsView,
): (itemId: string) => void {
  return function selectDevice(itemId: string): void {
    const slot = openSlot;
    if (slot === null || !isDeviceSlot(slot)) {
      return;
    }
    const choice = planDeviceChoice(state, readCommands(), slot, itemId);
    if (choice === null) {
      return;
    }
    applyLocalChange(choice.command);
    commands.equipDevice(choice.command, choice.itemId, choice.clear);
    closePanel();
  };
}

/**
 * The life that triggers the consumable of the slot.
 *
 * The life the player chose is kept by the client even when the slot has no
 * consumable: the value waits for the consumable that takes the slot.
 */
function buildTriggerSelection(
  state: PlayerState | null,
  openSlot: SkillSlot | null,
  triggerOverride: TriggerOverride | null,
  commands: SkillCommandsView,
): (percent: number) => void {
  return function setTriggerHpPercent(percent: number): void {
    const slot = openSlot;
    if (slot === null || !isConsumableSlot(slot)) {
      return;
    }
    const next = clampTrigger(percent);
    if (next === readTriggerChoice(state, slot, triggerOverride)) {
      return;
    }
    skillPanelStore.getState().setTriggerOverride({ percent: next, slot });
    const choice = planTriggerChoice(state, readCommands(), slot, next);
    if (choice === null) {
      return;
    }
    applyLocalChange(choice.command);
    commands.setTrigger(choice.command, choice.itemId, choice.percent);
  };
}

/**
 * The local change of the loadout, applied before the server answers.
 */
function applyLocalChange(command: PendingCommand): void {
  skillPanelStore.getState().addCommand(command);
}

/**
 * The commands that are on their way.
 */
function readCommands(): PendingCommandList {
  return skillPanelStore.getState().commands;
}

/**
 * A command the server refuses undoes the change the client applied.
 */
function buildCommandFailure(
  onCommandFailed: (code: TrainerClientErrorCode) => void,
): (code: TrainerClientErrorCode) => void {
  return function handleCommandFailed(code: TrainerClientErrorCode): void {
    skillPanelStore.getState().clearTriggerOverride();
    onCommandFailed(code);
  };
}

function closePanel(): void {
  skillPanelStore.getState().closePanel();
}

function selectOpenSlot(state: SkillPanelStoreState): SkillSlot | null {
  return state.openSlot;
}
