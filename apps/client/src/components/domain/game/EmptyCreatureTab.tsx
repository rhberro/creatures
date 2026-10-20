import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

const EMPTY_WIDTH = '92px';

export function EmptyCreatureTab(): ReactElement {
  return (
    <Box
      bg="bg.panel"
      borderColor="border"
      borderRadius="sm"
      borderStyle="dashed"
      borderWidth="1px"
      boxShadow="raised"
      minH="84px"
      opacity={0.55}
      width={EMPTY_WIDTH}
    />
  );
}
