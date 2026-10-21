import type { ReactElement, ReactNode } from 'react';

export type PopupProps = {
  children: ReactElement;
  content: ReactNode;
};

/**
 * The control of a popup.
 *
 * The popup does not own its open state: the controller tells it what to do,
 * so a popup alone and a popup inside a group answer the same way.
 */
export type PopupController = {
  /** The click on the trigger: it pins the popup. */
  handleClick(): void;
  /** The pointer entered the trigger: it opens the popup. */
  handleMouseEnter(): void;
  /** The pointer left the trigger: it closes the popup, unless it is pinned. */
  handleMouseLeave(): void;
  /** The popup asked to open or to close, by the click outside or by the ESC. */
  handleOpenChange(details: { open: boolean }): void;
  /** Whether the popup is showing. */
  isOpen: boolean;
};
