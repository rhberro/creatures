import { useState } from 'react';

import { useHasHoverCapability } from './useHasHoverCapability';

export type PopupState = {
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleOpenChange: (details: { open: boolean }) => void;
  isOpen: boolean;
};

/**
 * O estado do popup: abre no hover, fixa no clique.
 *
 * O hover so existe em ponteiro fino. No toque, o popup abre pelo clique.
 */
export function usePopupState(): PopupState {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const hasHover = useHasHoverCapability();
  const isOpen = hasHover ? isHovered || isPinned : isPinned;

  function handleMouseEnter(): void {
    setIsHovered(true);
  }

  function handleMouseLeave(): void {
    setIsHovered(false);
  }

  function handleOpenChange(details: { open: boolean }): void {
    setIsPinned(details.open);
    if (!details.open) {
      setIsHovered(false);
    }
  }

  return { handleMouseEnter, handleMouseLeave, handleOpenChange, isOpen };
}
