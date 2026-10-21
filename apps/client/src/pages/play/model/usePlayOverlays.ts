import { useState } from 'react';

export type PlayOverlays = {
  isBackpackOpen: boolean;
  isStorageOpen: boolean;
  isStoreOpen: boolean;
  onCloseBackpack: () => void;
  onCloseStorage: () => void;
  onCloseStore: () => void;
  onOpenBackpack: () => void;
  onOpenStorage: () => void;
  onOpenStore: () => void;
};

export function usePlayOverlays(): PlayOverlays {
  const [isBackpackOpen, setBackpackOpen] = useState<boolean>(false);
  const [isStorageOpen, setStorageOpen] = useState<boolean>(false);
  const [isStoreOpen, setStoreOpen] = useState<boolean>(false);

  function openBackpack(): void {
    setBackpackOpen(true);
  }

  function closeBackpack(): void {
    setBackpackOpen(false);
  }

  function openStorage(): void {
    setStorageOpen(true);
  }

  function closeStorage(): void {
    setStorageOpen(false);
  }

  function openStore(): void {
    setStoreOpen(true);
  }

  function closeStore(): void {
    setStoreOpen(false);
  }

  return {
    isBackpackOpen,
    isStorageOpen,
    isStoreOpen,
    onCloseBackpack: closeBackpack,
    onCloseStorage: closeStorage,
    onCloseStore: closeStore,
    onOpenBackpack: openBackpack,
    onOpenStorage: openStorage,
    onOpenStore: openStore,
  };
}
