import { expect, test } from 'bun:test';

import {
  hasStaminaForHunt,
  MINIMUM_STAMINA_MINUTES,
} from '~/features/hunt-area/model/huntAreaStamina';

test('a stamina baixa impede o inicio da cacada', checkLowStamina);
test('a stamina minima permite o inicio da cacada', checkMinimumStamina);

function checkLowStamina(): void {
  expect(MINIMUM_STAMINA_MINUTES).toBe(30);
  expect(hasStaminaForHunt(29)).toBe(false);
  expect(hasStaminaForHunt(0)).toBe(false);
}

function checkMinimumStamina(): void {
  expect(hasStaminaForHunt(30)).toBe(true);
  expect(hasStaminaForHunt(720)).toBe(true);
}
