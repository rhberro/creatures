import { Box } from '@chakra-ui/react';
import type { Creature } from '@creatures/contracts/creature';
import type { ReactElement } from 'react';

import { readCreatureName } from '~/entities/team/model/teamCreature';
import { Popup } from '~/shared/ui/popup';
import { Text } from '~/shared/ui/text';

const LEVEL_LABEL = 'Nível';

export type CreaturePopupProps = {
  creature: Creature;
  /** The element that opens the popup. */
  children: ReactElement;
  /** The status of the creature, when the game has one to show. */
  status?: string | null;
};

/**
 * The popup of a creature.
 *
 * It carries what the slot does not: the name of the species, the level and
 * the status. The popup opens on hover and stays open on click, as every popup
 * of the interface does.
 */
export function CreaturePopup(props: CreaturePopupProps): ReactElement {
  const { children, creature, status = null } = props;
  const name = readCreatureName(creature);
  const levelText = `${LEVEL_LABEL} ${creature.level}`;
  const level = (
    <Text color="fg.muted" variant="meta">
      {levelText}
    </Text>
  );
  const statusText =
    status === null ? null : (
      <Text color="fg.muted" variant="meta">
        {status}
      </Text>
    );
  const content = (
    <Box display="flex" flexDirection="column" gap="1">
      <Text variant="name">{name}</Text>
      {level}
      {statusText}
    </Box>
  );
  return <Popup content={content}>{children}</Popup>;
}
