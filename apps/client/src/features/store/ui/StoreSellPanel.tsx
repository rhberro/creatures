import type { StoreBagItem } from '@creatures/contracts/store';
import type { ReactElement } from 'react';

import type { StoreView } from '~/features/store/model/store.types';
import { StoreSlot } from '~/features/store/ui/StoreSlot';
import { SlotGrid } from '~/shared/ui/frame';
import { ScrollArea } from '~/shared/ui/scroll';

/**
 * The sell tab: everything the trainer owns.
 *
 * The same item is one slot, with the quantity in the label.
 */
export function StoreSellPanel(props: { store: StoreView }): ReactElement {
  const { store } = props;
  const cells = store.bag.map(function renderItem(item: StoreBagItem): ReactElement {
    return (
      <StoreBagCell
        item={item}
        key={item.itemId}
        selectedId={store.selectedBagItemId}
        select={store.select}
      />
    );
  });
  const grid = <SlotGrid>{cells}</SlotGrid>;
  return <ScrollArea height="full">{grid}</ScrollArea>;
}

type StoreBagCellProps = {
  item: StoreBagItem;
  selectedId: string | null;
  select: (itemId: string) => void;
};

/**
 * The slot of one item of the backpack.
 */
function StoreBagCell(props: StoreBagCellProps): ReactElement {
  const { item, selectedId, select } = props;
  const isSelected = selectedId === item.itemId;
  const onSelect = buildSelect(select, item.itemId);
  return (
    <StoreSlot
      category={item.category}
      isSelected={isSelected}
      name={item.name}
      quantity={item.quantity}
      value={item.sellPrice}
      valueLabel="Valor de venda por unidade"
      onSelect={onSelect}
    />
  );
}

/**
 * The click on the slot of an item of the backpack.
 */
function buildSelect(select: (itemId: string) => void, itemId: string): () => void {
  return function selectItem(): void {
    select(itemId);
  };
}
