import type { ReactElement, ReactNode } from 'react';

import { LayerFooter } from '~/shared/ui/layer';

type DialogFooterProps = {
  children: ReactNode;
};

export function DialogFooter(props: DialogFooterProps): ReactElement {
  const { children } = props;
  return <LayerFooter weight="dialog">{children}</LayerFooter>;
}
