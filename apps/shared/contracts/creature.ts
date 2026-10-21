import type { Element } from './species';

export type Potential = {
  vitality: number;
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicDefense: number;
};

/**
 * The species of a creature, reduced to what the interface shows.
 *
 * The full species lives in the catalog; a creature carries the reference to
 * it, and the interface needs the name and the element to draw the tab.
 */
export type SpeciesSummary = {
  element: Element;
  id: string;
  name: string;
  slug: string;
};

/**
 * A creature: one individual of a species, owned by a trainer.
 *
 * The values that change over the creature's life are the potential and the
 * level. The attributes and the level formula are not written yet, so the
 * interface cannot show a derived attribute yet.
 */
export type Creature = {
  capturedAt: string | null;
  createdAt: string;
  experience: number;
  id: string;
  isInTeam: boolean;
  level: number;
  nickname: string | null;
  potential: Potential;
  species: SpeciesSummary;
  speciesId: string;
  teamSlot: number | null;
  trainerId: string;
};

/**
 * One ability of a species, in the slot it occupies.
 *
 * The slot is what the skill bar draws: the abilities of the active creature
 * fill the four ability slots in the order the species declares them.
 */
export type CreatureAbility = {
  abilityId: string;
  cooldownMs: number;
  damage: number;
  element: Element;
  name: string;
  slot: number;
  slug: string;
};
