import { Box } from '@chakra-ui/react';
import type { InventoryItem, ItemCategory } from '@creatures/contracts/inventory';
import type { ChangeEvent, ReactElement } from 'react';

import { SlotGridArea, useTeam } from '~/entities/team';
import {
  BAG_FILTERS,
  filterBackpackItems,
  useBackpack,
} from '~/features/backpack/model/useBackpack';
import type { BagFilter } from '~/features/backpack/model/useBackpack';
import { DIVIDER_BOTTOM } from '~/shared/theme';
import { NativeButton } from '~/shared/ui/button';
import { PanelState } from '~/shared/ui/empty';
import { TextField } from '~/shared/ui/field';
import { Slot } from '~/shared/ui/frame';
import { IconChest, IconPotion, IconPrism } from '~/shared/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '~/shared/ui/modal';
import { Popup } from '~/shared/ui/popup';
import { ScrollArea } from '~/shared/ui/scroll';
import { Tab, TabBar, TabPanel, Tabs } from '~/shared/ui/tab';
import { Text } from '~/shared/ui/text';

import type { BackpackModalProps } from './backpackModal.types';

const TITLE = 'Mochila';
const SEARCH_PLACEHOLDER = 'Buscar na mochila';
const EMPTY_TITLE = 'Nenhum item encontrado';
const EMPTY_DESCRIPTION = 'Nada na mochila combina com a busca.';
const LOADING_MESSAGE = 'Carregando...';
const BAG_WIDTH = '720px';
const BAG_HEIGHT = '560px';
const SEARCH_WIDTH = '240px';
const ICON_SIZE = '24px';
const SLOT_WIDTH = '56px';

const ITEM_CATEGORY_COLORS: Record<ItemCategory, string> = {
  consumable: 'element.plant',
  device: 'element.water',
  material: 'accent.gold',
};

const ITEM_CATEGORY_ICONS: Record<ItemCategory, (props: { size?: string }) => ReactElement> = {
  consumable: IconPotion,
  device: IconPrism,
  material: IconChest,
};

export function BackpackModal(props: BackpackModalProps): ReactElement {
  const { contained = false, isOpen, onClose, snapshot } = props;
  const fallback = useTeam(undefined, isOpen && snapshot === undefined);
  const team = snapshot ?? fallback;
  const { filter, handleSearchChange, isSearching, search, select, selectedId, setFilter } =
    useBackpack();
  const filterTabs = BAG_FILTERS.map(renderFilter);
  const panels = BAG_FILTERS.map(
    renderPanel(team.backpack, isSearching, search, select, selectedId),
  );
  const body = team.isLoading ? <PanelState title={LOADING_MESSAGE} variant="loading" /> : panels;
  const handleFilterChange = buildFilterChange(setFilter);
  const tabs = (
    <Tabs onValueChange={handleFilterChange} value={filter}>
      <ModalHeader>{TITLE}</ModalHeader>
      <Box css={DIVIDER_BOTTOM} paddingBlock="2" paddingInline="4">
        <TabBar>{filterTabs}</TabBar>
      </Box>
      <ModalBody>{body}</ModalBody>
    </Tabs>
  );
  const footer = (
    <BackpackFooter error={team.error} onSearchChange={handleSearchChange} search={search} />
  );
  return (
    <Modal
      contained={contained}
      height={BAG_HEIGHT}
      isOpen={isOpen}
      onClose={onClose}
      width={BAG_WIDTH}
    >
      {tabs}
      <ModalFooter>{footer}</ModalFooter>
    </Modal>
  );
}

type BackpackFooterProps = {
  error: string | null;
  onSearchChange(event: ChangeEvent<HTMLInputElement>): void;
  search: string;
};

function BackpackFooter(props: BackpackFooterProps): ReactElement {
  const { error, onSearchChange, search } = props;
  const errorMessage =
    error === null ? null : (
      <Text color="fg.error" variant="meta">
        {error}
      </Text>
    );
  const searchField = (
    <TextField
      aria-label={SEARCH_PLACEHOLDER}
      clearable
      name="buscar-mochila"
      onChange={onSearchChange}
      placeholder={SEARCH_PLACEHOLDER}
      value={search}
    />
  );
  return (
    <Box alignItems="center" display="flex" gap="2" width="full">
      {errorMessage}
      <Box marginInlineStart="auto" maxW={SEARCH_WIDTH} width="full">
        {searchField}
      </Box>
    </Box>
  );
}

