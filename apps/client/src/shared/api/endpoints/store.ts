import type {
  StoreBagItem,
  StoreCatalog,
  StoreErrorCode,
  StoreItem,
} from '@creatures/contracts/store';

import type { ApiDeps } from '~/shared/api/client';
import { readBagItem, readItem, readNumber, readRecord } from '~/shared/api/endpoints/storeReaders';
import { buildHeaders, isSuccessStatus } from '~/shared/api/http';

const STORE_PATH = '/api/store';
const BUY_PATH = '/api/store/buy';
const SELL_PATH = '/api/store/sell';

/**
 * Every code the store answers with.
 *
 * The map is exhaustive by construction: adding a code to the contract without
 * adding it here breaks the build.
 */
const STORE_ERROR_CODES: Record<StoreErrorCode, true> = {
  store_insufficient_gold: true,
  store_internal_error: true,
  store_invalid_quantity: true,
  store_item_not_in_backpack: true,
  store_item_unavailable: true,
  trainer_not_found: true,
  unauthenticated: true,
};

export type StoreClientErrorCode = StoreErrorCode | 'unknown';

export type StoreCatalogResult =
  | { catalog: StoreCatalog; ok: true }
  | { code: StoreClientErrorCode; ok: false };

export type StoreOutcome = {
  bag: StoreBagItem[];
  gold: number;
  total: number;
};

export type StoreCommandResult =
  | { ok: true; outcome: StoreOutcome }
  | { code: StoreClientErrorCode; ok: false };

/**
 * The catalog of the store, with the backpack of the trainer and his gold.
 */
export function requestStoreCatalog(deps: ApiDeps): Promise<StoreCatalogResult> {
  return deps.getAccessToken().then(buildCatalogRequester(deps));
}

/**
 * Buys an item of the store.
 */
export function requestStoreBuy(
  deps: ApiDeps,
  itemId: string,
  quantity: number,
): Promise<StoreCommandResult> {
  return deps.getAccessToken().then(buildCommandRequester(deps, BUY_PATH, itemId, quantity));
}

/**
 * Sells a quantity of an item of the backpack.
 */
export function requestStoreSell(
  deps: ApiDeps,
  itemId: string,
  quantity: number,
): Promise<StoreCommandResult> {
  return deps.getAccessToken().then(buildCommandRequester(deps, SELL_PATH, itemId, quantity));
}

function buildCatalogRequester(
  deps: ApiDeps,
): (token: string | null) => Promise<StoreCatalogResult> {
  return function readCatalogWithToken(token: string | null): Promise<StoreCatalogResult> {
    if (token === null) {
      return Promise.resolve({ code: 'unauthenticated', ok: false });
    }
    const headers = buildHeaders(token);
    const init = { headers, method: 'GET' };
    return globalThis
      .fetch(buildUrl(deps.baseUrl, STORE_PATH), init)
      .then(readCatalogResponse)
      .catch(readNetworkFailure);
  };
}

function buildCommandRequester(
  deps: ApiDeps,
  path: string,
  itemId: string,
  quantity: number,
): (token: string | null) => Promise<StoreCommandResult> {
  return function sendCommandWithToken(token: string | null): Promise<StoreCommandResult> {
    if (token === null) {
      return Promise.resolve({ code: 'unauthenticated', ok: false });
    }
    const headers = buildHeaders(token);
    const body = JSON.stringify({ itemId, quantity });
    const init = { body, headers, method: 'POST' };
    return globalThis
      .fetch(buildUrl(deps.baseUrl, path), init)
      .then(readCommandResponse)
      .catch(readNetworkFailure);
  };
}

function readCatalogResponse(response: Response): Promise<StoreCatalogResult> {
  return response
    .json()
    .then(buildCatalogResult(response.status), buildUnreadableResult(response.status));
}

function readCommandResponse(response: Response): Promise<StoreCommandResult> {
  return response
    .json()
    .then(buildCommandResult(response.status), buildUnreadableResult(response.status));
}

function buildCatalogResult(status: number): (body: unknown) => StoreCatalogResult {
  return function toCatalogResult(body: unknown): StoreCatalogResult {
    if (!isSuccessStatus(status)) {
      return { code: readErrorCode(status, body), ok: false };
    }
    const catalog = readCatalog(body);
    if (catalog === null) {
      return { code: 'unknown', ok: false };
    }
    return { catalog, ok: true };
  };
}

function buildCommandResult(status: number): (body: unknown) => StoreCommandResult {
  return function toCommandResult(body: unknown): StoreCommandResult {
    if (!isSuccessStatus(status)) {
      return { code: readErrorCode(status, body), ok: false };
    }
    const outcome = readOutcome(body);
    if (outcome === null) {
      return { code: 'unknown', ok: false };
    }
    return { ok: true, outcome };
  };
}

function buildUnreadableResult(status: number): () => { code: StoreClientErrorCode; ok: false } {
  return function toUnreadableResult(): { code: StoreClientErrorCode; ok: false } {
    return { code: readErrorCode(status, null), ok: false };
  };
}

function readNetworkFailure(): { code: StoreClientErrorCode; ok: false } {
  return { code: 'unknown', ok: false };
}

/**
 * The code of a failed answer.
 *
 * The codes of the store live in their own namespace: the shared map of the
 * trainer knows nothing about them, so the body is the only source.
 */
function readErrorCode(status: number, body: unknown): StoreClientErrorCode {
  const code = readBodyCode(body);
  if (code !== null) {
    return code;
  }
  if (status === 401) {
    return 'unauthenticated';
  }
  return 'unknown';
}

function readBodyCode(body: unknown): StoreClientErrorCode | null {
  const entry = readRecord(body);
  if (entry === null) {
    return null;
  }
  const error = entry.error;
  if (typeof error !== 'string') {
    return null;
  }
  return Object.hasOwn(STORE_ERROR_CODES, error) ? (error as StoreErrorCode) : null;
}

function readCatalog(body: unknown): StoreCatalog | null {
  const entry = readRecord(body);
  if (entry === null) {
    return null;
  }
  const bag = readBag(entry.bag);
  const gold = readNumber(entry, 'gold');
  if (bag === null || gold === null) {
    return null;
  }
  return { bag, gold, items: readItems(entry.items) };
}

function readOutcome(body: unknown): StoreOutcome | null {
  const entry = readRecord(body);
  if (entry === null) {
    return null;
  }
  const bag = readBag(entry.bag);
  const gold = readNumber(entry, 'gold');
  const total = readNumber(entry, 'total');
  if (bag === null || gold === null || total === null) {
    return null;
  }
  return { bag, gold, total };
}

function readItems(value: unknown): StoreItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const parsed = value.map(readItem);
  return parsed.filter(isPresent);
}

function readBag(value: unknown): StoreBagItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const parsed = value.map(readBagItem);
  return parsed.filter(isPresent);
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path}`;
}
