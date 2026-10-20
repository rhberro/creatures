import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconCrosshair(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
    </Icon>
  );
}
