import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { Wordmark } from './Wordmark';

type BrandLayoutProps = {
  children: ReactNode;
};

export function BrandLayout(props: BrandLayoutProps): ReactElement {
  const { children } = props;
  return (
    <Box
      alignItems="center"
      as="main"
      bg="bg"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH="100dvh"
      p={6}
    >
      <Wordmark />
      {children}
    </Box>
  );
}
