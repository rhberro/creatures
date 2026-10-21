import type { PlayerState } from '@creatures/contracts/player';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Logger } from 'pino';

import { loadPlayerState } from '~/state/playerState';
import type { ConnectionRegistry } from '~/ws/connections';
import { buildStateSnapshot, sendMessage } from '~/ws/protocol';

/**
 * Pushes the new state of a player to the channel of the account.
 *
 * The push is the same snapshot the client asks for in `select_trainer`, so
 * the client applies it the same way and reconciles.
 */
export type StateBroadcaster = {
  pushState(userId: string, trainerId: string): void;
};

/**
 * The broadcaster of the state.
 *
 * The pushes of an account are queued: two commands in a row produce two
 * snapshots, and the second one never overtakes the first.
 */
export function createStateBroadcaster(
  admin: SupabaseClient,
  connections: ConnectionRegistry,
  logger: Logger,
): StateBroadcaster {
  const queues = new Map<string, Promise<void>>();

  function pushState(userId: string, trainerId: string): void {
    if (connections.get(userId) === undefined) {
      return;
    }
    const previous = queues.get(userId) ?? Promise.resolve();
    const next = previous
      .then(function load(): Promise<void> {
        return loadAndSend(admin, connections, userId, trainerId);
      })
      .catch(function report(error: unknown): void {
        logger.error({ err: error, userId }, 'state push failure');
      })
      .then(function release(): void {
        if (queues.get(userId) === next) {
          queues.delete(userId);
        }
      });
    queues.set(userId, next);
  }

  return { pushState };
}

/**
 * Loads the state and sends it to the channel of the account.
 *
 * The channel is looked up when the snapshot is ready, and not when the push
 * is queued: a connection that was replaced in the meantime receives nothing,
 * and the newer one is the one that gets the state.
 */
function loadAndSend(
  admin: SupabaseClient,
  connections: ConnectionRegistry,
  userId: string,
  trainerId: string,
): Promise<void> {
  return loadPlayerState(admin, trainerId, userId).then(function send(
    state: PlayerState | null,
  ): void {
    const ws = connections.get(userId);
    if (state === null || ws === undefined) {
      return;
    }
    sendMessage(ws, buildStateSnapshot(state));
  });
}
