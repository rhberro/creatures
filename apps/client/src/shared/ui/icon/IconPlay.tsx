import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconPlay(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M8 5l11 7-11 7V5Z" />
    </Icon>
  );
}
