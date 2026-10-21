import type { Creature, SpeciesSummary } from '@creatures/contracts/creature';
import type { Element } from '@creatures/contracts/species';

const UNKNOWN_NAME = '—';

/**
 * The name of the species of a creature, as the interface shows it.
 *
 * The species arrives with the state of the game. A state from a server that
 * does not carry the species yet has no species, and the interface falls back
 * to the placeholder instead of breaking.
 */
export function readCreatureName(creature: Creature): string {
  return readSpecies(creature)?.name ?? UNKNOWN_NAME;
}

/**
 * The element of a creature, which is what decides the color of its mark.
 *
 * The element is also the icon beside the name: the color never comes alone.
 */
export function readCreatureElement(creature: Creature): Element {
  return readSpecies(creature)?.element ?? 'neutral';
}

function readSpecies(creature: Creature): SpeciesSummary | null {
  const species = (creature as { species?: SpeciesSummary }).species;
  return typeof species === 'object' && species !== null ? species : null;
}
