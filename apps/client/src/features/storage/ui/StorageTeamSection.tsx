import { Box } from '@chakra-ui/react';
import type { TeamSlot } from '@creatures/contracts/player';
import type { ReactElement } from 'react';

import { TeamSlotRow } from '~/entities/team';
import { TEAM_LABEL } from '~/features/storage/ui/storageModal.constants';
import { Text } from '~/shared/ui/text';

type StorageTeamSectionProps = {
  /** The creature in the field, the one the row highlights. */
  activeCreatureId: string | null;
  /** Whether the team is closed, which happens during the hunt. */
  isLocked: boolean;
  /** The command that takes a creature out of the team. */
  onRemove(creatureId: string): void;
  reason: string | null;
  /** The team, with the slot of each creature. */
  slots: TeamSlot[];
};

/**
 * The section of the team: the five slots, always, even the empty ones.
 *
 * The section has a fixed height and does not scroll: it always shows the
 * same five slots. The double click takes a creature out of the team.
 */
export function StorageTeamSection(props: StorageTeamSectionProps): ReactElement {
  const { activeCreatureId, isLocked, onRemove, reason, slots } = props;
  const reasonText = buildReason(reason);
  const label = (
    <Box alignItems="center" display="flex" gap="3" justifyContent="space-between">
      <Text color="fg.muted" variant="label">
        {TEAM_LABEL}
      </Text>
      {reasonText}
    </Box>
  );
  const row = (
    <TeamSlotRow
      activeCreatureId={activeCreatureId}
      isLocked={isLocked}
      onRemove={onRemove}
      slots={slots}
    />
  );
  return (
    <Box>
      {label}
      <Box marginBlockStart="2">{row}</Box>
    </Box>
  );
}

/**
 * The reason why the actions are blocked, shown where the player looks for
 * the team.
 */
function buildReason(reason: string | null): ReactElement | null {
  if (reason === null) {
    return null;
  }
  return (
    <Text color="fg.warning" variant="meta">
      {reason}
    </Text>
  );
}
