import type { ClientMessage, ServerMessage } from '@creatures/contracts/game';
import type { PlayerState } from '@creatures/contracts/player';

const PING_INTERVAL = 30_000;
const WS_PATH = '/ws';

export type GameSocketStatus = 'closed' | 'connecting' | 'open';

export type GameSocketHandlers = {
  onError(message: string): void;
  onState(state: PlayerState): void;
  onStatus(status: GameSocketStatus): void;
};

export type GameSocket = {
  close(): void;
};

export type GameSocketOptions = {
  baseUrl: string;
  handlers: GameSocketHandlers;
  token: string;
  trainerId: string;
};

/**
 * The channel of updates of the game.
 *
 * The socket only carries what the server sends: the state of the player and
 * the heartbeat. There is no automatic reconnection — the reconnect button of
 * the screen is the one that opens the channel again.
 */
export function connectGameSocket(options: GameSocketOptions): GameSocket {
  const { baseUrl, handlers, token, trainerId } = options;
  const socket = new globalThis.WebSocket(buildSocketUrl(baseUrl, token));
  let pingTimer: ReturnType<typeof setInterval> | null = null;

  handlers.onStatus('connecting');

  socket.addEventListener('open', function handleOpen(): void {
    pingTimer = setInterval(function sendPing(): void {
      sendMessage(socket, { sentAt: Date.now(), type: 'ping' });
    }, PING_INTERVAL);
    sendMessage(socket, { trainerId, type: 'select_trainer' });
    handlers.onStatus('open');
  });

  socket.addEventListener('message', function handleMessage(event: MessageEvent): void {
    const message = readServerMessage(event.data);
    if (message === null) {
      handlers.onError('O servidor enviou uma mensagem que não foi entendida.');
      return;
    }
    if (message.type === 'state_snapshot') {
      handlers.onState(message.state);
      return;
    }
    if (message.type === 'error') {
      handlers.onError(message.message);
    }
  });

  socket.addEventListener('error', function handleError(): void {
    handlers.onError('A conexão com o servidor falhou.');
  });

  socket.addEventListener('close', function handleClose(): void {
    stopPing(pingTimer);
    pingTimer = null;
    handlers.onStatus('closed');
  });

  return {
    close: function close(): void {
      stopPing(pingTimer);
      pingTimer = null;
      socket.close();
    },
  };
}

function buildSocketUrl(baseUrl: string, token: string): string {
  const url = new globalThis.URL(baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = WS_PATH;
  url.search = `token=${encodeURIComponent(token)}`;
  return url.toString();
}

function sendMessage(socket: WebSocket, message: ClientMessage): void {
  if (socket.readyState !== globalThis.WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify(message));
}

function stopPing(timer: ReturnType<typeof setInterval> | null): void {
  if (timer === null) {
    return;
  }
  clearInterval(timer);
}

function readServerMessage(data: unknown): ServerMessage | null {
  if (typeof data !== 'string') {
    return null;
  }
  const parsed = parseJson(data);
  return parsed === null ? null : readMessage(parsed);
}

function parseJson(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function readMessage(value: unknown): ServerMessage | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const message = value as Partial<ServerMessage>;
  if (message.type === 'state_snapshot') {
    return isPlayerState(message.state) ? { state: message.state, type: 'state_snapshot' } : null;
  }
  if (message.type === 'pong') {
    return typeof message.sentAt === 'number' ? { sentAt: message.sentAt, type: 'pong' } : null;
  }
  if (message.type === 'error') {
    return typeof message.code === 'string' && typeof message.message === 'string'
      ? { code: message.code, message: message.message, type: 'error' }
      : null;
  }
  return null;
}

function isPlayerState(value: unknown): value is PlayerState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Partial<PlayerState>;
  return typeof state.trainer === 'object' && state.trainer !== null && Array.isArray(state.team);
}
