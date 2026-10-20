import type { ReactNode } from 'react';

export type AlertInput = {
  content: ReactNode;
  duration: number;
  icon: ReactNode;
  tone?: string;
};

export type AlertStackValue = {
  dismiss: (id: string) => void;
  show: (input: AlertInput) => string;
};