function renderFilter(filter: BagFilter): ReactElement {
  return (
    <Tab key={filter} value={filter}>
      {filter}
    </Tab>
  );
}

function buildFilterChange(setFilter: (filter: BagFilter) => void): (value: string) => void {
  return function handleChange(value: string): void {
    setFilter(value as BagFilter);
  };
}

function renderPanel(
  backpack: InventoryItem[],
  isSearching: boolean,
  search: string,
  select: (itemId: string) => void,
  selectedId: string | null,
): (filterOption: BagFilter) => ReactElement {
  return function render(filterOption: BagFilter): ReactElement {
    const items = filterBackpackItems(backpack, filterOption, search);
    return (
      <TabPanel key={filterOption} value={filterOption}>
        <BackpackPanel
          isSearching={isSearching}
          items={items}
          select={select}
          selectedId={selectedId}
        />
      </TabPanel>
    );
  };
}

/**
 * The grid of the active filter.
 *
 * The search with no result replaces the grid, and the area loses the scroll:
 * the player reads that the search ran and found nothing, instead of facing an
 * empty grid.
 */
function BackpackPanel(props: {
  isSearching: boolean;
  items: InventoryItem[];
  select(itemId: string): void;
  selectedId: string | null;
}): ReactElement {
  const { isSearching, items, select, selectedId } = props;
  if (isSearching && items.length === 0) {
    return <PanelState description={EMPTY_DESCRIPTION} title={EMPTY_TITLE} variant="empty" />;
  }
  const cells = items.map(function renderItem(item: InventoryItem): ReactElement {
    return renderItemSlot(item, select, selectedId);
  });
  return (
    <ScrollArea height="full">
      <SlotGridArea>{cells}</SlotGridArea>
    </ScrollArea>
  );
}

function renderItemSlot(
  item: InventoryItem,
  select: (itemId: string) => void,
  selectedId: string | null,
): ReactElement {
  const content = buildItemPopupContent(item);
  const trigger = buildItemTrigger(item, select, selectedId === item.itemId);
  return (
    <Popup key={item.itemId} content={content}>
      {trigger}
    </Popup>
  );
}

/**
 * The popup of an item: its name and how many of it the trainer has.
 */
function buildItemPopupContent(item: InventoryItem): ReactElement {
  const quantity = `Quantidade: ${item.quantity}`;
  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Text variant="name">{item.name}</Text>
      <Text color="fg.muted" variant="meta">
        {quantity}
      </Text>
    </Box>
  );
}

/**
 * The slot of an item, as the trigger of its popup.
 *
 * It is a real button: the popup opens on hover, stays open after the click,
 * and the keyboard reaches the item like it reaches any other control. The
 * click also leaves the slot marked as the chosen one.
 */
function buildItemTrigger(
  item: InventoryItem,
  select: (itemId: string) => void,
  isSelected: boolean,
): ReactElement {
  const glyph = <ItemGlyph category={item.category} quantity={item.quantity} />;
  const label = `${item.name} (${item.quantity})`;
  const handleClick = buildItemClick(select, item.itemId);
  return (
    <NativeButton
      aria-label={label}
      display="block"
      onClick={handleClick}
      position="relative"
      width={SLOT_WIDTH}
    >
      <Slot selected={isSelected}>{glyph}</Slot>
    </NativeButton>
  );
}

/**
 * The click on the slot of an item: it marks the item as chosen.
 */
function buildItemClick(select: (itemId: string) => void, itemId: string): () => void {
  return function clickItem(): void {
    select(itemId);
  };
}

function ItemGlyph(props: { category: ItemCategory; quantity: number }): ReactElement {
  const { category, quantity } = props;
  const Icon = ITEM_CATEGORY_ICONS[category];
  const color = ITEM_CATEGORY_COLORS[category];
  return (
    <Box
      alignItems="center"
      display="flex"
      height="full"
      justifyContent="center"
      position="relative"
      width="full"
    >
      <Box color={color}>
        <Icon size={ICON_SIZE} />
      </Box>
      <QuantityBadge quantity={quantity} />
    </Box>
  );
}

function QuantityBadge(props: { quantity: number }): ReactElement {
  const { quantity } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.sunken"
      borderRadius="sm"
      bottom="1"
      display="flex"
      justifyContent="center"
      minW="20px"
      paddingBlock="0.5"
      paddingInline="1"
      position="absolute"
      right="1"
    >
      <Text color="fg" variant="numeric">
        {quantity}
      </Text>
    </Box>
  );
}
