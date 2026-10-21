import { createContext } from 'react';

/**
 * The group of the popups of a grid.
 *
 * A grid has one open popup at a time. The group holds the id of the open one
 * and the id of the one pinned by a click, so clicking one slot closes the
 * popup of another and opens its own in the same update — with the mouse and
 * with the touch.
 */
export type PopupGroupContextValue = {
  /** The click on a trigger: it opens and pins the popup, closing the other. */
  click(id: string): void;
  /** The request of a popup to close, by the click outside or by the ESC. */
  dismiss(id: string): void;
  /** The pointer entered a trigger: it opens the popup. */
  enter(id: string): void;
  /** The pointer left a trigger: it closes the popup, unless it is pinned. */
  leave(id: string): void;
  /** The request of a popup to open. */
  open(id: string): void;
  /** The id of the open popup, or null when none is. */
  openId: string | null;
  /** The id of the popup pinned by a click, or null when none is. */
  pinnedId: string | null;
};

/**
 * The context of the group.
 *
 * It lives in its own file, as every context of the design system: the file
 * of the component exports only the component.
 */
export const PopupGroupContext = createContext<PopupGroupContextValue | null>(null);
