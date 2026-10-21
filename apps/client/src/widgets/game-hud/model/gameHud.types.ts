import type { Creature } from '@creatures/contracts/creature';

export type { Creature };

export type CreatureSlot = Creature | null;

export type PlayScreenState = 'city' | 'hunt';
