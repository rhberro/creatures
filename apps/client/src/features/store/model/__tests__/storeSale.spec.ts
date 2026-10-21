import { expect, test } from 'bun:test';

import type { StoreBagItem } from '@creatures/contracts/store';

import { isItemOwned, resolveSaleTotal, type StoreSale } from '~/features/store/model/storeSale';
import { computeStoreTotal } from '~/features/store/model/useStoreSelection';

const ITEM_ID = 'item-1';
const OTHER_ITEM_ID = 'item-2';
const UNIT_PRICE = 90;

const BAG: StoreBagItem[] = [
  {
    category: 'consumable',
    description: 'Restaura a vida de uma criatura.',
    itemId: ITEM_ID,
    name: 'Poção de Cura',
    quantity: 3,
    sellPrice: UNIT_PRICE,
    slug: 'pocao-de-cura',
  },
];

test('o total da venda é o preço da unidade vezes a quantidade', sellTotalUsesTheQuantity);
test('o total da venda sem item selecionado é zero', sellTotalWithoutSelectionIsZero);
test('o total do servidor vale quando a venda é a mesma', serverTotalWinsForTheSameSale);
test('o total do servidor não vale para outra venda', serverTotalIsIgnoredForAnotherSale);
test('o item que saiu da mochila não está mais no estoque', itemOutOfTheBackpackIsGone);

function sellTotalUsesTheQuantity(): void {
  const total = computeStoreTotal('sell', [], BAG, null, ITEM_ID, 2);
  expect(total).toBe(UNIT_PRICE * 2);
}

function sellTotalWithoutSelectionIsZero(): void {
  const total = computeStoreTotal('sell', [], BAG, null, null, 2);
  expect(total).toBe(0);
}

function serverTotalWinsForTheSameSale(): void {
  const sale: StoreSale = { itemId: ITEM_ID, quantity: 2, total: 180 };
  expect(resolveSaleTotal(UNIT_PRICE * 2, sale, ITEM_ID, 2)).toBe(180);
}

function serverTotalIsIgnoredForAnotherSale(): void {
  const sale: StoreSale = { itemId: ITEM_ID, quantity: 2, total: 180 };
  expect(resolveSaleTotal(UNIT_PRICE * 3, sale, ITEM_ID, 3)).toBe(UNIT_PRICE * 3);
  expect(resolveSaleTotal(UNIT_PRICE * 2, sale, OTHER_ITEM_ID, 2)).toBe(UNIT_PRICE * 2);
  expect(resolveSaleTotal(UNIT_PRICE * 2, null, ITEM_ID, 2)).toBe(UNIT_PRICE * 2);
}

function itemOutOfTheBackpackIsGone(): void {
  expect(isItemOwned(BAG, ITEM_ID)).toBe(true);
  expect(isItemOwned(BAG, OTHER_ITEM_ID)).toBe(false);
  expect(isItemOwned([], ITEM_ID)).toBe(false);
}
