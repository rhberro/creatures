import type {
  HuntArea,
  HuntAreaDetail,
  HuntAreaItem,
  HuntAreaSpecies,
  HuntAreaTone,
} from '@creatures/contracts/hunt';
import type { ItemCategory } from '@creatures/contracts/inventory';
import type { Element } from '@creatures/contracts/species';

import type { ApiDeps } from '~/shared/api/client';
import { buildHeaders, isSuccessStatus, resolveErrorCode } from '~/shared/api/http';
import type { TrainerClientErrorCode } from '~/shared/api/http';

const HUNT_AREAS_PATH = '/api/hunt-areas';
const UNAUTHENTICATED: TrainerClientErrorCode = 'unauthenticated';

const TONES: readonly HuntAreaTone[] = [
  'arcane',
  'blood',
  'ember',
  'frost',
  'gold',
  'neutral',
  'verdant',
];

const ELEMENTS: readonly Element[] = ['fire', 'neutral', 'plant', 'water'];

const ITEM_CATEGORIES: readonly ItemCategory[] = ['consumable', 'device', 'material'];

export type HuntAreaListResult =
  | { ok: true; areas: HuntArea[] }
  | { ok: false; code: TrainerClientErrorCode };

export type HuntAreaDetailResult =
  | { ok: true; area: HuntAreaDetail }
  | { ok: false; code: TrainerClientErrorCode };

type HuntAreaFailure = { code: TrainerClientErrorCode; ok: false };

/**
 * The list of hunt areas.
 *
 * The order is the server's decision: the areas come from the lowest
 * recommended level to the highest, and the client does not reorder them.
 */
export function requestHuntAreaList(deps: ApiDeps): Promise<HuntAreaListResult> {
  return deps.getAccessToken().then(buildHuntAreaListRequester(deps));
}

/**
 * One hunt area, with every creature and every item of the place.
 */
export function requestHuntArea(deps: ApiDeps, areaId: string): Promise<HuntAreaDetailResult> {
  return deps.getAccessToken().then(buildHuntAreaRequester(deps, areaId));
}

function buildHuntAreaListRequester(
  deps: ApiDeps,
): (token: string | null) => Promise<HuntAreaListResult> {
  return function listAreasWithToken(token: string | null): Promise<HuntAreaListResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const init = { headers, method: 'GET' };
    return globalThis
      .fetch(buildHuntAreasUrl(deps.baseUrl), init)
      .then(readHuntAreaListResponse)
      .catch(readHuntAreaListNetworkFailure);
  };
}

function buildHuntAreaRequester(
  deps: ApiDeps,
  areaId: string,
): (token: string | null) => Promise<HuntAreaDetailResult> {
  return function readAreaWithToken(token: string | null): Promise<HuntAreaDetailResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const init = { headers, method: 'GET' };
    return globalThis
      .fetch(buildHuntAreaUrl(deps.baseUrl, areaId), init)
      .then(readHuntAreaDetailResponse)
      .catch(readHuntAreaDetailNetworkFailure);
  };
}

function readHuntAreaListResponse(response: Response): Promise<HuntAreaListResult> {
  return response
    .json()
    .then(buildHuntAreaListResult(response.status), buildUnreadableResult(response.status));
}

function readHuntAreaDetailResponse(response: Response): Promise<HuntAreaDetailResult> {
  return response
    .json()
    .then(buildHuntAreaDetailResult(response.status), buildUnreadableResult(response.status));
}

function buildHuntAreaListResult(status: number): (body: unknown) => HuntAreaListResult {
  return function toHuntAreaListResult(body: unknown): HuntAreaListResult {
    if (!isSuccessStatus(status)) {
      return { code: resolveErrorCode(status, body), ok: false };
    }
    return { areas: readHuntAreas(body), ok: true };
  };
}

function buildUnreadableResult(status: number): () => HuntAreaFailure {
  return function toUnreadableResult(): HuntAreaFailure {
    return { code: resolveErrorCode(status, null), ok: false };
  };
}

function buildHuntAreaDetailResult(status: number): (body: unknown) => HuntAreaDetailResult {
  return function toHuntAreaDetailResult(body: unknown): HuntAreaDetailResult {
    if (!isSuccessStatus(status)) {
      return { code: resolveErrorCode(status, body), ok: false };
    }
    const area = readHuntAreaDetail(body);
    if (area === null) {
      return { code: 'unknown', ok: false };
    }
    return { area, ok: true };
  };
}

