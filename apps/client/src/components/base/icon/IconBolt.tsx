import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconBolt(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
    </Icon>
  );
}
