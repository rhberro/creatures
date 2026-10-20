import type { ButtonTone, GamePalette } from './button.types';

export const TONE_PALETTE: Record<ButtonTone, GamePalette> = {
  danger: 'blood',
  ghost: 'gray',
  primary: 'arcane',
  secondary: 'gray',
};

export const TONE_VARIANT: Record<ButtonTone, 'ghost' | 'outline' | 'solid'> = {
  danger: 'outline',
  ghost: 'ghost',
  primary: 'solid',
  secondary: 'outline',
};
