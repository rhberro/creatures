import { Popover } from '@chakra-ui/react';
import { cloneElement, useId, type ReactElement } from 'react';

import type { PopupController, PopupProps } from './popup.types';
import type { PopupGroupContextValue } from './popupGroup.context';
import { useHasHoverCapability } from './useHasHoverCapability';
import { usePopupGroupContext } from './usePopupGroup';
import { usePopupState } from './usePopupState';

/**
 * The popup.
 *
 * It is the `Popover` of the Chakra (Ark UI): the content is positioned with
 * floating-ui — it flips and avoids leaving the screen —, it closes on the
 * ESC, on the click outside and it gives the focus back to the trigger.
 *
 * What is ours is the **behavior**: it opens on hover and is pinned by the
 * click. The hover only exists on a thin pointer; on the touch, the popup
 * opens by the click.
 *
 * Inside a grid, the popup joins the **group of the grid**: there is one
 * `openId` for the whole grid, so clicking a slot closes the popup of the
 * other and opens its own in the same update — with the mouse and with the
 * touch. Outside the grid, each popup keeps its own state, as it always did.
 */
export function Popup(props: PopupProps): ReactElement {
  const { children, content } = props;
  // The `useId` gives a stable id per instance: the group compares the ids,
  // and the same slot keeps its own between the renders.
  const id = useId();
  const hasHover = useHasHoverCapability();
  const group = usePopupGroupContext();
  const local = usePopupState(id, hasHover);
  const controller = group === null ? local : buildGroupController(group, id, hasHover);
  const trigger = buildTrigger(children, controller);
  const positioning = buildPositioning();

  return (
    <Popover.Root
      autoFocus={false}
      closeOnInteractOutside
      onOpenChange={controller.handleOpenChange}
      open={controller.isOpen}
      positioning={positioning}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          bg="bg.panel"
          borderColor="border.emphasized"
          borderRadius="sm"
          borderWidth="1px"
          boxShadow="overlay"
          maxW="calc(100vw - 32px)"
          padding="3"
          width="240px"
          onMouseEnter={controller.handleMouseEnter}
          onMouseLeave={controller.handleMouseLeave}
        >
          {content}
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

/**
 * The control of the popup when it belongs to the group of the grid.
 *
 * The click does not leave the trigger of the Ark to toggle the state: it is
 * handled here, so the group decides everything at once. That way, clicking B
 * with the popup of A open closes A and opens B in the same update, no matter
 * whether the click outside of A arrives before or after.
 */
function buildGroupController(
  group: PopupGroupContextValue,
  id: string,
  hasHover: boolean,
): PopupController {
  function handleClick(): void {
    group.click(id);
  }

  function handleMouseEnter(): void {
    if (hasHover) {
      group.enter(id);
    }
  }

  function handleMouseLeave(): void {
    if (hasHover) {
      group.leave(id);
    }
  }

  function handleOpenChange(details: { open: boolean }): void {
    if (details.open) {
      group.open(id);
      return;
    }
    group.dismiss(id);
  }

  return {
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleOpenChange,
    isOpen: group.openId === id,
  };
}

type TriggerHandlers = {
  handleClick: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

function buildTrigger(children: ReactElement, controller: PopupController): ReactElement {
  const childProps = children.props as Record<string, unknown>;
  const childOnClick = childProps.onClick;
  return cloneElement(children as ReactElement<Record<string, unknown>>, {
    onClick: composeClick(childOnClick, controller.handleClick),
    onMouseEnter: controller.handleMouseEnter,
    onMouseLeave: controller.handleMouseLeave,
  });
}

/**
 * The click of the trigger, with the click of the child.
 *
 * The clone replaces the handler of the child, so the two have to be composed:
 * the child keeps doing what it did, and the popup pins itself.
 *
 * The default of the click is stopped **before** the handler of the child
 * runs: the trigger of the Ark toggles the popup, and the toggle is not ours
 * to make — the state of the popup is. The Ark skips its own toggle when the
 * default is already prevented.
 */
function composeClick(
  childOnClick: unknown,
  handleClick: TriggerHandlers['handleClick'],
): (event: { preventDefault: () => void }) => void {
  return function click(event: { preventDefault: () => void }): void {
    event.preventDefault();
    if (typeof childOnClick === 'function') {
      childOnClick(event);
    }
    handleClick();
  };
}

function buildPositioning(): { placement: 'bottom-start' } {
  return { placement: 'bottom-start' };
}
