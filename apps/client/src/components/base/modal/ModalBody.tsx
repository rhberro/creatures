import type { ReactElement, ReactNode } from 'react';

import { LayerBody } from '~/components/base/layer/LayerBody';

type ModalBodyProps = {
  children: ReactNode;
};

export function ModalBody(props: ModalBodyProps): ReactElement {
  const { children } = props;
  return <LayerBody weight="modal">{children}</LayerBody>;
}
