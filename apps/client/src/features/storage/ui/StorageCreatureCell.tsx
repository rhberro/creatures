import type { Creature } from '@creatures/contracts/creature';
import type { ReactElement } from 'react';

import { CreatureGlyph, CreaturePopup, useCreatureActivation } from '~/entities/team';
import { NativeButton } from '~/shared/ui/button';
import { Slot } from '~/shared/ui/frame';

const SLOT_WIDTH = '56px';

type StorageCreatureCellProps = {
  creature: Creature;
  /** Whether the team is closed, which happens during the hunt. */
  isLocked: boolean;
  /** Whether the slot is the one the player clicked. */
  isSelected: boolean;
  onAdd(creatureId: string): void;
  /** The click on the slot, that marks the creature as chosen. */
  onSelect(creatureId: string): void;
};

/**
 * A captured creature: the mark of the species and the command that sends it
 * to the team.
 *
 * The slot carries the mark and nothing else: the name and the level live in
 * the popup. The double click sends the creature to the team, and the click
 * leaves the slot marked as the chosen one.
 */
export function StorageCreatureCell(props: StorageCreatureCellProps): ReactElement {
  const { creature, isLocked, isSelected, onAdd, onSelect } = props;
  const creatureId = creature.id;

  function handleActivate(): void {
    if (isLocked) {
      return;
    }
    onAdd(creatureId);
  }

  const activation = useCreatureActivation(handleActivate);
  const cursor = isLocked ? 'not-allowed' : 'pointer';
  const handleClick = buildClick(activation.handleClick, onSelect, creatureId);
  const trigger = (
    <NativeButton
      cursor={cursor}
      onClick={handleClick}
      onDoubleClick={activation.handleDoubleClick}
      onPointerDown={activation.handlePointerDown}
      width={SLOT_WIDTH}
    >
      <Slot selected={isSelected}>
        <CreatureGlyph creature={creature} />
      </Slot>
    </NativeButton>
  );
  return <CreaturePopup creature={creature}>{trigger}</CreaturePopup>;
}

/**
 * The click on the slot: it marks the creature as chosen and it keeps the
 * activation of the touch, that sends the creature to the team.
 */
function buildClick(
  activate: () => void,
  onSelect: (creatureId: string) => void,
  creatureId: string,
): () => void {
  return function click(): void {
    onSelect(creatureId);
    activate();
  };
}
