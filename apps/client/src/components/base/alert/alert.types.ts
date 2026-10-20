import type { ReactNode } from 'react';

export type AlertItem = {
  content: ReactNode;
  duration: number;
  icon: ReactNode;
  id: string;
  isLeaving?: boolean;
  remaining: number;
};

export type AlertInput = Omit<AlertItem, 'id' | 'isLeaving' | 'remaining'>;

export type AlertStackValue = {
  alerts: AlertItem[];
  dismiss: (id: string) => void;
  show: (input: AlertInput) => string;
};
