import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { DIVIDER_TOP } from '~/shared/theme';

type FrameFooterProps = {
  children: ReactNode;
};

export function FrameFooter(props: FrameFooterProps): ReactElement {
  const { children } = props;
  return (
    <Box css={DIVIDER_TOP} paddingBlock="3" paddingInline="4">
      {children}
    </Box>
  );
}