function readHuntAreaListNetworkFailure(): HuntAreaListResult {
  return { code: 'unknown', ok: false };
}

function readHuntAreaDetailNetworkFailure(): HuntAreaDetailResult {
  return { code: 'unknown', ok: false };
}

function readHuntAreas(body: unknown): HuntArea[] {
  if (typeof body !== 'object' || body === null) {
    return [];
  }
  const areas = (body as { areas?: unknown }).areas;
  if (!Array.isArray(areas)) {
    return [];
  }
  const parsed = areas.map(readHuntArea);
  return parsed.filter(isPresent);
}

function readHuntAreaDetail(body: unknown): HuntAreaDetail | null {
  const entry = readRecord(body);
  if (entry === null) {
    return null;
  }
  const area = readHuntArea(entry);
  if (area === null) {
    return null;
  }
  return { ...area, items: readHuntAreaItems(entry.items) };
}

function readHuntArea(value: unknown): HuntArea | null {
  const entry = readRecord(value);
  if (entry === null) {
    return null;
  }
  const id = readString(entry.id);
  const name = readString(entry.name);
  const slug = readString(entry.slug);
  const description = readString(entry.description);
  const minimumLevel = readNumber(entry.minimumLevel);
  const recommendedLevel = readNumber(entry.recommendedLevel);
  const primarySpecies = readHuntAreaSpecies(entry.primarySpecies);
  if (id === null || name === null || slug === null || description === null) {
    return null;
  }
  if (minimumLevel === null || recommendedLevel === null) {
    return null;
  }
  if (primarySpecies === null) {
    return null;
  }
  return {
    description,
    id,
    minimumLevel,
    name,
    primarySpecies,
    recommendedLevel,
    slug,
    species: readHuntAreaSpeciesList(entry.species),
    tone: readTone(entry.tone),
  };
}

function readHuntAreaSpeciesList(value: unknown): HuntAreaSpecies[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const parsed = value.map(readHuntAreaSpecies);
  return parsed.filter(isPresent);
}

function readHuntAreaSpecies(value: unknown): HuntAreaSpecies | null {
  const entry = readRecord(value);
  if (entry === null) {
    return null;
  }
  const species = readSpeciesSummary(entry.species);
  if (species === null) {
    return null;
  }
  return { species, tone: readTone(entry.tone) };
}

function readSpeciesSummary(value: unknown): HuntAreaSpecies['species'] | null {
  const entry = readRecord(value);
  if (entry === null) {
    return null;
  }
  const id = readString(entry.id);
  const name = readString(entry.name);
  const slug = readString(entry.slug);
  const element = entry.element;
  if (id === null || name === null || slug === null) {
    return null;
  }
  if (!ELEMENTS.includes(element as Element)) {
    return null;
  }
  return { element: element as Element, id, name, slug };
}

function readHuntAreaItems(value: unknown): HuntAreaItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const parsed = value.map(readHuntAreaItem);
  return parsed.filter(isPresent);
}

function readHuntAreaItem(value: unknown): HuntAreaItem | null {
  const entry = readRecord(value);
  if (entry === null) {
    return null;
  }
  const itemId = readString(entry.itemId);
  const name = readString(entry.name);
  const slug = readString(entry.slug);
  const category = entry.category;
  if (itemId === null || name === null || slug === null) {
    return null;
  }
  if (!ITEM_CATEGORIES.includes(category as ItemCategory)) {
    return null;
  }
  return {
    category: category as ItemCategory,
    itemId,
    name,
    slug,
    tone: readTone(entry.tone),
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

/**
 * A tone the client does not know is drawn as neutral, the same way the server
 * falls back when the column of the area carries a tone that is not in the
 * contract.
 */
function readTone(value: unknown): HuntAreaTone {
  return TONES.includes(value as HuntAreaTone) ? (value as HuntAreaTone) : 'neutral';
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

function buildHuntAreasUrl(baseUrl: string): string {
  return `${baseUrl}${HUNT_AREAS_PATH}`;
}

function buildHuntAreaUrl(baseUrl: string, areaId: string): string {
  return `${baseUrl}${HUNT_AREAS_PATH}/${areaId}`;
}
