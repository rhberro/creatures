export const MAX_STORE_QUANTITY = 999999;
export const MIN_STORE_QUANTITY = 1;

/**
 * A quantity that is never zero and never above the limit.
 */
export function clampQuantity(value: number): number {
  if (value < MIN_STORE_QUANTITY) {
    return MIN_STORE_QUANTITY;
  }
  if (value > MAX_STORE_QUANTITY) {
    return MAX_STORE_QUANTITY;
  }
  return Math.trunc(value);
}

/**
 * The quantity the field shows when it loses the focus: one, when the field
 * is empty or holds something that is not a number.
 */
export function normalizeQuantity(text: string): number {
  const parsed = Math.trunc(Number(text));
  if (Number.isNaN(parsed)) {
    return MIN_STORE_QUANTITY;
  }
  return clampQuantity(parsed);
}

/**
 * The quantity the field holds while the player writes it.
 *
 * The text is not a number yet: the field shows what the player typed, and the
 * quantity follows it.
 */
export function readQuantity(text: string): number {
  const parsed = Math.trunc(Number(text));
  if (Number.isNaN(parsed)) {
    return MIN_STORE_QUANTITY;
  }
  return clampQuantity(parsed);
}
