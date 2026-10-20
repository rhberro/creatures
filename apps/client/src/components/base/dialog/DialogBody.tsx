import type { ReactElement, ReactNode } from 'react';

import { LayerBody } from '~/components/base/layer/LayerBody';

type DialogBodyProps = {
  children: ReactNode;
};

export function DialogBody(props: DialogBodyProps): ReactElement {
  const { children } = props;
  return <LayerBody weight="dialog">{children}</LayerBody>;
}
