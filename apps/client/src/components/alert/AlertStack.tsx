import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type AlertItem = {
  content: ReactNode;
  duration: number;
  icon: ReactNode;
  id: string;
  remaining: number;
};

export type AlertInput = Omit<AlertItem, 'id' | 'remaining'>;

export type AlertStack = {
  alerts: AlertItem[];
  dismiss: (id: string) => void;
  show: (input: AlertInput) => string;
};

function stubDismiss(): void {
  void 0;
}

function stubShow(): string {
  return '';
}

const STUB_STACK: AlertStack = {
  alerts: [],
  dismiss: stubDismiss,
  show: stubShow,
};

export const AlertsContext = createContext<AlertStack>(STUB_STACK);

export function useAlerts(): AlertStack {
  return useContext(AlertsContext);
}
