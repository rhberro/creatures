import type { HuntAreaTone } from '@creatures/contracts/hunt';
import type { ItemCategory } from '@creatures/contracts/inventory';
import type { Element } from '@creatures/contracts/species';

/**
 * The tone of a species comes from its element and the tone of an item comes
 * from its category.
 *
 * The tone is a presentation rule, and the presentation is the server's
 * decision: the client resolves a tone to the palette tokens it needs, and it
 * never has to guess which tone a creature is drawn with.
 */
const SPECIES_TONES: Record<Element, HuntAreaTone> = {
  fire: 'ember',
  neutral: 'neutral',
  plant: 'verdant',
  water: 'frost',
};

const ITEM_TONES: Record<ItemCategory, HuntAreaTone> = {
  consumable: 'verdant',
  device: 'frost',
  material: 'gold',
};

const AREA_TONES: ReadonlySet<string> = new Set<HuntAreaTone>([
  'arcane',
  'blood',
  'ember',
  'frost',
  'gold',
  'neutral',
  'verdant',
]);

export function speciesTone(element: Element): HuntAreaTone {
  return SPECIES_TONES[element];
}

export function itemTone(category: ItemCategory): HuntAreaTone {
  return ITEM_TONES[category];
}

/**
 * The tone of an area is chosen by design and lives in the column of the area,
 * so it is read instead of derived.
 */
export function areaTone(value: string): HuntAreaTone {
  if (AREA_TONES.has(value)) {
    return value as HuntAreaTone;
  }
  return 'neutral';
}
