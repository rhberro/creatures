import type { StoreBagItem, StoreItem } from '@creatures/contracts/store';
import { useCallback, useState } from 'react';

import type { StoreTab } from './store.types';

export type StoreSelectionView = {
  /** Takes the selection away. */
  clearSelection: () => void;
  /** The item of the backpack the player selected to sell. */
  selectedBagItemId: string | null;
  /** The item of the catalog the player selected to buy. */
  selectedItemId: string | null;
  /** Selects an item of the current tab. */
  select: (itemId: string) => void;
  /** Changes the tab and resets the state of the modal. */
  setTab: (tab: StoreTab) => void;
  /** The tab the modal is showing. */
  tab: StoreTab;
};

/**
 * The selection of the store modal.
 *
 * The buy tab selects one item of the catalog, the sell tab one item of the
 * backpack. Changing the tab takes the selection away.
 */
export function useStoreSelection(): StoreSelectionView {
  const [selectedBagItemId, setSelectedBagItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [tab, setTabState] = useState<StoreTab>('buy');

  const clearSelection = useCallback(function clear(): void {
    setSelectedBagItemId(null);
    setSelectedItemId(null);
  }, []);

  const setTab = useCallback(
    function changeTab(next: StoreTab): void {
      clearSelection();
      setTabState(next);
    },
    [clearSelection],
  );

  const select = useCallback(
    function selectItem(itemId: string): void {
      if (tab === 'sell') {
        setSelectedBagItemId(itemId);
        return;
      }
      setSelectedItemId(itemId);
    },
    [tab],
  );

  return {
    clearSelection,
    select,
    selectedBagItemId,
    selectedItemId,
    setTab,
    tab,
  };
}

/**
 * The gold the action of the tab costs, or yields.
 *
 * The buy costs the price of the item times the quantity. The sale yields the
 * price of the unit times the quantity: the player chooses how many of the
 * item he sells.
 */
export function computeStoreTotal(
  tab: StoreTab,
  catalog: StoreItem[],
  bag: StoreBagItem[],
  selectedItemId: string | null,
  selectedBagItemId: string | null,
  quantity: number,
): number {
  if (tab === 'sell') {
    const item = bag.find(function matches(entry: StoreBagItem): boolean {
      return entry.itemId === selectedBagItemId;
    });
    if (item === undefined) {
      return 0;
    }
    return item.sellPrice * quantity;
  }
  const item = catalog.find(function matches(entry: StoreItem): boolean {
    return entry.id === selectedItemId;
  });
  if (item === undefined) {
    return 0;
  }
  return item.price * quantity;
}
