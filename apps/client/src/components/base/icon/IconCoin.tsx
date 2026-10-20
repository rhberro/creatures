import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconCoin(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 1.9 3 2.5 3 1.4 3 2.5-1.3 2-3 2-3-.9-3-2" />
    </Icon>
  );
}
