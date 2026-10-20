import type { ReactNode } from 'react';

export type SlotProps = {
  children?: ReactNode;
  empty?: boolean;
  equipped?: boolean;
  selected?: boolean;
};
