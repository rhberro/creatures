import type { InventoryItem, ItemCategory } from '@creatures/contracts/inventory';
import { type ChangeEvent, useCallback, useState } from 'react';

export type BagFilter = 'Consumíveis' | 'Dispositivos' | 'Todos' | 'Variados';

/** The quick filters, in the order the interface shows them. */
export const BAG_FILTERS: readonly BagFilter[] = [
  'Todos',
  'Consumíveis',
  'Dispositivos',
  'Variados',
];

const FILTER_BY_CATEGORY: Record<Exclude<BagFilter, 'Todos'>, ItemCategory> = {
  Consumíveis: 'consumable',
  Dispositivos: 'device',
  Variados: 'material',
};

export type BackpackState = {
  filter: BagFilter;
  handleSearchChange(event: ChangeEvent<HTMLInputElement>): void;
  isSearching: boolean;
  search: string;
  /** The item the player clicked, the one whose slot is marked. */
  selectedId: string | null;
  /** Selects an item of the grid. */
  select(itemId: string): void;
  setFilter(filter: BagFilter): void;
};

/**
 * The filter, the search and the selection of the backpack.
 *
 * The search always wins over the filter: typing resets the filter to Todos,
 * so the player never stays stuck in a tab without a result.
 *
 * The selection is the item the player clicked: the slot stays marked while
 * the cursor goes away, because the mark is the choice and not the hover of
 * the popup.
 */
export function useBackpack(): BackpackState {
  const [filter, setFilter] = useState<BagFilter>('Todos');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearchChange = useCallback(function handleSearchChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    setSearch(event.target.value);
    setFilter('Todos');
  }, []);

  const select = useCallback(function selectItem(itemId: string): void {
    setSelectedId(itemId);
  }, []);

  return {
    filter,
    handleSearchChange,
    isSearching: search.trim() !== '',
    search,
    select,
    selectedId,
    setFilter,
  };
}

export function filterBackpackItems(
  items: InventoryItem[],
  filter: BagFilter,
  search: string,
): InventoryItem[] {
  const byCategory =
    filter === 'Todos' ? items : items.filter(matchesCategory(FILTER_BY_CATEGORY[filter]));
  const term = normalize(search);
  if (term === '') {
    return byCategory;
  }
  return byCategory.filter(function matches(item: InventoryItem): boolean {
    return normalize(item.name).includes(term);
  });
}

function matchesCategory(category: ItemCategory): (item: InventoryItem) => boolean {
  return function matches(item: InventoryItem): boolean {
    return item.category === category;
  };
}

/** The name without accents and in lower case, so "pocao" finds "Poção". */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/gu, '')
    .trim()
    .toLowerCase();
}
