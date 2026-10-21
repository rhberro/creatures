import type { ReactNode } from 'react';

export type ChipProps = {
  active?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  tone?: ChipTone;
};

export type ChipTone = 'arcane' | 'blood' | 'ember' | 'frost' | 'gold' | 'neutral' | 'verdant';
