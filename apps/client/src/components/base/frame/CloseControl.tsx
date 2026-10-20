import { Box } from '@chakra-ui/react';
import type { MouseEvent, ReactElement } from 'react';

import { IconClose } from '~/components/base/icon';

const CLOSE_SIZE = '28px';

type CloseControlProps = {
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  size?: string;
};

export function CloseControl(props: CloseControlProps): ReactElement {
  const { onClick, size = CLOSE_SIZE } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.raised"
      borderColor="border"
      borderRadius="full"
      borderWidth="1px"
      boxShadow="overlay"
      color="fg.muted"
      cursor="pointer"
      display="flex"
      flexShrink="0"
      height={size}
      justifyContent="center"
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={size}
      onClick={onClick}
    >
      <IconClose />
    </Box>
  );
}
