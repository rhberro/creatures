import { expect, test } from 'bun:test';

import type { ApiDeps } from '~/shared/api/client';

import { requestStoreBuy, requestStoreCatalog, requestStoreSell } from './store';

const BASE_URL = 'http://localhost:3001';
const ITEM_ID = '11111111-1111-4111-8111-111111111111';

type FakeResponse = {
  json(): Promise<unknown>;
  status: number;
};

const DEPS: ApiDeps = {
  baseUrl: BASE_URL,
  getAccessToken: readToken,
};

const DEPS_WITHOUT_TOKEN: ApiDeps = {
  baseUrl: BASE_URL,
  getAccessToken: readNoToken,
};

function readToken(): Promise<string | null> {
  return Promise.resolve('access-token');
}

function readNoToken(): Promise<string | null> {
  return Promise.resolve(null);
}

function stubFetch(answer: (url: string) => FakeResponse): void {
  globalThis.fetch = function fetchStub(input: RequestInfo | URL): Promise<Response> {
    return Promise.resolve(answer(String(input))) as unknown as Promise<Response>;
  } as unknown as typeof globalThis.fetch;
}

function readCatalogBody(): Promise<unknown> {
  return Promise.resolve({
    bag: [
      {
        category: 'consumable',
        description: 'Restaura a vida.',
        itemId: ITEM_ID,
        name: 'Poção',
        quantity: 2,
        sellPrice: 108,
        slug: 'pocao',
      },
    ],
    gold: 500,
    items: [
      {
        category: 'consumable',
        description: 'Restaura a vida.',
        id: ITEM_ID,
        name: 'Poção',
        price: 120,
        slug: 'pocao',
      },
    ],
  });
}

function readOutcomeBody(): Promise<unknown> {
  return Promise.resolve({ bag: [], gold: 380, total: 120 });
}

function readRefusalBody(): Promise<unknown> {
  return Promise.resolve({ error: 'store_insufficient_gold' });
}

test('the catalog comes with the items, the bag and the gold', readsTheCatalog);
test('a buy answers with the new wallet', readsThePurchase);
test('a refusal carries the code of the store', readsTheRefusal);
test('a request without a token is unauthenticated', refusesWithoutToken);

function readsTheCatalog(): Promise<void> {
  stubFetch(function answer(): FakeResponse {
    return { json: readCatalogBody, status: 200 };
  });
  return requestStoreCatalog(DEPS).then(function assertCatalog(
    result: Awaited<ReturnType<typeof requestStoreCatalog>>,
  ): void {
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.catalog.gold).toBe(500);
    expect(result.catalog.items).toHaveLength(1);
    expect(result.catalog.bag).toHaveLength(1);
    expect(result.catalog.bag[0]?.quantity).toBe(2);
  });
}

function readsThePurchase(): Promise<void> {
  stubFetch(function answer(): FakeResponse {
    return { json: readOutcomeBody, status: 200 };
  });
  return requestStoreBuy(DEPS, ITEM_ID, 1).then(function assertPurchase(
    result: Awaited<ReturnType<typeof requestStoreBuy>>,
  ): void {
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.outcome.gold).toBe(380);
    expect(result.outcome.total).toBe(120);
  });
}

function readsTheRefusal(): Promise<void> {
  stubFetch(function answer(): FakeResponse {
    return { json: readRefusalBody, status: 409 };
  });
  return requestStoreSell(DEPS, ITEM_ID, 1).then(function assertRefusal(
    result: Awaited<ReturnType<typeof requestStoreSell>>,
  ): void {
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('store_insufficient_gold');
  });
}

function refusesWithoutToken(): Promise<void> {
  return requestStoreCatalog(DEPS_WITHOUT_TOKEN).then(function assertRefusal(
    result: Awaited<ReturnType<typeof requestStoreCatalog>>,
  ): void {
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('unauthenticated');
  });
}
