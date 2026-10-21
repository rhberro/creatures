import type { HuntArea } from '@creatures/contracts/hunt';
import { useEffect, useState } from 'react';

import { fetchHuntAreas } from '~/features/hunt-area/api/huntAreaApi';
import type { HuntAreaListResult } from '~/features/hunt-area/api/huntAreaApi';

export type HuntAreaStatus = 'error' | 'loading' | 'ready';

export type HuntAreaListState = {
  areas: HuntArea[];
  error: string | null;
  reload: () => void;
  status: HuntAreaStatus;
};

const LOAD_ERROR = 'Não foi possível carregar os locais de caça.';

/**
 * The list of hunt areas.
 *
 * The list is loaded when the modal opens, and the order of the areas is the
 * one of the server: the client never reorders it.
 */
export function useHuntAreaList(isOpen: boolean): HuntAreaListState {
  const [areas, setAreas] = useState<HuntArea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HuntAreaStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(loadAreas, [isOpen, attempt]);

  function loadAreas(): void {
    if (!isOpen) {
      return;
    }
    setStatus('loading');
    setError(null);
    fetchHuntAreas().then(handleResult);
  }

  function handleResult(result: HuntAreaListResult): void {
    if (result.ok) {
      setAreas(result.areas);
      setStatus('ready');
      return;
    }
    setError(LOAD_ERROR);
    setStatus('error');
  }

  function reload(): void {
    setAttempt(attempt + 1);
  }

  return { areas, error, reload, status };
}
