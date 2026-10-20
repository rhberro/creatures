import type { ReactNode } from 'react';

export type DrawerProps = {
  children: ReactNode;
  contained?: boolean;
  height?: string;
  onClose: () => void;
  width?: string;
};
