import type { ReactElement, ReactNode } from 'react';

import { LayerHeader } from '~/shared/ui/layer';

type DialogHeaderProps = {
  children: ReactNode;
};

export function DialogHeader(props: DialogHeaderProps): ReactElement {
  const { children } = props;
  return <LayerHeader weight="dialog">{children}</LayerHeader>;
}
