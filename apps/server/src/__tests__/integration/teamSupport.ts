import { OK, buildHandler, buildJsonRequest, buildRequest, send } from '~/__tests__/support';

import { buildTestName, buildTrainerBody } from './environment';
import type { IntegrationEnvironment } from './environment';

export type PlayerStatePayload = {
  activeAbilities: { slot: number }[];
  activeCreatureId: string | null;
  activeVitals: { currentHp: number; maxHp: number } | null;
  backpack: { category: string; name: string; quantity: number; slug: string }[];
  equippedAbilities: { abilityId: string; name: string; slot: number }[];
  equippedConsumables: {
    itemId: string;
    name: string;
    quantity: number;
    slot: number;
    triggerHpPercent: number;
  }[];
  equippedDevice: { itemId: string; name: string; quantity: number; slot: number } | null;
  storage: { id: string }[];
  team: { creature: { id: string; species: { name: string } }; slot: number }[];
};

export type RowResult = {
  data: unknown[] | null;
};

export function readRows(result: { data: unknown[] | null }): { data: unknown[] | null } {
  return result;
}

export function readId(row: unknown): string {
  return (row as { id: string }).id;
}

export function readCreatureId(slot: { creature: { id: string } }): string {
  return slot.creature.id;
}

export function sendRequest(
  env: IntegrationEnvironment,
  method: string,
  path: string,
  token: string,
): Promise<Response> {
  return send(buildHandler(env.deps), buildRequest(method, path, token));
}

export function sendJson(
  env: IntegrationEnvironment,
  method: string,
  path: string,
  body: unknown,
  token: string,
): Promise<Response> {
  return send(buildHandler(env.deps), buildJsonRequest(method, path, body, token));
}

export function readState(env: IntegrationEnvironment, token: string): Promise<PlayerStatePayload> {
  return sendRequest(env, 'GET', '/api/player/state', token).then(function assertStatus(
    response: Response,
  ): Promise<PlayerStatePayload> {
    if (response.status !== OK) {
      throw new Error(`the player state answered ${response.status}`);
    }
    return response.json().then(function read(body: unknown): PlayerStatePayload {
      return body as PlayerStatePayload;
    });
  });
}

/**
 * Creates a trainer for the account and opens the session on it, which is what
 * every command of the game needs.
 */
export function createTrainerWithSession(
  env: IntegrationEnvironment,
  token: string,
): Promise<string> {
  return sendJson(env, 'POST', '/api/trainers', buildTrainerBody(buildTestName()), token).then(
    function readTrainer(response: Response): Promise<string> {
      return response.json().then(function keepTrainer(body: unknown): Promise<string> {
        const trainer = body as { id: string };
        return sendJson(env, 'POST', '/api/session/trainer', { trainerId: trainer.id }, token).then(
          function selectSession(): string {
            return trainer.id;
          },
        );
      });
    },
  );
}
