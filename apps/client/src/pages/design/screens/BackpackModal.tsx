import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { BackpackModal } from '~/components/domain/game/BackpackModal';

export function BackpackModalPreview(): ReactElement {
  return (
    <Box height="600px" overflow="hidden" padding="20px" position="relative" width="760px">
      <BackpackModal contained isOpen onClose={noop} />
    </Box>
  );
}

function noop(): void {
  void 0;
}
