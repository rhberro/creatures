import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconBell(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 9a6 6 0 0 1 12 0v3.5L19.5 15h-15L6 12.5V9Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </Icon>
  );
}
