import type { HuntAreaDetail } from '@creatures/contracts/hunt';
import { useEffect, useState } from 'react';

import { fetchHuntArea } from '~/features/hunt-area/api/huntAreaApi';
import type { HuntAreaDetailResult } from '~/features/hunt-area/api/huntAreaApi';
import type { HuntAreaStatus } from '~/features/hunt-area/model/useHuntAreaList';

export type HuntAreaDetailState = {
  area: HuntAreaDetail | null;
  error: string | null;
  status: HuntAreaStatus;
};

const LOAD_ERROR = 'Não foi possível carregar os detalhes do local.';

/**
 * The details of one hunt area.
 *
 * The drawer asks for the area when the player selects it, and forgets it when
 * the selection ends.
 */
export function useHuntAreaDetail(areaId: string | null): HuntAreaDetailState {
  const [area, setArea] = useState<HuntAreaDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HuntAreaStatus>('loading');

  useEffect(loadArea, [areaId]);

  function loadArea(): void {
    if (areaId === null) {
      setArea(null);
      return;
    }
    setStatus('loading');
    setError(null);
    fetchHuntArea(areaId).then(handleResult);
  }

  function handleResult(result: HuntAreaDetailResult): void {
    if (result.ok) {
      setArea(result.area);
      setStatus('ready');
      return;
    }
    setError(LOAD_ERROR);
    setStatus('error');
  }

  return { area, error, status };
}
