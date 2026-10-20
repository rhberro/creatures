import type { ReactElement, ReactNode } from 'react';

import { LayerHeader } from '~/components/base/layer/LayerHeader';

type DialogHeaderProps = {
  children: ReactNode;
};

export function DialogHeader(props: DialogHeaderProps): ReactElement {
  const { children } = props;
  return <LayerHeader weight="dialog">{children}</LayerHeader>;
}
