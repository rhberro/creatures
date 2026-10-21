import { createApiDeps } from '~/shared/api';
// The endpoint is imported by its own path until the barrel of the shared API
// publishes it. The barrel line is the one reported in the reconciliation.
import { requestHuntArea, requestHuntAreaList } from '~/shared/api/endpoints/hunt';
import type { HuntAreaDetailResult, HuntAreaListResult } from '~/shared/api/endpoints/hunt';
import { getAccessToken } from '~/shared/auth';

export type { HuntAreaDetailResult, HuntAreaListResult } from '~/shared/api/endpoints/hunt';

/**
 * The conversation with the server about the hunt areas.
 *
 * The endpoint lives in the shared API: it is a plain access to a resource,
 * with no rule of the game in it. This file is the one that binds the
 * session of the player to the request.
 */
export function fetchHuntAreas(): Promise<HuntAreaListResult> {
  return requestHuntAreaList(createApiDeps(getAccessToken));
}

export function fetchHuntArea(areaId: string): Promise<HuntAreaDetailResult> {
  return requestHuntArea(createApiDeps(getAccessToken), areaId);
}
