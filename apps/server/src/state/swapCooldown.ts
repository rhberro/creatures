/**
 * The wait between two manual swaps.
 *
 * A manual swap puts another creature in the field, and the player could spam
 * it to fish for a good match. The rule is five seconds of wait for any
 * creature, and the automatic swap of a creature that fainted does not obey
 * it: it is not a choice of the player.
 *
 * The instant of the last swap lives in the session of the trainer, in the
 * memory of the process.
 */
export const SWAP_COOLDOWN_MS = 5000;

/**
 * Whether a new manual swap is still waiting for the previous one.
 */
export function isSwapBlocked(lastSwapAt: number | null, now: number): boolean {
  if (lastSwapAt === null) {
    return false;
  }
  return now - lastSwapAt < SWAP_COOLDOWN_MS;
}

/**
 * How much is left of the wait, in milliseconds.
 */
export function readSwapCooldownRemainingMs(lastSwapAt: number | null, now: number): number {
  if (lastSwapAt === null) {
    return 0;
  }
  const remaining = SWAP_COOLDOWN_MS - (now - lastSwapAt);
  return Math.max(remaining, 0);
}
