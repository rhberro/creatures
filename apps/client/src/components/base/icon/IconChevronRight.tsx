import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconChevronRight(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  );
}
