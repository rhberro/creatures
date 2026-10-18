import type { Starter } from '@creatures/contracts/trainer';

import { STARTERS } from '~/data/starters';

export function isValidStarterId(id: string): boolean {
  return STARTERS.some(buildStarterIdMatcher(id));
}

function buildStarterIdMatcher(id: string): (starter: Starter) => boolean {
  return function matchesId(starter: Starter): boolean {
    return starter.id === id;
  };
}
