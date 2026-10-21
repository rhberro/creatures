import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { createTrainerWithStarter } from '~/db/trainerRepository';

import { cleanupEnvironment, countRows, prepareEnvironment, readToken } from './environment';
import type { IntegrationEnvironment } from './environment';
import { createTrainerWithSession, readState } from './teamSupport';
import type { PlayerStatePayload, RowResult } from './teamSupport';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';
const STARTER_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const SEED = 42;
const OTHER_SEED = 7;

type BackpackRow = {
  quantity: number;
  items: { category: string; name: string };
};

let env: IntegrationEnvironment;
let token = '';

describe.skipIf(!ENABLED)('the backpack of a new trainer', describeBackpack);

function describeBackpack(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the new trainer is born with consumables and devices', bornWithItems);
  test('the same seed gives the same backpack', sameSeedSameBackpack);
  test('another seed gives another backpack', otherSeedOtherBackpack);
  test('the database is left without trainers', leavesEmptyDatabase);
}

function prepareSuite(): Promise<void> {
  return prepareEnvironment().then(function store(
    environment: IntegrationEnvironment,
  ): Promise<void> {
    env = environment;
    return readToken(env, env.ownerEmail).then(function keepToken(accessToken: string): void {
      token = accessToken;
    });
  });
}

function cleanupSuite(): Promise<unknown> {
  if (env === undefined) {
    return Promise.resolve();
  }
  return cleanupEnvironment(env);
}

/**
 * The trainer is created by the API, the same way the player does it, and the
 * state is read the same way the client reads it.
 */
function bornWithItems(): Promise<void> {
  return createTrainerWithSession(env, token).then(function readBackpack(): Promise<void> {
    return readState(env, token).then(function assertState(state: PlayerStatePayload): void {
      const consumables = state.backpack.filter(function isConsumable(item: {
        category: string;
      }): boolean {
        return item.category === 'consumable';
      });
      const devices = state.backpack.filter(function isDevice(item: { category: string }): boolean {
        return item.category === 'device';
      });
      expect(consumables.length).toBeGreaterThanOrEqual(3);
      expect(consumables.length).toBeLessThanOrEqual(5);
      expect(devices.length).toBeGreaterThanOrEqual(2);
      expect(devices.length).toBeLessThanOrEqual(3);
      for (const item of state.backpack) {
        expect(item.quantity).toBeGreaterThanOrEqual(1);
        expect(item.quantity).toBeLessThanOrEqual(99);
      }
    });
  });
}

/**
 * Two trainers created with the same seed have the same backpack: the same
 * items, with the same quantities.
 */
function sameSeedSameBackpack(): Promise<void> {
  return createSeededTrainer(SEED).then(function first(firstTrainer: string): Promise<void> {
    return createSeededTrainer(SEED).then(function second(secondTrainer: string): Promise<void> {
      return readBackpackOf(firstTrainer).then(function readFirst(
        firstItems: string,
      ): Promise<void> {
        return readBackpackOf(secondTrainer).then(function assertSame(secondItems: string): void {
          expect(secondItems).toBe(firstItems);
          expect(firstItems.length).toBeGreaterThan(0);
        });
      });
    });
  });
}

/**
 * Another seed draws another backpack.
 */
function otherSeedOtherBackpack(): Promise<void> {
  return createSeededTrainer(SEED).then(function first(firstTrainer: string): Promise<void> {
    return createSeededTrainer(OTHER_SEED).then(function second(
      secondTrainer: string,
    ): Promise<void> {
      return readBackpackOf(firstTrainer).then(function readFirst(
        firstItems: string,
      ): Promise<void> {
        return readBackpackOf(secondTrainer).then(function assertOther(secondItems: string): void {
          expect(secondItems).not.toBe(firstItems);
        });
      });
    });
  });
}

function createSeededTrainer(seed: number): Promise<string> {
  const name = `S${seed}${globalThis.crypto.randomUUID().slice(0, 8)}`;
  return createTrainerWithStarter(env.admin, {
    gender: 'male',
    name,
    normalizedName: name.toLowerCase(),
    ownerId: env.ownerId,
    seed,
    starterSpeciesId: STARTER_ID,
  }).then(function readOutcome(outcome: {
    error: { code: string; message: string } | null;
    trainerId: string | null;
  }): string {
    if (outcome.error !== null || outcome.trainerId === null) {
      throw new Error(`the seeded trainer was not created: ${outcome.error?.message ?? 'no id'}`);
    }
    return outcome.trainerId;
  });
}

/**
 * The items of the backpack of a trainer, as a comparable text.
 */
function readBackpackOf(trainerId: string): Promise<string> {
  const query = env.admin
    .from('trainer_items')
    .select('quantity, items(name, category)')
    .eq('trainer_id', trainerId);
  return Promise.resolve(query.then(readItems));
}

function readItems(result: RowResult): string {
  const rows = result.data ?? [];
  return rows
    .map(function describeItem(row: unknown): string {
      const item = row as BackpackRow;
      return `${item.items.category}:${item.items.name}:${item.quantity}`;
    })
    .toSorted()
    .join(',');
}

function leavesEmptyDatabase(): Promise<void> {
  const ownTrainers = env.admin.from('trainers').select('id').eq('owner_id', env.ownerId);
  return Promise.resolve(ownTrainers.then(readRows))
    .then(function collect(_result: RowResult): PromiseLike<RowResult> {
      const deletion = env.admin.from('trainers').delete().eq('owner_id', env.ownerId);
      return deletion.then(readRows);
    })
    .then(function assertTrainers(): PromiseLike<RowResult> {
      const remaining = env.admin.from('trainers').select('id').eq('owner_id', env.ownerId);
      return remaining.then(readRows);
    })
    .then(function assertOwnTrainers(result: RowResult): void {
      expect(countRows(result)).toBe(0);
    });
}

function readRows(result: { data: unknown[] | null }): { data: unknown[] | null } {
  return result;
}
