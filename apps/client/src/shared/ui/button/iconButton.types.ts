import type { ReactElement } from 'react';

export type IconButtonProps = {
  children: ReactElement;
  label: string;
  onClick: () => void;
  radius?: string;
  size?: string;
  tone?: IconButtonTone;
};

export type IconButtonTone =
  | 'danger'
  | 'dangerGhost'
  | 'ghost'
  | 'neutral'
  | 'primary'
  | 'secondary';
