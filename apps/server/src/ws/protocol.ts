import type { GameErrorCode, ServerMessage } from '@creatures/contracts/game';
import type { PlayerState } from '@creatures/contracts/player';
import type { ServerWebSocket } from 'bun';

import type { SocketData } from '~/ws/connections';

/**
 * The state of the player, as the client sees it.
 */
export function buildStateSnapshot(state: PlayerState): ServerMessage {
  return { state, type: 'state_snapshot' };
}

export function buildErrorMessage(code: GameErrorCode, message: string): ServerMessage {
  return { code, message, type: 'error' };
}

export function sendMessage(ws: ServerWebSocket<SocketData>, message: ServerMessage): void {
  ws.send(JSON.stringify(message));
}
