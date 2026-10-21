import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import type { ServerWebSocket } from 'bun';

import { NO_CONTENT } from '~/__tests__/support';
import type { SocketData } from '~/ws/connections';

import { cleanupEnvironment, countRows, prepareEnvironment, readToken } from './environment';
import type { IntegrationEnvironment } from './environment';
import { readSpeciesAbilities } from './skillBarSupport';
import type { AbilityPayload } from './skillBarSupport';
import { createTrainerWithSession, readRows, sendJson } from './teamSupport';
import type { RowResult } from './teamSupport';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';
const WAIT_TIMEOUT_MS = 5000;

type SnapshotState = {
  equippedAbilities: { abilityId: string; slot: number }[];
};

type SnapshotMessage = {
  state: SnapshotState;
  type: string;
};

/**
 * The channel of the account, as the test sees it.
 */
type FakeChannel = {
  isClosed: () => boolean;
  socket: () => ServerWebSocket<SocketData>;
  waitForSnapshot: () => Promise<SnapshotMessage>;
};

let env: IntegrationEnvironment;
let token = '';
let trainerId = '';
let starterCreatureId = '';

describe.skipIf(!ENABLED)('the push of the state', describePush);

function describePush(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the loadout of the creature is pushed to the channel', pushesTheLoadout);
  test('the command answers with no content', answersWithNoContent);
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
    .then(createTrainer)
    .then(readStarterCreature);
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
  return Promise.resolve(query.then(readRows)).then(function keep(result: RowResult): void {
    const first = (result.data ?? [])[0] as { id: string } | undefined;
    if (first === undefined) {
      throw new Error('the starter creature is missing');
    }
    starterCreatureId = first.id;
  });
}

/**
 * The channel of the account, as a fake socket that keeps what it receives.
 */
function openChannel(): FakeChannel {
  const channel = buildChannel(env.ownerId);
  env.connections.open(channel.socket());
  return channel;
}

/**
 * The loadout is written by the API and the new state has to arrive by the
 * channel, without the client asking for it.
 */
function pushesTheLoadout(): Promise<void> {
  const channel = openChannel();
  return readSpeciesAbilities(env).then(function writeAbilities(
    abilities: AbilityPayload[],
  ): Promise<void> {
    const first = abilities[0];
    const third = abilities[2];
    if (first === undefined || third === undefined) {
      throw new Error('the species has less than three abilities');
    }
    const abilityIds = ['', first.ability_id, '', third.ability_id];
    return sendJson(
      env,
      'PUT',
      `/api/creatures/${starterCreatureId}/ability-slots`,
      { abilityIds },
      token,
    ).then(function assertStatus(response: Response): Promise<void> {
      expect(response.status).toBe(NO_CONTENT);
      return channel.waitForSnapshot().then(function assertSnapshot(
        snapshot: SnapshotMessage,
      ): void {
        expect(snapshot.type).toBe('state_snapshot');
        expect(snapshot.state.equippedAbilities.map(readAbilityId)).toEqual([
          first.ability_id,
          third.ability_id,
        ]);
      });
    });
  });
}

/**
 * The command itself answers with no content: what the client needs is the
 * snapshot, and it arrives by the channel.
 */
function answersWithNoContent(): Promise<void> {
  const channel = openChannel();
  return sendJson(env, 'DELETE', '/api/gear-slots/6', undefined, token).then(function assertStatus(
    response: Response,
  ): Promise<void> {
    expect(response.status).toBe(NO_CONTENT);
    return channel.waitForSnapshot().then(function assertSnapshot(snapshot: SnapshotMessage): void {
      expect(snapshot.type).toBe('state_snapshot');
    });
  });
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

function readAbilityId(ability: { abilityId: string }): string {
  return ability.abilityId;
}

/**
 * A socket that only keeps what the server sends.
 */
function buildChannel(userId: string): FakeChannel {
  const messages: string[] = [];
  const data: SocketData = { userId };
  let closed = false;
  const fake = {
    close: function close(): void {
      closed = true;
    },
    data,
    send: function send(payload: string): void {
      messages.push(payload);
    },
  };
  return {
    isClosed: function isClosed(): boolean {
      return closed;
    },
    socket: function socket(): ServerWebSocket<SocketData> {
      return fake as unknown as ServerWebSocket<SocketData>;
    },
    waitForSnapshot: function waitForSnapshot(): Promise<SnapshotMessage> {
      return waitFor(function find(): SnapshotMessage | null {
        const last = messages.at(-1);
        if (last === undefined) {
          return null;
        }
        const parsed = JSON.parse(last) as { state?: SnapshotState; type: string };
        if (parsed.type !== 'state_snapshot' || parsed.state === undefined) {
          return null;
        }
        return { state: parsed.state, type: parsed.type };
      });
    },
  };
}

/**
 * Waits for a value to show up, giving the server the time to answer.
 */
function waitFor<T>(read: () => T | null): Promise<T> {
  return new Promise<T>(function schedule(
    resolve: (value: T) => void,
    reject: (reason: Error) => void,
  ): void {
    const deadline = Date.now() + WAIT_TIMEOUT_MS;
    function attempt(): void {
      const value = read();
      if (value !== null) {
        resolve(value);
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error('the state was not pushed in time'));
        return;
      }
      setTimeout(attempt, 20);
    }
    attempt();
  });
}
