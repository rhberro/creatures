import { createContext } from 'react';

import type { OverlayContextValue } from './overlay.types';

export const OverlayContext = createContext<OverlayContextValue | null>(null);
