import type { ItemCategory } from '@creatures/contracts/inventory';
import type { StoreBagItem, StoreItem } from '@creatures/contracts/store';

const ITEM_CATEGORIES: readonly ItemCategory[] = ['consumable', 'device', 'material'];

export function readCategory(value: unknown): ItemCategory {
  return ITEM_CATEGORIES.includes(value as ItemCategory) ? (value as ItemCategory) : 'material';
}

export function readItem(value: unknown): StoreItem | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const entry = value as Record<string, unknown>;
  const id = readString(entry.id);
  const name = readString(entry.name);
  const slug = readString(entry.slug);
  const description = readString(entry.description);
  const price = readNumber(entry, 'price');
  if (id === null || name === null || slug === null || description === null || price === null) {
    return null;
  }
  return {
    category: readCategory(entry.category),
    description,
    id,
    name,
    price,
    slug,
  };
}

export function readBagItem(value: unknown): StoreBagItem | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const entry = value as Record<string, unknown>;
  const itemId = readString(entry.itemId);
  const name = readString(entry.name);
  const slug = readString(entry.slug);
  const description = readString(entry.description);
  const quantity = readNumber(entry, 'quantity');
  const sellPrice = readNumber(entry, 'sellPrice');
  if (
    itemId === null ||
    name === null ||
    slug === null ||
    description === null ||
    quantity === null ||
    sellPrice === null
  ) {
    return null;
  }
  return {
    category: readCategory(entry.category),
    description,
    itemId,
    name,
    quantity,
    sellPrice,
    slug,
  };
}

export function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function readNumber(entry: Record<string, unknown>, field: string): number | null {
  const value = entry[field];
  return typeof value === 'number' ? value : null;
}

export function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}
