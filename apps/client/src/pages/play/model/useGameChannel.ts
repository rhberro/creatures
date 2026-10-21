import type { PlayerState } from '@creatures/contracts/player';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import { openGameChannel } from '~/pages/play/model/gameChannel';
import type { PlayerStateLoadResult } from '~/pages/play/model/usePlayerState';

const CONNECTION_WARNING = 'A conexão com o servidor está indisponível.';
const TRAINERS_PATH = '/trainers';

export type GameChannel = {
  connectionLost: boolean;
  onReconnect: () => void;
};

export type GameChannelOptions = {
  applySnapshot: (state: PlayerState) => void;
  navigate: NavigateFunction;
  onWarning: (message: string) => void;
  refresh: () => Promise<PlayerStateLoadResult>;
  state: PlayerState | null;
};

type ChannelHandlers = {
  applySnapshot: (state: PlayerState) => void;
  onWarning: (message: string) => void;
};

/**
 * The channel of updates of the game.
 *
 * The channel opens with the trainer of the player and closes with the screen.
 * It never reconnects by itself: the button of the screen is the one that
 * opens it again.
 */
export function useGameChannel(options: GameChannelOptions): GameChannel {
  const { applySnapshot, navigate, onWarning, refresh, state } = options;
  const [connectionLost, setConnectionLost] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const trainerId = state === null ? null : state.trainer.id;
  const handlers = useLatestHandlers({ applySnapshot, onWarning });

  useEffect(
    openGameChannel({
      applySnapshot: handlers.applySnapshot,
      onLost: handleChannelLost,
      onOpen: handleChannelOpen,
      onWarning: handlers.onWarning,
      trainerId,
    }),
    // The handlers are read through a ref, so their identity never opens the
    // channel again: the screen recreates them on every render, and the
    // channel cannot be torn down and rebuilt for that.
    [attempt, handlers, trainerId],
  );

  function handleChannelOpen(): void {
    setConnectionLost(false);
  }

  function handleChannelLost(): void {
    setConnectionLost(true);
  }

  function handleReconnect(): void {
    setAttempt(incrementAttempt);
    refresh().then(handleRefreshResult(navigate, onWarning));
  }

  return { connectionLost, onReconnect: handleReconnect };
}

/**
 * The handlers of the channel, always the latest one.
 *
 * The screen recreates its handlers on every render. The channel is opened
 * once and lives for the whole screen, so it cannot depend on their identity:
 * it reads them through a ref, and the wrapper it holds stays the same.
 */
function useLatestHandlers(handlers: ChannelHandlers): ChannelHandlers {
  const ref = useRef<ChannelHandlers>(handlers);
  const [stable] = useState<ChannelHandlers>(buildInitialHandlers(ref));
  useEffect(updateRef(ref, handlers), [handlers]);
  return stable;
}

function buildInitialHandlers(ref: RefObject<ChannelHandlers>): ChannelHandlers {
  return buildRefHandlers(ref);
}

function updateRef(ref: RefObject<ChannelHandlers>, handlers: ChannelHandlers): () => void {
  return function update(): void {
    ref.current = handlers;
  };
}

function buildRefHandlers(ref: RefObject<ChannelHandlers>): ChannelHandlers {
  return {
    applySnapshot: function applyThroughRef(state: PlayerState): void {
      ref.current.applySnapshot(state);
    },
    onWarning: function warnThroughRef(message: string): void {
      ref.current.onWarning(message);
    },
  };
}

function incrementAttempt(current: number): number {
  return current + 1;
}

function handleRefreshResult(
  navigate: NavigateFunction,
  onWarning: (message: string) => void,
): (result: PlayerStateLoadResult) => void {
  return function handleResult(result: PlayerStateLoadResult): void {
    if (result === 'no-trainer') {
      navigate(TRAINERS_PATH, { replace: true });
      return;
    }
    if (result === 'failed') {
      onWarning(CONNECTION_WARNING);
    }
  };
}
