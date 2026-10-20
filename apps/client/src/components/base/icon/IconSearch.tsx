import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconSearch(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M15.5 15.5 20 20" />
    </Icon>
  );
}
