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

/**
 * As cores do chip, por tom.
 *
 * O tom e o elemento do jogo — fogo, planta, gelo, ouro, perigo — e cada um
 * tem um papel proprio na paleta. As cores sao tokens semanticos de paleta,
 * nao passos crus: assim o chip continua certo se a escala mudar.
 */
export const CHIP_TONE_COLORS: Record<ChipTone, ChipToneColors> = {
  arcane: {
    activeBackground: 'arcane.strong',
    activeBorder: 'arcane.border',
    activeColor: 'arcane.contrast',
    idleBorder: 'arcane.borderMuted',
    idleColor: 'arcane.fg',
  },
  blood: {
    activeBackground: 'blood.strong',
    activeBorder: 'blood.border',
    activeColor: 'blood.contrast',
    idleBorder: 'blood.borderMuted',
    idleColor: 'blood.fg',
  },
  ember: {
    activeBackground: 'ember.strong',
    activeBorder: 'ember.border',
    activeColor: 'ember.contrast',
    idleBorder: 'ember.borderMuted',
    idleColor: 'ember.fg',
  },
  frost: {
    activeBackground: 'frost.strong',
    activeBorder: 'frost.border',
    activeColor: 'frost.contrast',
    idleBorder: 'frost.borderMuted',
    idleColor: 'frost.fg',
  },
  gold: {
    activeBackground: 'gold.strong',
    activeBorder: 'gold.border',
    activeColor: 'gold.contrast',
    idleBorder: 'gold.borderMuted',
    idleColor: 'gold.fg',
  },
  neutral: {
    activeBackground: 'arcane.strong',
    activeBorder: 'arcane.border',
    activeColor: 'arcane.contrast',
    idleBorder: 'border',
    idleColor: 'fg.muted',
  },
  verdant: {
    activeBackground: 'verdant.strong',
    activeBorder: 'verdant.border',
    activeColor: 'verdant.contrast',
    idleBorder: 'verdant.borderMuted',
    idleColor: 'verdant.fg',
  },
};
