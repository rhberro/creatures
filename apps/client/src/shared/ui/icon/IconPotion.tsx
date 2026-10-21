import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconPotion(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M10 3h4" />
      <path d="M11 3v6l-4.6 8A2 2 0 0 0 8.1 21h7.8a2 2 0 0 0 1.7-3L13 9V3" />
      <path d="M7.5 15h9" />
    </Icon>
  );
}
