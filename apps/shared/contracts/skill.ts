import type { Element } from './species';

/**
 * The slots of the skill bar, from left to right.
 *
 * The creature owns the four ability slots; the trainer owns the two
 * consumable slots and the device slot.
 */
export type SkillSlot = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const ABILITY_SLOTS: readonly SkillSlot[] = [0, 1, 2, 3];
export const CONSUMABLE_SLOTS: readonly SkillSlot[] = [4, 5];
export const DEVICE_SLOT: SkillSlot = 6;

/**
 * An ability equipped in a slot of a creature.
 */
export type EquippedAbility = {
  abilityId: string;
  cooldownMs: number;
  damage: number;
  element: Element;
  name: string;
  slot: SkillSlot;
  slug: string;
};

/**
 * A consumable equipped in a slot, with the life it triggers at.
 */
export type EquippedConsumable = {
  itemId: string;
  name: string;
  quantity: number;
  slot: SkillSlot;
  triggerHpPercent: number;
};

/**
 * The capture device equipped in the device slot.
 */
export type EquippedDevice = {
  itemId: string;
  name: string;
  quantity: number;
  slot: SkillSlot;
};

/**
 * The life of the active creature.
 *
 * The maximum life comes from the species and the potential; the current life
 * is what is left of it.
 */
export type CreatureVitals = {
  currentHp: number;
  maxHp: number;
};
