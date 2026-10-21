import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { TextField } from '~/shared/ui/field';

const QUANTITY_LABEL = 'Quantidade';
const QUANTITY_WIDTH = '72px';
const MAX_QUANTITY = 999999;
const MIN_QUANTITY = 1;

export type StoreQuantityFieldProps = {
  /** The field is closed when there is nothing to buy or to sell. */
  disabled: boolean;
  /** The quantity when the field loses the focus. */
  onBlur(): void;
  /** The write in the field. */
  onChange(text: string): void;
  /** The text of the field, while the player writes it. */
  quantityText: string;
};

/**
 * The field of the quantity.
 *
 * The same field serves the buy and the sell: the quantity is never zero, it
 * goes back to one when the field loses the focus, and the limit is the same
 * in the two tabs.
 */
export function StoreQuantityField(props: StoreQuantityFieldProps): ReactElement {
  const { disabled, onBlur, onChange, quantityText } = props;
  const change = buildQuantityChange(onChange);
  const field = (
    <TextField
      aria-label={QUANTITY_LABEL}
      disabled={disabled}
      max={MAX_QUANTITY}
      min={MIN_QUANTITY}
      name="quantidade"
      onBlur={onBlur}
      onChange={change}
      type="number"
      value={quantityText}
    />
  );
  return <Box width={QUANTITY_WIDTH}>{field}</Box>;
}

/**
 * The write in the quantity field.
 */
function buildQuantityChange(
  onChange: (text: string) => void,
): (event: { target: { value: string } }) => void {
  return function changeQuantity(event: { target: { value: string } }): void {
    onChange(event.target.value);
  };
}
