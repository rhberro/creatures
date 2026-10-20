import type { ReactNode } from 'react';

export type FrameProps = {
  accent?: boolean;
  children: ReactNode;
  height?: string;
  tone?: FrameTone;
};

export type FrameTone = 'overlay' | 'panel' | 'recessed' | 'transparent';

export type FrameAlign = 'center' | 'start';
