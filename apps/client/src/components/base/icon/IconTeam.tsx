import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconTeam(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M4 9h2" />
      <path d="M18 9h2" />
    </Icon>
  );
}
