import type { PlayerState } from '@creatures/contracts/player';

import { readApiBaseUrl } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';

import { connectGameSocket } from './gameSocket';
import type { GameSocket, GameSocketStatus } from './gameSocket';

const CONNECTION_WARNING = 'A conexão com o servidor está indisponível.';

export type GameChannelDeps = {
  applySnapshot: (state: PlayerState) => void;
  onLost: () => void;
  onOpen: () => void;
  onWarning: (message: string) => void;
  trainerId: string | null;
};

type ChannelState = {
  cancelled: boolean;
  opened: boolean;
  socket: GameSocket | null;
};

/**
 * Opens the channel of updates of the game.
 *
 * The channel is opened with the trainer of the player, and it is closed when
 * the screen goes away. There is no automatic reconnection: the button of the
 * screen of the game is the one that opens the channel again.
 */
export function openGameChannel(deps: GameChannelDeps): () => () => void {
  return function openChannel(): () => void {
    const trainerId = deps.trainerId;
    if (trainerId === null) {
      return noop;
    }
    const state: ChannelState = { cancelled: false, opened: false, socket: null };
    const handlers = buildHandlers(deps, state);

    getAccessToken().then(function handleToken(token: string | null): void {
      if (state.cancelled || token === null) {
        return;
      }
      state.socket = connectGameSocket({
        baseUrl: readApiBaseUrl(),
        handlers,
        token,
        trainerId,
      });
    });

    return function closeChannel(): void {
      state.cancelled = true;
      if (state.socket === null) {
        return;
      }
      state.socket.close();
    };
  };
}

function buildHandlers(
  deps: GameChannelDeps,
  state: ChannelState,
): {
  onError: (message: string) => void;
  onState: (state: PlayerState) => void;
  onStatus: (status: GameSocketStatus) => void;
} {
  return {
    onError: buildErrorHandler(deps),
    onState: deps.applySnapshot,
    onStatus: buildStatusHandler(deps, state),
  };
}

function buildErrorHandler(deps: GameChannelDeps): (message: string) => void {
  return function handleError(message: string): void {
    deps.onWarning(message);
  };
}

/**
 * A channel that never opened is a warning: the game still runs with the state
 * that came over REST. A channel that drops after being open is a lost
 * connection: the screen asks the player to reconnect.
 */
function buildStatusHandler(
  deps: GameChannelDeps,
  state: ChannelState,
): (status: GameSocketStatus) => void {
  return function handleStatus(status: GameSocketStatus): void {
    if (state.cancelled) {
      return;
    }
    if (status === 'open') {
      state.opened = true;
      deps.onOpen();
      return;
    }
    if (status !== 'closed') {
      return;
    }
    if (state.opened) {
      deps.onLost();
      return;
    }
    deps.onWarning(CONNECTION_WARNING);
  };
}

function noop(): void {
  void 0;
}
