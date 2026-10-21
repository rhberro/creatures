import type { ReactElement } from 'react';

import { HuntAreaSelectModal } from '~/features/hunt-area';
import { SAMPLE_HUNT_AREAS } from '~/pages/design-system/model/huntAreaData';

export function HuntAreaSelect(): ReactElement {
  return (
    <HuntAreaSelectModal
      areas={SAMPLE_HUNT_AREAS}
      contained
      isOpen
      onClose={noop}
      onSelect={noop}
    />
  );
}

function noop(): void {
  void 0;
}
