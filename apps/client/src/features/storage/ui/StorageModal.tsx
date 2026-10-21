import { Box } from '@chakra-ui/react';
import type { Creature } from '@creatures/contracts/creature';
import type { TeamSlot } from '@creatures/contracts/player';
import type { ReactElement } from 'react';

import { MAX_TEAM_SIZE, useTeam } from '~/entities/team';
import { useStorage } from '~/features/storage/model/useStorage';
import { StorageCreaturesSection } from '~/features/storage/ui/StorageCreaturesSection';
import { StorageFooter } from '~/features/storage/ui/StorageFooter';
import {
  FULL_REASON,
  HUNT_REASON,
  STORAGE_HEIGHT,
  STORAGE_WIDTH,
  TITLE,
} from '~/features/storage/ui/storageModal.constants';
import { StorageTeamSection } from '~/features/storage/ui/StorageTeamSection';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '~/shared/ui/modal';
import { PopupGroup } from '~/shared/ui/popup';

import type { StorageModalProps } from './storageModal.types';

/**
 * The storage: the team on top and the captured creatures below.
 *
 * The reading works from anywhere, hunting or not. The commands that change
 * the team are closed during the hunt, and the order of the team is the order
 * of the entry: the creature in the field is the one in the first slot.
 */
export function StorageModal(props: StorageModalProps): ReactElement {
  const { contained = false, isHunting = false, isOpen, onClose, snapshot } = props;
  const fallback = useTeam(undefined, isOpen && snapshot === undefined);
  const team = snapshot ?? fallback;
  const { captured, handleSearchChange, isSearching, search, select, selectedId } = useStorage(
    team.storage,
  );
  const isFull = team.team.length >= MAX_TEAM_SIZE;
  const reason = isHunting ? HUNT_REASON : isFull ? FULL_REASON : null;

  function handleAdd(creatureId: string): void {
    void team.addToTeam(creatureId);
  }

  function handleRemove(creatureId: string): void {
    void team.removeFromTeam(creatureId);
  }

  return (
    <Modal
      contained={contained}
      height={STORAGE_HEIGHT}
      isOpen={isOpen}
      onClose={onClose}
      width={STORAGE_WIDTH}
    >
      <ModalHeader>{TITLE}</ModalHeader>
      <ModalBody>
        <StorageBody
          activeCreatureId={team.activeCreatureId}
          captured={captured}
          isHunting={isHunting}
          isLoading={team.isLoading}
          isSearching={isSearching}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onSelect={select}
          reason={reason}
          selectedId={selectedId}
          slots={team.team}
        />
      </ModalBody>
      <ModalFooter>
        <StorageFooter error={team.error} onSearchChange={handleSearchChange} search={search} />
      </ModalFooter>
    </Modal>
  );
}

type StorageBodyProps = {
  activeCreatureId: string | null;
  captured: Creature[];
  isHunting: boolean;
  isLoading: boolean;
  isSearching: boolean;
  onAdd(creatureId: string): void;
  onRemove(creatureId: string): void;
  /** The click on a slot of the grid, that marks the creature as chosen. */
  onSelect(creatureId: string): void;
  reason: string | null;
  /** The creature the player clicked, the one whose slot is marked. */
  selectedId: string | null;
  slots: TeamSlot[];
};

/**
 * The body of the storage: the team on top and the captured creatures below.
 *
 * The body is the **group of the popups** do modal: o popup do time e o da
 * grade são o mesmo grupo, então só um fica aberto por vez — clicar numa
 * criatura da grade fecha o popup do time, e vice-versa.
 */
function StorageBody(props: StorageBodyProps): ReactElement {
  const {
    activeCreatureId,
    captured,
    isHunting,
    isLoading,
    isSearching,
    onAdd,
    onRemove,
    onSelect,
    reason,
    selectedId,
    slots,
  } = props;
  return (
    <Box display="flex" flexDirection="column" gap="4" height="full">
      <PopupGroup>
        <StorageTeamSection
          activeCreatureId={activeCreatureId}
          isLocked={isHunting}
          onRemove={onRemove}
          reason={reason}
          slots={slots}
        />
        <StorageCreaturesSection
          captured={captured}
          isLocked={isHunting}
          isLoading={isLoading}
          isSearching={isSearching}
          onAdd={onAdd}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      </PopupGroup>
    </Box>
  );
}
