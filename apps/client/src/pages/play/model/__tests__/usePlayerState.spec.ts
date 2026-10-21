import { expect, test } from 'bun:test';

import { createPlayerStateStore } from '~/pages/play/model/usePlayerState';
import type { PlayerStateResult } from '~/shared/api';

const TIMEOUT_MS = 10;
const WAIT_MS = 60;

function hangingRequest(): Promise<PlayerStateResult> {
  return new Promise(function neverAnswer(): void {
    void 0;
  });
}

function waitFor(milliseconds: number): Promise<void> {
  return new Promise(function resolveLater(resolve: () => void): void {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * A request that never answers cannot leave the screen loading forever: the
 * guard gives up on it and the screen falls into the state of the lost
 * connection.
 */
function loadingStateBecomesTheLostConnection(): Promise<void> {
  const store = createPlayerStateStore({ requestState: hangingRequest, timeoutMs: TIMEOUT_MS });
  store.getState().load();
  return waitFor(WAIT_MS).then(function assertSnapshot(): void {
    const snapshot = store.getState();
    expect(snapshot.status).toBe('error');
    expect(snapshot.state).toBeNull();
    expect(snapshot.error).not.toBeNull();
  });
}

test('a request that never answers leaves the loading state', loadingStateBecomesTheLostConnection);
