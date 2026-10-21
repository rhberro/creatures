import type { StoreBagItem } from '@creatures/contracts/store';

/**
 * A sale the server did.
 *
 * The server answers with the total of the sale it executed: the sale is the
 * source of the total of what the player just sold.
 */
export type StoreSale = {
  /** The item that was sold. */
  itemId: string;
  /** How many of it were sold. */
  quantity: number;
  /** What the sale yielded, in gold coins. */
  total: number;
};

/**
 * The total of the sale the player is choosing.
 *
 * The total the client computes is the price of the unit times the quantity.
 * When the server has just answered with the total of the very same sale, the
 * server is the source: the client never argues with the value of a sale that
 * already happened.
 */
export function resolveSaleTotal(
  localTotal: number,
  sale: StoreSale | null,
  selectedItemId: string | null,
  quantity: number,
): number {
  if (sale === null) {
    return localTotal;
  }
  if (sale.itemId !== selectedItemId) {
    return localTotal;
  }
  if (sale.quantity !== quantity) {
    return localTotal;
  }
  return sale.total;
}

/**
 * Whether the trainer still owns the item after the sale.
 *
 * The item that leaves the backpack entirely is not in the list anymore, so
 * the slot of the item is gone and the selection has to go with it.
 */
export function isItemOwned(bag: StoreBagItem[], itemId: string): boolean {
  return bag.some(function matches(entry: StoreBagItem): boolean {
    return entry.itemId === itemId;
  });
}
