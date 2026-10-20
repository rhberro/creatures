import type { IconButtonTone } from './iconButton.types';

export type IconButtonToneColors = {
  background: string;
  borderColor: string;
  borderWidth: string;
  color: string;
};

export const ICON_BUTTON_TONE: Record<IconButtonTone, IconButtonToneColors> = {
  danger: {
    background: 'bg.raised',
    borderColor: 'blood.700',
    borderWidth: '1px',
    color: 'blood.400',
  },
  neutral: {
    background: 'bg.raised',
    borderColor: 'transparent',
    borderWidth: '0',
    color: 'fg.muted',
  },
  primary: {
    background: 'arcane.600',
    borderColor: 'arcane.300',
    borderWidth: '1px',
    color: 'arcane.50',
  },
  secondary: {
    background: 'bg.panel',
    borderColor: 'border.emphasized',
    borderWidth: '1px',
    color: 'fg.muted',
  },
};
