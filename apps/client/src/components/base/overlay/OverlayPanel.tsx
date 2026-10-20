import { Box, Dialog as ChakraDialog } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { IconButton } from '~/components/base/button/IconButton';
import { IconClose } from '~/components/base/icon';

const CLOSE_SIZE = '32px';
const CLOSE_OFFSET = '-16px';
const CLOSE_ICON_SIZE = '16px';

type OverlayPanelProps = {
  children: ReactNode;
  height?: string;
  onClose: () => void;
  variant: 'drawer' | 'modal';
  width: string;
};

export function OverlayPanel(props: OverlayPanelProps): ReactElement {
  const { children, height, onClose, variant, width } = props;
  const isDrawer = variant === 'drawer';
  const borderWidth = isDrawer ? '0 0 0 1px' : '1px';
  const borderRadius = isDrawer ? '0' : 'lg';
  return (
    <ChakraDialog.Content
      bg="bg.panel"
      borderColor="border"
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      boxShadow="overlay"
      display="flex"
      flexDirection="column"
      height={height}
      maxH="calc(100dvh - 64px)"
      maxW="calc(100% - 32px)"
      position="relative"
      width={width}
    >
      <Box
        borderRadius="inherit"
        display="flex"
        flex="1"
        flexDirection="column"
        minH="0"
        overflow="hidden"
      >
        {children}
      </Box>
      <Box position="absolute" right={CLOSE_OFFSET} top={CLOSE_OFFSET}>
        <IconButton label="Fechar" onClick={onClose} radius="full" size={CLOSE_SIZE} tone="neutral">
          <IconClose size={CLOSE_ICON_SIZE} />
        </IconButton>
      </Box>
    </ChakraDialog.Content>
  );
}
