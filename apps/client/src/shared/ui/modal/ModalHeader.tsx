import type { ReactElement, ReactNode } from 'react';

import { LayerHeader } from '~/shared/ui/layer';

type ModalHeaderProps = {
  children: ReactNode;
};

export function ModalHeader(props: ModalHeaderProps): ReactElement {
  const { children } = props;
  return <LayerHeader weight="modal">{children}</LayerHeader>;
}
