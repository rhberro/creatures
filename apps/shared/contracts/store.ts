import type { ItemCategory } from './inventory';

/**
 * An item the store sells.
 *
 * The price is the price of the buy: the sale always yields 90% of it.
 */
export type StoreItem = {
  category: ItemCategory;
  description: string;
  id: string;
  name: string;
  price: number;
  slug: string;
};

/**
 * An item of the backpack, as the sell tab sees it.
 *
 * The same item is a single entry with the total quantity, so the interface
 * puts the quantity in the label of one slot.
 */
export type StoreBagItem = {
  category: ItemCategory;
  description: string;
  itemId: string;
  name: string;
  /** How many of the item the trainer owns. */
  quantity: number;
  /** What one unit of the item is worth in a sale. */
  sellPrice: number;
  slug: string;
};

/**
 * The catalog of the store and the wallet of the trainer.
 */
export type StoreCatalog = {
  /** The items of the backpack, grouped by item. */
  bag: StoreBagItem[];
  /** The gold the trainer has. */
  gold: number;
  /** The items the store sells. */
  items: StoreItem[];
};

/**
 * The result of a buy: the new wallet and the new backpack.
 */
export type StorePurchase = {
  bag: StoreBagItem[];
  gold: number;
  /** What the purchase cost in gold. */
  total: number;
};

/**
 * The result of a sale: the new wallet and the new backpack.
 */
export type StoreSale = {
  bag: StoreBagItem[];
  gold: number;
  /** What the sale yielded in gold. */
  total: number;
};

/**
 * The reasons the store refuses an operation.
 *
 * The codes live in the namespace of the store: the shared trainer contract
 * has a closed set of codes, and the store is not a trainer.
 */
export type StoreErrorCode =
  | 'store_insufficient_gold'
  | 'store_internal_error'
  | 'store_invalid_quantity'
  | 'store_item_not_in_backpack'
  | 'store_item_unavailable'
  | 'trainer_not_found'
  | 'unauthenticated';
