import type { ReactElement } from 'react';

export type IconButtonProps = {
  children: ReactElement;
  label: string;
  onClick: () => void;
  size?: string;
  tone?: IconButtonTone;
};

export type IconButtonTone = 'danger' | 'neutral' | 'primary' | 'secondary';
