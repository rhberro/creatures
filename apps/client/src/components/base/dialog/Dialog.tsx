import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Overlay } from '~/components/base/overlay/Overlay';

import type { DialogProps } from './dialog.types';

const DIALOG_WIDTH = '420px';

export function Dialog(props: DialogProps): ReactElement {
  const { children, contained = false, isOpen, onClose, width = DIALOG_WIDTH } = props;
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
        <ChakraDialog.Positioner padding="4" position={position}>
          <ChakraDialog.Content
            bg="bg.panel"
            borderColor="border"
            borderRadius="lg"
            borderWidth="1px"
            boxShadow="overlay"
            display="flex"
            flexDirection="column"
            maxH="calc(100dvh - 64px)"
            maxW="calc(100% - 32px)"
            overflow="hidden"
            position="relative"
            width={width}
          >
            {children}
          </ChakraDialog.Content>
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
