import { Box } from '@chakra-ui/react';
import { useRef, type ReactElement, type ReactNode } from 'react';

import { LayerDropshadow } from '~/components/layers/LayerDropshadow';
import type { LayerMode } from '~/components/layers/types';
import { useLayerClose, type UseLayerCloseProps } from '~/components/layers/useLayerClose';

export function Layer(props: LayerProps): ReactElement {
  const { children, mode, onClose } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const closeOptions: UseLayerCloseProps = { contentRef, mode, onClose };
  useLayerClose(closeOptions);

  if (mode === 'drawer') {
    return (
      <>
        <LayerDropshadow onClose={onClose} />
        <Box
          bg="bg.panel"
          borderColor="border.default"
          borderLeftWidth="1px"
          h="100dvh"
          position="fixed"
          ref={contentRef}
          right="0"
          top="0"
          w="sm"
        >
          {children}
        </Box>
      </>
    );
  }

  if (mode === 'composed') {
    return (
      <Box
        alignItems="center"
        display="flex"
        inset="0"
        justifyContent="center"
        position="fixed"
        ref={contentRef}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box ref={contentRef} display="inline-block">
      {children}
    </Box>
  );
}

export type LayerProps = {
  children: ReactNode;
  mode: LayerMode;
  onClose: () => void;
};
