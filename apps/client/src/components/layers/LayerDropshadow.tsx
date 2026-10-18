import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function LayerDropshadow(props: LayerDropshadowProps): ReactElement {
  const { onClose } = props;
  return (
    <Box
      bg="blackAlpha.600"
      bottom="0"
      cursor="pointer"
      left="0"
      onClick={onClose}
      position="fixed"
      right="0"
      top="0"
    />
  );
}

export type LayerDropshadowProps = {
  onClose: () => void;
};
