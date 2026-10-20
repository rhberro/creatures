import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { SELECTED_RING } from '~/theme/selection';

import { CornerBracket } from './CornerBracket';
import { EquippedWedge } from './EquippedWedge';
import type { SlotProps } from './slot.types';

export function Slot(props: SlotProps): ReactElement {
  const { children, empty = false, equipped = false, selected = false } = props;
  const bracket = selected ? <CornerBracket /> : null;
  const content = empty ? null : children;
  const ring = selected ? SELECTED_RING : undefined;
  const wedge = equipped ? <EquippedWedge /> : null;
  return (
    <Box
      _before={ring}
      bg="bg.sunken"
      borderRadius="sm"
      boxShadow="recessed"
      height="56px"
      position="relative"
      transitionProperty="box-shadow"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width="56px"
    >
      <Box borderRadius="sm" height="full" overflow="hidden" width="full">
        {content}
      </Box>
      {bracket}
      {wedge}
    </Box>
  );
}
