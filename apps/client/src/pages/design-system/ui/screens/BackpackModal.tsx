import type { ReactElement } from 'react';

import { BackpackModal } from '~/features/backpack';

export function BackpackModalPreview(): ReactElement {
  return <BackpackModal contained isOpen onClose={noop} />;
}

function noop(): void {
  void 0;
}
