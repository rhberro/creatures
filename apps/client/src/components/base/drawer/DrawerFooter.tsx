import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type DrawerFooterProps = {
  children: ReactNode;
};

export function DrawerFooter(props: DrawerFooterProps): ReactElement {
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
