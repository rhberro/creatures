import type { ServerWebSocket } from 'bun';

/**
 * The identity of the account behind a connection.
 *
 * The token is validated once, when the channel is opened, and the result
 * travels with the connection from then on.
 */
export type SocketData = {
  userId: string;
};

const REPLACED_CLOSE_CODE = 1000;
const REPLACED_CLOSE_REASON = 'replaced by a newer connection';

/**
 * The registry of the open channels, one per account.
 *
 * The registry lives outside the WebSocket handler because the HTTP routes
 * need it: a command that changes the state has to find the channel of the
 * account to push the new state to it.
 */
export type ConnectionRegistry = {
  close(ws: ServerWebSocket<SocketData>): void;
  get(userId: string): ServerWebSocket<SocketData> | undefined;
  open(ws: ServerWebSocket<SocketData>): void;
};

export function createConnectionRegistry(): ConnectionRegistry {
  const connections = new Map<string, ServerWebSocket<SocketData>>();

  /**
   * One account, one channel: the newer connection replaces the older one,
   * which is closed with the code 1000.
   */
  function open(ws: ServerWebSocket<SocketData>): void {
    const userId = ws.data.userId;
    const previous = connections.get(userId);
    if (previous !== undefined) {
      previous.close(REPLACED_CLOSE_CODE, REPLACED_CLOSE_REASON);
    }
    connections.set(userId, ws);
  }

  /**
   * Only the connection that is still the current one is removed from the
   * registry: a connection that was already replaced does not erase the newer
   * one.
   */
  function close(ws: ServerWebSocket<SocketData>): void {
    const userId = ws.data.userId;
    if (connections.get(userId) === ws) {
      connections.delete(userId);
    }
  }

  function get(userId: string): ServerWebSocket<SocketData> | undefined {
    return connections.get(userId);
  }

  return { close, get, open };
}
