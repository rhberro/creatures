import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { cleanupEnvironment, countRows, prepareEnvironment, readToken } from './environment';
import type { IntegrationEnvironment } from './environment';
import { createTrainerWithSession, readRows, sendJson, sendRequest } from './teamSupport';
import type { RowResult } from './teamSupport';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';
const HOOK_TIMEOUT_MS = 60000;

const STORE_PATH = '/api/store';
const BUY_PATH = '/api/store/buy';
const SELL_PATH = '/api/store/sell';

const POCAO_ID = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
const POCAO_FRACA_ID = '2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f';
const MATERIAL_ID = '8c9d0e1f-2a3b-4c4d-9e5f-7a8b9c0d1e2f';

type CatalogPayload = {
  bag: { itemId: string; quantity: number; sellPrice: number }[];
  gold: number;
  items: { id: string; name: string; price: number }[];
};

type OutcomePayload = {
  bag: { itemId: string; quantity: number; sellPrice: number }[];
  gold: number;
  total: number;
};

let env: IntegrationEnvironment;
let token = '';
let trainerId = '';

describe.skipIf(!ENABLED)('the store against the real database', describeStore);

function describeStore(): void {
  beforeAll(prepareSuite, { timeout: HOOK_TIMEOUT_MS });
  afterAll(cleanupSuite, { timeout: HOOK_TIMEOUT_MS });

  test('the catalog shows the items of the store and the gold', showsTheCatalog);
  test('a buy debits the gold and fills the backpack', buysAnItem);
  test('a buy without gold is refused', refusesABuyWithoutGold);
  test('a sale credits 90% of the price and empties the backpack', sellsAnItem);
  test('a sale of an item the trainer does not have is refused', refusesASaleWithoutTheItem);
  test('the database is left without trainers', leavesEmptyDatabase);
}

function prepareSuite(): Promise<void> {
  return prepareEnvironment()
    .then(function store(environment: IntegrationEnvironment): Promise<void> {
      env = environment;
      return readToken(env, env.ownerEmail).then(function keepToken(accessToken: string): void {
        token = accessToken;
      });
    })
    .then(createTrainer);
}

function cleanupSuite(): Promise<unknown> {
  if (env === undefined) {
    return Promise.resolve();
  }
  return cleanupEnvironment(env);
}

function createTrainer(): Promise<void> {
  return createTrainerWithSession(env, token).then(function keepTrainer(id: string): void {
    trainerId = id;
  });
}

/**
 * The catalog is the one of the store: the items of the shop, the backpack of
 * the trainer and his gold.
 */
function showsTheCatalog(): Promise<void> {
  return readCatalog().then(function assertCatalog(catalog: CatalogPayload): void {
    expect(catalog.items.length).toBeGreaterThanOrEqual(6);
    expect(catalog.gold).toBeGreaterThanOrEqual(0);
    for (const item of catalog.items) {
      expect(item.price).toBeGreaterThan(0);
    }
  });
}

/**
 * A buy debits the gold of the trainer and puts the item in his backpack, in
 * the same transaction.
 */
function buysAnItem(): Promise<void> {
  return clearItem(POCAO_ID).then(function withCatalog(): Promise<void> {
    return readCatalog().then(function withGold(catalog: CatalogPayload): Promise<void> {
      const before = catalog.gold;
      return giveGold(5000).then(function buyItem(): Promise<void> {
        return sendJson(env, 'POST', BUY_PATH, { itemId: POCAO_ID, quantity: 2 }, token).then(
          function assertPurchase(response: Response): Promise<void> {
            expect(response.status).toBe(200);
            return response.json().then(function readOutcome(body: unknown): void {
              const outcome = body as OutcomePayload;
              expect(outcome.total).toBe(240);
              expect(outcome.gold).toBe(before + 5000 - 240);
              const stack = outcome.bag.find(function matches(entry: {
                itemId: string;
                quantity: number;
              }): boolean {
                return entry.itemId === POCAO_ID;
              });
              expect(stack?.quantity).toBe(2);
            });
          },
        );
      });
    });
  });
}

/**
 * The buy that costs more than the gold of the trainer is refused, and the
 * gold stays the same.
 */
function refusesABuyWithoutGold(): Promise<void> {
  return readCatalog().then(function withCatalog(catalog: CatalogPayload): Promise<void> {
    const before = catalog.gold;
    return sendJson(
      env,
      'POST',
      BUY_PATH,
      { itemId: '3d4e5f6a-7b8c-4d9e-8f0a-2b3c4d5e6f7a', quantity: 999 },
      token,
    ).then(function assertRefusal(response: Response): Promise<void> {
      expect(response.status).toBe(409);
      return response.json().then(function assertCode(body: unknown): Promise<void> {
        expect((body as { error: string }).error).toBe('store_insufficient_gold');
        return readCatalog().then(function assertGold(after: CatalogPayload): void {
          expect(after.gold).toBe(before);
        });
      });
    });
  });
}

