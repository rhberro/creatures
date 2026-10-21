import { useReducer } from 'react';

import type { PopupController } from './popup.types';
import { CLOSED_POPUP_STATE, reducePopupState } from './popupState';

/**
 * The state of a popup alone: it opens on hover and is pinned by the click.
 *
 * The hover only exists on a thin pointer. On touch, the popup opens by the
 * click.
 */
export function usePopupState(id: string, hasHover: boolean): PopupController {
  const [state, dispatch] = useReducer(reducePopupState, CLOSED_POPUP_STATE);
  const isOpen = state.openId === id;

  function handleClick(): void {
    dispatch({ id, type: 'click' });
  }

  function handleMouseEnter(): void {
    if (hasHover) {
      dispatch({ id, type: 'enter' });
    }
  }

  function handleMouseLeave(): void {
    if (hasHover) {
      dispatch({ id, type: 'leave' });
    }
  }

  function handleOpenChange(details: { open: boolean }): void {
    if (details.open) {
      dispatch({ id, type: 'open' });
      return;
    }
    dispatch({ id, type: 'dismiss' });
  }

  return { handleClick, handleMouseEnter, handleMouseLeave, handleOpenChange, isOpen };
}
