import type { ReactElement, ReactNode } from 'react';

import { LayerHeader } from '~/shared/ui/layer';

type DrawerHeaderProps = {
  children: ReactNode;
};

export function DrawerHeader(props: DrawerHeaderProps): ReactElement {
  const { children } = props;
  return <LayerHeader weight="drawer">{children}</LayerHeader>;
}
