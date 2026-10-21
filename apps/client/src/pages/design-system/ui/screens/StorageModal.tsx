import type { ReactElement } from 'react';

import { StorageModal } from '~/features/storage';

export function StorageModalPreview(): ReactElement {
  return <StorageModal contained isOpen onClose={noop} />;
}

function noop(): void {
  void 0;
}
