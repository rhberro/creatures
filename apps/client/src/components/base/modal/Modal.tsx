import { Box } from '@chakra-ui/react';
import { useRef, type ReactElement } from 'react';

import { CloseControl } from '~/components/base/frame/CloseControl';
import { Frame } from '~/components/base/frame/Frame';
import { Overlay } from '~/components/base/overlay/Overlay';
import { OverlayContext } from '~/components/base/overlay/overlay.context';
import type { OverlayContextValue } from '~/components/base/overlay/overlay.types';
import { useOverlay } from '~/components/base/overlay/useOverlay';

import type { ModalProps } from './modal.types';

const MODAL_WIDTH = '640px';
const MODAL_MAX_HEIGHT = 'calc(100dvh - 64px)';
const CLOSE_OFFSET = '-12px';
const CLOSE_SIZE = '32px';

export function Modal(props: ModalProps): ReactElement {
  const { children, contained = false, height, onClose, width = MODAL_WIDTH } = props;
  const position = contained ? 'absolute' : 'fixed';
  const contentRef = useRef<HTMLDivElement>(null);
  useOverlay({ contentRef, dismissOnOutside: false, interactive: !contained, onClose });
  const context: OverlayContextValue = { onClose };
  return (
    <OverlayContext.Provider value={context}>
      <Box
        alignItems="center"
        display="flex"
        inset="0"
        justifyContent="center"
        position={position}
        zIndex="modal"
      >
        <Overlay />
        <Box
          display="flex"
          flexDirection="column"
          height={height}
          maxH={MODAL_MAX_HEIGHT}
          maxW="calc(100% - 32px)"
          position="relative"
          ref={contentRef}
          width={width}
          zIndex="1"
        >
          <Frame height="full" tone="overlay">
            {children}
          </Frame>
          <Box position="absolute" right={CLOSE_OFFSET} top={CLOSE_OFFSET}>
            <CloseControl onClick={onClose} size={CLOSE_SIZE} />
          </Box>
        </Box>
      </Box>
    </OverlayContext.Provider>
  );
}
