import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { Text } from '~/components/base/text/Text';

type DialogHeaderProps = {
  children: ReactNode;
};

export function DialogHeader(props: DialogHeaderProps): ReactElement {
  const { children } = props;
  return (
    <Box borderBottom="1px solid" borderColor="border" paddingBlock="3" paddingInline="4">
      <Text color="fg" variant="section">
        {children}
      </Text>
    </Box>
  );
}
