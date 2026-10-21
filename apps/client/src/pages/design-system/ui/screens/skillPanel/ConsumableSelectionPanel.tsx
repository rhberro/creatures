import type { ReactElement } from 'react';

import { ConsumableSelectionPanel as ConsumableSelectionPanelView } from '~/features/skill-panel';

import { SAMPLE_CONSUMABLES } from './skillPanelSamples';

const SAMPLE_SLOT = 4;
const SAMPLE_TRIGGER = 30;

export function ConsumableSelectionPanel(): ReactElement {
  return (
    <ConsumableSelectionPanelView
      entries={SAMPLE_CONSUMABLES}
      onSelect={noop}
      onTriggerChange={noop}
      slot={SAMPLE_SLOT}
      triggerHpPercent={SAMPLE_TRIGGER}
    />
  );
}

function noop(): void {
  void 0;
}
