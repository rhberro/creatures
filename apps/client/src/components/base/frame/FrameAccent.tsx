import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function FrameAccent(): ReactElement {
  return <Box bg="coin" height="2px" left="0" position="absolute" right="0" top="0" zIndex="1" />;
}
