import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import {
  CONFLICT,
  CREATED,
  NOT_FOUND,
  OK,
  TRAINERS_PATH,
  buildHandler,
  buildJsonRequest,
  buildRequest,
  send,
} from '~/__tests__/support';

import {
  buildTestName,
  buildTrainerBody,
  cleanupEnvironment,
  countRows,
  prepareEnvironment,
  readToken,
} from './environment';
import type { IntegrationEnvironment, TrainerPayload } from './environment';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';

let env: IntegrationEnvironment;
let trainerIds: string[] = [];

describe.skipIf(!ENABLED)('trainer api against the real database', describeTrainers);

function describeTrainers(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the account starts without trainers', accountStartsEmpty);
  test('POST creates the trainer and its starter creature', createsTrainer);
  test('POST refuses a duplicated name', refusesDuplicatedName);
  test('PATCH renames the trainer', renamesTrainer);
  test('DELETE removes the trainer and its creatures', deletesTrainer);
  test('another account cannot touch the trainer', isolatesAccounts);
  test('the database is left without trainers and creatures', leavesEmptyDatabase);
}

function prepareSuite(): Promise<void> {
  return prepareEnvironment().then(function store(environment: IntegrationEnvironment): void {
    env = environment;
  });
}

function cleanupSuite(): Promise<unknown> {
  if (env === undefined) {
    return Promise.resolve();
  }
  return cleanupEnvironment(env);
}

function accountStartsEmpty(): Promise<void> {
  return readToken(env, env.ownerEmail).then(function request(token: string): Promise<void> {
    return sendRequest('GET', TRAINERS_PATH, token).then(function assertStatus(
      response: Response,
    ): Promise<void> {
      expect(response.status).toBe(OK);
      return response.json().then(function assertBody(body: unknown): void {
        expect((body as { trainers: TrainerPayload[] }).trainers).toHaveLength(0);
      });
    });
  });
}

function createsTrainer(): Promise<void> {
  const name = buildTestName();
  return readToken(env, env.ownerEmail).then(function request(token: string): Promise<void> {
    return sendJson('POST', TRAINERS_PATH, buildTrainerBody(name), token).then(
      function assertStatus(response: Response): Promise<void> {
        expect(response.status).toBe(CREATED);
        return response.json().then(function assertTrainer(body: unknown): Promise<void> {
          const trainer = body as TrainerPayload;
          expect(trainer.name).toBe(name);
          expect(trainer.id.length).toBeGreaterThan(0);
          return countCreatures(trainer.id).then(function assertCount(count: number): void {
            expect(count).toBe(1);
          });
        });
      },
    );
  });
}

function refusesDuplicatedName(): Promise<void> {
  const name = buildTestName();
  return readToken(env, env.ownerEmail).then(function create(token: string): Promise<void> {
    return sendJson('POST', TRAINERS_PATH, buildTrainerBody(name), token).then(
      function duplicate(): Promise<void> {
        return sendJson('POST', TRAINERS_PATH, buildTrainerBody(name.toUpperCase()), token).then(
          function assertStatus(response: Response): Promise<void> {
            expect(response.status).toBe(CONFLICT);
            return response.json().then(function assertCode(body: unknown): void {
              expect((body as { error: string }).error).toBe('name_taken');
            });
          },
        );
      },
    );
  });
}

function renamesTrainer(): Promise<void> {
  const renamed = buildTestName();
  return readToken(env, env.ownerEmail).then(function request(token: string): Promise<void> {
    return sendJson('POST', TRAINERS_PATH, buildTrainerBody(buildTestName()), token).then(
      function readTrainer(response: Response): Promise<void> {
        return response.json().then(function rename(body: unknown): Promise<void> {
          const trainer = body as TrainerPayload;
          return sendJson('PATCH', `${TRAINERS_PATH}/${trainer.id}`, { name: renamed }, token).then(
            function assertStatus(update: Response): Promise<void> {
              expect(update.status).toBe(OK);
              return update.json().then(function assertName(body2: unknown): void {
                expect((body2 as TrainerPayload).name).toBe(renamed);
              });
            },
          );
        });
      },
    );
  });
}

function deletesTrainer(): Promise<void> {
  return readToken(env, env.ownerEmail).then(function request(token: string): Promise<void> {
    return sendJson('POST', TRAINERS_PATH, buildTrainerBody(buildTestName()), token).then(
      function readTrainer(response: Response): Promise<void> {
        return response.json().then(function remove(body: unknown): Promise<void> {
          const trainer = body as TrainerPayload;
          return sendRequest('DELETE', `${TRAINERS_PATH}/${trainer.id}`, token).then(
            function assertDeleted(deleted: Response): Promise<void> {
              expect(deleted.status).toBe(204);
              return sendRequest('DELETE', `${TRAINERS_PATH}/${trainer.id}`, token).then(
                function assertMissing(missing: Response): Promise<void> {
                  expect(missing.status).toBe(NOT_FOUND);
                  return countCreatures(trainer.id).then(function assertCount(count: number): void {
                    expect(count).toBe(0);
                  });
                },
              );
            },
          );
        });
      },
    );
  });
}

function isolatesAccounts(): Promise<void> {
  return readToken(env, env.ownerEmail).then(function owner(ownerToken: string): Promise<void> {
    return readToken(env, env.otherEmail).then(function other(otherToken: string): Promise<void> {
      return sendJson('POST', TRAINERS_PATH, buildTrainerBody(buildTestName()), ownerToken).then(
        function readTrainer(response: Response): Promise<void> {
          return response.json().then(function remove(body: unknown): Promise<void> {
            const trainer = body as TrainerPayload;
            return sendRequest('DELETE', `${TRAINERS_PATH}/${trainer.id}`, otherToken).then(
              function assertNotFound(deleted: Response): Promise<void> {
                expect(deleted.status).toBe(NOT_FOUND);
                return countTrainers(trainer.id).then(function assertCount(count: number): void {
                  expect(count).toBe(1);
                });
              },
            );
          });
        },
      );
    });
  });
}

function leavesEmptyDatabase(): Promise<void> {
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

function readId(row: unknown): string {
  return (row as { id: string }).id;
}

function countCreatures(trainerId: string): Promise<number> {
  const query = env.admin.from('creatures').select('id').eq('trainer_id', trainerId);
  return Promise.resolve(query.then(countRows));
}

function countTrainers(trainerId: string): Promise<number> {
  const query = env.admin.from('trainers').select('id').eq('id', trainerId);
  return Promise.resolve(query.then(countRows));
}

type RowResult = {
  data: unknown[] | null;
};

function readRows(result: { data: unknown[] | null }): { data: unknown[] | null } {
  return result;
}

function sendRequest(method: string, path: string, token: string): Promise<Response> {
  return send(buildHandler(env.deps), buildRequest(method, path, token));
}

function sendJson(method: string, path: string, body: unknown, token: string): Promise<Response> {
  return send(buildHandler(env.deps), buildJsonRequest(method, path, body, token));
}
