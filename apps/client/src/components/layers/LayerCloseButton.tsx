import { Button } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function LayerCloseButton(props: LayerCloseButtonProps): ReactElement {
  const { onClose } = props;
  return (
    <Button
      aria-label="Fechar"
      onClick={onClose}
      position="absolute"
      right="2"
      size="sm"
      top="2"
      variant="ghost"
    >
      ×
    </Button>
  );
}

export type LayerCloseButtonProps = {
  onClose: () => void;
};
