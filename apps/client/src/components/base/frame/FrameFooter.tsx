import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type FrameFooterProps = {
  children: ReactNode;
};

export function FrameFooter(props: FrameFooterProps): ReactElement {
  const { children } = props;
  return (
    <Box borderTop="1px solid" borderColor="border" paddingBlock="3" paddingInline="4">
      {children}
    </Box>
  );
}
