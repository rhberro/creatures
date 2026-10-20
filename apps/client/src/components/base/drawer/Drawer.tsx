import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Overlay } from '~/components/base/overlay/Overlay';
import { OverlayPanel } from '~/components/base/overlay/OverlayPanel';

import type { DrawerProps } from './drawer.types';

const DRAWER_WIDTH = '320px';

export function Drawer(props: DrawerProps): ReactElement {
  const { children, contained = false, height, isOpen, onClose, width = DRAWER_WIDTH } = props;
  const handleOpenChange = buildOpenChange(onClose);
  const closeOnOutside = !contained;
  const isModalLayer = !contained;
  const position = contained ? 'absolute' : 'fixed';
  return (
    <ChakraDialog.Root
      closeOnEscape
      closeOnInteractOutside={closeOnOutside}
      modal={isModalLayer}
      onOpenChange={handleOpenChange}
      open={isOpen}
      size="sm"
    >
      <Portal disabled={contained}>
        <Overlay contained={contained} />
        <ChakraDialog.Positioner
          alignItems="stretch"
          inset="0"
          justifyContent="flex-end"
          padding="0"
          position={position}
        >
          <OverlayPanel height={height} onClose={onClose} variant="drawer" width={width}>
            {children}
          </OverlayPanel>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
}

function buildOpenChange(onClose: () => void): (details: { open: boolean }) => void {
  return function handleOpenChange(details: { open: boolean }): void {
    if (!details.open) {
      onClose();
    }
  };
}
