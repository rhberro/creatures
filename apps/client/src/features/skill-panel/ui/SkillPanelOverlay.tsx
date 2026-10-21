import { Box } from '@chakra-ui/react';
import type { SkillSlot } from '@creatures/contracts/skill';
import type { MutableRefObject, ReactElement, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { skillPanelStore } from '~/features/skill-panel/model/skillPanelStore';

type SkillPanelOverlayProps = {
  children: ReactNode;
};

/**
 * The panel of selection, over the skill bar.
 *
 * The panel opens on top of the bar, and it does not pause the game: the
 * simulation keeps running while the player chooses what goes in the slot.
 *
 * It closes the way the popup of the design system closes: by the click
 * outside and by the ESC. The click inside never closes it — the player is
 * choosing, and the choice is what the panel is for.
 */
export function SkillPanelOverlay(props: SkillPanelOverlayProps): ReactElement {
  const { children } = props;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openSlotRef = useRef<SkillSlot | null>(null);

  useEffect(function listen(): () => void {
    function handlePointerDown(): void {
      openSlotRef.current = skillPanelStore.getState().openSlot;
    }

    function handleClick(event: MouseEvent): void {
      closeOnOutsideClick(panelRef.current, openSlotRef, event);
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') {
        return;
      }
      skillPanelStore.getState().closePanel();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return function remove(): void {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Box
      ref={panelRef}
      bottom="calc(100% + 8px)"
      left="50%"
      position="absolute"
      transform="translateX(-50%)"
      zIndex="10"
    >
      {children}
    </Box>
  );
}

/**
 * The click outside closes the panel.
 *
 * The slot that was open when the pointer went down is the one that decides:
 * when the click opened another panel, the new panel stays open — the click
 * was the choice of the player, not the dismissal of the panel.
 */
function closeOnOutsideClick(
  panel: HTMLDivElement | null,
  openSlotRef: MutableRefObject<SkillSlot | null>,
  event: MouseEvent,
): void {
  if (panel === null) {
    return;
  }
  const target = event.target;
  if (target instanceof Node && panel.contains(target)) {
    return;
  }
  if (skillPanelStore.getState().openSlot !== openSlotRef.current) {
    return;
  }
  skillPanelStore.getState().closePanel();
}
