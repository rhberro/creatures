import type { ReactElement, ReactNode } from 'react';

import { LayerBody } from '~/shared/ui/layer';

type ModalBodyProps = {
  children: ReactNode;
};

export function ModalBody(props: ModalBodyProps): ReactElement {
  const { children } = props;
  return <LayerBody weight="modal">{children}</LayerBody>;
}
