import { Box } from '@chakra-ui/react';
import type { Creature } from '@creatures/contracts/creature';
import type { Element } from '@creatures/contracts/species';
import type { ReactElement } from 'react';

import { readCreatureElement } from '~/entities/team/model/teamCreature';

const ELEMENT_COLORS: Record<Element, string> = {
  fire: 'element.fire',
  neutral: 'element.neutral',
  plant: 'element.plant',
  water: 'element.water',
};

type CreatureGlyphProps = {
  creature: Creature;
};

/**
 * The mark of a creature: the element decides the color.
 *
 * It stands in for the final art of the creature, which does not exist yet.
 * The slot carries no text: the name and the level live in the popup, and the
 * slot stays clean.
 */
export function CreatureGlyph(props: CreatureGlyphProps): ReactElement {
  const { creature } = props;
  const color = ELEMENT_COLORS[readCreatureElement(creature)];
  return <Box bg={color} height="full" width="full" />;
}
