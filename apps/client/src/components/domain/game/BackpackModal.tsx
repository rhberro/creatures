import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';
import { Slot } from '~/components/base/frame/Slot';
import { Modal } from '~/components/base/modal/Modal';
import { ModalBody } from '~/components/base/modal/ModalBody';
import { ModalFooter } from '~/components/base/modal/ModalFooter';
import { ModalHeader } from '~/components/base/modal/ModalHeader';
import { ScrollArea } from '~/components/base/scroll/ScrollArea';
import { Tab } from '~/components/base/tab/Tab';
import { TabBar } from '~/components/base/tab/TabBar';

const TITLE = 'Mochila';
const FILTERS = ['Todos', 'Consumíveis', 'Dispositivos'] as const;
const SEARCH_PLACEHOLDER = 'Buscar na mochila';
const BAG_WIDTH = '720px';
const BAG_HEIGHT = '560px';

type BagItem = {
  empty?: boolean;
  glyph: string;
  name: string;
  tone: string;
};

const ITEMS: BagItem[] = [
  { glyph: '✚', name: 'Poção de Cura', tone: 'verdant.400' },
  { glyph: '✦', name: 'Elixir de Stamina', tone: 'frost.400' },
  { glyph: '✹', name: 'Frasco Antídoto', tone: 'ember.400' },
  { glyph: '◈', name: 'Isca de Caça', tone: 'gold.400' },
  { glyph: '❖', name: 'Bálsamo de Prata', tone: 'base.300' },
  { glyph: '⬢', name: 'Prisma de Captura', tone: 'frost.400' },
  { glyph: '⬣', name: 'Isca Prisma', tone: 'gold.400' },
  { glyph: '⬡', name: 'Cristal Bruto', tone: 'base.300' },
  { empty: true, glyph: '', name: '', tone: '' },
  { empty: true, glyph: '', name: '', tone: '' },
  { empty: true, glyph: '', name: '', tone: '' },
  { empty: true, glyph: '', name: '', tone: '' },
];

type BackpackModalProps = {
  contained?: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export function BackpackModal(props: BackpackModalProps): ReactElement {
  const { contained = false, isOpen, onClose } = props;
  const cells = ITEMS.map(renderBagCell);
  const tabs = FILTERS.map(renderFilter);
  return (
    <Modal
      contained={contained}
      isOpen={isOpen}
      height={BAG_HEIGHT}
      onClose={onClose}
      width={BAG_WIDTH}
    >
      <ModalHeader>{TITLE}</ModalHeader>
      <Box borderBottom="1px solid" borderColor="border" paddingBlock="2" paddingInline="4">
        <TabBar>{tabs}</TabBar>
      </Box>
      <ModalBody>
        <ScrollArea height="full">
          <Box display="grid" gap="1" gridTemplateColumns="repeat(6, 56px)" justifyContent="start">
            {cells}
          </Box>
        </ScrollArea>
      </ModalBody>
      <ModalFooter>
        <Box display="flex" justifyContent="flex-end" width="full">
          <TextField maxW="240px" name="buscar-mochila" placeholder={SEARCH_PLACEHOLDER} />
        </Box>
      </ModalFooter>
    </Modal>
  );
}

function renderBagCell(item: BagItem, index: number): ReactElement {
  const cellKey = item.name || `vazio-${index}`;
  const content = item.empty ? null : <BagGlyph glyph={item.glyph} tone={item.tone} />;
  return (
    <Box key={cellKey}>
      <Slot empty={item.empty}>{content}</Slot>
    </Box>
  );
}

type BagGlyphProps = {
  glyph: string;
  tone: string;
};

function BagGlyph(props: BagGlyphProps): ReactElement {
  const { glyph, tone } = props;
  return (
    <Box
      alignItems="center"
      color={tone}
      display="flex"
      fontSize="lg"
      height="100%"
      justifyContent="center"
      width="100%"
    >
      {glyph}
    </Box>
  );
}

function renderFilter(filter: (typeof FILTERS)[number]): ReactElement {
  return <Tab key={filter}>{filter}</Tab>;
}
