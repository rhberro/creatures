import { useContext } from 'react';

import { AlertsContext } from './alert.context';
import type { AlertStackValue } from './alert.types';

export function useAlerts(): AlertStackValue {
  return useContext(AlertsContext);
}
