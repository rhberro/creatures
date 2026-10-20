import { useContext } from 'react';

import { OverlayContext } from './overlay.context';
import type { OverlayContextValue } from './overlay.types';

export function useOverlayContext(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (value === null) {
    throw new Error('useOverlayContext exige um Modal ou Drawer como ancestral.');
  }
  return value;
}
