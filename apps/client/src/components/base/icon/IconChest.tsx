import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconChest(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 9h16v11H4z" />
      <path d="M4 9l2-4h12l2 4" />
      <path d="M10 13h4v3h-4z" />
    </Icon>
  );
}
