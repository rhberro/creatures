import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { CornerBracket } from './CornerBracket';
import { EquippedWedge } from './EquippedWedge';
import type { SlotProps } from './slot.types';

const SELECTED_BORDER_WIDTH = '1px';
const SELECTED_BORDER_COLOR = 'state.selected';

/**
 * The slot: the only shape that shows an item, a creature or an ability.
 *
 * It carries the four states — filled, selected (clicked), equipped and empty
 * — and nothing else. It does not know about teams, active creatures or
 * selection rings: who knows that is the domain.
 *
 * The selected state draws the border **and** the corner bracket of the top
 * left. The border is a real border, inside the slot: the outline of the
 * keyboard focus lives outside the element, so the two never fight.
 *
 * The content takes the whole slot: the art of a creature, the mark of an
 * item or the glyph of an ability fills the width and the height, with no
 * margin and no letterbox.
 */
export function Slot(props: SlotProps): ReactElement {
  const { children, empty = false, equipped = false, selected = false } = props;
  const content = empty ? null : children;
  const bracket = selected ? <CornerBracket /> : null;
  const wedge = equipped ? <EquippedWedge /> : null;
  const borderColor = selected ? SELECTED_BORDER_COLOR : undefined;
  const borderWidth = selected ? SELECTED_BORDER_WIDTH : undefined;
  return (
    <Box
      bg="bg.sunken"
      borderColor={borderColor}
      borderRadius="sm"
      borderWidth={borderWidth}
      boxShadow="recessed"
      height="56px"
      position="relative"
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
