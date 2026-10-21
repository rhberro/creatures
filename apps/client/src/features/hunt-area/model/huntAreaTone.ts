import type { HuntAreaTone } from '@creatures/contracts/hunt';

/**
 * The roles of a tone in the interface.
 *
 * A tone is a name, never a color. The interface resolves it to the semantic
 * tokens of the palette, the same way the `Chip` does, so a tone that comes
 * from the database never turns into a raw color on the screen.
 */
export type HuntAreaToneColors = {
  /** The ring that draws the area around the portrait of the creature. */
  border: string;
  /** The fill of the circle of a creature, of an item and of the portrait. */
  fill: string;
  /** The fill of the big block, the image of the area in the drawer. */
  surface: string;
};

/**
 * The tones of the hunt areas and the tokens they resolve to.
 *
 * The neutral tone has no palette of its own in the game: the areas without
 * an element use the gray palette, which is the `base` scale with the weights
 * of a neutral color.
 */
export const HUNT_AREA_TONE_COLORS: Record<HuntAreaTone, HuntAreaToneColors> = {
  arcane: {
    border: 'arcane.border',
    fill: 'arcane.emphasized',
    surface: 'arcane.solid',
  },
  blood: {
    border: 'blood.border',
    fill: 'blood.emphasized',
    surface: 'blood.solid',
  },
  ember: {
    border: 'ember.border',
    fill: 'ember.emphasized',
    surface: 'ember.solid',
  },
  frost: {
    border: 'frost.border',
    fill: 'frost.emphasized',
    surface: 'frost.solid',
  },
  gold: {
    border: 'gold.border',
    fill: 'gold.emphasized',
    surface: 'gold.solid',
  },
  neutral: {
    border: 'border.emphasized',
    fill: 'gray.emphasized',
    surface: 'gray.solid',
  },
  verdant: {
    border: 'verdant.border',
    fill: 'verdant.emphasized',
    surface: 'verdant.solid',
  },
};

/**
 * The fill of a tone.
 */
export function huntAreaToneFill(tone: HuntAreaTone): string {
  return HUNT_AREA_TONE_COLORS[tone].fill;
}
