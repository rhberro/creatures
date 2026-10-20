import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type DialogBodyProps = {
  children: ReactNode;
};

export function DialogBody(props: DialogBodyProps): ReactElement {
  const { children } = props;
  return (
    <Box display="flex" flexDirection="column" gap="4" padding="4">
      {children}
    </Box>
  );
}
