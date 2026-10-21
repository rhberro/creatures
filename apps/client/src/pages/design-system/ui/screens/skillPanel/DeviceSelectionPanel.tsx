import type { ReactElement } from 'react';

import { DeviceSelectionPanel as DeviceSelectionPanelView } from '~/features/skill-panel';

import { SAMPLE_DEVICES } from './skillPanelSamples';

export function DeviceSelectionPanel(): ReactElement {
  return <DeviceSelectionPanelView entries={SAMPLE_DEVICES} onSelect={noop} />;
}

function noop(): void {
  void 0;
}
