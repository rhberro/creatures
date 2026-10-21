import type { ReactElement } from 'react';

import { SkillSelectionPanel as SkillSelectionPanelView } from '~/features/skill-panel';

import { SAMPLE_ABILITIES } from './skillPanelSamples';

const SAMPLE_SLOT = 2;

export function SkillSelectionPanel(): ReactElement {
  return <SkillSelectionPanelView entries={SAMPLE_ABILITIES} onSelect={noop} slot={SAMPLE_SLOT} />;
}

function noop(): void {
  void 0;
}
