import { useContext, useMemo, useReducer } from 'react';

import { PopupGroupContext, type PopupGroupContextValue } from './popupGroup.context';
import { CLOSED_POPUP_STATE, reducePopupState } from './popupState';

/**
 * The group the popup belongs to, when it belongs to one.
 *
 * A popup outside a group keeps its own state, as it always did.
 */
export function usePopupGroupContext(): PopupGroupContextValue | null {
  return useContext(PopupGroupContext);
}

/**
 * The state of the group: one open popup, one pinned.
 *
 * The hover opens and the click pins, as in a popup on its own. The
 * difference is that the state is shared by the whole grid: hovering one slot
 * closes the popup of the previous one, and clicking one closes it and opens
 * the new one in the same update.
 */
export function usePopupGroup(): PopupGroupContextValue {
  const [state, dispatch] = useReducer(reducePopupState, CLOSED_POPUP_STATE);
  return useMemo(
    function buildValue(): PopupGroupContextValue {
      function click(id: string): void {
        dispatch({ id, type: 'click' });
      }

      function dismiss(id: string): void {
        dispatch({ id, type: 'dismiss' });
      }

      function enter(id: string): void {
        dispatch({ id, type: 'enter' });
      }

      function leave(id: string): void {
        dispatch({ id, type: 'leave' });
      }

      function open(id: string): void {
        dispatch({ id, type: 'open' });
      }

      return {
        click,
        dismiss,
        enter,
        leave,
        open,
        openId: state.openId,
        pinnedId: state.pinnedId,
      };
    },
    [state],
  );
}
