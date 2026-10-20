import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type DialogFooterProps = {
  children: ReactNode;
};

export function DialogFooter(props: DialogFooterProps): ReactElement {
  const { children } = props;
  return (
    <Box
      alignItems="center"
      borderTop="1px solid"
      borderColor="border"
      display="flex"
      gap="2"
      paddingBlock="3"
      paddingInline="4"
    >
      {children}
    </Box>
  );
}
