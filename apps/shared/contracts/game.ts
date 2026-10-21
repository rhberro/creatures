import type { PlayerState } from './player';

export type GameErrorCode =
  | 'invalid_message'
  | 'trainer_not_found'
  | 'unauthenticated'
  | 'internal_error';

export type ClientMessage =
  | { type: 'select_trainer'; trainerId: string }
  | { type: 'ping'; sentAt: number };

export type ServerMessage =
  | { type: 'state_snapshot'; state: PlayerState }
  | { type: 'pong'; sentAt: number }
  | { type: 'error'; code: GameErrorCode; message: string };
