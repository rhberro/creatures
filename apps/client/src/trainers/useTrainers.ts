import type { NewTrainerInput } from '@creatures/contracts/trainer';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '~/auth/useAuth';
import { supabase } from '~/supabase/client';
import { createTrainersController } from '~/trainers/trainersClient';
import type {
  DeleteTrainerResult,
  TrainerCreateResult,
  TrainersController,
  TrainersSnapshot,
} from '~/trainers/trainersClient';

const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const AUTHENTICATED_STATUS = 'AUTHENTICATED';

export type TrainersHook = TrainersSnapshot & {
  create(input: NewTrainerInput): Promise<TrainerCreateResult>;
  refresh(): Promise<void>;
  remove(id: string): Promise<DeleteTrainerResult>;
};

export function useTrainers(): TrainersHook {
  const controller = useTrainersController();
  const [snapshot, setSnapshot] = useState<TrainersSnapshot>(controller.getSnapshot);
  const auth = useAuth();
  const isAuthenticated = auth.status === AUTHENTICATED_STATUS;

  useEffect(subscribeToController(controller, setSnapshot), [controller]);
  useEffect(refreshWhenAuthenticated(controller, isAuthenticated), [controller, isAuthenticated]);

  return {
    create: controller.create,
    error: snapshot.error,
    isLoading: snapshot.isLoading,
    refresh: controller.refresh,
    remove: controller.remove,
    trainers: snapshot.trainers,
  };
}

function useTrainersController(): TrainersController {
  const ref = useRef<TrainersController | null>(null);
  if (ref.current === null) {
    ref.current = createDefaultController();
  }
  return ref.current;
}

function createDefaultController(): TrainersController {
  const deps = { baseUrl: readApiBaseUrl(), getAccessToken: readAccessToken };
  return createTrainersController(deps);
}

// The token is read straight from Supabase: the AuthAdapter does not expose
// getAccessToken, and the server already owns token validation.
export function readAccessToken(): Promise<string | null> {
  return supabase.auth.getSession().then(readSessionToken);
}

function readSessionToken(result: SessionResult): string | null {
  return result.data.session?.access_token ?? null;
}

export function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL;
  return typeof value === 'string' && value.length > 0 ? value : DEFAULT_API_BASE_URL;
}

function subscribeToController(
  controller: TrainersController,
  setSnapshot: (snapshot: TrainersSnapshot) => void,
): () => void {
  return controller.subscribe(function forwardSnapshot(): void {
    setSnapshot(controller.getSnapshot());
  });
}

function refreshWhenAuthenticated(
  controller: TrainersController,
  isAuthenticated: boolean,
): () => void {
  return function loadTrainers(): () => void {
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

type SessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;
