import type { ChipTone } from './chip.types';

export const SKEW = 'skewX(-12deg)';

export const SKEW_BACK = 'skewX(12deg)';

export type ChipToneColors = {
  activeBackground: string;
  activeBorder: string;
  activeColor: string;
  idleBorder: string;
  idleColor: string;
};

export const CHIP_TONE_COLORS: Record<ChipTone, ChipToneColors> = {
  arcane: {
    activeBackground: 'arcane.600',
    activeBorder: 'arcane.300',
    activeColor: 'arcane.50',
    idleBorder: 'arcane.700',
    idleColor: 'arcane.300',
  },
  blood: {
    activeBackground: 'blood.600',
    activeBorder: 'blood.300',
    activeColor: 'blood.50',
    idleBorder: 'blood.700',
    idleColor: 'blood.300',
  },
  ember: {
    activeBackground: 'ember.600',
    activeBorder: 'ember.300',
    activeColor: 'ember.50',
    idleBorder: 'ember.700',
    idleColor: 'ember.300',
  },
  frost: {
    activeBackground: 'frost.600',
    activeBorder: 'frost.300',
    activeColor: 'frost.50',
    idleBorder: 'frost.700',
    idleColor: 'frost.300',
  },
  gold: {
    activeBackground: 'gold.600',
    activeBorder: 'gold.300',
    activeColor: 'gold.50',
    idleBorder: 'gold.700',
    idleColor: 'gold.300',
  },
  neutral: {
    activeBackground: 'arcane.600',
    activeBorder: 'arcane.300',
    activeColor: 'arcane.50',
    idleBorder: 'border',
    idleColor: 'fg.muted',
  },
  verdant: {
    activeBackground: 'verdant.600',
    activeBorder: 'verdant.300',
    activeColor: 'verdant.50',
    idleBorder: 'verdant.700',
    idleColor: 'verdant.300',
  },
};
