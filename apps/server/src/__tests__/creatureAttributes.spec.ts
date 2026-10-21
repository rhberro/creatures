import { expect, test } from 'bun:test';

import {
  calculateAttribute,
  calculateMaxHp,
  LEVEL_GROWTH,
  POTENTIAL_DEVIATION,
  resolveCurrentHp,
} from '~/db/creatureAttributes';

const BASE = 22;

function keepsTheBaseValueWithHalfPotential(): void {
  expect(calculateAttribute(BASE, 50, 1)).toBe(BASE);
}

function takesThirtyPercentOffWithTheWorstPotential(): void {
  expect(calculateAttribute(BASE, 0, 1)).toBe(Math.floor(BASE * 0.7));
  expect(calculateAttribute(BASE, 0, 1)).toBe(15);
}

function addsThirtyPercentWithTheBestPotential(): void {
  expect(calculateAttribute(BASE, 100, 1)).toBe(Math.floor(BASE * 1.3));
  expect(calculateAttribute(BASE, 100, 1)).toBe(28);
}

function growsFivePercentPerLevel(): void {
  expect(calculateAttribute(BASE, 50, 2)).toBe(Math.floor(BASE * 1.05));
  expect(calculateAttribute(BASE, 50, 2)).toBe(23);
  expect(calculateAttribute(BASE, 50, 3)).toBe(Math.floor(BASE * 1.1));
}

function combinesThePotentialAndTheLevel(): void {
  expect(calculateAttribute(BASE, 100, 2)).toBe(Math.floor(BASE * 1.3 * 1.05));
  expect(calculateAttribute(BASE, 100, 2)).toBe(30);
}

function alwaysReturnsAnInteger(): void {
  const value = calculateAttribute(23, 33, 4);
  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBe(Math.floor(value));
}

function usesTheDeclaredConstants(): void {
  expect(POTENTIAL_DEVIATION).toBe(0.3);
  expect(LEVEL_GROWTH).toBe(0.05);
}

function readsTheMaximumLifeAsTheVitality(): void {
  expect(calculateMaxHp(BASE, 50, 1)).toBe(BASE);
  expect(calculateMaxHp(BASE, 100, 1)).toBe(28);
}

function readsAFullLifeWhenNothingIsStored(): void {
  expect(resolveCurrentHp(null, 22)).toBe(22);
  expect(resolveCurrentHp(7, 22)).toBe(7);
  expect(resolveCurrentHp(30, 22)).toBe(22);
}

test('the attribute keeps the base value with half potential', keepsTheBaseValueWithHalfPotential);
test(
  'the attribute loses thirty percent with the worst potential',
  takesThirtyPercentOffWithTheWorstPotential,
);
test(
  'the attribute gains thirty percent with the best potential',
  addsThirtyPercentWithTheBestPotential,
);
test('the attribute grows five percent per level', growsFivePercentPerLevel);
test('the attribute combines the potential and the level', combinesThePotentialAndTheLevel);
test('the attribute is always an integer', alwaysReturnsAnInteger);
test('the constants of the formula are the declared ones', usesTheDeclaredConstants);
test('the maximum life is the vitality attribute', readsTheMaximumLifeAsTheVitality);
test('the life of a creature that never took a hit is full', readsAFullLifeWhenNothingIsStored);
