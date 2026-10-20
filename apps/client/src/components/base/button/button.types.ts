import type { ComponentProps } from 'react';

export type ButtonProps = Omit<
  ComponentProps<typeof import('@chakra-ui/react').Button>,
  'colorPalette' | 'variant'
> & {
  palette?: GamePalette;
  tone?: ButtonTone;
};

export type ButtonTone = 'danger' | 'ghost' | 'primary' | 'secondary';

export type GamePalette =
  | 'arcane'
  | 'blood'
  | 'ember'
  | 'focus'
  | 'frost'
  | 'gold'
  | 'gray'
  | 'verdant';
