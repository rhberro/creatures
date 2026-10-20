import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconPrism(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 3 3 20h18L12 3Z" />
      <path d="M12 3v17" />
    </Icon>
  );
}
