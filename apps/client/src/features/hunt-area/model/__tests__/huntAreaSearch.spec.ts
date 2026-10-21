import { expect, test } from 'bun:test';

import type { HuntArea } from '@creatures/contracts/hunt';

import {
  clampHuntAreaPage,
  countHuntAreaPages,
  huntAreaPage,
} from '~/features/hunt-area/model/huntAreaPagination';
import { filterHuntAreas, normalizeHuntAreaText } from '~/features/hunt-area/model/huntAreaSearch';

test('a busca ignora os acentos e as maiusculas', checkNormalizedText);
test('a busca encontra a area pelo nome', checkSearchByAreaName);
test('a busca encontra a area pelo nome de uma criatura', checkSearchBySpeciesName);
test('a busca sem resultado devolve a lista vazia', checkSearchWithoutResult);
test('a busca vazia devolve todas as areas', checkEmptySearch);
test('a paginacao conta as paginas da lista', checkPageCount);
test('a paginacao entrega as areas de uma pagina', checkPageContent);
test('a pagina nunca passa do fim da lista', checkClampedPage);

function checkNormalizedText(): void {
  expect(normalizeHuntAreaText('  Monstrinho  ')).toBe('monstrinho');
  expect(normalizeHuntAreaText('CURAÇÁ')).toBe('curaca');
}

function checkSearchByAreaName(): void {
  const areas = [buildArea('Campina Cinzenta'), buildArea('Lago Congelado')];
  const found = filterHuntAreas(areas, 'CONGELADO');
  expect(found).toHaveLength(1);
  expect(found[0]?.name).toBe('Lago Congelado');
}

function checkSearchBySpeciesName(): void {
  const areas = [buildArea('Campina Cinzenta'), buildArea('Lago Congelado')];
  const found = filterHuntAreas(areas, 'pedrino');
  expect(found).toHaveLength(2);
}

function checkSearchWithoutResult(): void {
  const areas = [buildArea('Campina Cinzenta')];
  expect(filterHuntAreas(areas, 'nada disso')).toHaveLength(0);
}

function checkEmptySearch(): void {
  const areas = [buildArea('Campina Cinzenta'), buildArea('Lago Congelado')];
  expect(filterHuntAreas(areas, '   ')).toHaveLength(2);
}

function checkPageCount(): void {
  expect(countHuntAreaPages(0)).toBe(1);
  expect(countHuntAreaPages(8)).toBe(1);
  expect(countHuntAreaPages(9)).toBe(2);
}

function checkPageContent(): void {
  const areas = [buildArea('Campina Cinzenta'), buildArea('Lago Congelado')];
  expect(huntAreaPage(areas, 1)).toHaveLength(2);
  expect(huntAreaPage(areas, 2)).toHaveLength(0);
}

function checkClampedPage(): void {
  expect(clampHuntAreaPage(3, 2)).toBe(2);
  expect(clampHuntAreaPage(0, 2)).toBe(1);
}

function buildArea(name: string): HuntArea {
  return {
    description: 'Uma area de cacada.',
    id: name,
    minimumLevel: 1,
    name,
    primarySpecies: {
      species: { element: 'neutral', id: 'pedrino', name: 'Pedrino', slug: 'pedrino' },
      tone: 'neutral',
    },
    recommendedLevel: 3,
    slug: name,
    species: [
      {
        species: { element: 'neutral', id: 'pedrino', name: 'Pedrino', slug: 'pedrino' },
        tone: 'neutral',
      },
    ],
    tone: 'neutral',
  };
}
