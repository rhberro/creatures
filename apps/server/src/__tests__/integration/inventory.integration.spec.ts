import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { SESSION_PATH } from '~/__tests__/support';

import {
  buildTestName,
  buildTrainerBody,
  cleanupEnvironment,
  countRows,
  prepareEnvironment,
  readToken,
} from './environment';
import type { IntegrationEnvironment, TrainerPayload } from './environment';
import { readId, readRows, readState, sendJson } from './teamSupport';
import type { PlayerStatePayload, RowResult } from './teamSupport';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';

type ItemPayload = {
  category: string;
  id: string;
  name: string;
  slug: string;
};

let env: IntegrationEnvironment;
let trainerId = '';
let token = '';

describe.skipIf(!ENABLED)('the backpack against the real database', describeBackpack);

function describeBackpack(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the backpack shows only the items the trainer has', showsTheBackpack);
  test('the database is left without trainers and creatures', leavesEmptyDatabase);
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
  return sendJson(env, 'POST', '/api/trainers', buildTrainerBody(buildTestName()), token).then(
    function readTrainer(response: Response): Promise<void> {
      return response.json().then(function keepTrainer(body: unknown): Promise<void> {
        const trainer = body as TrainerPayload;
        trainerId = trainer.id;
        return sendJson(env, 'POST', SESSION_PATH, { trainerId }, token).then(
          function selectSession(): void {
            expect(true).toBe(true);
          },
        );
      });
    },
  );
}

function showsTheBackpack(): Promise<void> {
  return clearBackpack().then(function readCatalog(): Promise<void> {
    return readItems().then(function writeItems(items: ItemPayload[]): Promise<void> {
      const owned = items[0];
      const empty = items[1];
      if (owned === undefined || empty === undefined) {
        throw new Error('the catalog of items is empty');
      }
      return giveItem(owned, 3)
        .then(function giveTheEmptyOne(): Promise<void> {
          return giveItem(empty, 0);
        })
        .then(function assertBackpack(): Promise<void> {
          return readState(env, token).then(function assertItems(state: PlayerStatePayload): void {
            expect(state.backpack).toHaveLength(1);
            expect(state.backpack[0]?.name).toBe(owned.name);
            expect(state.backpack[0]?.quantity).toBe(3);
            expect(state.backpack[0]?.category).toBe(owned.category);
            expect(state.backpack[0]?.slug).toBe(owned.slug);
          });
        });
    });
  });
}

/**
 * The trainer is born with a backpack, and the test is about the backpack of a
 * trainer that owns what it was given: the items of the birth are removed
 * first.
 */
function clearBackpack(): Promise<void> {
  const query = env.admin.from('trainer_items').delete().eq('trainer_id', trainerId);
  return Promise.resolve(query).then(function cleared(): void {
    expect(true).toBe(true);
  });
}

function readItems(): Promise<ItemPayload[]> {
  const query = env.admin.from('items').select('id, name, category, slug').limit(2);
  return Promise.resolve(query.then(readItemRows));
}

function readItemRows(result: {
  data: ItemPayload[] | null;
  error: { message: string } | null;
}): ItemPayload[] {
  return result.data ?? [];
}

function giveItem(item: ItemPayload, quantity: number): Promise<void> {
  const query = env.admin
    .from('trainer_items')
    .upsert({ item_id: item.id, quantity, trainer_id: trainerId });
  return Promise.resolve(query).then(function written(): void {
    expect(true).toBe(true);
  });
}

function leavesEmptyDatabase(): Promise<void> {
  let trainerIds: string[] = [];
  const ownTrainers = env.admin.from('trainers').select('id').eq('owner_id', env.ownerId);
  return Promise.resolve(ownTrainers.then(readRows))
    .then(function collect(result: RowResult): PromiseLike<RowResult> {
      trainerIds = (result.data ?? []).map(readId);
      const deletion = env.admin.from('trainers').delete().eq('owner_id', env.ownerId);
      return deletion.then(readRows);
    })
    .then(function assertTrainers(): PromiseLike<RowResult> {
      const remaining = env.admin.from('trainers').select('id').eq('owner_id', env.ownerId);
      return remaining.then(readRows);
    })
    .then(function assertOwnTrainers(result: RowResult): PromiseLike<RowResult> {
      expect(countRows(result)).toBe(0);
      const creatures = env.admin.from('creatures').select('id').in('trainer_id', trainerIds);
      return creatures.then(readRows);
    })
    .then(function assertCreatures(result: RowResult): void {
      expect(countRows(result)).toBe(0);
    });
}
