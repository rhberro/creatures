import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function EquippedWedge(): ReactElement {
  return (
    <Box
      bg="state.equipped"
      bottom="0"
      clipPath="polygon(100% 0, 100% 100%, 0 100%)"
      height="12px"
      position="absolute"
      right="0"
      width="12px"
    />
  );
}
