import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconBag(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Icon>
  );
}
