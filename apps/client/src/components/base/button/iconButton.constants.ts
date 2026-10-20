import type { IconButtonTone } from './iconButton.types';

export type IconButtonToneColors = {
  background: string;
  borderColor: string;
  borderWidth: string;
  boxShadow: string;
  color: string;
  hoverBackground: string;
  hoverColor: string;
};

export const ICON_BUTTON_TONE: Record<IconButtonTone, IconButtonToneColors> = {
  danger: {
    background: 'bg.raised',
    borderColor: 'blood.700',
    borderWidth: '1px',
    boxShadow: 'sm',
    color: 'blood.400',
    hoverBackground: 'blood.900',
    hoverColor: 'blood.200',
  },
  dangerGhost: {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidth: '0',
    boxShadow: 'none',
    color: 'fg.subtle',
    hoverBackground: 'blood.900',
    hoverColor: 'blood.200',
  },
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidth: '0',
    boxShadow: 'none',
    color: 'fg.subtle',
    hoverBackground: 'bg.emphasized',
    hoverColor: 'fg',
  },
  neutral: {
    background: 'bg.raised',
    borderColor: 'transparent',
    borderWidth: '0',
    boxShadow: 'sm',
    color: 'fg.muted',
    hoverBackground: 'bg.emphasized',
    hoverColor: 'fg',
  },
  primary: {
    background: 'arcane.600',
    borderColor: 'arcane.300',
    borderWidth: '1px',
    boxShadow: 'sm',
    color: 'arcane.50',
    hoverBackground: 'arcane.500',
    hoverColor: 'arcane.50',
  },
  secondary: {
    background: 'bg.panel',
    borderColor: 'border.emphasized',
    borderWidth: '1px',
    boxShadow: 'sm',
    color: 'fg.muted',
    hoverBackground: 'bg.raised',
    hoverColor: 'fg',
  },
};
