import type { HuntArea } from '@creatures/contracts/hunt';

/**
 * How many areas fit in one page.
 *
 * The grid of the modal has four columns, so a page holds two rows of cards.
 */
export const HUNT_AREAS_PER_PAGE = 8;

export function countHuntAreaPages(total: number): number {
  return Math.max(1, Math.ceil(total / HUNT_AREAS_PER_PAGE));
}

/**
 * The areas of one page.
 */
export function huntAreaPage(areas: HuntArea[], page: number): HuntArea[] {
  const start = (page - 1) * HUNT_AREAS_PER_PAGE;
  return areas.slice(start, start + HUNT_AREAS_PER_PAGE);
}

/**
 * The page that shows something, when the list shrank under the player.
 */
export function clampHuntAreaPage(page: number, pageCount: number): number {
  return Math.min(Math.max(page, 1), pageCount);
}
