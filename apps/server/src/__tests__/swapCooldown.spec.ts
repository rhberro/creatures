import { expect, test } from 'bun:test';

import { isSwapBlocked, readSwapCooldownRemainingMs, SWAP_COOLDOWN_MS } from '~/state/swapCooldown';

const NOW = 1_700_000_000_000;

function blocksTheSecondSwapOfTheSameMoment(): void {
  expect(isSwapBlocked(NOW, NOW)).toBe(true);
  expect(isSwapBlocked(NOW, NOW + SWAP_COOLDOWN_MS - 1)).toBe(true);
}

function letsTheSwapThroughAfterFiveSeconds(): void {
  expect(isSwapBlocked(NOW, NOW + SWAP_COOLDOWN_MS)).toBe(false);
  expect(isSwapBlocked(NOW, NOW + SWAP_COOLDOWN_MS + 1000)).toBe(false);
}

function letsTheFirstSwapThrough(): void {
  expect(isSwapBlocked(null, NOW)).toBe(false);
}

function readsTheTimeLeftOfTheWait(): void {
  expect(readSwapCooldownRemainingMs(NOW, NOW)).toBe(SWAP_COOLDOWN_MS);
  expect(readSwapCooldownRemainingMs(NOW, NOW + 2000)).toBe(SWAP_COOLDOWN_MS - 2000);
  expect(readSwapCooldownRemainingMs(NOW, NOW + SWAP_COOLDOWN_MS)).toBe(0);
  expect(readSwapCooldownRemainingMs(null, NOW)).toBe(0);
}

function waitsFiveSeconds(): void {
  expect(SWAP_COOLDOWN_MS).toBe(5000);
}

test('the second swap of the same moment is blocked', blocksTheSecondSwapOfTheSameMoment);
test('the swap is allowed after five seconds', letsTheSwapThroughAfterFiveSeconds);
test('the first swap is never blocked', letsTheFirstSwapThrough);
test('the time left of the wait is read', readsTheTimeLeftOfTheWait);
test('the wait is five seconds', waitsFiveSeconds);
