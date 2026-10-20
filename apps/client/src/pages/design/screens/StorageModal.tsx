import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { StorageModal } from '~/components/domain/game/StorageModal';

export function StorageModalPreview(): ReactElement {
  return (
    <Box height="660px" overflow="hidden" padding="20px" position="relative" width="760px">
      <StorageModal contained isOpen onClose={noop} />
    </Box>
  );
}

function noop(): void {
  void 0;
}
