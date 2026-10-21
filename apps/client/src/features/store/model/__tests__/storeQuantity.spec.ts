import { expect, test } from 'bun:test';

import {
  clampQuantity,
  MAX_STORE_QUANTITY,
  normalizeQuantity,
  readQuantity,
} from '~/features/store/model/storeQuantity';

function keepsTheQuantityInsideTheLimit(): void {
  expect(clampQuantity(0)).toBe(1);
  expect(clampQuantity(-5)).toBe(1);
  expect(clampQuantity(1)).toBe(1);
  expect(clampQuantity(999999)).toBe(999999);
  expect(clampQuantity(1000000)).toBe(MAX_STORE_QUANTITY);
}

function takesTheQuantityBackToOneWhenTheFieldIsEmpty(): void {
  expect(normalizeQuantity('')).toBe(1);
  expect(normalizeQuantity('abc')).toBe(1);
  expect(normalizeQuantity('-3')).toBe(1);
  expect(normalizeQuantity('0')).toBe(1);
}

function keepsTheQuantityThePlayerTyped(): void {
  expect(normalizeQuantity('42')).toBe(42);
  expect(normalizeQuantity('12')).toBe(12);
  expect(normalizeQuantity('1000000')).toBe(MAX_STORE_QUANTITY);
}

function readsTheQuantityWhileThePlayerWrites(): void {
  expect(readQuantity('7')).toBe(7);
  expect(readQuantity('0')).toBe(1);
  expect(readQuantity('')).toBe(1);
}

test('the quantity never leaves the limit', keepsTheQuantityInsideTheLimit);
test('the empty field goes back to one', takesTheQuantityBackToOneWhenTheFieldIsEmpty);
test('the quantity the player typed is kept', keepsTheQuantityThePlayerTyped);
test('the quantity follows the text of the field', readsTheQuantityWhileThePlayerWrites);
