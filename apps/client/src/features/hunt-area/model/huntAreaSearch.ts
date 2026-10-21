import type { HuntArea } from '@creatures/contracts/hunt';

const DIACRITIC_PATTERN = /\p{Diacritic}/gu;

/**
 * The text of the search, normalized.
 *
 * The accents go away and the case stops mattering, so "monsTRINHO" finds
 * "Monstrinho" and the player does not need to hit the accent.
 */
export function normalizeHuntAreaText(value: string): string {
  return value.normalize('NFD').replaceAll(DIACRITIC_PATTERN, '').toLowerCase().trim();
}

/**
 * The areas that match the search.
 *
 * The search finds an area by its own name or by the name of one of the
 * creatures of the place: the player looks for what he will find there, and
 * not only for the name of the location.
 */
export function filterHuntAreas(areas: HuntArea[], query: string): HuntArea[] {
  const normalized = normalizeHuntAreaText(query);
  if (normalized === '') {
    return areas;
  }
  return areas.filter(matchesHuntArea(normalized));
}

function matchesHuntArea(normalized: string): (area: HuntArea) => boolean {
  return function matches(area: HuntArea): boolean {
    if (normalizeHuntAreaText(area.name).includes(normalized)) {
      return true;
    }
    return area.species.some(matchesSpeciesName(normalized));
  };
}

function matchesSpeciesName(normalized: string): (entry: HuntArea['species'][number]) => boolean {
  return function matches(entry: HuntArea['species'][number]): boolean {
    return normalizeHuntAreaText(entry.species.name).includes(normalized);
  };
}
