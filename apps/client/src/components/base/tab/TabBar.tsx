import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type TabBarProps = {
  children: ReactNode;
};

export function TabBar(props: TabBarProps): ReactElement {
  const { children } = props;
  return (
    <Box display="flex" gap="1">
      {children}
    </Box>
  );
}
