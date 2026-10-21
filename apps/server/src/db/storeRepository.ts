import type { StoreBagItem, StoreItem } from '@creatures/contracts/store';
import type { SupabaseClient } from '@supabase/supabase-js';

import { readRows } from '~/db/trainerRepository';
import type { DatabaseError } from '~/db/types';

const STORE_ITEM_COLUMNS = 'id, slug, name, category, description, price';
const BAG_COLUMNS = 'item_id, quantity, items(id, slug, name, category, description, price)';
const BUY_FUNCTION = 'store_buy_item';
const SELL_FUNCTION = 'store_sell_item';
const SALE_RATE = 0.9;

type QueryResult<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

type StoreItemRow = {
  category: string;
  description: string;
  id: string;
  name: string;
  price: number;
  slug: string;
};

type BagItemRow = {
  category: string;
  description: string;
  id: string;
  name: string;
  price: number;
  slug: string;
};

type BagRow = {
  item_id: string;
  items: BagItemRow | BagItemRow[] | null;
  quantity: number;
};

type StoreOutcomeRow = {
  gold: number;
  total: number;
};

/**
 * The items the store sells.
 *
 * The catalog is the one of the database: the flag on the item decides what
 * the shop offers, and the price is the price of the shop.
 */
export function listStoreItems(admin: SupabaseClient): Promise<StoreItem[]> {
  const query = admin
    .from('items')
    .select(STORE_ITEM_COLUMNS)
    .eq('is_store_item', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  return Promise.resolve(query.then(readItemRows));
}

/**
 * The items of the backpack of the trainer, grouped by item.
 *
 * The same item is one entry with the total quantity, because the interface
 * puts the quantity in the label of one slot.
 */
export function listStoreBag(admin: SupabaseClient, trainerId: string): Promise<StoreBagItem[]> {
  const query = admin
    .from('trainer_items')
    .select(BAG_COLUMNS)
    .eq('trainer_id', trainerId)
    .gt('quantity', 0)
    .order('items(name)', { ascending: true });
  return Promise.resolve(query.then(readBagRows));
}

/**
 * The gold of the trainer, or null when the trainer does not exist.
 */
export function readTrainerGold(admin: SupabaseClient, trainerId: string): Promise<number | null> {
  const query = admin.from('trainers').select('gold').eq('id', trainerId).maybeSingle();
  return Promise.resolve(query.then(readGoldRow));
}

/**
 * Buys an item of the store.
 *
 * The gold and the backpack are written in one transaction, in the database.
 */
export function buyStoreItem(
  admin: SupabaseClient,
  input: StoreCommand,
): Promise<StoreOutcomeRow | DatabaseError> {
  const args = {
    p_item_id: input.itemId,
    p_quantity: input.quantity,
    p_trainer_id: input.trainerId,
  };
  return Promise.resolve(admin.rpc(BUY_FUNCTION, args).then(readOutcomeRow));
}

/**
 * Sells a quantity of an item the trainer owns.
 */
export function sellStoreItem(
  admin: SupabaseClient,
  input: StoreCommand,
): Promise<StoreOutcomeRow | DatabaseError> {
  const args = {
    p_item_id: input.itemId,
    p_quantity: input.quantity,
    p_trainer_id: input.trainerId,
  };
  return Promise.resolve(admin.rpc(SELL_FUNCTION, args).then(readOutcomeRow));
}

export type StoreCommand = {
  itemId: string;
  quantity: number;
  trainerId: string;
};

function readItemRows(result: QueryResult<StoreItemRow[]>): StoreItem[] {
  const rows = readRows<StoreItemRow>(result.data, result.error);
  return rows.map(mapStoreItem);
}

function readBagRows(result: QueryResult<BagRow[]>): StoreBagItem[] {
  const rows = readRows<BagRow>(result.data, result.error);
  return rows.map(mapBagItem);
}

function mapStoreItem(row: StoreItemRow): StoreItem {
  return {
    category: row.category as StoreItem['category'],
    description: row.description,
    id: row.id,
    name: row.name,
    price: row.price,
    slug: row.slug,
  };
}

function mapBagItem(row: BagRow): StoreBagItem {
  const item = readBagItem(row.items);
  return {
    category: (item?.category ?? 'material') as StoreBagItem['category'],
    description: item?.description ?? '',
    itemId: row.item_id,
    name: item?.name ?? '',
    quantity: row.quantity,
    sellPrice: Math.round((item?.price ?? 0) * SALE_RATE),
    slug: item?.slug ?? '',
  };
}

/**
 * The item of the row: the relation comes as an object or as a list, and the
 * list has one entry.
 */
function readBagItem(value: BagRow['items']): BagItemRow | null {
  if (value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function readGoldRow(result: QueryResult<{ gold: number }>): number | null {
  if (result.error !== null) {
    throw new Error(`Trainer gold lookup failed: ${result.error.message}`);
  }
  if (result.data === null) {
    return null;
  }
  return result.data.gold;
}

function readOutcomeRow(result: QueryResult<StoreOutcomeRow>): StoreOutcomeRow | DatabaseError {
  if (result.error !== null) {
    return { code: result.error.code, message: result.error.message };
  }
  if (result.data === null) {
    return { code: 'P0001', message: 'store_outcome_missing' };
  }
  return result.data;
}
