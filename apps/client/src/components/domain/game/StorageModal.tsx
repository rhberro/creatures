import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';
import { Slot } from '~/components/base/frame/Slot';
import { Modal } from '~/components/base/modal/Modal';
import { ModalBody } from '~/components/base/modal/ModalBody';
import { ModalFooter } from '~/components/base/modal/ModalFooter';
import { ModalHeader } from '~/components/base/modal/ModalHeader';
import { ScrollArea } from '~/components/base/scroll/ScrollArea';
import { Text } from '~/components/base/text/Text';

const TITLE = 'Armazenamento';
const TEAM_LABEL = 'Time';
const CREATURES_LABEL = 'Criaturas';
const SEARCH_PLACEHOLDER = 'Buscar criaturas';
const STORE_WIDTH = '720px';
const STORE_HEIGHT = '620px';
const TEAM_COLUMNS = 'repeat(5, 56px)';
const CAPTURED_COLUMNS = 'repeat(10, 56px)';

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
  { empty: true, level: '', name: '', tone: '' },
  { empty: true, level: '', name: '', tone: '' },
  { empty: true, level: '', name: '', tone: '' },
  { empty: true, level: '', name: '', tone: '' },
  { empty: true, level: '', name: '', tone: '' },
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
        <Box
          display="grid"
          gap="1"
          gridTemplateColumns={TEAM_COLUMNS}
          justifyContent="start"
          marginBlockEnd="5"
        >
          {teamCells}
        </Box>
        <Text color="fg.muted" marginBlockEnd="2" variant="label">
          {CREATURES_LABEL}
        </Text>
        <ScrollArea maxH="320px">
          <Box display="grid" gap="1" gridTemplateColumns={CAPTURED_COLUMNS} justifyContent="start">
            {capturedCells}
          </Box>
        </ScrollArea>
      </ModalBody>
      <ModalFooter>
        <Box display="flex" justifyContent="flex-end" width="full">
          <TextField maxW="240px" name="buscar-armazenamento" placeholder={SEARCH_PLACEHOLDER} />
        </Box>
      </ModalFooter>
    </Modal>
  );
}

function renderCreatureCell(creature: StorageCreature, index: number): ReactElement {
  const cellKey = creature.name || `vazio-${index}`;
  const content = creature.empty ? null : <CreatureGlyph tone={creature.tone} />;
  return (
    <Box key={cellKey}>
      <Slot empty={creature.empty}>{content}</Slot>
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
      <Box bg={tone} borderRadius="full" height="100%" width="100%" />
    </Box>
  );
}
