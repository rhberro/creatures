import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconHeart(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 20.5S4.5 16 4.5 10.5A4 4 0 0 1 12 8a4 4 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10Z" />
    </Icon>
  );
}
