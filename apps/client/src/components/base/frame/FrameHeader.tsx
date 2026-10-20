import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { Text } from '~/components/base/text/Text';
import { DIVIDER_BOTTOM } from '~/theme/divider';

import type { FrameAlign } from './frame.types';

type FrameHeaderProps = {
  align?: FrameAlign;
  children: ReactNode;
};

export function FrameHeader(props: FrameHeaderProps): ReactElement {
  const { align = 'start', children } = props;
  return (
    <Box css={DIVIDER_BOTTOM} paddingBlock="3" paddingInline="4" textAlign={align}>
      <Text color="fg" variant="section">
        {children}
      </Text>
    </Box>
  );
}
