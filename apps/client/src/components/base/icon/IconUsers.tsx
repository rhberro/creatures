import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconUsers(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6" />
      <path d="M18 14.5A5.5 5.5 0 0 1 21.5 20" />
    </Icon>
  );
}
