import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

const TOUCH_POINTER = 'touch';
const MOUSE_POINTER = 'mouse';
const PEN_POINTER = 'pen';

export type CreatureActivation = {
  /** The click: on touch and on the keyboard it activates the creature. */
  handleClick(): void;
  /** The double click: with the mouse it activates the creature. */
  handleDoubleClick(): void;
  /** The pointer down: it remembers which pointer the player used. */
  handlePointerDown(event: ReactPointerEvent): void;
};

/**
 * The activation of a creature: the double click with the mouse, the single tap
 * with the finger.
 *
 * The double click does not exist on touch, and the creature of a slot has no
 * other action: on touch the tap does the same thing the double click does
 * with the mouse.
 *
 * The pointer that pressed the slot decides which of the two answers, and the
 * keyboard answers with the click: the creature is reachable without a mouse.
 */
export function useCreatureActivation(onActivate: () => void): CreatureActivation {
  const pointerRef = useRef<string | null>(null);

  function handlePointerDown(event: ReactPointerEvent): void {
    pointerRef.current = event.pointerType;
  }

  function handleClick(): void {
    const pointer = pointerRef.current;
    if (pointer !== null && pointer !== TOUCH_POINTER) {
      return;
    }
    onActivate();
  }

  function handleDoubleClick(): void {
    const pointer = pointerRef.current;
    if (pointer !== MOUSE_POINTER && pointer !== PEN_POINTER) {
      return;
    }
    onActivate();
  }

  return { handleClick, handleDoubleClick, handlePointerDown };
}
