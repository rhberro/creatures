import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconStore(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 9h16v11H4z" />
      <path d="M4 9l1.6-5h12.8L20 9" />
      <path d="M9 20v-6h6v6" />
    </Icon>
  );
}
