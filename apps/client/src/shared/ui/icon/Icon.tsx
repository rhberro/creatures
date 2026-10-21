import type { ReactElement, ReactNode } from 'react';

import { ICON_DEFAULTS } from './icon.constants';
import type { IconProps } from './icon.types';

export function Icon(props: IconProps & { children: ReactNode }): ReactElement {
  const { children, size = ICON_DEFAULTS.SIZE } = props;
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={ICON_DEFAULTS.STROKE_WIDTH}
      viewBox={ICON_DEFAULTS.VIEW_BOX}
      width={size}
    >
      {children}
    </svg>
  );
}
