import { Box } from '@chakra-ui/react';
import { useRef, type ReactElement } from 'react';

import { CloseControl } from '~/components/base/frame/CloseControl';
import { Overlay } from '~/components/base/overlay/Overlay';
import { OverlayContext } from '~/components/base/overlay/overlay.context';
import type { OverlayContextValue } from '~/components/base/overlay/overlay.types';
import { useOverlay } from '~/components/base/overlay/useOverlay';

import type { DrawerProps } from './drawer.types';

const DRAWER_WIDTH = '320px';
const DRAWER_MAX_HEIGHT = 'calc(100dvh - 32px)';
const CLOSE_OFFSET = '-12px';
const CLOSE_SIZE = '32px';

export function Drawer(props: DrawerProps): ReactElement {
  const { children, contained = false, height, onClose, width = DRAWER_WIDTH } = props;
  const position = contained ? 'absolute' : 'fixed';
  const contentRef = useRef<HTMLDivElement>(null);
  useOverlay({ contentRef, dismissOnOutside: true, interactive: !contained, onClose });
  const context: OverlayContextValue = { onClose };
  return (
    <OverlayContext.Provider value={context}>
      <Box inset="0" position={position} zIndex="modal">
        <Overlay />
        <Box
          bg="bg.panel"
          borderColor="border"
          borderLeftWidth="1px"
          bottom="0"
          boxShadow="overlay"
          display="flex"
          flexDirection="column"
          height={height}
          maxH={DRAWER_MAX_HEIGHT}
          position="absolute"
          ref={contentRef}
          right="0"
          top="0"
          width={width}
          zIndex="1"
        >
          {children}
        </Box>
        <Box position="absolute" right={CLOSE_OFFSET} top={CLOSE_OFFSET}>
          <CloseControl onClick={onClose} size={CLOSE_SIZE} />
        </Box>
      </Box>
    </OverlayContext.Provider>
  );
}
