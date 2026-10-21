import type { HuntAreaItem, HuntAreaSpecies, HuntAreaTone } from '@creatures/contracts/hunt';

/**
 * A creature or an item of an area, reduced to what the interface draws: the
 * name that the tooltip shows and the tone that colors the circle.
 */
export type HuntAreaEntry = {
  name: string;
  tone: HuntAreaTone;
};

export function huntAreaSpeciesEntries(species: HuntAreaSpecies[]): HuntAreaEntry[] {
  return species.map(toSpeciesEntry);
}

export function huntAreaItemEntries(items: HuntAreaItem[]): HuntAreaEntry[] {
  return items.map(toItemEntry);
}

function toSpeciesEntry(entry: HuntAreaSpecies): HuntAreaEntry {
  return { name: entry.species.name, tone: entry.tone };
}

function toItemEntry(entry: HuntAreaItem): HuntAreaEntry {
  return { name: entry.name, tone: entry.tone };
}
