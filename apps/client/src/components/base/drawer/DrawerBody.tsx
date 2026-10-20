import type { ReactElement, ReactNode } from 'react';

import { LayerBody } from '~/components/base/layer/LayerBody';

type DrawerBodyProps = {
  children: ReactNode;
};

export function DrawerBody(props: DrawerBodyProps): ReactElement {
  const { children } = props;
  return <LayerBody weight="drawer">{children}</LayerBody>;
}
