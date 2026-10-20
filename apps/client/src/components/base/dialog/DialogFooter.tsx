import type { ReactElement, ReactNode } from 'react';

import { LayerFooter } from '~/components/base/layer/LayerFooter';

type DialogFooterProps = {
  children: ReactNode;
};

export function DialogFooter(props: DialogFooterProps): ReactElement {
  const { children } = props;
  return <LayerFooter weight="dialog">{children}</LayerFooter>;
}
