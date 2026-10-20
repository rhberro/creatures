import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { AreaEntry } from './data';

const CIRCLE_SIZE = '20px';
const CIRCLE_OVERLAP = '-6px';
const MAX_VISIBLE = 7;

type CreatureCirclesProps = {
  creatures: AreaEntry[];
};

export function CreatureCircles(props: CreatureCirclesProps): ReactElement {
  const { creatures } = props;
  const visible = creatures.slice(0, MAX_VISIBLE);
  const overflow = creatures.length > MAX_VISIBLE;
  const circles = visible.map(renderCircle);
  const overflowMark = overflow ? <OverflowMark /> : null;
  return (
    <Box alignItems="center" display="flex" height={CIRCLE_SIZE}>
      {circles}
      {overflowMark}
    </Box>
  );
}

function renderCircle(creature: AreaEntry, index: number): ReactElement {
  const margin = index === 0 ? '0' : CIRCLE_OVERLAP;
  return (
    <Box
      bg={creature.tone}
      borderRadius="full"
      height={CIRCLE_SIZE}
      key={creature.name}
      marginInlineStart={margin}
      title={creature.name}
      width={CIRCLE_SIZE}
    />
  );
}

function OverflowMark(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg.raised"
      borderRadius="full"
      display="flex"
      height={CIRCLE_SIZE}
      justifyContent="center"
      marginInlineStart={CIRCLE_OVERLAP}
      width={CIRCLE_SIZE}
    >
      +
    </Box>
  );
}
