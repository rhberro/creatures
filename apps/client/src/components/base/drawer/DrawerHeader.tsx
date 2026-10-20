import type { ReactElement, ReactNode } from 'react';

import { LayerHeader } from '~/components/base/layer/LayerHeader';

type DrawerHeaderProps = {
  children: ReactNode;
};

export function DrawerHeader(props: DrawerHeaderProps): ReactElement {
  const { children } = props;
  return <LayerHeader weight="drawer">{children}</LayerHeader>;
}
