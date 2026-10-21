import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/shared/ui/button';

const SHOP_BOTTOM = '128px';

type ShopButtonProps = {
  onClick: () => void;
};

export function ShopButton(props: ShopButtonProps): ReactElement {
  const { onClick } = props;
  return (
    <Box bottom={SHOP_BOTTOM} left="50%" position="absolute" transform="translateX(-50%)">
      <Button onClick={onClick} tone="primary">
        Loja
      </Button>
    </Box>
  );
}
