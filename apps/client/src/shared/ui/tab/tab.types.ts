import type { ReactNode } from 'react';

export type TabsProps = {
  children: ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

export type TabProps = {
  children: ReactNode;
  value: string;
};

export type TabPanelProps = {
  children: ReactNode;
  value: string;
};
