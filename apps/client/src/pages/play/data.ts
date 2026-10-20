import type { CreatureSlot } from '~/components/domain/game/game.types';

export const TEAM_SLOTS: CreatureSlot[] = [
  { id: 'c1', level: 33, name: 'Criatura 1' },
  { id: 'c2', level: 14, name: 'Criatura 2' },
  { id: 'c3', level: 8, name: 'Criatura 3' },
  null,
  null,
];

export const ACTIVE_CREATURE_ID = 'c1';
