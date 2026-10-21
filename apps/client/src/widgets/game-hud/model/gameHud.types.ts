export type Creature = {
  id: string;
  level: number;
  name: string;
};

export type CreatureSlot = Creature | null;

export type PlayScreenState = 'city' | 'hunt';
