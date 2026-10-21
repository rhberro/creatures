import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

const BRACKET_SIZE = '14px';

export function CornerBracket(): ReactElement {
  return (
    <Box
      bg="state.selected"
      clipPath="polygon(0 0, 100% 0, 0 100%)"
      height={BRACKET_SIZE}
      left="0"
      position="absolute"
      top="0"
      width={BRACKET_SIZE}
    />
  );
}
