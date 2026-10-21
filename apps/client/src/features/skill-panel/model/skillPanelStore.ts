import type { SkillSlot } from '@creatures/contracts/skill';
import { useStore } from 'zustand/react';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import type { PendingLoadout } from './skillPanelPrediction';
import type { PendingCommand, PendingCommandList } from './skillPanelQueue';
import { appendCommand, readPendingItemIds, readPendingLoadout } from './skillPanelQueue';
import { removeCommandFrom } from './skillPanelQueue';

/**
 * The life the player chose for a slot, before the server carries it.
 *
 * The trigger of a slot without consumable has nowhere to live in the server:
 * the client keeps it until a consumable takes the slot.
 */
export type TriggerOverride = {
  percent: number;
  slot: SkillSlot;
};

export type SkillPanelActions = {
  /** Puts a command in the queue of the commands that are on their way. */
  addCommand: (command: PendingCommand) => void;
  /** Forgets the commands that are on their way: the state of the server is the truth again. */
  clearCommands: () => void;
  /** Forgets the life the player chose. */
  clearTriggerOverride: () => void;
  /** Closes the panel that is open. */
  closePanel: () => void;
  /** Opens the panel of a slot, or closes it when it is the one that is open. */
  openPanel: (slot: SkillSlot) => void;
  /** Forgets a command the server refused, and the ones that came after it. */
  removeCommand: (id: string) => void;
  /** Puts the panel back to the beginning. */
  reset: () => void;
  /** The life the player chose for a slot. */
  setTriggerOverride: (override: TriggerOverride | null) => void;
};

export type SkillPanelSnapshot = {
  /** The commands of the panel that are on their way, in the order of the clicks. */
  commands: PendingCommandList;
  /** The slot whose panel is open. */
  openSlot: SkillSlot | null;
  /** The life the player chose for a slot. */
  triggerOverride: TriggerOverride | null;
};

export type SkillPanelStoreState = SkillPanelSnapshot & SkillPanelActions;

export type SkillPanelStore = StoreApi<SkillPanelStoreState>;

/**
 * The state of the panels of the skill bar.
 *
 * The store lives outside the page because the bar and the panels are two
 * consumers of the same truth: the loadout the client predicts has to reach
 * the slot of the bar at the same instant it reaches the card of the panel.
 */
export function createSkillPanelStore(): SkillPanelStore {
  return createStore<SkillPanelStoreState>(buildInitializer());
}

export const skillPanelStore: SkillPanelStore = createSkillPanelStore();

/**
 * Reads a piece of the state of the panels.
 */
export function useSkillPanelState<T>(selector: (state: SkillPanelStoreState) => T): T {
  return useStore(skillPanelStore, selector);
}

/**
 * The commands of the panel that are on their way.
 */
export function selectCommands(state: SkillPanelStoreState): PendingCommandList {
  return state.commands;
}

/**
 * The loadout the client predicts, for the bar that shows the slots.
 *
 * The bar is another consumer of the prediction of the panel: the slot shows
 * the new item in the same instant the card of the panel shows it selected.
 */
export function usePendingLoadout(): PendingLoadout | null {
  return useStore(skillPanelStore, selectPendingLoadout);
}

/**
 * The loadout the client predicts.
 */
export function selectPendingLoadout(state: SkillPanelStoreState): PendingLoadout | null {
  return readPendingLoadout(state.commands);
}

/**
 * The items that are on their way: none of them can be clicked again.
 */
export function selectPendingItemIds(state: SkillPanelStoreState): string[] {
  return readPendingItemIds(state.commands);
}

function buildInitializer(): StateCreator<SkillPanelStoreState> {
  return function initialize(set, get): SkillPanelStoreState {
    return {
      ...buildInitialSnapshot(),
      ...buildActions(set, get),
    };
  };
}

function buildInitialSnapshot(): SkillPanelSnapshot {
  return {
    commands: [],
    openSlot: null,
    triggerOverride: null,
  };
}

function buildActions(
  set: (partial: Partial<SkillPanelStoreState>) => void,
  get: () => SkillPanelStoreState,
): SkillPanelActions {
  return {
    addCommand: buildAddCommand(set, get),
    clearCommands: buildClearCommands(set),
    clearTriggerOverride: buildClearTriggerOverride(set),
    closePanel: buildClosePanel(set),
    openPanel: buildOpenPanel(set, get),
    removeCommand: buildRemoveCommand(set, get),
    reset: buildReset(set),
    setTriggerOverride: buildSetTriggerOverride(set),
  };
}

function buildAddCommand(
  set: (partial: Partial<SkillPanelStoreState>) => void,
  get: () => SkillPanelStoreState,
): (command: PendingCommand) => void {
  return function addCommand(command: PendingCommand): void {
    set({ commands: appendCommand(get().commands, command) });
  };
}

function buildClearCommands(set: (partial: Partial<SkillPanelStoreState>) => void): () => void {
  return function clearCommands(): void {
    set({ commands: [] });
  };
}

function buildClearTriggerOverride(
  set: (partial: Partial<SkillPanelStoreState>) => void,
): () => void {
  return function clearTriggerOverride(): void {
    set({ triggerOverride: null });
  };
}

function buildClosePanel(set: (partial: Partial<SkillPanelStoreState>) => void): () => void {
  return function closePanel(): void {
    set({ openSlot: null });
  };
}

function buildOpenPanel(
  set: (partial: Partial<SkillPanelStoreState>) => void,
  get: () => SkillPanelStoreState,
): (slot: SkillSlot) => void {
  return function openPanel(slot: SkillSlot): void {
    set({ openSlot: get().openSlot === slot ? null : slot });
  };
}

function buildRemoveCommand(
  set: (partial: Partial<SkillPanelStoreState>) => void,
  get: () => SkillPanelStoreState,
): (id: string) => void {
  return function removeCommand(id: string): void {
    set({ commands: removeCommandFrom(get().commands, id) });
  };
}

function buildReset(set: (partial: Partial<SkillPanelStoreState>) => void): () => void {
  return function reset(): void {
    set({
      commands: [],
      openSlot: null,
      triggerOverride: null,
    });
  };
}

function buildSetTriggerOverride(
  set: (partial: Partial<SkillPanelStoreState>) => void,
): (override: TriggerOverride | null) => void {
  return function setTriggerOverride(override: TriggerOverride | null): void {
    set({ triggerOverride: override });
  };
}
