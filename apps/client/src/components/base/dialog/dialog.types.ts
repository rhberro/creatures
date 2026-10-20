import type { ReactNode } from 'react';

export type DialogProps = {
  children: ReactNode;
  contained?: boolean;
  onClose: () => void;
  width?: string;
};
