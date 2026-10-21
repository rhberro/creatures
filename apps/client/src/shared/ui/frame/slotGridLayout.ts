const SLOT_SIZE = 56;
const SLOT_GAP = 4;

/**
 * The columns used while the width of the grid is unknown.
 *
 * The grid measures itself, and the measurement lands after the first render.
 * The fallback keeps the grid from showing nothing while it waits: without it
 * an empty backpack would show an empty area and then jump.
 */
export const DEFAULT_SLOT_COLUMNS = 11;

/**
 * How many columns fit in a width.
 *
 * A width of zero means "not measured yet", not "no columns at all".
 */
export function computeSlotColumns(width: number): number {
  if (width <= 0) {
    return 0;
  }
  return Math.max(1, Math.floor((width + SLOT_GAP) / (SLOT_SIZE + SLOT_GAP)));
}

/**
 * The columns the grid works with.
 *
 * The measured ones when the grid knows its width; the fallback when it does
 * not and there is no item to show.
 */
export function resolveSlotColumns(columns: number, filled: number): number {
  if (columns > 0) {
    return columns;
  }
  if (filled === 0) {
    return DEFAULT_SLOT_COLUMNS;
  }
  return 0;
}

/**
 * The empty slots that complete the last row.
 *
 * The grid shows full rows: the last row of the items is completed with empty
 * slots, and a grid with no item at all shows one full row of empty slots —
 * the player sees that the slots are there, instead of an empty area.
 *
 * The grid does not grow: the empty slots never make a row of their own.
 */
export function computeEmptySlotCount(columns: number, filled: number): number {
  if (columns <= 0) {
    return 0;
  }
  if (filled === 0) {
    return columns;
  }
  return (columns - (filled % columns)) % columns;
}
