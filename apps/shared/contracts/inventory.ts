/**
 * The category of an item, which decides the quick filter it shows under.
 *
 * The material category is the leftover: creature parts and anything that is
 * neither a consumable nor a capture device.
 */
export type ItemCategory = 'consumable' | 'device' | 'material';

/**
 * An item the trainer owns, with how many of it there are.
 */
export type InventoryItem = {
  category: ItemCategory;
  description: string;
  itemId: string;
  name: string;
  quantity: number;
  slug: string;
};
