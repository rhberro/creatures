import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type DrawerBodyProps = {
  children: ReactNode;
};

export function DrawerBody(props: DrawerBodyProps): ReactElement {
  const { children } = props;
  return (
    <Box flex="1" minH="0" overflowY="auto" padding="4">
      {children}
    </Box>
  );
}
