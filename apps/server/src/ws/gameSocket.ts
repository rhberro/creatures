import type { ClientMessage, GameErrorCode } from '@creatures/contracts/game';
import type { Trainer } from '@creatures/contracts/trainer';
import type { ServerWebSocket, WebSocketHandler } from 'bun';

import { findTrainerById } from '~/db/trainerRepository';
import type { ServerDependencies } from '~/dependencies';
import { isUuid } from '~/validation/trainer';
import type { ConnectionRegistry, SocketData } from '~/ws/connections';
import { buildErrorMessage, sendMessage } from '~/ws/protocol';

export function createGameSocketHandler(
  deps: ServerDependencies,
  connections: ConnectionRegistry,
): WebSocketHandler<SocketData> {
  function open(ws: ServerWebSocket<SocketData>): void {
    connections.open(ws);
  }

  function close(ws: ServerWebSocket<SocketData>): void {
    connections.close(ws);
  }

  function message(ws: ServerWebSocket<SocketData>, raw: string | Buffer): void {
    handleMessage(deps, ws, raw).catch(reportFailure(deps, ws));
  }

  return { close, message, open };
}

function handleMessage(
  deps: ServerDependencies,
  ws: ServerWebSocket<SocketData>,
  raw: string | Buffer,
): Promise<void> {
  const parsed = parseClientMessage(raw);
  if (parsed === null) {
    sendError(ws, 'invalid_message', 'Mensagem inválida.');
    return Promise.resolve();
  }
  if (parsed.type === 'ping') {
    sendMessage(ws, { sentAt: parsed.sentAt, type: 'pong' });
    return Promise.resolve();
  }
  return handleSelectTrainer(deps, ws, parsed.trainerId);
}

/**
 * Opens the session of the trainer and delivers the state.
 *
 * The snapshot goes through the broadcaster, the same path the HTTP commands
 * use: the state is loaded from the database and sent to the channel of the
 * account.
 */
function handleSelectTrainer(
  deps: ServerDependencies,
  ws: ServerWebSocket<SocketData>,
  trainerId: string,
): Promise<void> {
  const userId = ws.data.userId;
  return findTrainerById(deps.admin, trainerId, userId).then(function checkOwner(
    trainer: Trainer | null,
  ): void | Promise<void> {
    if (trainer === null) {
      sendError(ws, 'trainer_not_found', 'Treinador não encontrado.');
      return;
    }
    deps.sessions.set(userId, trainer.id);
    deps.broadcaster.pushState(userId, trainer.id);
  });
}

export function parseClientMessage(raw: string | Buffer): ClientMessage | null {
  const text = typeof raw === 'string' ? raw : raw.toString('utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const candidate = parsed as { sentAt?: unknown; trainerId?: unknown; type?: unknown };
  if (candidate.type === 'ping' && typeof candidate.sentAt === 'number') {
    return { sentAt: candidate.sentAt, type: 'ping' };
  }
  if (candidate.type === 'select_trainer' && typeof candidate.trainerId === 'string') {
    if (!isUuid(candidate.trainerId)) {
      return null;
    }
    return { trainerId: candidate.trainerId, type: 'select_trainer' };
  }
  return null;
}

function sendError(ws: ServerWebSocket<SocketData>, code: GameErrorCode, message: string): void {
  sendMessage(ws, buildErrorMessage(code, message));
}

function reportFailure(
  deps: ServerDependencies,
  ws: ServerWebSocket<SocketData>,
): (error: unknown) => void {
  return function report(error: unknown): void {
    deps.logger.error({ err: error, userId: ws.data.userId }, 'websocket message failure');
    sendError(ws, 'internal_error', 'Erro interno do servidor.');
  };
}
