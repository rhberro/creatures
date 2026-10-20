import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';
import { FOCUS_BORDER } from '~/theme/focus';

import type { TabProps } from './tab.types';

export function Tab(props: TabProps): ReactElement {
  const { active = false, children } = props;
  const background = active ? 'bg.raised' : 'transparent';
  const borderColor = active ? 'arcane' : 'transparent';
  const color = active ? 'fg' : 'fg.subtle';
  return (
    <Box
      _focusVisible={FOCUS_BORDER}
      bg={background}
      borderBottom="2px solid"
      borderColor={borderColor}
      color={color}
      cursor="pointer"
      paddingBlock="2"
      paddingInline="4"
      role="button"
      tabIndex={0}
      transitionProperty="background-color, border-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
    >
      <Text variant="label">{children}</Text>
    </Box>
  );
}
