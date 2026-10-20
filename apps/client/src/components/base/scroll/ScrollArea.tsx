import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { ScrollAreaProps } from './scroll.types';

export function ScrollArea(props: ScrollAreaProps): ReactElement {
  const { children, ...rest } = props;
  return (
    <Box overflow="auto" scrollbarGutter="stable" {...rest}>
      {children}
    </Box>
  );
}
