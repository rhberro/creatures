import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { TONE_BG, TONE_SHADOW } from './frame.constants';
import type { FrameProps } from './frame.types';
import { FrameAccent } from './FrameAccent';

export function Frame(props: FrameProps): ReactElement {
  const { accent = false, children, height, tone = 'panel' } = props;
  const accentEdge = accent ? <FrameAccent /> : null;
  return (
    <Box
      bg={TONE_BG[tone]}
      borderRadius="lg"
      boxShadow={TONE_SHADOW[tone]}
      display="flex"
      flexDirection="column"
      height={height}
      overflow="hidden"
      position="relative"
    >
      {accentEdge}
      {children}
    </Box>
  );
}
