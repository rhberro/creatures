import type { ReactNode } from 'react';

export type DialogProps = {
  children: ReactNode;
  contained?: boolean;
  isOpen: boolean;
  label?: string;
  onClose: () => void;
  width?: string;
};
