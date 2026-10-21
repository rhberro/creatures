import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { TextField } from '~/shared/ui/field';
import { Slot, SlotGrid } from '~/shared/ui/frame';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '~/shared/ui/modal';
import { ScrollArea } from '~/shared/ui/scroll';
import { Text } from '~/shared/ui/text';

const TITLE = 'Armazenamento';
const TEAM_LABEL = 'Time';
const CREATURES_LABEL = 'Criaturas';
const SEARCH_PLACEHOLDER = 'Buscar criaturas';
const STORE_WIDTH = '720px';
const STORE_HEIGHT = '620px';
const SEARCH_WIDTH = '240px';

type StorageCreature = {
  empty?: boolean;
  level: string;
  name: string;
  tone: string;
};

const TEAM: StorageCreature[] = [
  { level: '9', name: 'Cinzarra', tone: 'ember.400' },
  { level: '7', name: 'Brotus', tone: 'verdant.400' },
  { level: '5', name: 'Pedrino', tone: 'base.300' },
  { empty: true, level: '', name: '', tone: '' },
  { empty: true, level: '', name: '', tone: '' },
];

const CAPTURED: StorageCreature[] = [
  { level: '3', name: 'Brasal', tone: 'ember.400' },
  { level: '2', name: 'Mossim', tone: 'verdant.400' },
  { level: '1', name: 'Cascalho', tone: 'base.300' },
  { level: '4', name: 'Fagulha', tone: 'ember.400' },
  { level: '6', name: 'Galho', tone: 'verdant.400' },
  { level: '2', name: 'Seixo', tone: 'base.300' },
];

type StorageModalProps = {
  contained?: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export function StorageModal(props: StorageModalProps): ReactElement {
  const { contained = false, isOpen, onClose } = props;
  const teamCells = TEAM.map(renderCreatureCell);
  const capturedCells = CAPTURED.map(renderCreatureCell);
  return (
    <Modal
      contained={contained}
      isOpen={isOpen}
      height={STORE_HEIGHT}
      onClose={onClose}
      width={STORE_WIDTH}
    >
      <ModalHeader>{TITLE}</ModalHeader>
      <ModalBody>
        <Text color="fg.muted" marginBlockEnd="2" variant="label">
          {TEAM_LABEL}
        </Text>
        <Box marginBlockEnd="5">
          <SlotGrid>{teamCells}</SlotGrid>
        </Box>
        <Text color="fg.muted" marginBlockEnd="2" variant="label">
          {CREATURES_LABEL}
        </Text>
        <ScrollArea maxH="320px">
          <SlotGrid>{capturedCells}</SlotGrid>
        </ScrollArea>
      </ModalBody>
      <ModalFooter>
        <Box display="flex" justifyContent="flex-end" width="full">
          <Box maxW={SEARCH_WIDTH} width="full">
            <TextField
              aria-label={SEARCH_PLACEHOLDER}
              clearable
              name="buscar-armazenamento"
              placeholder={SEARCH_PLACEHOLDER}
            />
          </Box>
        </Box>
      </ModalFooter>
    </Modal>
  );
}

function renderCreatureCell(item: StorageCreature, index: number): ReactElement {
  const cellKey = item.name || `vazio-${index}`;
  const content = <CreatureGlyph tone={item.tone} />;
  return (
    <Box key={cellKey}>
      <Slot>{content}</Slot>
    </Box>
  );
}

type CreatureGlyphProps = {
  tone: string;
};

function CreatureGlyph(props: CreatureGlyphProps): ReactElement {
  const { tone } = props;
  return (
    <Box alignItems="center" display="flex" height="100%" justifyContent="center" width="100%">
      <Box bg={tone} borderRadius="sm" height="100%" width="100%" />
    </Box>
  );
}
