import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { NO_CONTENT, NOT_FOUND, TEAM_PATH } from '~/__tests__/support';

import {
  cleanupEnvironment,
  countRows,
  createCreature,
  prepareEnvironment,
  readToken,
} from './environment';
import type { IntegrationEnvironment } from './environment';
import { createTrainerWithSession, readId, readRows, readState, sendJson } from './teamSupport';
import type { PlayerStatePayload, RowResult } from './teamSupport';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';
const CAPTURED_AT = [
  '2026-01-01T00:00:00.000Z',
  '2026-01-02T00:00:00.000Z',
  '2026-01-03T00:00:00.000Z',
];
const OTHER_SPECIES_IDS = [
  '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
  '16fd2706-8baf-433b-82eb-8c7fada847da',
  '4a1b2c3d-5e6f-4a8b-9c0d-1e2f3a4b5c6d',
];
const TOO_MANY_REQUESTS = 429;

let env: IntegrationEnvironment;
let trainerId = '';
let starterCreatureId = '';
let capturedIds: string[] = [];
let token = '';

describe.skipIf(!ENABLED)('the manual swap against the real database', describeSwap);

function describeSwap(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('a creature that is not in the team is not found', refusesUnknownCreature);
  test('the chosen creature exchanges places with the one in the field', swapsTheActiveCreature);
  test('the second swap of the same moment is refused', refusesTheSecondSwap);
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
    .then(createTrainer)
    .then(readStarterCreature)
    .then(captureCreatures)
    .then(addCapturedToTeam);
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

function readStarterCreature(): Promise<void> {
  const query = env.admin.from('creatures').select('id').eq('trainer_id', trainerId);
  return Promise.resolve(query.then(readStarterRows)).then(function keep(id: string): void {
    starterCreatureId = id;
  });
}

function readStarterRows(result: {
  data: { id: string }[] | null;
  error: { message: string } | null;
}): string {
  const first = (result.data ?? [])[0];
  if (first === undefined) {
    throw new Error(`the starter creature is missing: ${result.error?.message ?? 'no rows'}`);
  }
  return first.id;
}

function captureCreatures(): Promise<void> {
  return captureFrom(0, []);
}

function captureFrom(index: number, ids: string[]): Promise<void> {
  const capturedAt = CAPTURED_AT[index];
  const speciesId = OTHER_SPECIES_IDS[index];
  if (capturedAt === undefined || speciesId === undefined) {
    capturedIds = ids;
    return Promise.resolve();
  }
  return createCreature(env, trainerId, speciesId, capturedAt).then(function keep(
    id: string,
  ): Promise<void> {
    ids.push(id);
    return captureFrom(index + 1, ids);
  });
}

function addCapturedToTeam(): Promise<void> {
  return addCaptured(0)
    .then(function addSecond(): Promise<void> {
      return addCaptured(1);
    })
    .then(function addThird(): Promise<void> {
      return addCaptured(2);
    });
}

function addCaptured(index: number): Promise<void> {
  const creatureId = capturedIds[index];
  if (creatureId === undefined) {
    throw new Error('the captured creature is missing');
  }
  return sendJson(env, 'POST', TEAM_PATH, { creatureId }, token).then(function assertStatus(
    response: Response,
  ): void {
    expect(response.status).toBe(NO_CONTENT);
  });
}

/**
 * The team is [A, B, C, D] and the chosen one is the last: the result is
 * [D, B, C, A]. The creatures in between do not move.
 */
function swapsTheActiveCreature(): Promise<void> {
  const chosenId = capturedIds[2];
  if (chosenId === undefined) {
    throw new Error('the captured creature is missing');
  }
  return readState(env, token).then(function beforeSwap(state: PlayerStatePayload): Promise<void> {
    expect(state.team.map(readCreatureId)).toEqual([
      starterCreatureId,
      capturedIds[0],
      capturedIds[1],
      chosenId,
    ]);
    return sendJson(env, 'POST', '/api/team/swap', { creatureId: chosenId }, token).then(
      function assertStatus(response: Response): Promise<void> {
        expect(response.status).toBe(NO_CONTENT);
        return readState(env, token).then(function afterSwap(after: PlayerStatePayload): void {
          expect(after.team.map(readCreatureId)).toEqual([
            chosenId,
            capturedIds[0],
            capturedIds[1],
            starterCreatureId,
          ]);
          expect(after.activeCreatureId).toBe(chosenId);
        });
      },
    );
  });
}

function refusesTheSecondSwap(): Promise<void> {
  return sendJson(env, 'POST', '/api/team/swap', { creatureId: starterCreatureId }, token).then(
    function assertStatus(response: Response): Promise<void> {
      expect(response.status).toBe(TOO_MANY_REQUESTS);
      return response.json().then(function assertCode(body: unknown): void {
        expect((body as { error: string }).error).toBe('swap_cooldown');
      });
    },
  );
}

function refusesUnknownCreature(): Promise<void> {
  const foreignId = '99999999-9999-4999-8999-999999999999';
  return sendJson(env, 'POST', '/api/team/swap', { creatureId: foreignId }, token).then(
    function assertStatus(response: Response): Promise<void> {
      expect(response.status).toBe(NOT_FOUND);
      return response.json().then(function assertCode(body: unknown): void {
        expect((body as { error: string }).error).toBe('creature_not_found');
      });
    },
  );
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

function readCreatureId(slot: { creature: { id: string } }): string {
  return slot.creature.id;
}
