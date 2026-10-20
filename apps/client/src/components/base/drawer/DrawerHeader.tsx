import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { Text } from '~/components/base/text/Text';

type DrawerHeaderProps = {
  align?: 'center' | 'start';
  children: ReactNode;
};

export function DrawerHeader(props: DrawerHeaderProps): ReactElement {
  const { align = 'center', children } = props;
  return (
    <Box
      borderBottom="1px solid"
      borderColor="border"
      paddingBlock="3"
      paddingInline="4"
      textAlign={align}
    >
      <Text color="fg" variant="title">
        {children}
      </Text>
    </Box>
  );
}
