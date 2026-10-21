export type Element = 'fire' | 'water' | 'plant' | 'neutral';

export type Ability = {
  id: string;
  slug: string;
  name: string;
  element: Element;
  damage: number;
  cooldownMs: number;
  description: string;
};

export type Species = {
  id: string;
  slug: string;
  name: string;
  element: Element;
  description: string;
  baseVitality: number;
  basePhysicalAttack: number;
  baseMagicAttack: number;
  basePhysicalDefense: number;
  baseMagicDefense: number;
  captureChance: number;
  baseExperience: number;
  isStarter: boolean;
  abilities: Ability[];
};

export type StarterSpecies = Species & { isStarter: true };
