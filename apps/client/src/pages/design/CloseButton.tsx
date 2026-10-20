import type { ReactElement } from 'react';

import { IconClose } from '~/components/base/icon';

import { IconButton } from './IconButton';

export function CloseButton(): ReactElement {
  return (
    <IconButton label="Fechar">
      <IconClose />
    </IconButton>
  );
}
