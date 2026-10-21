import type { ReactElement, ReactNode } from 'react';

import { PopupGroupContext } from './popupGroup.context';
import { usePopupGroup, usePopupGroupContext } from './usePopupGroup';

type PopupGroupProps = {
  children: ReactNode;
};

/**
 * The group of the popups inside it.
 *
 * The grid wraps its slots with this provider, so every `Popup` inside joins
 * the same group and only one is open at a time: clicking a slot closes the
 * popup of another and opens its own.
 *
 * A group inside another group **joins** the outer one: the modal with a
 * grid and a row of slots keeps a single popup open in the whole modal.
 */
export function PopupGroup(props: PopupGroupProps): ReactElement {
  const { children } = props;
  const parent = usePopupGroupContext();
  const own = usePopupGroup();
  const group = parent ?? own;
  return <PopupGroupContext.Provider value={group}>{children}</PopupGroupContext.Provider>;
}
