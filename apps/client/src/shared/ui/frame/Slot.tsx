import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { useSelectionRing } from '~/shared/theme';

import { CornerBracket } from './CornerBracket';
import { EquippedWedge } from './EquippedWedge';
import type { SlotProps } from './slot.types';

export function Slot(props: SlotProps): ReactElement {
  const { children, empty = false, equipped = false, selected = false } = props;
  const selectionRing = useSelectionRing();
  const bracket = selected ? <CornerBracket /> : null;
  const content = empty ? null : children;
  const ring = selected ? selectionRing : undefined;
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
