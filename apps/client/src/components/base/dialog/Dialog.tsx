import { Box } from '@chakra-ui/react';
import { useRef, type ReactElement } from 'react';

import { Frame } from '~/components/base/frame/Frame';
import { Overlay } from '~/components/base/overlay/Overlay';
import { OverlayContext } from '~/components/base/overlay/overlay.context';
import type { OverlayContextValue } from '~/components/base/overlay/overlay.types';
import { useOverlay } from '~/components/base/overlay/useOverlay';

import type { DialogProps } from './dialog.types';

const DIALOG_WIDTH = '420px';

export function Dialog(props: DialogProps): ReactElement {
  const { children, contained = false, onClose, width = DIALOG_WIDTH } = props;
  const position = contained ? 'absolute' : 'fixed';
  const contentRef = useRef<HTMLDivElement>(null);
  useOverlay({ contentRef, dismissOnOutside: true, interactive: !contained, onClose });
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
          maxH="calc(100dvh - 64px)"
          maxW="calc(100% - 32px)"
          position="relative"
          ref={contentRef}
          width={width}
          zIndex="1"
        >
          <Frame tone="overlay">{children}</Frame>
        </Box>
      </Box>
    </OverlayContext.Provider>
  );
}
