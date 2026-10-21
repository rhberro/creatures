/**
 * The creatures seeded for the test account.
 *
 * One creature per species, each one with a different potential, so the team
 * swap and the five second cooldown can be exercised.
 */

export const CREATURE_COUNT = 4;

export type SpeciesRow = {
  id: string;
  name: string;
  slug: string;
};

export type Potential = {
  magicAttack: number;
  magicDefense: number;
  physicalAttack: number;
  physicalDefense: number;
  vitality: number;
};

export type CreatureSeed = {
  nickname: string;
  potential: Potential;
  speciesSlug: string;
};

export const CREATURE_SEEDS: CreatureSeed[] = [
  {
    nickname: 'Brasa',
    potential: {
      magicAttack: 20,
      magicDefense: 15,
      physicalAttack: 85,
      physicalDefense: 60,
      vitality: 70,
    },
    speciesSlug: 'brasa',
  },
  {
    nickname: 'Gota',
    potential: {
      magicAttack: 80,
      magicDefense: 75,
      physicalAttack: 25,
      physicalDefense: 40,
      vitality: 55,
    },
    speciesSlug: 'gota',
  },
  {
    nickname: 'Broto',
    potential: {
      magicAttack: 45,
      magicDefense: 80,
      physicalAttack: 40,
      physicalDefense: 85,
      vitality: 90,
    },
    speciesSlug: 'broto',
  },
  {
    nickname: 'Cinzarra',
    potential: {
      magicAttack: 35,
      magicDefense: 25,
      physicalAttack: 95,
      physicalDefense: 45,
      vitality: 40,
    },
    speciesSlug: 'cinzarra',
  },
];
