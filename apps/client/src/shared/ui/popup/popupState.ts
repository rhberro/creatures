/**
 * The state of a popup.
 *
 * The popup opens on hover and is pinned by the click. The state keeps the
 * three ids apart, because they answer different questions:
 *
 * - **hovered**: the pointer is over the trigger;
 * - **open**: the popup is showing;
 * - **pinned**: the click fixed the popup, so it survives the pointer leaving.
 *
 * The same state serves a popup alone and a group of popups: a group only has
 * one open at a time, and the ids say which one it is.
 */
export type PopupState = {
  hoveredId: string | null;
  openId: string | null;
  pinnedId: string | null;
};

/**
 * The state of a group with no popup open.
 */
export const CLOSED_POPUP_STATE: PopupState = {
  hoveredId: null,
  openId: null,
  pinnedId: null,
};

/**
 * What happens to the state of the popups.
 */
export type PopupEvent =
  | { id: string; type: 'click' }
  | { id: string; type: 'dismiss' }
  | { id: string; type: 'enter' }
  | { id: string; type: 'leave' }
  | { id: string; type: 'open' };

/**
 * The next state of the popups.
 *
 * The rule is the same for a popup alone and for a group: the hover opens, the
 * click pins, and the group keeps only one popup open — clicking another one
 * closes the first and opens the second in the same update.
 */
export function reducePopupState(state: PopupState, event: PopupEvent): PopupState {
  switch (event.type) {
    case 'click':
      return reduceClick(state, event.id);
    case 'dismiss':
      return reduceDismiss(state, event.id);
    case 'enter':
      return reduceEnter(state, event.id);
    case 'leave':
      return reduceLeave(state, event.id);
    case 'open':
      return reduceOpen(state, event.id);
    default:
      return state;
  }
}

/**
 * The click on a trigger.
 *
 * Clicking a popup that is not the open one switches: the open one closes and
 * the clicked one opens, pinned, in the same update. Clicking the open one
 * pins it — the click keeps the popup open — and clicking it again takes the
 * pin away. Without the pointer over it, the second click closes the popup:
 * on the touch there is no hover to keep it open.
 */
function reduceClick(state: PopupState, id: string): PopupState {
  if (state.openId !== id) {
    return { hoveredId: state.hoveredId, openId: id, pinnedId: id };
  }
  if (state.pinnedId !== id) {
    return { ...state, pinnedId: id };
  }
  if (state.hoveredId === id) {
    return { ...state, pinnedId: null };
  }
  return { ...state, openId: null, pinnedId: null };
}

/**
 * The request of the popup to close: the click outside or the ESC.
 */
function reduceDismiss(state: PopupState, id: string): PopupState {
  if (state.openId !== id) {
    return state;
  }
  return { hoveredId: state.hoveredId, openId: null, pinnedId: null };
}

/**
 * The pointer over a trigger.
 *
 * The hover opens the popup. A pinned popup owns the group: the hover of
 * another trigger does not take the place of the one the player pinned.
 */
function reduceEnter(state: PopupState, id: string): PopupState {
  if (state.pinnedId !== null && state.pinnedId !== id) {
    return state;
  }
  if (state.hoveredId === id && state.openId === id) {
    return state;
  }
  return { hoveredId: id, openId: id, pinnedId: state.pinnedId };
}

/**
 * The pointer left a trigger.
 *
 * The popup closes unless it is pinned: the pin is what keeps it open after
 * the pointer leaves.
 */
function reduceLeave(state: PopupState, id: string): PopupState {
  const hoveredId = state.hoveredId === id ? null : state.hoveredId;
  if (state.openId === id && state.pinnedId !== id) {
    return { hoveredId, openId: null, pinnedId: state.pinnedId };
  }
  return { ...state, hoveredId };
}

/**
 * The request of the popup to open.
 */
function reduceOpen(state: PopupState, id: string): PopupState {
  return { hoveredId: state.hoveredId, openId: id, pinnedId: id };
}
