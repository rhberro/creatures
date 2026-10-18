import { Button } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function ShopButton(props: ShopButtonProps): ReactElement {
  const { onClick } = props;
  return (
    <Button
      colorPalette="gray"
      left="50%"
      position="absolute"
      size="md"
      transform="translateX(-50%)"
      variant="outline"
      onClick={onClick}
    >
      Loja
    </Button>
  );
}

export type ShopButtonProps = {
  onClick: () => void;
};
