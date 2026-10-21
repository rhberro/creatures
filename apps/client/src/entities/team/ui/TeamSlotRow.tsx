import { Box } from '@chakra-ui/react';
import type { Creature } from '@creatures/contracts/creature';
import type { TeamSlot } from '@creatures/contracts/player';
import type { ReactElement } from 'react';

import { MAX_TEAM_SIZE } from '~/entities/team/model/team.constants';
import { useCreatureActivation } from '~/entities/team/model/useCreatureActivation';
import { NativeButton } from '~/shared/ui/button';
import { Slot } from '~/shared/ui/frame';
import { PopupGroup } from '~/shared/ui/popup';

import { CreatureGlyph } from './CreatureGlyph';
import { CreaturePopup } from './CreaturePopup';

const SLOT_WIDTH = '56px';
const ROW_HEIGHT = '56px';
const ACTIVE_STATUS = 'Em campo';

export type TeamSlotRowProps = {
  /** The creature in the field, the one the row highlights. */
  activeCreatureId: string | null;
  /** Whether the team is closed, which happens during the hunt. */
  isLocked: boolean;
  /** The command that takes a creature out of the team. */
  onRemove(creatureId: string): void;
  /** The team, with the slot of each creature. */
  slots: TeamSlot[];
};

/**
 * The row of the team: the five slots, always, even the empty ones.
 *
 * The slot of a creature is the slot it occupies in the team, so a free slot
 * in the middle of the row stays empty instead of closing the gap: the row
 * shows the team as it is.
 *
 * The slot carries the mark of the creature and nothing else: the name, the
 * level and the status live in the popup. The double click takes the creature
 * out of the team.
 *
 * The row is the **group of its popups**: one open popup at a time, and
 * clicking a creature closes the popup of the other and opens its own.
 */
export function TeamSlotRow(props: TeamSlotRowProps): ReactElement {
  const { activeCreatureId, isLocked, onRemove, slots } = props;
  const cells = buildCells(activeCreatureId, isLocked, onRemove, slots);
  return (
    <Box display="flex" gap="1" height={ROW_HEIGHT}>
      <PopupGroup>{cells}</PopupGroup>
    </Box>
  );
}

function buildCells(
  activeCreatureId: string | null,
  isLocked: boolean,
  onRemove: (creatureId: string) => void,
  slots: TeamSlot[],
): ReactElement[] {
  const cells: ReactElement[] = [];
  for (let index = 0; index < MAX_TEAM_SIZE; index += 1) {
    const slot = slots.find(function matchesSlot(entry: TeamSlot): boolean {
      return entry.slot === index + 1;
    });
    const creature = slot?.creature ?? null;
    const key = creature === null ? `empty-${index}` : creature.id;
    cells.push(
      <TeamSlotCell
        activeCreatureId={activeCreatureId}
        creature={creature}
        isLocked={isLocked}
        key={key}
        onRemove={onRemove}
      />,
    );
  }
  return cells;
}

type TeamSlotCellProps = {
  activeCreatureId: string | null;
  creature: Creature | null;
  isLocked: boolean;
  onRemove(creatureId: string): void;
};

function TeamSlotCell(props: TeamSlotCellProps): ReactElement {
  const { activeCreatureId, creature, isLocked, onRemove } = props;
  if (creature === null) {
    return (
      <Box width={SLOT_WIDTH}>
        <Slot empty />
      </Box>
    );
  }
  return (
    <CreatureSlot
      activeCreatureId={activeCreatureId}
      creature={creature}
      isLocked={isLocked}
      onRemove={onRemove}
    />
  );
}

type CreatureSlotProps = {
  activeCreatureId: string | null;
  creature: Creature;
  isLocked: boolean;
  onRemove(creatureId: string): void;
};

/**
 * The slot of a creature of the team.
 *
 * The double click takes the creature out of the team, and the popup carries
 * what the slot does not show.
 */
function CreatureSlot(props: CreatureSlotProps): ReactElement {
  const { activeCreatureId, creature, isLocked, onRemove } = props;
  const creatureId = creature.id;
  const isActive = activeCreatureId === creatureId;

  function handleActivate(): void {
    if (isLocked) {
      return;
    }
    onRemove(creatureId);
  }

  const activation = useCreatureActivation(handleActivate);
  const cursor = isLocked ? 'not-allowed' : 'pointer';
  const trigger = (
    <NativeButton
      cursor={cursor}
      onClick={activation.handleClick}
      onDoubleClick={activation.handleDoubleClick}
      onPointerDown={activation.handlePointerDown}
      width={SLOT_WIDTH}
    >
      <Slot selected={isActive}>
        <CreatureGlyph creature={creature} />
      </Slot>
    </NativeButton>
  );
  const status = isActive ? ACTIVE_STATUS : null;
  return (
    <CreaturePopup creature={creature} status={status}>
      {trigger}
    </CreaturePopup>
  );
}
