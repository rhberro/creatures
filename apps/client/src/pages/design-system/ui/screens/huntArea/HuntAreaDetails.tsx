import type { ReactElement } from 'react';

import { HuntAreaDetailsDrawer } from '~/features/hunt-area';
import { SAMPLE_HUNT_AREA_DETAIL } from '~/pages/design-system/model/huntAreaData';

const SAMPLE_STAMINA_MINUTES = 240;

export function HuntAreaDetails(): ReactElement {
  return (
    <HuntAreaDetailsDrawer
      area={SAMPLE_HUNT_AREA_DETAIL}
      contained
      isOpen
      staminaMinutes={SAMPLE_STAMINA_MINUTES}
      onClose={noop}
    />
  );
}

function noop(): void {
  void 0;
}
