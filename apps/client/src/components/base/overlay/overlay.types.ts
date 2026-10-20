import type { RefObject } from 'react';

export type OverlayContextValue = {
  onClose: () => void;
};

export type OverlayDismissProps = {
  contentRef: RefObject<HTMLElement | null>;
  dismissOnOutside: boolean;
  interactive: boolean;
  onClose: () => void;
};
