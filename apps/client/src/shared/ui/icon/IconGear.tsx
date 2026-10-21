import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconGear(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5" />
      <path d="M12 18.5V21" />
      <path d="M4.6 7.2l2.2 1.3" />
      <path d="M17.2 15.5l2.2 1.3" />
      <path d="M4.6 16.8l2.2-1.3" />
      <path d="M17.2 8.5l2.2-1.3" />
    </Icon>
  );
}
