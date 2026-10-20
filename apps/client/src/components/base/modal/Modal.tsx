import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Overlay } from '~/components/base/overlay/Overlay';
import { OverlayPanel } from '~/components/base/overlay/OverlayPanel';

import type { ModalProps } from './modal.types';

const MODAL_WIDTH = '640px';

export function Modal(props: ModalProps): ReactElement {
  const { children, contained = false, height, isOpen, onClose, width = MODAL_WIDTH } = props;
  const handleOpenChange = buildOpenChange(onClose);
  const closeOnOutside = false;
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
        <ChakraDialog.Positioner inset="0" padding="4" position={position}>
          <OverlayPanel height={height} onClose={onClose} variant="modal" width={width}>
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