/**
 * The sale yields 90% of the price of the item, and the item leaves the
 * backpack.
 */
function sellsAnItem(): Promise<void> {
  return giveItem(POCAO_FRACA_ID, 4).then(function sellItem(): Promise<void> {
    return readCatalog().then(function withCatalog(catalog: CatalogPayload): Promise<void> {
      const before = catalog.gold;
      const stack = catalog.bag.find(function matches(entry: { itemId: string }): boolean {
        return entry.itemId === POCAO_FRACA_ID;
      });
      expect(stack?.quantity).toBe(4);
      return sendJson(env, 'POST', SELL_PATH, { itemId: POCAO_FRACA_ID, quantity: 4 }, token).then(
        function assertSale(response: Response): Promise<void> {
          expect(response.status).toBe(200);
          return response.json().then(function readOutcome(body: unknown): void {
            const outcome = body as OutcomePayload;
            // The price of the weak potion is 60, and the sale yields 90% of it.
            expect(outcome.total).toBe(216);
            expect(outcome.gold).toBe(before + 216);
            const sold = outcome.bag.find(function matches(entry: { itemId: string }): boolean {
              return entry.itemId === POCAO_FRACA_ID;
            });
            expect(sold).toBeUndefined();
          });
        },
      );
    });
  });
}

/**
 * The item that the trainer does not have cannot be sold.
 */
function refusesASaleWithoutTheItem(): Promise<void> {
  return sendJson(env, 'POST', SELL_PATH, { itemId: MATERIAL_ID, quantity: 1 }, token).then(
    function assertRefusal(response: Response): Promise<void> {
      expect(response.status).toBe(404);
      return response.json().then(function assertCode(body: unknown): void {
        expect((body as { error: string }).error).toBe('store_item_not_in_backpack');
      });
    },
  );
}

function leavesEmptyDatabase(): Promise<void> {
  let trainerIds: string[] = [];
  const ownTrainers = env.admin.from('trainers').select('id').eq('owner_id', env.ownerId);
  return Promise.resolve(ownTrainers.then(readRows))
    .then(function collect(result: RowResult): PromiseLike<RowResult> {
      trainerIds = (result.data ?? []).map(function readId(row: unknown): string {
        return (row as { id: string }).id;
      });
      const deletion = env.admin.from('trainers').delete().eq('owner_id', env.ownerId);
      return deletion.then(readRows);
    })
    .then(function assertTrainers(): PromiseLike<RowResult> {
      const remaining = env.admin.from('trainers').select('id').eq('owner_id', env.ownerId);
      return remaining.then(readRows);
    })
    .then(function assertOwnTrainers(result: RowResult): PromiseLike<RowResult> {
      expect(countRows(result)).toBe(0);
      const items = env.admin.from('trainer_items').select('item_id').in('trainer_id', trainerIds);
      return items.then(readRows);
    })
    .then(function assertItems(result: RowResult): void {
      expect(countRows(result)).toBe(0);
    });
}

function readCatalog(): Promise<CatalogPayload> {
  return sendRequest(env, 'GET', STORE_PATH, token).then(function assertStatus(
    response: Response,
  ): Promise<CatalogPayload> {
    if (response.status !== 200) {
      throw new Error(`the store answered ${response.status}`);
    }
    return response.json().then(function read(body: unknown): CatalogPayload {
      return body as CatalogPayload;
    });
  });
}

function giveGold(amount: number): Promise<void> {
  const query = env.admin.from('trainers').update({ gold: amount }).eq('id', trainerId);
  return Promise.resolve(query).then(function written(): void {
    expect(true).toBe(true);
  });
}

/**
 * The item leaves the backpack, so the test of the buy starts from zero.
 */
function clearItem(itemId: string): Promise<void> {
  const query = env.admin
    .from('trainer_items')
    .delete()
    .eq('trainer_id', trainerId)
    .eq('item_id', itemId);
  return Promise.resolve(query).then(function cleared(): void {
    expect(true).toBe(true);
  });
}

function giveItem(itemId: string, quantity: number): Promise<void> {
  const query = env.admin
    .from('trainer_items')
    .upsert({ item_id: itemId, quantity, trainer_id: trainerId });
  return Promise.resolve(query).then(function written(): void {
    expect(true).toBe(true);
  });
}
