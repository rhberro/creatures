import type { FrameTone } from './frame.types';

export const TONE_BG: Record<FrameTone, string> = {
  overlay: 'bg.panel',
  panel: 'bg.panel',
  recessed: 'bg.sunken',
  transparent: 'transparent',
};

export const TONE_SHADOW: Record<FrameTone, string> = {
  overlay: 'overlay',
  panel: 'raised',
  recessed: 'recessed',
  transparent: 'none',
};
