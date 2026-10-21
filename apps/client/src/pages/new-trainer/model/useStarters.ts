import type { StarterSpecies } from '@creatures/contracts/species';
import { useEffect, useRef, useState } from 'react';

import { createApiDeps, requestStarterList } from '~/shared/api';
import type { ApiDeps, StarterListResult, TrainerClientErrorCode } from '~/shared/api';
import { getAccessToken, useAuth } from '~/shared/auth';

const AUTHENTICATED_STATUS = 'AUTHENTICATED';

export type StartersSnapshot = {
  error: TrainerClientErrorCode | null;
  isLoading: boolean;
  starters: StarterSpecies[];
};

export type StartersController = {
  getSnapshot(): StartersSnapshot;
  refresh(): Promise<void>;
  subscribe(listener: () => void): () => void;
};

export function createStartersController(deps: ApiDeps): StartersController {
  let snapshot = buildInitialSnapshot();
  const listeners = new Set<() => void>();

  function getSnapshot(): StartersSnapshot {
    return snapshot;
  }

  function setSnapshot(next: StartersSnapshot): void {
    snapshot = next;
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return buildUnsubscribe(listeners, listener);
  }

  function refresh(): Promise<void> {
    setSnapshot(buildLoadingSnapshot(snapshot));
    return requestStarterList(deps).then(buildListApplier(setSnapshot, getSnapshot));
  }

  return { getSnapshot, refresh, subscribe };
}

export type StartersHook = StartersSnapshot & {
  refresh(): Promise<void>;
};

export function useStarters(): StartersHook {
  const controller = useStartersController();
  const [snapshot, setSnapshot] = useState<StartersSnapshot>(controller.getSnapshot);
  const auth = useAuth();
  const isAuthenticated = auth.status === AUTHENTICATED_STATUS;

  useEffect(subscribeToController(controller, setSnapshot), [controller]);
  useEffect(refreshWhenAuthenticated(controller, isAuthenticated), [isAuthenticated]);

  return {
    error: snapshot.error,
    isLoading: snapshot.isLoading,
    refresh: controller.refresh,
    starters: snapshot.starters,
  };
}

function useStartersController(): StartersController {
  const ref = useRef<StartersController | null>(null);
  if (ref.current === null) {
    ref.current = createDefaultController();
  }
  return ref.current;
}

function createDefaultController(): StartersController {
  return createStartersController(createApiDeps(getAccessToken));
}

function buildInitialSnapshot(): StartersSnapshot {
  return { error: null, isLoading: false, starters: [] };
}

function buildLoadingSnapshot(current: StartersSnapshot): StartersSnapshot {
  return { error: null, isLoading: true, starters: current.starters };
}

function buildUnsubscribe(listeners: Set<() => void>, listener: () => void): () => void {
  return function unsubscribe(): void {
    listeners.delete(listener);
  };
}

function buildListApplier(
  setSnapshot: (snapshot: StartersSnapshot) => void,
  getSnapshot: () => StartersSnapshot,
): (result: StarterListResult) => void {
  return function applyList(result: StarterListResult): void {
    if (result.ok) {
      setSnapshot({ error: null, isLoading: false, starters: result.starters });
      return;
    }
    setSnapshot({ error: result.code, isLoading: false, starters: getSnapshot().starters });
  };
}

function subscribeToController(
  controller: StartersController,
  setSnapshot: (snapshot: StartersSnapshot) => void,
): () => void {
  return controller.subscribe(function forwardSnapshot(): void {
    setSnapshot(controller.getSnapshot());
  });
}

function refreshWhenAuthenticated(
  controller: StartersController,
  isAuthenticated: boolean,
): () => void {
  return function loadStarters(): () => void {
    if (isAuthenticated) {
      controller.refresh().catch(ignoreError);
    }
    return noop;
  };
}

function ignoreError(): void {
  void 0;
}

function noop(): void {
  void 0;
}
