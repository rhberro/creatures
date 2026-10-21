import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconGem(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />
      <path d="M3 9h18" />
      <path d="M9 4l3 5 3-5" />
    </Icon>
  );
}
