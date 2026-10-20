import type { ReactElement, ReactNode } from 'react';

import { LayerFooter } from '~/components/base/layer/LayerFooter';

type ModalFooterProps = {
  children: ReactNode;
};

export function ModalFooter(props: ModalFooterProps): ReactElement {
  const { children } = props;
  return <LayerFooter weight="modal">{children}</LayerFooter>;
}
