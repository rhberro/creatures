import { useState } from 'react';

export type PlayOverlays = {
  isBackpackOpen: boolean;
  isHuntOpen: boolean;
  isStorageOpen: boolean;
  isStoreOpen: boolean;
  onCloseBackpack: () => void;
  onCloseHunt: () => void;
  onCloseStorage: () => void;
  onCloseStore: () => void;
  onOpenBackpack: () => void;
  onOpenHunt: () => void;
  onOpenStorage: () => void;
  onOpenStore: () => void;
};

/**
 * The open state of the overlays of the game screen.
 *
 * The screen only holds which overlay is open: the modal itself belongs to
 * the feature that owns it, and the screen renders it with the state of this
 * hook.
 */
export function usePlayOverlays(): PlayOverlays {
  const [isBackpackOpen, setBackpackOpen] = useState<boolean>(false);
  const [isHuntOpen, setHuntOpen] = useState<boolean>(false);
  const [isStorageOpen, setStorageOpen] = useState<boolean>(false);
  const [isStoreOpen, setStoreOpen] = useState<boolean>(false);
  return {
    isBackpackOpen,
    isHuntOpen,
    isStorageOpen,
    isStoreOpen,
    onCloseBackpack: closeOverlay(setBackpackOpen),
    onCloseHunt: closeOverlay(setHuntOpen),
    onCloseStorage: closeOverlay(setStorageOpen),
    onCloseStore: closeOverlay(setStoreOpen),
    onOpenBackpack: openOverlay(setBackpackOpen),
    onOpenHunt: openOverlay(setHuntOpen),
    onOpenStorage: openOverlay(setStorageOpen),
    onOpenStore: openOverlay(setStoreOpen),
  };
}

type OverlaySetter = (open: boolean) => void;

function openOverlay(setter: OverlaySetter): () => void {
  return function open(): void {
    setter(true);
  };
}

function closeOverlay(setter: OverlaySetter): () => void {
  return function close(): void {
    setter(false);
  };
}
