import type { Creature, SpeciesSummary } from '@creatures/contracts/creature';

export type CreatureIdentity = {
  speciesName: string | null;
};

/**
 * The identity of a creature, as the interface shows it.
 *
 * The species arrives with the state of the game. A state from a server that
 * does not carry the species yet has no species, and the tab falls back to the
 * placeholder instead of breaking.
 */
export function readCreatureIdentity(creature: Creature): CreatureIdentity {
  return { speciesName: readSpecies(creature)?.name ?? null };
}

function readSpecies(creature: Creature): SpeciesSummary | null {
  const species = (creature as { species?: SpeciesSummary }).species;
  if (typeof species !== 'object' || species === null) {
    return null;
  }
  return species;
}
