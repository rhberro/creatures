import { createContext } from 'react';

import type { AlertStackValue } from './alert.types';

function stubDismiss(): void {
  void 0;
}

function stubShow(): string {
  return '';
}

const STUB_STACK: AlertStackValue = {
  dismiss: stubDismiss,
  show: stubShow,
};

export const AlertsContext = createContext<AlertStackValue>(STUB_STACK);
