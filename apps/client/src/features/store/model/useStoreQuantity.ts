import { useCallback, useState } from 'react';

import { clampQuantity, normalizeQuantity, readQuantity } from './storeQuantity';

export type StoreQuantityView = {
  /** Normalizes the quantity when the field loses the focus. */
  commitQuantity: () => void;
  /** The quantity the player is buying. */
  quantity: number;
  /** The text of the quantity field, while the player writes it. */
  quantityText: string;
  /** Puts the quantity back to its first value. */
  reset: () => void;
  /** Adds a step to the quantity. */
  stepQuantity: (step: number) => void;
  /** Writes in the quantity field. */
  typeQuantity: (text: string) => void;
};

const INITIAL_QUANTITY = 1;

/**
 * The quantity of the store modal.
 *
 * The quantity is never zero: a field that is empty or that holds a negative
 * number goes back to one when it loses the focus.
 */
export function useStoreQuantity(): StoreQuantityView {
  const [quantity, setQuantity] = useState<number>(INITIAL_QUANTITY);
  const [quantityText, setQuantityText] = useState<string>(String(INITIAL_QUANTITY));

  const reset = useCallback(function resetQuantity(): void {
    setQuantity(INITIAL_QUANTITY);
    setQuantityText(String(INITIAL_QUANTITY));
  }, []);

  const typeQuantity = useCallback(function typeQuantityText(text: string): void {
    setQuantityText(text);
    setQuantity(readQuantity(text));
  }, []);

  const commitQuantity = useCallback(
    function commitQuantityText(): void {
      const normalized = normalizeQuantity(quantityText);
      setQuantity(normalized);
      setQuantityText(String(normalized));
    },
    [quantityText],
  );

  const stepQuantity = useCallback(
    function addStep(step: number): void {
      const next = clampQuantity(quantity + step);
      setQuantity(next);
      setQuantityText(String(next));
    },
    [quantity],
  );

  return { commitQuantity, quantity, quantityText, reset, stepQuantity, typeQuantity };
}
