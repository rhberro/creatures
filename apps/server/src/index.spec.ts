import { expect, test } from 'bun:test';

function placeholder(): void {
  expect(1 + 1).toBe(2);
}

test('placeholder smoke', placeholder);
