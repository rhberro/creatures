import { expect, test } from 'bun:test';

import { mapStoreOperationError } from '~/db/storeErrors';
import { MAX_STORE_QUANTITY, validateStoreCommand } from '~/validation/store';

const ITEM_ID = '11111111-1111-4111-8111-111111111111';

function acceptsAValidCommand(): void {
  const result = validateStoreCommand({ itemId: ITEM_ID, quantity: 3 });
  expect(result.ok).toBe(true);
}

function refusesAnInvalidQuantity(): void {
  const result = validateStoreCommand({ itemId: ITEM_ID, quantity: 0 });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.code).toBe('store_invalid_quantity');
  }
}

function refusesAFractionalQuantity(): void {
  const result = validateStoreCommand({ itemId: ITEM_ID, quantity: 1.5 });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.code).toBe('store_invalid_quantity');
  }
}

function refusesAQuantityAboveTheLimit(): void {
  const result = validateStoreCommand({ itemId: ITEM_ID, quantity: MAX_STORE_QUANTITY + 1 });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.code).toBe('store_invalid_quantity');
  }
}

function acceptsTheLimitOfTheQuantity(): void {
  const result = validateStoreCommand({ itemId: ITEM_ID, quantity: MAX_STORE_QUANTITY });
  expect(result.ok).toBe(true);
}

function refusesAMalformedItem(): void {
  const result = validateStoreCommand({ itemId: 'not-a-uuid', quantity: 1 });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.code).toBe('store_item_unavailable');
  }
}

function mapsTheRefusalOfTheDatabase(): void {
  const error = mapStoreOperationError({ code: 'P0001', message: 'store_insufficient_gold' });
  expect(error.status).toBe(409);
  expect(error.code).toBe('store_insufficient_gold');
}

function mapsAnItemThatIsNotForSale(): void {
  const error = mapStoreOperationError({ code: 'P0001', message: 'store_item_unavailable' });
  expect(error.status).toBe(404);
  expect(error.code).toBe('store_item_unavailable');
}

function mapsAnItemThatIsNotInTheBackpack(): void {
  const error = mapStoreOperationError({ code: 'P0001', message: 'store_item_not_in_backpack' });
  expect(error.status).toBe(404);
  expect(error.code).toBe('store_item_not_in_backpack');
}

function mapsAnUnknownFailureToAnInternalError(): void {
  const error = mapStoreOperationError({ code: '42601', message: 'syntax error' });
  expect(error.status).toBe(500);
  expect(error.code).toBe('store_internal_error');
}

test('the store accepts a valid command', acceptsAValidCommand);
test('the store refuses a quantity of zero', refusesAnInvalidQuantity);
test('the store refuses a fractional quantity', refusesAFractionalQuantity);
test('the store refuses a quantity above the limit', refusesAQuantityAboveTheLimit);
test('the store accepts the limit of the quantity', acceptsTheLimitOfTheQuantity);
test('the store refuses a malformed item', refusesAMalformedItem);
test('the refusal of not enough gold is a conflict', mapsTheRefusalOfTheDatabase);
test('an item that is not for sale is not found', mapsAnItemThatIsNotForSale);
test('an item that is not in the backpack is not found', mapsAnItemThatIsNotInTheBackpack);
test('an unknown failure is an internal error', mapsAnUnknownFailureToAnInternalError);
