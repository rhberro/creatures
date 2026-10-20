import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconClose } from '~/components/base/icon';

const CLEAR_SIZE = '14px';

type ClearControlProps = {
  onClick: () => void;
};

export function ClearControl(props: ClearControlProps): ReactElement {
  const { onClick } = props;
  return (
    <Box
      alignItems="center"
      color="fg.subtle"
      cursor="pointer"
      display="flex"
      height="24px"
      justifyContent="center"
      position="absolute"
      right="7px"
      top="7px"
      transitionProperty="color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width="24px"
      zIndex="1"
      onClick={onClick}
    >
      <IconClose size={CLEAR_SIZE} />
    </Box>
  );
}
