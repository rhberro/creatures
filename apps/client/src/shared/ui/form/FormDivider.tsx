import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

export function FormDivider(): ReactElement {
  return (
    <Box alignItems="center" display="flex" gap={3}>
      <Box bg="border" flex="1" h="1px" />
      <Text color="fg.muted" variant="meta">
        ou
      </Text>
      <Box bg="border" flex="1" h="1px" />
    </Box>
  );
}
