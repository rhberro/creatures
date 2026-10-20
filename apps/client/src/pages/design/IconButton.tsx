import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';

type IconButtonProps = {
  children: ReactElement;
  label: string;
};

export function IconButton(props: IconButtonProps): ReactElement {
  const { children, label } = props;
  return (
    <Button aria-label={label} bg="bg.raised" minW="44px" padding="0" tone="ghost">
      {children}
    </Button>
  );
}
