import { Box } from '@chakra-ui/react';
import { useState, type ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';
import { Slot } from '~/components/base/frame/Slot';
import { SlotGrid } from '~/components/base/frame/SlotGrid';
import { Modal } from '~/components/base/modal/Modal';
import { ModalBody } from '~/components/base/modal/ModalBody';
import { ModalFooter } from '~/components/base/modal/ModalFooter';
import { ModalHeader } from '~/components/base/modal/ModalHeader';
import { ScrollArea } from '~/components/base/scroll/ScrollArea';
import { Tab } from '~/components/base/tab/Tab';
import { TabBar } from '~/components/base/tab/TabBar';
import { TabPanel } from '~/components/base/tab/TabPanel';
import { Tabs } from '~/components/base/tab/Tabs';
import { DIVIDER_BOTTOM } from '~/theme/divider';

const TITLE = 'Mochila';
const FILTERS = ['Todos', 'Consumíveis', 'Dispositivos'] as const;
const SEARCH_PLACEHOLDER = 'Buscar na mochila';
const BAG_WIDTH = '720px';
const BAG_HEIGHT = '560px';
const SEARCH_WIDTH = '240px';

type BagCategory = 'consumable' | 'device';

type BagItem = {
  category: BagCategory;
  glyph: string;
  name: string;
  tone: string;
};

const ITEMS: BagItem[] = [
  { category: 'consumable', glyph: '✚', name: 'Poção de Cura', tone: 'verdant.400' },
  { category: 'consumable', glyph: '✦', name: 'Elixir de Stamina', tone: 'frost.400' },
  { category: 'consumable', glyph: '✹', name: 'Frasco Antídoto', tone: 'ember.400' },
  { category: 'consumable', glyph: '◈', name: 'Isca de Caça', tone: 'gold.400' },
  { category: 'consumable', glyph: '❖', name: 'Bálsamo de Prata', tone: 'base.300' },
  { category: 'device', glyph: '⬢', name: 'Prisma de Captura', tone: 'frost.400' },
  { category: 'device', glyph: '⬣', name: 'Isca Prisma', tone: 'gold.400' },
  { category: 'device', glyph: '⬡', name: 'Cristal Bruto', tone: 'base.300' },
];

type Filter = (typeof FILTERS)[number];

const FILTER_BY_CATEGORY: Record<Exclude<Filter, 'Todos'>, BagCategory> = {
  Consumíveis: 'consumable',
  Dispositivos: 'device',
};

type BackpackModalProps = {
  contained?: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export function BackpackModal(props: BackpackModalProps): ReactElement {
  const { contained = false, isOpen, onClose } = props;
  const [filter, setFilter] = useState<Filter>('Todos');
  const handleFilterChange = buildFilterChange(setFilter);
  const tabs = FILTERS.map(renderFilter);
  const panels = FILTERS.map(renderPanel(ITEMS));
  return (
    <Modal
      contained={contained}
      isOpen={isOpen}
      height={BAG_HEIGHT}
      onClose={onClose}
      width={BAG_WIDTH}
    >
      <Tabs onValueChange={handleFilterChange} value={filter}>
        <ModalHeader>{TITLE}</ModalHeader>
        <Box css={DIVIDER_BOTTOM} paddingBlock="2" paddingInline="4">
          <TabBar>{tabs}</TabBar>
        </Box>
        <ModalBody>{panels}</ModalBody>
      </Tabs>
      <ModalFooter>
        <Box display="flex" justifyContent="flex-end" width="full">
          <Box maxW={SEARCH_WIDTH} width="full">
            <TextField
              aria-label={SEARCH_PLACEHOLDER}
              clearable
              name="buscar-mochila"
              placeholder={SEARCH_PLACEHOLDER}
            />
          </Box>
        </Box>
      </ModalFooter>
    </Modal>
  );
}

function buildFilterChange(setFilter: (filter: Filter) => void): (value: string) => void {
  return function handleChange(value: string): void {
    setFilter(value as Filter);
  };
}

function renderPanel(items: BagItem[]): (filter: Filter) => ReactElement {
  return function render(item: Filter): ReactElement {
    const visible = filterItems(items, item);
    const cells = visible.map(renderBagCell);
    return (
      <TabPanel key={item} value={item}>
        <ScrollArea height="full">
          <SlotGrid>{cells}</SlotGrid>
        </ScrollArea>
      </TabPanel>
    );
  };
}

function filterItems(items: BagItem[], filter: Filter): BagItem[] {
  if (filter === 'Todos') {
    return items;
  }
  const category = FILTER_BY_CATEGORY[filter];
  return items.filter(matchesCategory(category));
}

function matchesCategory(category: BagCategory): (item: BagItem) => boolean {
  return function matches(item: BagItem): boolean {
    return item.category === category;
  };
}

function renderBagCell(item: BagItem): ReactElement {
  return (
    <Box key={item.name}>
      <Slot>
        <BagGlyph glyph={item.glyph} tone={item.tone} />
      </Slot>
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

function renderFilter(filter: Filter): ReactElement {
  return (
    <Tab key={filter} value={filter}>
      {filter}
    </Tab>
  );
}
