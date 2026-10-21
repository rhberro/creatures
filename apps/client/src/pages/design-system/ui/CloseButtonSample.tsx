import type { ReactElement } from 'react';

import { IconClose } from '~/shared/ui/icon';

import { IconButtonSample } from './IconButtonSample';

export function CloseButtonSample(): ReactElement {
  return (
    <IconButtonSample label="Fechar">
      <IconClose />
    </IconButtonSample>
  );
}
