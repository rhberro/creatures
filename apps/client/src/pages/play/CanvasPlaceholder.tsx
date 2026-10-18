import { Box, Center, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function CanvasPlaceholder(): ReactElement {
  return (
    <Box bg="bg.subtle" flex="1" position="relative">
      <Center h="full">
        <Text color="fg.muted">Canvas</Text>
      </Center>
    </Box>
  );
}
