/**
 * The current attributes of a creature.
 *
 * The attributes are not stored: they are derived from the base value of the
 * species, the potential of the individual and the level.
 *
 * ```
 * Atributo = floor( Base × (1 − d + 2d × PV/100) × (1 + (Nível − 1) × k) )
 * ```
 *
 * `d` is how much the potential weighs: the worst potential takes 30% off the
 * base value and the best one adds 30% to it. `k` is how much a creature grows
 * with the level: 5% of the base value for each level above the first.
 *
 * A potential of 50% leaves the base value untouched, which is what a creature
 * born with every potential at 50% must have.
 */

/** How much the potential weighs on the attribute, from the worst to the best. */
export const POTENTIAL_DEVIATION = 0.3;

/** How much the attribute grows for each level above the first. */
export const LEVEL_GROWTH = 0.05;

const MIN_POTENTIAL_PERCENT = 0;
const MAX_POTENTIAL_PERCENT = 100;
const MIN_LEVEL = 1;

/**
 * The current value of one attribute of a creature.
 */
export function calculateAttribute(base: number, potentialPercent: number, level: number): number {
  const potential = clamp(potentialPercent, MIN_POTENTIAL_PERCENT, MAX_POTENTIAL_PERCENT);
  const safeLevel = Math.max(MIN_LEVEL, level);
  const potentialFactor = 1 - POTENTIAL_DEVIATION + 2 * POTENTIAL_DEVIATION * (potential / 100);
  const levelFactor = 1 + (safeLevel - 1) * LEVEL_GROWTH;
  return Math.floor(base * potentialFactor * levelFactor);
}

/**
 * The maximum life of a creature is its vitality attribute.
 */
export function calculateMaxHp(
  baseVitality: number,
  potentialVitality: number,
  level: number,
): number {
  return calculateAttribute(baseVitality, potentialVitality, level);
}

/**
 * The life left of a creature.
 *
 * The stored value is null until the creature takes a hit, and a null life is
 * the same as a full life.
 */
export function resolveCurrentHp(storedHp: number | null, maxHp: number): number {
  if (storedHp === null) {
    return maxHp;
  }
  return Math.min(storedHp, maxHp);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
