import type { ReactNode } from 'react';

export type DrawerProps = {
  children: ReactNode;
  contained?: boolean;
  height?: string;
  isOpen: boolean;
  onClose: () => void;
  width?: string;
};
