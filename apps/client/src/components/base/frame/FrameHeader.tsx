import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { Text } from '~/components/base/text/Text';

import type { FrameAlign } from './frame.types';

type FrameHeaderProps = {
  align?: FrameAlign;
  children: ReactNode;
};

export function FrameHeader(props: FrameHeaderProps): ReactElement {
  const { align = 'start', children } = props;
  return (
    <Box
      borderBottom="1px solid"
      borderColor="border"
      paddingBlock="3"
      paddingInline="4"
      textAlign={align}
    >
      <Text color="fg" variant="section">
        {children}
      </Text>
    </Box>
  );
}
