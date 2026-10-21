import type { StarterSpecies } from '@creatures/contracts/species';

/**
 * What the screen of the starter creatures needs.
 *
 * It comes from the species: the screen shows the name and sends the id when
 * the trainer is created.
 */
export type StarterEntry = Pick<StarterSpecies, 'id' | 'name'>;
