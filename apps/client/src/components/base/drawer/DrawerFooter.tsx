import type { ReactElement, ReactNode } from 'react';

import { LayerFooter } from '~/components/base/layer/LayerFooter';

type DrawerFooterProps = {
  children: ReactNode;
};

export function DrawerFooter(props: DrawerFooterProps): ReactElement {
  const { children } = props;
  return <LayerFooter weight="drawer">{children}</LayerFooter>;
}
