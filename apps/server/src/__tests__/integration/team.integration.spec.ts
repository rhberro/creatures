import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { CONFLICT, NO_CONTENT, NOT_FOUND, SESSION_PATH, TEAM_PATH } from '~/__tests__/support';

import {
  buildTestName,
  buildTrainerBody,
  cleanupEnvironment,
  countRows,
  createCreature,
  prepareEnvironment,
  readToken,
} from './environment';
import type { IntegrationEnvironment, TrainerPayload } from './environment';
import { readCreatureId, readId, readRows, readState, sendJson, sendRequest } from './teamSupport';
import type { PlayerStatePayload, RowResult } from './teamSupport';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';
const OTHER_SPECIES_ID = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';
const CAPTURED_AT = [
  '2026-01-01T00:00:00.000Z',
  '2026-01-02T00:00:00.000Z',
  '2026-01-03T00:00:00.000Z',
  '2026-01-04T00:00:00.000Z',
  '2026-01-05T00:00:00.000Z',
  '2026-01-06T00:00:00.000Z',
];

let env: IntegrationEnvironment;
let trainerId = '';
let starterCreatureId = '';
let capturedIds: string[] = [];
let token = '';

describe.skipIf(!ENABLED)('the team api against the real database', describeTeam);

function describeTeam(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the trainer starts with the starter creature in the team', startsWithStarter);
  test('a captured creature joins the team in the first free slot', addsCreature);
  test('the team is closed when it reaches five creatures', fillsTheTeam);
  test('the order of the team is rewritten', reordersTeam);
  test('a creature leaves the team and goes to the storage', removesCreature);
  test('a creature that does not exist is not found', refusesUnknownCreature);
  test('the state of the player follows the team', reflectsTheTeam);
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
    .then(captureCreatures);
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
  if (capturedAt === undefined) {
    capturedIds = ids;
    return Promise.resolve();
  }
  return createCreature(env, trainerId, OTHER_SPECIES_ID, capturedAt).then(function keep(
    id: string,
  ): Promise<void> {
    ids.push(id);
    return captureFrom(index + 1, ids);
  });
}

function startsWithStarter(): Promise<void> {
  return readState(env, token).then(function assertState(state: PlayerStatePayload): void {
    expect(state.team).toHaveLength(1);
    expect(state.team[0]?.slot).toBe(1);
    expect(state.team[0]?.creature.id).toBe(starterCreatureId);
    expect(state.activeCreatureId).toBe(starterCreatureId);
    expect(state.storage).toHaveLength(capturedIds.length);
    // The trainer is born with a backpack: the items are drawn when the
    // trainer is created.
    expect(state.backpack.length).toBeGreaterThan(0);
    expect(state.activeAbilities.length).toBeGreaterThan(0);
    expect(state.team[0]?.creature.species.name).toBe('Brasa');
    expect(state.storage.map(readId)).toEqual(capturedIds.toReversed());
  });
}

function addsCreature(): Promise<void> {
  const creatureId = capturedIds[0];
  if (creatureId === undefined) {
    throw new Error('the captured creature is missing');
  }
  return sendJson(env, 'POST', TEAM_PATH, { creatureId }, token).then(function assertStatus(
    response: Response,
  ): Promise<void> {
    expect(response.status).toBe(NO_CONTENT);
    return readState(env, token).then(function assertState(state: PlayerStatePayload): void {
      expect(state.team).toHaveLength(2);
      expect(state.team[1]?.slot).toBe(2);
      expect(state.team[1]?.creature.id).toBe(creatureId);
      expect(state.storage).toHaveLength(capturedIds.length - 1);
    });
  });
}

function fillsTheTeam(): Promise<void> {
  return addCaptured(1)
    .then(function addSecond(): Promise<void> {
      return addCaptured(2);
    })
    .then(function addThird(): Promise<void> {
      return addCaptured(3);
    })
    .then(function refuseTheSixth(): Promise<void> {
      const creatureId = capturedIds[4];
      if (creatureId === undefined) {
        throw new Error('the captured creature is missing');
      }
      return sendJson(env, 'POST', TEAM_PATH, { creatureId }, token).then(function assertStatus(
        response: Response,
      ): Promise<void> {
        expect(response.status).toBe(CONFLICT);
        return response.json().then(function assertCode(body: unknown): void {
          expect((body as { error: string }).error).toBe('team_full');
        });
      });
    });
}

function reordersTeam(): Promise<void> {
  return readState(env, token).then(function reverse(state: PlayerStatePayload): Promise<void> {
    const order = state.team.map(readCreatureId).toReversed();
    return sendJson(env, 'PUT', TEAM_PATH, { order }, token).then(function assertStatus(
      response: Response,
    ): Promise<void> {
      expect(response.status).toBe(NO_CONTENT);
      return readState(env, token).then(function assertState(after: PlayerStatePayload): void {
        expect(after.team.map(readCreatureId)).toEqual(order);
        expect(after.activeCreatureId).toBe(order[0]);
      });
    });
  });
}

function removesCreature(): Promise<void> {
  return readState(env, token).then(function remove(state: PlayerStatePayload): Promise<void> {
    const creatureId = state.team[1]?.creature.id;
    if (creatureId === undefined) {
      throw new Error('the team is empty');
    }
    return sendRequest(env, 'DELETE', `${TEAM_PATH}/${creatureId}`, token).then(
      function assertStatus(response: Response): Promise<void> {
        expect(response.status).toBe(NO_CONTENT);
        return readState(env, token).then(function assertState(after: PlayerStatePayload): void {
          expect(after.team).toHaveLength(4);
          expect(after.team.map(readCreatureId)).not.toContain(creatureId);
          expect(after.storage.map(readId)).toContain(creatureId);
        });
      },
    );
  });
}

function refusesUnknownCreature(): Promise<void> {
  const foreignId = '99999999-9999-4999-8999-999999999999';
  return sendJson(env, 'POST', TEAM_PATH, { creatureId: foreignId }, token).then(
    function assertStatus(response: Response): Promise<void> {
      expect(response.status).toBe(NOT_FOUND);
      return response.json().then(function assertCode(body: unknown): void {
        expect((body as { error: string }).error).toBe('creature_not_found');
      });
    },
  );
}

function reflectsTheTeam(): Promise<void> {
  return readState(env, token).then(function assertState(state: PlayerStatePayload): void {
    expect(state.team).toHaveLength(4);
    expect(state.activeCreatureId).toBe(state.team[0]?.creature.id);
    expect(state.activeAbilities.length).toBeGreaterThan(0);
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
