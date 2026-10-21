import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { cleanupEnvironment, prepareEnvironment, readToken } from './environment';
import type { IntegrationEnvironment } from './environment';
import { sendRequest } from './teamSupport';

const ENABLED = globalThis.process.env.CREATURES_TEST_DB === '1';
const NOT_FOUND = 404;
const OK = 200;

type SpeciesPayload = {
  species: { element: string; id: string; name: string; slug: string };
  tone: string;
};

type AreaPayload = {
  description: string;
  id: string;
  minimumLevel: number;
  name: string;
  recommendedLevel: number;
  slug: string;
  species: SpeciesPayload[];
  primarySpecies: SpeciesPayload;
  tone: string;
};

type AreaDetailPayload = AreaPayload & {
  items: { category: string; name: string; slug: string; tone: string }[];
};

type AreasPayload = {
  areas: AreaPayload[];
};

let env: IntegrationEnvironment;
let token = '';

describe.skipIf(!ENABLED)('the hunt areas against the real database', describeHuntAreas);

function describeHuntAreas(): void {
  beforeAll(prepareSuite);
  afterAll(cleanupSuite);

  test('the areas come from the database, from the lowest level to the highest', showsTheAreas);
  test('the detail of an area brings the union of the items of its species', showsTheDetail);
  test('an unknown area answers 404', answersNotFound);
  test('the seeded areas are left in the database', keepsTheCatalog);
}

function prepareSuite(): Promise<void> {
  return prepareEnvironment().then(function store(
    environment: IntegrationEnvironment,
  ): Promise<void> {
    env = environment;
    return readToken(env, env.ownerEmail).then(function keepToken(accessToken: string): void {
      token = accessToken;
    });
  });
}

function cleanupSuite(): Promise<unknown> {
  if (env === undefined) {
    return Promise.resolve();
  }
  return cleanupEnvironment(env);
}

function showsTheAreas(): Promise<void> {
  return readAreas().then(function assertOrder(areas: AreaPayload[]): void {
    expect(areas.length).toBeGreaterThanOrEqual(3);
    const levels = areas.map(readRecommendedLevel);
    expect(levels).toEqual(levels.toSorted(compareLevels));
    const area = areas[0];
    expect(area?.slug).toBe('campina-cinzenta');
    expect(area?.tone).toBe('ember');
    expect(area?.primarySpecies.species.name).toBe('Brasa');
    expect(area?.primarySpecies.tone).toBe('ember');
    expect(area?.species.length).toBeGreaterThanOrEqual(3);
  });
}

function showsTheDetail(): Promise<void> {
  return readAreas().then(function readFirstArea(areas: AreaPayload[]): Promise<void> {
    const area = areas[0];
    if (area === undefined) {
      throw new Error('the catalog of hunt areas is empty');
    }
    return sendRequest(env, 'GET', `/api/hunt-areas/${area.id}`, token).then(function assertStatus(
      response: Response,
    ): Promise<void> {
      expect(response.status).toBe(OK);
      return response.json().then(function assertItems(body: unknown): Promise<void> {
        const detail = body as AreaDetailPayload;
        expect(detail.id).toBe(area.id);
        expect(detail.items.length).toBeGreaterThan(0);
        return readDropsOfTheArea(area).then(function assertUnion(expected: string[]): void {
          const names = detail.items.map(readItemName).toSorted();
          expect(names).toEqual(expected.toSorted());
          for (const item of detail.items) {
            expect(item.category).toBe('material');
            expect(item.tone).toBe('gold');
          }
        });
      });
    });
  });
}

function readDropsOfTheArea(area: AreaPayload): Promise<string[]> {
  const speciesIds = area.species.map(readSpeciesId);
  const query = env.admin.from('species_drops').select('items(name)').in('species_id', speciesIds);
  return Promise.resolve(query).then(function readNames(result: {
    data: { items: { name: string } | { name: string }[] | null }[] | null;
    error: { message: string } | null;
  }): string[] {
    if (result.error !== null) {
      throw new Error(`the drops of the area could not be read: ${result.error.message}`);
    }
    const names = new Set<string>();
    for (const row of result.data ?? []) {
      const items = row.items;
      if (Array.isArray(items)) {
        for (const item of items) {
          names.add(item.name);
        }
      } else if (items !== null) {
        names.add(items.name);
      }
    }
    return [...names];
  });
}

function answersNotFound(): Promise<void> {
  const unknownId = '00000000-0000-4000-8000-000000000000';
  return sendRequest(env, 'GET', `/api/hunt-areas/${unknownId}`, token).then(function assertStatus(
    response: Response,
  ): Promise<void> {
    expect(response.status).toBe(NOT_FOUND);
    return response.json().then(function assertCode(body: unknown): void {
      expect((body as { error: string }).error).toBe('trainer_not_found');
    });
  });
}

function keepsTheCatalog(): Promise<void> {
  const query = env.admin.from('hunt_areas').select('slug');
  return Promise.resolve(query).then(function assertAreas(result: {
    data: { slug: string }[] | null;
    error: { message: string } | null;
  }): void {
    expect(result.error).toBeNull();
    expect((result.data ?? []).length).toBeGreaterThanOrEqual(3);
  });
}

function readAreas(): Promise<AreaPayload[]> {
  return sendRequest(env, 'GET', '/api/hunt-areas', token).then(function assertStatus(
    response: Response,
  ): Promise<AreaPayload[]> {
    expect(response.status).toBe(OK);
    return response.json().then(function read(body: unknown): AreaPayload[] {
      return (body as AreasPayload).areas;
    });
  });
}

function readRecommendedLevel(area: AreaPayload): number {
  return area.recommendedLevel;
}

function compareLevels(first: number, second: number): number {
  return first - second;
}

function readItemName(item: { name: string }): string {
  return item.name;
}

function readSpeciesId(entry: SpeciesPayload): string {
  return entry.species.id;
}
